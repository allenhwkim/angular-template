var LayoutDecorator = require(__dirname +'/../../layout-decorator.js');
var fs = require("fs");
var assert = require("assert");

var layout = new LayoutDecorator({layout: __dirname +"/layout.html"});
var contents = fs.readFileSync(__dirname + "/input.html", 'utf8');
var result = layout.compile(contents);
//console.log('result', result);

var expected = fs.readFileSync(__dirname +"/expected.html", 'utf8');
assert(result.trim()===expected.trim());
