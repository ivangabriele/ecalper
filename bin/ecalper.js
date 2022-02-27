#!/usr/bin/env node

const ecalper = require('../ecalper')
const parseArguments = require('./parse-arguments')

/* Additional options that apply to `ecalper`, but not `search` */
const positionalArgs = {
  paths: {
    array: true,
    default: ['*'],
    describe: 'File or directory to search',
    position: 2,
  },
  replacement: {
    demandOption: true,
    describe: 'Replacement string for matches',
    position: 1,
    string: true,
  },
}

const addlOptions = {
  'function-file': {
    alias: 'f',
    describe: 'Path of file containing JS replacement function',
    hidden: true,
  },
  preview: {
    abbr: 'p',
    boolean: true,
    describe: "Preview the replacements, but don't modify files",
  },
  silent: {
    abbr: 's',
    boolean: true,
    describe: "Don't print out anything",
  },
}

const options = parseArguments('replace', positionalArgs, addlOptions)

ecalper(options)
