const fs = require('fs');
const path = require('path');
const { getFiles } = require("./utils");

const managedAPIBaseURL = 'https://api.enhancedocs.com';
const apiBaseURL = process.env.API_BASE_URL ? process.env.API_BASE_URL : managedAPIBaseURL;
const http = apiBaseURL.startsWith('https') ? require('https') : require('http');
const telemetryDisabled = process.env.ENHANCEDOCS_TELEMETRY_DISABLED;
const apiKey = process.env.ENHANCEDOCS_API_KEY;

const enhanceAPIOptions = { headers: { } };
if (apiKey) enhanceAPIOptions.headers.authorization = 'Bearer ' + apiKey

const postTelemetry = (data) => {
  data = JSON.stringify(data);
  const req = http.request(apiBaseURL + '/integrations/cli/telemetry', {
    method: 'POST',
    headers: {
      ...enhanceAPIOptions.headers,
      'Content-Length': data.length,
      'Content-Type': 'application/json',
    }
  });
  req.write(data);
}

const buildDocs = async (folders) => {
  await fs.promises.mkdir('.enhancedocs', { recursive: true });

  const outputFilePath = path.join('.enhancedocs', 'output.jsonp');
  const filesPromises = folders.map(async folder => {
    return await getFiles(folder);
  });

  const filesArrays = await Promise.all(filesPromises);
  const files = filesArrays.flat();

  const outputData = await Promise.all(files.map(async file => {
    const content = await fs.promises.readFile(file, 'utf-8');
    return {
      source: file,
      content
    };
  }));
  await fs.promises.writeFile(outputFilePath, outputData.map(data => JSON.stringify(data)).join('\n'));
  return true;
}

const updateProjectProperties = (projectId) => {
  let packageJSON;
  try {
    const projectPackage = fs.readFileSync('package.json', 'utf-8');
    packageJSON = JSON.parse(projectPackage);
  } catch (e) {
    if (!telemetryDisabled) {
      postTelemetry({ projectId, error: e.message });
    }
    return;
  }
  const docusaurus = packageJSON.dependencies && Object.entries(packageJSON.dependencies).find(dependency => dependency[0] === '@docusaurus/core');
  if (docusaurus) {
    const data = JSON.stringify({ name: docusaurus[0], version: docusaurus[1] });
    const req = http.request(apiBaseURL + `/projects/settings?projectId=${projectId}`, {
      method: 'PATCH',
      headers: {
        ...enhanceAPIOptions.headers,
        'Content-Length': data.length,
        'Content-Type': 'application/json',
      }
    });
    req.write(data);
    return;
  }
  if (!telemetryDisabled) {
    postTelemetry({
      projectId: projectId,
      dependencies: packageJSON.dependencies,
      devDependencies: packageJSON.devDependencies,
      browserslist: packageJSON.browserslist,
      engines: packageJSON.engines,
    });
  }
};

const pushDocs = (projectId) => new Promise((resolve, reject) => {
  const readStream = fs.createReadStream('.enhancedocs/output.jsonp');
  let url = apiBaseURL + `/ingest`;
  if (projectId) {
    url = `${url}?projectId=${projectId}`
    updateProjectProperties(projectId);
  }
  const req = http.request(url, { ...enhanceAPIOptions, method: 'PUT' });
  readStream.on('data', function(chunk) {
    console.log(`🗂   Uploading ${chunk.length} of ${readStream.bytesRead} bytes...`);
    req.write(chunk);
  });
  readStream.on('end',() => {
    req.end();
    resolve();
    console.log('✨  Ingestion finished');
  });
  req.on('error', (err) => reject(err));
  readStream.on('error', (err) => reject(err));
});

const askDocs = (args) => new Promise((resolve, reject) => {
  let projectId;
  const projectArgIndex = args.indexOf("--project");
  const projectIdIndex = projectArgIndex + 1;
  if (projectArgIndex !== -1) {
    if (args.length -1 < projectIdIndex) {
      return reject(new Error('Provide a projectId. --project [projectId] [question]'));
    }
    projectId = args[projectArgIndex + 1];
  }
  let question = args.join(" ");
  let url;
  if (projectId) {
    question = args.slice(projectIdIndex + 1).join(" ");
    url =  apiBaseURL + `/ask?question=${question}&projectId=${projectId}`
  } else {
    url = apiBaseURL + `/ask?question=${question}`;
  }
  if (!question) {
    return reject(new Error('Provide a question'));
  }
  const req = http.get(url, { ...enhanceAPIOptions, method: 'GET' }, (res) => {
    let result = '';
    res.on('data', (chunk) => {
      result += chunk;
    });
    res.on('end', () => {
      resolve();
      console.log(result);
    });
    res.on("error", (err) => reject(err));
  });
  req.on('error', (err) => reject(err));
});

module.exports = {
  buildDocs: buildDocs,
  pushDocs: pushDocs,
  askDocs: askDocs,
};
