const fs = require("fs"),
    test = require('tape'),
    path = require('path'),
    replace = require('../replace');

function getText(file) {
  const content = fs.readFileSync(file, "utf-8");
  return content;
}

function join(file) {
  return path.join(__dirname, file);
}

test('recursive', function (t) {
  t.plan(7);

  replace({
    regex: "a",
    replacement: "b",
    paths: [join("test_files/test_paths")],
    recursive: true
  });

  const changedFiles = [
    "test_files/test_paths/test1.txt",
    "test_files/test_paths/test2.txt",
    "test_files/test_paths/sample1.txt"];
  let expected = "bbbb";
  changedFiles.map(f =>
    t.equal(getText(join(f)), expected, "recursive replace on directory " + f)
  )

  expected = "aaaa";
  const ignored = "test_files/test_paths/test.png"
  t.equal(getText(join(ignored)), expected, "skip file with match in defaultignore")

  replace({
    regex: "b",
    replacement: "a",
    paths: [join("test_files/test_paths")],
    recursive: true
  });

  changedFiles.map(f =>
    t.equal(getText(join(f)), expected, "reverting worked")
  );
});

test('include', function(t) {
  t.plan(5);

  replace({
    regex: "a",
    replacement: "b",
    paths: [join("test_files/test_paths")],
    recursive: true,
    include: "sample*.txt"
  });

  const changedFiles = [
    "test_files/test_paths/sample1.txt",
  ];
  let expected = "bbbb";
  changedFiles.map(f =>
    t.equal(getText(join(f)), expected, "replace in included file " + f)
  );

  const ignoredFiles = [
    "test_files/test_paths/test1.txt",
    "test_files/test_paths/test2.txt",
    "test_files/test_paths/test.png"];
  expected = "aaaa";
  ignoredFiles.map(f =>
    t.equal(getText(join(f)), expected, "don't replace in not-included file " + f)
  );

  replace({
    regex: "b",
    replacement: "a",
    paths: [join("test_files/test_paths")],
    recursive: true
  });

  expected = "aaaa";
  changedFiles.map(f =>
    t.equal(getText(join(f)), expected, "reverting worked")
  );
})

test('exclude', function(t) {
  t.plan(6);

  replace({
    regex: "a",
    replacement: "b",
    paths: [join("test_files/test_paths")],
    recursive: true,
    exclude: "*sample*.txt"
  });

  const changedFiles = [
    "test_files/test_paths/test1.txt",
    "test_files/test_paths/test2.txt"];
  let expected = "bbbb";
  changedFiles.map(f =>
    t.equal(getText(join(f)), expected, "replace in non-excluded file " + f)
  );

  const ignoredFiles = [
    "test_files/test_paths/sample1.txt",
    "test_files/test_paths/test.png"];
  expected = "aaaa";
    ignoredFiles.map(f =>
    t.equal(getText(join(f)), expected, "don't replace in excluded file " + f)
  );

  replace({
    regex: "b",
    replacement: "a",
    paths: [join("test_files/test_paths")],
    recursive: true
  });

  expected = "aaaa";
  changedFiles.map(f =>
    t.equal(getText(join(f)), expected, "reverting worked")
  )
})