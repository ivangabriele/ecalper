const fs = require('fs')
const path = require('path')
const test = require('tape')

const ecalper = require('../ecalper')

function getText(file) {
  const content = fs.readFileSync(file, 'utf-8')

  return content
}

function join(file) {
  return path.join(__dirname, file)
}

test('recursive', t => {
  t.plan(7)

  ecalper({
    paths: [join('test_files/test_paths')],
    recursive: true,
    regex: 'a',
    replacement: 'b',
  })

  const changedFiles = [
    join('test_files/test_paths/test1.txt'),
    join('test_files/test_paths/test2.txt'),
    join('test_files/test_paths/sample1.txt'),
  ]
  const expected1 = 'bbbb'
  changedFiles.forEach(file => {
    t.equal(getText(file), expected1, `recursive replace on directory ${file}`)
  })

  const expected2 = 'aaaa'
  const ignored = join('test_files/test_paths/test.png')
  t.equal(getText(ignored), expected2, 'skip file with match in defaultignore')

  ecalper({
    paths: [join('test_files/test_paths')],
    recursive: true,
    regex: 'b',
    replacement: 'a',
  })

  changedFiles.forEach(file => {
    t.equal(getText(file), expected2, 'reverting worked')
  })
})

test('include', t => {
  t.plan(5)

  ecalper({
    include: 'sample*.txt',
    paths: [join('test_files/test_paths')],
    recursive: true,
    regex: 'a',
    replacement: 'b',
  })

  const changedFiles = [join('test_files/test_paths/sample1.txt')]
  const expected3 = 'bbbb'
  changedFiles.forEach(file => {
    t.equal(getText(file), expected3, `replace in included file ${file}`)
  })

  const ignoredFiles = [
    join('test_files/test_paths/test1.txt'),
    join('test_files/test_paths/test2.txt'),
    join('test_files/test_paths/test.png'),
  ]
  const expected4 = 'aaaa'
  ignoredFiles.forEach(file => {
    t.equal(getText(file), expected4, `don't replace in not-included file ${file}`)
  })

  ecalper({
    paths: [join('test_files/test_paths')],
    recursive: true,
    regex: 'b',
    replacement: 'a',
  })

  const expected5 = 'aaaa'
  changedFiles.forEach(file => {
    t.equal(getText(file), expected5, 'reverting worked')
  })
})

test('exclude', t => {
  t.plan(6)

  ecalper({
    exclude: '*sample*.txt',
    paths: [join('test_files/test_paths')],
    recursive: true,
    regex: 'a',
    replacement: 'b',
  })

  const changedFiles = [join('test_files/test_paths/test1.txt'), join('test_files/test_paths/test2.txt')]
  const expected = 'bbbb'
  changedFiles.forEach(file => {
    t.equal(getText(file), expected, `replace in non-excluded file ${file}`)
  })

  const ignoredFiles = [join('test_files/test_paths/sample1.txt'), join('test_files/test_paths/test.png')]
  const expected6 = 'aaaa'
  ignoredFiles.forEach(file => {
    t.equal(getText(file), expected6, `don't replace in excluded file ${file}`)
  })

  ecalper({
    paths: [join('test_files/test_paths')],
    recursive: true,
    regex: 'b',
    replacement: 'a',
  })

  const expected7 = 'aaaa'
  changedFiles.forEach(file => {
    t.equal(getText(file), expected7, 'reverting worked')
  })
})
