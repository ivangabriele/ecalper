const fs = require('fs'),
  path = require('path'),
  minimatch = require('minimatch'),
  sharedOptions = require('./bin/shared-options'),
  Thener = require('thener').default,
  RegReplacer = require("regreplacer").default;

function canSearch(file, isFile, includes, excludes) {
  const inIncludes = includes && includes.some(function (include) {
    return minimatch(file, include, { matchBase: true });
  })
  const inExcludes = excludes.some(function (exclude) {
    return minimatch(file, exclude, { matchBase: true });
  })

  return ((!includes || !isFile || inIncludes) && (!excludes || !inExcludes));
}

function printFile(file, count = false) {
  let printout = file;
  if (count) {
    let count = ' (' + match.length + ')';
    printout += count;
  }
  console.log(printout);
}

function readDirPromise(file, sync = true) {
  return thenOrPromise(
    file,
    fs.readdir,
    fs.readdirSync,
    sync
  );
}

function readFilePromise(file, sync = true) {
  return thenOrPromise(
    file,
    (val, fn) => fs.readFile(val, 'utf-8', fn),
    (val) => fs.readFileSync(val, 'utf-8'),
    sync
  );
}

function lstatPromise(file, sync = true) {
  return thenOrPromise(file, fs.lstat, fs.lstatSync, sync);
}

function thenOrPromise(arg, func, syncFunc, sync) {
  if (sync) {
    try {
      const stats = syncFunc(arg);
      // return Promise.resolve(stats);
      return new Thener(stats);
    } catch (e) {
      console.log(e);
    }
  } else {
    return new Promise((res, rej) => {
      func(arg, function (err, data) {
        if (err) rej(err);
        else res(data);
      })
    });
  }
}

function canReplace(options) {
  return !options.preview && options.replacement !== undefined;
}

module.exports = function(options) {
  // If the path is the same as the default and the recursive option was not
  // specified, search recursively under the current directory as a
  // convenience.
  if (options.paths.length === 1 &&
    options.paths[0] === sharedOptions.paths.default[0] &&
    !options.hasOwnProperty('recursive')) {
    options.paths = ['.'];
    options.recursive = true;
  }

  let lineCount = 0;

  let flags = 'g'; // global multiline
  if (options.ignoreCase) flags += 'i';

  if (options.multiline) flags += 'm';

  if (!(options.regex instanceof RegExp)) {
    options.regex = new RegExp(options.regex, flags);
  }

  const ignoreFile = options.excludeList || path.join(__dirname, '/defaultignore');
  const ignores = fs.readFileSync(ignoreFile, 'utf-8').split('\n');
  options.excludes = [];
  if (options.exclude) options.excludes = options.exclude.split(',');
  options.excludes = options.excludes.concat(ignores);

  if (options.include) options.includes = options.include.split(',');

  let replaceFunc;
  if (options.funcFile) replaceFunc = require(options.funcFile);

  for (let i = 0; i < options.paths.length; i++) {
    replacize(options.paths[i], !options.async, options);
  }

  function replacizeDirectory(file, sync = true, options) {
    readDirPromise(file, sync).then(function (files) {
      for (let i = 0; i < files.length; i++) {
        if (!options.silent) printFile(file, options.count);
        replacize(path.join(file, files[i]), sync, options);
      }
    });
  }

  function replacize(file, sync = true, options) {
    lstatPromise(file, sync).then(function (stats) {
      if (stats.isSymbolicLink()) return;
      if (stats.isDirectory() && options.recursive) {
        replacizeDirectory(file, sync, options);
      }
      
      let isFile = stats.isFile();
      if (!canSearch(file, isFile, options.includes, options.excludes)) return;
      if (isFile) {
        replacizeFile(file, sync, options);
      }
    });
  }

  function replacizeFile(file, sync = true, options) {
    readFilePromise(file, sync).then(function (text) {
      text = replacizeText(text, file, options);
      console.log(text === null);
      if (canReplace(options) && text !== null) {
        if (sync) {
          fs.writeFileSync(file, text);
        } else {
          fs.writeFile(file, text, function (err) {
            if (err) throw err;
          });
        }
      }
    })
  }

  function replacizeText(text, file, options) {
    const regRep = new RegReplacer(options.regex);
    const regMatches = regRep.match(text);

    if (!regMatches.hasMatches) return null;

    if (!options.silent && !options.quiet
       && !(lineCount > options.maxLines)
       && options.multiline) {
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.match(options.regex)) {
          if (++lineCount > options.maxLines) {
            break;
          }
          let replacement = options.replacement || '$&';
          line = line.replace(options.regex, replaceFunc || replacement);
          console.log(' ' + (i + 1) + ': ' + line.slice(0, options.limit || 400));
        }
      }
    }
    
    let rep;
    if(replaceFunc) {
      return regMatches.replaceAll(replaceFunc, "matches");
    } else {
      return regMatches.replaceAll(options.replacement, "matches");
    }
  }
}