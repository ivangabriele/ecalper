const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const test = require('tape')

const bin = require.resolve('../bin/ecalper')

function getText(file) {
  const content = fs.readFileSync(file, 'utf-8')

  return content
}

function join(file) {
  return path.join(__dirname, file)
}

test('basic', t => {
  t.plan(1)

  const input = join('test_files/test_basic.txt')
  const original = getText(input)
  t.on('end', () => {
    fs.writeFileSync(input, original, 'utf-8')
  })

  childProcess.spawnSync(process.execPath, [bin, 'ac', 'DC', input])

  t.equal(getText(input), 'aaDCcc')
})
