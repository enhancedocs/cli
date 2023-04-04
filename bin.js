#!/usr/bin/env node
const path = require("path");
const { buildDocs, pushDocs } = require("./");

const help = () => {
  console.log(`Usage:
  enhancedocs build <docs_path>
  enhancedocs push <project_id>
  enhancedocs -v`);
  process.exit(code);
}

const [, , cmd, ...args] = process.argv;
const ln = args.length;
const [x, y] = args;
const cmds = {
  build: () => buildDocs(x),
  push: () => pushDocs(x),
  ['-v']: () => console.log(require(path.join(__dirname, './package.json')).version),
};
try {
  cmds[cmd] ? cmds[cmd]() : help(0);
}
catch (e) {
  console.error(e instanceof Error ? `enhancedocs - ${e.message}` : e);
  process.exit(1);
}
