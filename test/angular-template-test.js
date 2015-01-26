var assert = require("assert");
var cheerio = require("cheerio");
var html = require('html');
var fs = require('fs');
var angularTemplate = require(__dirname + '/../index.js');

module.exports = function() {
  /**
   * angular-template test
   */
  var html = fs.readFileSync(__dirname+'/layout.html' );
  var output = angularTemplate(html, {
      content: 'includes/include-level1.html', 
      foo: true,
      bar: false,
      fuz: 'baz',
      collection: [1,2,3,4,5]
    }, __dirname);
  assert(output.length > 100);
  assert(output.indexOf("YES"));
  assert(output.indexOf("baz"));
  assert(output.indexOf("id5"));
};
