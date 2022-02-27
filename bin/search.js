#!/usr/bin/env node

const ecalper = require('../ecalper')
const parseArguments = require('./parse-arguments')

const options = parseArguments('search')

ecalper(options)
