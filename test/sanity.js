const fs = require("fs"),
  test = require('tape'),
  path = require('path'),
  replace = require('../replace');

function getText(file) {
  const content = fs.readFileSync(file, "utf-8");
  return content;
}

function join(file) {
  return path.join(__dirname, 'test_files', file);
}

function tester(name, testData) {
  test(name, function (t) {
    const { file, reps } = testData;
    t.plan(reps.length);

    reps.map(rep => {
      const {
        regex,
        replacement,
        expected,
        text,
        multiline,
        ignoreCase,
        preview,
        async
      } = rep;

      replace({
        regex,
        replacement,
        paths: [join(file)],
        multiline,
        ignoreCase,
        preview,
        async
      })
      t.equal(getText(join(file)), expected, text);
    });
  })
}

const files = {
  basic: 'test_basic.txt',
  multi: 'test_multiline.txt',
  case: 'test_case.txt',
  nums: 'test_numbers.txt',
  prev: 'test_preview.txt'
}

const basic = {
  file: files.basic,
  reps: [
    {
      regex: 'a',
      replacement: 'b',
      expected: 'bbbccc',
      text: 'single letter replace works',
      multiline: false,
      ignoreCase: false,
      preview: false,
      async: false
    },
    {
      regex: 'b',
      replacement: 'a',
      expected: 'aaaccc',
      text: 'reverting worked',
      multiline: false,
      ignoreCase: false,
      preview: false,
      async: false
    }
  ]
}

tester('basic', basic);

const numbers = {
  file: files.nums,
  reps: [
    {
      regex: '123',
      replacement: '456',
      expected: 'a456b',
      text: 'number replace works',
      multiline: false,
      ignoreCase: false,
      preview: false,
      async: false
    },
    {
      regex: '456',
      replacement: '123',
      expected: 'a123b',
      text: 'reverting worked',
      multiline: false,
      ignoreCase: false,
      preview: false,
      async: false
    }
  ]
}

tester('numbers', numbers);

const multiline = {
  file: files.multi,
  reps: [
    {
      regex: "c$",
      replacement: "t",
      expected: "abc\ndef",
      text: "$ shouldn't match without multiline",
      multiline: false,
      ignoreCase: false,
      preview: false,
      async: false
    },
    {
      regex: 'c$',
      replacement: 't',
      expected: 'abt\ndef',
      text: 'with multiline, $ should match eol',
      multiline: true,
      ignoreCase: false,
      preview: false,
      async: false
    },
    {
      regex: 't$',
      replacement: 'c',
      expected: 'abc\ndef',
      text: 'reverting worked',
      multiline: true,
      ignoreCase: false,
      preview: false,
      async: false
    }
  ]
}

tester('multiline', multiline);

const caseIn = {
  file: files.case,
  reps: [
    {
      regex: "a",
      replacement: "c",
      expected: "cccc",
      text: "case insensitive replace",
      multiline: false,
      ignoreCase: true,
      preview: false,
      async: false
    },
    {
      regex: 'c',
      replacement: 'A',
      expected: 'AAAA',
      text: 'reverting worked',
      multiline: false,
      ignoreCase: false,
      preview: false,
      async: false
    }
  ]
}

tester('case insensitive', caseIn);

const preview = {
  file: files.prev,
  reps: [
    {
      regex: "a",
      replacement: "c",
      expected: "aaaa",
      text: "no replacement if 'preview' is true",
      multiline: false,
      ignoreCase: false,
      preview: true,
      async: false
    }
  ]
}

tester('preview', preview);

// const async = {
//   file: files.prev,
//   reps: [
//     {
//       regex: "a",
//       replacement: "c",
//       expected: "aaaa",
//       text: "no replacement if 'preview' is true",
//       multiline: true,
//       ignoreCase: false,
//       preview: false,
//       async: true
//     }
//   ]
// }

// tester('async', async);