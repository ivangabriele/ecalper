const path = require('path')

module.exports = {
  async: {
    abbr: 'a',
    boolean: true,
    describe: 'Asynchronously read/write files in directory (faster)',
    hidden: true,
  },
  color: {
    choices: ['red', 'green', 'blue', 'cyan', 'yellow', 'magenta', 'bold', 'italic'],
    default: 'cyan',
    describe: 'Highlight color',
    string: true,
  },
  count: {
    abbr: 'c',
    boolean: true,
    describe: 'Display count of occurances in each file',
  },
  exclude: {
    describe: "Don't search in these files, e.g. '*.min.js'",
    string: true,
  },
  'exclude-list': {
    default: path.join(__dirname, '..', 'defaultignore'),
    describe: 'Path of file containing a new-line separated list of files to ignore',
    hidden: true,
    string: true,
  },
  fileColor: {
    choices: ['red', 'green', 'blue', 'cyan', 'yellow', 'magenta', 'bold', 'italic'],
    default: 'yellow',
    describe: "Highlight matching file's name in color",
    string: true,
  },
  ignoreCase: {
    abbr: 'i',
    boolean: true,
    describe: 'Ignore case when searching',
  },
  include: {
    describe: "Only search in these files, e.g. '*.js,*.foo'",
    string: true,
  },
  multiline: {
    abbr: 'm',
    boolean: true,
    default: true,
    describe: 'Match line by line',
  },
  n: {
    describe: 'Limit the number of lines to preview',
    number: true,
  },
  noColor: {
    boolean: true,
    describe: 'Disable color output',
  },
  paths: {
    array: true,
    default: ['*'],
    describe: 'File or directory to search',
    position: 1,
  },
  quiet: {
    abbr: 'q',
    boolean: true,
    describe: 'Just print the names of the files matches occured in (faster)',
  },
  recursive: {
    abbr: 'r',
    boolean: true,
    describe: 'Recursively search directories',
  },
  regex: {
    demandOption: true,
    describe: "JavaScript regex for searching file e.g. '\\d+'",
    position: 0,
    string: true,
  },
  stdin: {
    abbr: 'z',
    boolean: true,
    describe: 'Use standard in for input',
  },
}
