const fs = require("fs");
const path = require("path");
const http = process.env.ENHANCE_ENV === "dev" ? require("http") : require("https");
const https = require("https");

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

const buildDocs = async (folder) => {
  await fs.promises.mkdir('.enhancedocs', { recursive: true });

  const outputFilePath = path.join('.enhancedocs', 'output.jsonp');
  const files = await getFiles(folder);

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

const pushDocs = () => new Promise((resolve, reject) => {
  const enhanceAPIOptions = {
    headers: {
      authorization: "Bearer " + process.env.ENHANCEDOCS_API_KEY
    }
  }
  const req = http.get(enhancedocsBaseAPIUrl + '/integrations/signed-url', enhanceAPIOptions, (res) => {
    if (res.statusCode === 401) {
      return reject(new Error("Unauthorized; Invalid ENHANCEDOCS_API_KEY"));
    }
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
