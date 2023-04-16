#!/usr/bin/env node
const path = require("path");
const { buildDocs, pushDocs } = require("./");

const help = (code) => {
  console.log(`Usage: enhancedocs [options] [arguments]

Options:

  build [...contentPath]  Bundle ingest content into one file
  push [projectId]        Push bundled content file to EnhanceDocs API
  -v, --version           Print EnhanceDocs CLI version
  -h, --help              Print EnhanceDocs command line options (currently set)`);
  process.exit(code);
}

const version = () => console.log(require(path.join(__dirname, './package.json')).version);

const [, , cmd, ...args] = process.argv;
const ln = args.length;
const [x, y, z] = args;
const cmds = {
  build: () => buildDocs(x),
  push: () => pushDocs(x),
  ['-v']: () => version(),
  ['--version']: () => version(),
  ['-h']: () => help(0),
  ['--help']: () => help(0),
};
try {
  cmds[cmd] ? cmds[cmd]() : help(0);
}
catch (e) {
  console.error(e instanceof Error ? `enhancedocs - ${e.message}` : e);
  process.exit(1);
}
