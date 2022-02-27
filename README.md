# ecalper

[![img-license]][lnk-license] [![img-github]][lnk-github] [![img-npm]][lnk-npm]

`ecalper` is a command line utility for performing search-and-replace on files. It's similar to sed but there are a few differences:

* Modifies files when matches are found
* Recursive search on directories with -r
* Uses [JavaScript syntax](https://developer.mozilla.org/en/JavaScript/Guide/Regular_Expressions#Using_Simple_Patterns) for regular expressions and [replacement strings](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter).

## Install

With [node.js](http://nodejs.org/) and [npm](http://github.com/isaacs/npm):

 npm install -g ecalper

You can now use `replace` and `search` from the command line.

## Examples

Replace all occurrences of "foo" with "bar" in files in the current directory:

```sh
ecalper 'foo' 'bar' *
```

Replace in all files in a recursive search of the current directory:

```sh
ecalper 'foo' 'bar' . -r
```

Replace only in test/file1.js and test/file2.js:

```sh
ecalper 'foo' 'bar' test/file1.js test/file2.js
```

Replace all word pairs with "_" in middle with a "-":

```sh
ecalper '(\w+)_(\w+)' '$1-$2' *
```

Replace only in files with names matching *.js:

```sh
ecalper 'foo' 'bar' . -r --include="*.js"
```

Don't replace in files with names matching *.min.js and*.py:

```sh
ecalper 'foo' 'bar' . -r --exclude="*.min.js,*.py"
```

Preview the replacements without modifying any files:

```sh
ecalper 'foo' 'bar' . -r --preview
```

Replace using stdin:

```sh
echo "asd" | replace "asd" "dsa" -z
```

See all the options:

```sh
ecalper -h
```

## Search

There's also a `search` command. It's like `grep`, but with `replace`'s syntax.

```sh
search "setTimeout" . -r
```

## Programmatic Usage

You can use replace from your JS program:

```js
import ecalper from 'ecalper'

ecalper({
  regex: "foo",
  replacement: "bar",
  paths: ['./Test/'],
  recursive: false,
  silent: false,
})
```

## More Details

### Excludes

By default, `ecalper` and `search` will exclude files (binaries, images, etc) that match patterns in the `"defaultignore"` located in this directory.

### On huge directories

If `ecalper` is taking too long on a large directory, try turning on the quiet flag with `-q`, only including the necessary file types with `--include` or limiting the lines shown in a preview with `-n`.

---

[img-github]: https://img.shields.io/github/workflow/status/ivangabriele/ecalper/Check/main?style=flat-square
[img-license]: https://img.shields.io/github/license/ivangabriele/ecalper?style=flat-square
[img-npm]: https://img.shields.io/npm/v/ecalper?style=flat-square
[lnk-github]: https://github.com/ivangabriele/ecalper/actions?query=branch%3Amain++
[lnk-license]: https://github.com/ivangabriele/ecalper/blob/main/LICENSE
[lnk-npm]: https://www.npmjs.com/package/ecalper
