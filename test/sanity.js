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

test('basic', t => {
  t.plan(2)

  const file = join('test_files/test_basic.txt')

  ecalper({
    paths: [file],
    regex: 'a',
    replacement: 'b',
  })

  const expected1 = 'bbbccc'
  t.equal(getText(file), expected1, 'single letter replace works')

  ecalper({
    paths: [file],
    regex: 'b',
    replacement: 'a',
  })

  const expected2 = 'aaaccc'
  t.equal(getText(file), expected2, 'reverting worked')
})

test('numbers', t => {
  t.plan(2)

  const file = join('test_files/test_numbers.txt')

  ecalper({
    paths: [file],
    regex: '123',
    replacement: '456',
  })

  const expected3 = 'a456b'
  t.equal(getText(file), expected3, 'number replace works')

  ecalper({
    paths: [file],
    regex: '456',
    replacement: '123',
  })

  const expected4 = 'a123b'
  t.equal(getText(file), expected4, 'reverting worked')
})

test('multiline', t => {
  t.plan(3)

  const file = join('test_files/test_multiline.txt')

  ecalper({
    multiline: false,
    paths: [file],
    regex: 'c$',
    replacement: 't',
  })

  const expected5 = 'abc\ndef'
  t.equal(getText(file), expected5, "$ shouldn't match without multiline")

  ecalper({
    multiline: true,
    paths: [file],
    regex: 'c$',
    replacement: 't',
  })

  const expected6 = 'abt\ndef'
  t.equal(getText(file), expected6, 'with multiline, $ should match eol')

  ecalper({
    multiline: true,
    paths: [file],
    regex: 't$',
    replacement: 'c',
  })

  const expected7 = 'abc\ndef'
  t.equal(getText(file), expected7, 'reverting worked')
})

test('case insensitive', t => {
  t.plan(2)

  const file = join('test_files/test_case.txt')

  ecalper({
    ignoreCase: true,
    paths: [file],
    regex: 'a',
    replacement: 'c',
  })

  const expected8 = 'cccc'
  t.equal(getText(file), expected8, 'case insensitive replace')

  ecalper({
    paths: [file],
    regex: 'c',
    replacement: 'A',
  })

  const expected9 = 'AAAA'
  t.equal(getText(file), expected9, 'reverting worked')
})

test('preview', t => {
  t.plan(1)

  const file = join('test_files/test_preview.txt')

  ecalper({
    paths: [file],
    preview: true,
    regex: 'a',
    replacement: 'c',
  })

  const expected10 = 'aaaa'
  t.equal(getText(file), expected10, "no replacement if 'preview' is true")
})
