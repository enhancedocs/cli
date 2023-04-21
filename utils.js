const path = require('path');
const fs = require("fs");

const extensions = new Set([
  '3dv', 'ai', 'amf', 'art', 'ase', 'awg', 'blp', 'bmp', 'bw', 'cd5', 'cdr', 'cgm', 'cit', 'cmx', 'cpt', 'cr2', 'cur',
  'cut', 'dds', 'dib', 'djvu', 'dxf', 'e2d', 'ecw', 'egt', 'emf', 'eps', 'exif', 'fs', 'gbr', 'gif', 'gpl', 'grf',
  'hdp', 'heic', 'heif', 'icns', 'ico', 'iff', 'int', 'inta', 'jfif', 'jng', 'jp2', 'jpeg', 'jpg', 'jps', 'jxr', 'lbm',
  'liff', 'max', 'miff', 'mng', 'msp', 'nef', 'nitf', 'nrrd', 'odg', 'ota', 'pam', 'pbm', 'pc1', 'pc2', 'pc3', 'pcf',
  'pct', 'pcx', 'pdd', 'pdn', 'pgf', 'pgm', 'PI1', 'PI2', 'PI3', 'pict', 'png', 'pnm', 'pns', 'ppm', 'psb', 'psd',
  'psp', 'px', 'pxm', 'pxr', 'qfx', 'ras', 'raw', 'rgb', 'rgba', 'rle', 'sct', 'sgi', 'sid', 'stl', 'sun', 'svg', 'sxd',
  'tga', 'tif', 'tiff', 'v2d', 'vnd', 'vrml', 'vtf', 'wdp', 'webp', 'wmf', 'x3d', 'xar', 'xbm', 'xcf', 'xpm'
]);

const isFileSupported = filePath => !extensions.has(path.extname(filePath).slice(1).toLowerCase());

const getFiles = (dir) => {
  return fs.promises.readdir(dir, { withFileTypes: true }).then(entries => {
    const filesPromises = entries.map(entry => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isFile()) {
        if (isFileSupported(entryPath)) {
          return Promise.resolve([entryPath]);
        } else {
          return Promise.resolve([]);
        }
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

module.exports = {
  isFileSupported: isFileSupported,
  getFiles: getFiles,
};
