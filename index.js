const fs = require("fs");
const path = require("path");
const http = process.env.ENHANCE_ENV === "dev" ? require("http") : require("https");
const https = require("https");

const telemetryDisabled = process.env.ENHANCEDOCS_TELEMETRY_DISABLED;
const apiKey = process.env.ENHANCEDOCS_API_KEY;
const enhancedocsBaseAPIUrl = process.env.ENHANCE_ENV === "dev" ? "http://127.0.0.1:8080" : "https://api.enhancedocs.com";

const getFiles = (dir) => {
  return fs.promises.readdir(dir, { withFileTypes: true }).then(entries => {
      const filesPromises = entries.map(entry => {
        const entryPath = path.join(dir, entry.name);
        if (entry.isFile()) {
          return Promise.resolve([entryPath]);
        } else {
          return getFiles(entryPath);
        }
      });
      return Promise.all(filesPromises);
    })
    .then(filesArrays => {
      return filesArrays.flat();
    });
}

const postTelemetry = (data) => {
  data = JSON.stringify(data);
  const req = http.request(enhancedocsBaseAPIUrl + '/integrations/cli/telemetry', {
    method: 'POST',
    headers: {
      authorization: "Bearer " + apiKey,
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
    const projectPackage = fs.readFileSync("package.json", 'utf-8');
    packageJSON = JSON.parse(projectPackage);
  } catch (e) {
    if (!telemetryDisabled) {
      postTelemetry({ projectId, error: e.message });
    }
    return;
  }
  const docusaurus = packageJSON.dependencies && Object.entries(packageJSON.dependencies).find(dependency => dependency[0] === "@docusaurus/core");
  if (docusaurus) {
    const data = JSON.stringify({ name: docusaurus[0], version: docusaurus[1] });
    const req = http.request(enhancedocsBaseAPIUrl + `/projects/settings?projectId=${projectId}`, {
      method: 'PATCH',
      headers: {
        authorization: "Bearer " + apiKey,
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
  if (!projectId) {
    return reject(new Error("Required Project Id; enhancedocs push <project_id>"));
  }
  if (!apiKey) {
    return reject(new Error("Required ENHANCEDOCS_API_KEY"));
  }
  const enhanceAPIOptions = {
    headers: {
      authorization: "Bearer " + apiKey
    }
  }
  const req = http.get(enhancedocsBaseAPIUrl + `/integrations/signed-url?projectId=${projectId}`, enhanceAPIOptions, (res) => {
    if (res.statusCode === 401) {
      return reject(new Error("Unauthorized; Invalid ENHANCEDOCS_API_KEY"));
    }
    updateProjectProperties(projectId);
    let url = '';
    res.on('data', (chunk) => {
      url += chunk;
    });
    res.on('end', () => {
      const readStream = fs.createReadStream(".enhancedocs/output.jsonp");
      const req = https.request(url, { method: 'PUT' });
      readStream.on('data', function(chunk) {
        req.write(chunk);
      });
      readStream.on('end',() => {
        req.end();
        resolve();
      });
      req.on('error', (err) => reject(err));
      readStream.on('error', (err) => reject(err));
    });
  })
  req.on('error', (err) => reject(err));
});

module.exports = {
  buildDocs: buildDocs,
  pushDocs: pushDocs,
};
