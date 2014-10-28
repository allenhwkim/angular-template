var AngularTemplate = require(__dirname+'/../../angular-template.js');
var fs = require("fs");
var assert = require("assert");

var scope = {
  trueCase: true,
  falseCase: false,
  foo: 'foooooooo',
  bar: {baz: 'bazzzzz'},
  elements: [
    {name: 'el1', desc: 'el1 desc'},
    {name: 'el2', desc: 'el2 desc'}
  ],
};

var result, expected;
var inputHtml = fs.readFileSync(__dirname+"/input.html");
var template = AngularTemplate({
  basePath: __dirname
});
result = template.compile(inputHtml, scope);
//console.log('result', result);

expected = fs.readFileSync(__dirname+"/expected.html", 'utf8');
assert(result.trim()===expected.trim());

var template = AngularTemplate({
  basePath: __dirname,
  layout: __dirname+"/layout.html"
});
result = template.compile(inputHtml, scope);
expected = fs.readFileSync(__dirname+"/expected-with-layout.html", 'utf8');
assert(result.trim()===expected.trim());

