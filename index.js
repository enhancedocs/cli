const fs = require("fs");
const http = process.env.ENHANCE_ENV === "dev" ? require("http") : require("https");
const https = require("https");
const nativeModule = require('./index.node');

const enhancedocsBaseAPIUrl = process.env.ENHANCE_ENV === "dev" ? "http://127.0.0.1:8080" : "https://api.enhancedocs.com";


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
  buildDocs: nativeModule.buildDocs,
  pushDocs: pushDocs,
};
