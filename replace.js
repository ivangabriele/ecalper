const fs = require('fs'),
  path = require('path'),
  colors = require('colors'),
  minimatch = require('minimatch'),
  sharedOptions = require('./bin/shared-options'),
  Thener = require('thener').default;

function canSearch(file, isFile, includes, excludes) {
  const inIncludes = includes && includes.some(function (include) {
    return minimatch(file, include, { matchBase: true });
  })
  const inExcludes = excludes.some(function (exclude) {
    return minimatch(file, exclude, { matchBase: true });
  })

  return ((!includes || !isFile || inIncludes) && (!excludes || !inExcludes));
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
  const limit = 400; // chars per line

  if (!options.color) options.color = 'cyan';

  let flags = 'g'; // global multiline
  if (options.ignoreCase) flags += 'i';

  if (options.multiline) flags += 'm';

  let regex;
  if (options.regex instanceof RegExp) {
    regex = options.regex;
  } else {
    regex = new RegExp(options.regex, flags);
  }
  const canReplace = !options.preview && options.replacement !== undefined;

  let includes;
  if (options.include) includes = options.include.split(',');

  let excludes = [];
  if (options.exclude) {
    excludes = options.exclude.split(',');
  }
  const ignoreFile = options.excludeList || path.join(__dirname, '/defaultignore');
  const ignores = fs.readFileSync(ignoreFile, 'utf-8').split('\n');
  excludes = excludes.concat(ignores);

  var replaceFunc;
  if (options.funcFile) {
    eval('replaceFunc = ' + fs.readFileSync(options.funcFile, 'utf-8'));
  }

  for (let i = 0; i < options.paths.length; i++) {
    replacizeFile(options.paths[i], !options.async);
  }

  function replacizeFile(file, sync = true) {
    lstatPromise(file, sync).then(function (stats) {
      if (stats.isSymbolicLink()) {
        // don't follow symbolic links for now
        return;
      }
      var isFile = stats.isFile();
      if (!canSearch(file, isFile, includes, excludes)) {
        return;
      }
      if (isFile) {
        readFilePromise(file, sync).then(function (text) {
          text = replacizeText(text, file);
          if (canReplace && text !== null) {
            if(sync) {
              fs.writeFileSync(file, text);
            } else {
              fs.writeFile(file, text, function (err) {
                if (err) throw err;
              });
            }
          }
        })
      }
      else if (stats.isDirectory() && options.recursive) {
        readDirPromise(file, sync).then(function(files) {
          for (var i = 0; i < files.length; i++) {
            replacizeFile(path.join(file, files[i]), sync);
          }
        })
      }
    });
  }

  function replacizeText(text, file) {
    const match = text.match(regex);
    if (!match) {
      return null;
    }

    if (!options.silent) {
      let printout = options.noColor ? file : file[options.fileColor] || file;
      if (options.count) {
        let count = ' (' + match.length + ')';
        count = options.noColor ? count : count.grey;
        printout += count;
      }
      console.log(printout);
    }
    if (!options.silent && !options.quiet
       && !(lineCount > options.maxLines)
       && options.multiline) {
      const lines = text.split('\n');
      for (var i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.match(regex)) {
          if (++lineCount > options.maxLines) {
            break;
          }
          let replacement = options.replacement || '$&';
          if (!options.noColor) {
            replacement = replacement[options.color];
          }
          line = line.replace(regex, replaceFunc || replacement);
          console.log(' ' + (i + 1) + ': ' + line.slice(0, limit));
        }
      }
    }
    if (canReplace) {
      return text.replace(regex, replaceFunc || options.replacement);
    }
  }
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

