/* eslint-disable no-console, no-underscore-dangle, no-use-before-define */

const chalk = require('chalk')
const fs = require('fs')
const minimatch = require('minimatch')
const path = require('path')

const sharedOptions = require('./bin/shared-options')

function ecalper(options) {
  const matched = []
  // If the path is the same as the default and the recursive option was not
  // specified, search recursively under the current directory as a
  // convenience.
  if (
    options.paths.length === 1 &&
    options.paths[0] === sharedOptions.paths.default[0] &&
    // eslint-disable-next-line no-prototype-builtins
    !options.hasOwnProperty('recursive')
  ) {
    options.paths = ['.']
  }

  let lineCount = 0
  const limit = 400 // chars per line

  if (options.r) {
    options.recursive = true
  }

  if (!options.color) {
    options.color = 'cyan'
  }

  let flags = 'g' // global multiline
  if (options.ignoreCase) {
    flags += 'i'
  }
  if (options.multiline) {
    flags += 'm'
  }

  let regex
  if (options.regex instanceof RegExp) {
    regex = options.regex
  } else {
    regex = new RegExp(options.regex, flags)
  }
  const canReplace = !options.preview && options.replacement !== undefined

  let includes
  if (options.include) {
    includes = options.include.split(',')
  }
  let excludes = []
  if (options.exclude) {
    excludes = options.exclude.split(',')
  }
  const ignoreFile = options.excludeList || path.join(__dirname, '/defaultignore')
  const ignores = fs.readFileSync(ignoreFile, 'utf-8').split('\n')
  excludes = excludes.concat(ignores)

  let replaceFunc
  if (options.funcFile) {
    // eslint-disable-next-line no-eval
    eval(`replaceFunc = ${fs.readFileSync(options.funcFile, 'utf-8')}`)
  }

  if (options.z) {
    process.stdin.resume()
    let _input = ''
    process.stdin.on('data', input => {
      _input += input
    })

    process.stdin.on('end', () => {
      const text = replacizeText(_input)
      process.stdout.write(text)
    })
  } else {
    for (let i = 0; i < options.paths.length; i += 1) {
      if (options.async) {
        replacizeFile(options.paths[i])
      } else {
        replacizeFileSync(options.paths[i])
      }
    }
  }

  return matched

  function canSearch(file, isFile) {
    const inIncludes = includes && includes.some(include => minimatch(file, include, { matchBase: true }))
    const inExcludes = excludes.some(exclude => minimatch(file, exclude, { matchBase: true }))

    return (!includes || !isFile || inIncludes) && (!excludes || !inExcludes)
  }

  function replacizeFile(file) {
    fs.lstat(file, (err, stats) => {
      if (err) {
        throw err
      }

      if (stats.isSymbolicLink()) {
        // don't follow symbolic links for now
        return
      }
      const isFile = stats.isFile()
      if (!canSearch(file, isFile)) {
        return
      }
      if (isFile) {
        fs.readFile(file, 'utf-8', (err, text) => {
          if (err) {
            if (err.code === 'EMFILE') {
              console.log('Too many files, try running `replace` without --async')
              process.exit(1)
            }
            throw err
          }

          text = replacizeText(text, file)
          if (canReplace && text !== null) {
            fs.writeFile(file, text, err => {
              if (err) {
                throw err
              }
            })
          }
        })
      } else if (stats.isDirectory() && options.recursive) {
        fs.readdir(file, (err, files) => {
          if (err) {
            throw err
          }
          for (let i = 0; i < files.length; i += 1) {
            replacizeFile(path.join(file, files[i]))
          }
        })
      }
    })
  }

  function replacizeFileSync(file) {
    const stats = fs.lstatSync(file)
    if (stats.isSymbolicLink()) {
      // don't follow symbolic links for now
      return
    }
    const isFile = stats.isFile()
    if (!canSearch(file, isFile)) {
      return
    }
    if (isFile) {
      const text = fs.readFileSync(file, 'utf-8')

      const replacizedText = replacizeText(text, file)

      if (replacizedText !== null) {
        if (canReplace) {
          fs.writeFileSync(file, replacizedText)
        } else {
          matched.push({ path: file, text })
        }
      }
    } else if (stats.isDirectory() && options.recursive) {
      const files = fs.readdirSync(file)
      for (let i = 0; i < files.length; i += 1) {
        replacizeFileSync(path.join(file, files[i]))
      }
    }
  }

  function replacizeText(text, file) {
    const match = text.match(regex)
    if (!match) {
      return null
    }

    if (!options.silent && file) {
      // eslint-disable-next-line no-nested-ternary
      let printout = options.noColor ? file : options.fileColor ? chalk[options.fileColor](file) : file
      if (options.count) {
        let count = ` (${match.length})`
        count = options.noColor ? count : chalk.grey(count)
        printout += count
      }
      console.log(printout)
    }
    if (!options.silent && !options.quiet && !(lineCount > options.maxLines) && options.multiline) {
      const lines = text.split('\n')
      for (let i = 0; i < lines.length; i += 1) {
        let line = lines[i]
        if (line.match(regex)) {
          lineCount += 1
          if (lineCount > options.maxLines) {
            break
          }

          let replacement = options.replacement || '$&'
          if (!options.noColor) {
            replacement = chalk[options.color](replacement)
          }

          line = line.replace(regex, replaceFunc || replacement)

          // only console log if file not stdin
          // eslint-disable-next-line no-unused-expressions
          file && console.log(` ${i + 1}: ${line.slice(0, limit)}`)
        }
      }
    }
    if (canReplace) {
      return text.replace(regex, replaceFunc || options.replacement)
    }

    return undefined
  }
}

module.exports = ecalper
