const yargs = require('yargs')

const sharedOptions = require('./shared-options')

function parseArguments(scriptName, addlPosArgs, addlOpts) {
  addlPosArgs = addlPosArgs || []
  addlOpts = addlOpts || {}

  const posArgs = {}
  const opts = {}
  Object.keys(sharedOptions).forEach(name => {
    const option = sharedOptions[name]
    if (typeof option.position === 'number') {
      posArgs[name] = option
    } else {
      opts[name] = option
    }
  })

  const options = { ...opts, ...addlOpts }

  const positionalArgs = []
  ;[posArgs, addlPosArgs].forEach(posArgs => {
    Object.keys(posArgs).forEach(name => {
      const posArg = posArgs[name]
      posArg.name = name
      positionalArgs[posArg.position] = posArg
    })
  })

  let command = '$0'
  positionalArgs.forEach(positionalArg => {
    let option = positionalArg.name

    if (positionalArg.array) {
      option += '..'
    }
    if (positionalArg.demandOption) {
      option = `<${option}>`
    } else {
      option = `[${option}]`
    }

    command += ` ${option}`
  })

  return yargs
    .scriptName(scriptName)
    .command(command, '', yargs => {
      positionalArgs.forEach(positionalArg => {
        yargs.positional(positionalArg.name, positionalArg)
      })
    })
    .options(options).argv
}

module.exports = parseArguments
