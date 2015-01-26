var assert = require("assert");
var cheerio = require("cheerio");
var html = require('html');
var fs = require('fs');
var compileNgInclude = require(__dirname + '/../compilers/ng-include.js');

/** output should look like this:
<div id="main">
  <div id="level1">
    <div id="level2">
      <div id="1">YES</div>
      <div id="2"></div>
      <div id="3" class="c-foo"></div>
      <div id="4">baz</div>
      <div id="id1">1</div>
      <div id="id2">2</div>
      <div id="id3">3</div>
      <div id="id4">4</div>
      <div id="id5">5</div>
    </div>
  </div>
</div> */

module.exports = function() {
  var $;

  /**
   * ng-include test with file given by variable
   */
  $ = cheerio.load("<div id='main' ng-include='content'></div>");
  compileNgInclude($, {
      content: 'includes/include-level1.html', 
      foo: true,
      bar: false,
      fuz: 'baz',
      collection: [1,2,3,4,5]
    }, __dirname);
  assert.equal($("#main #level1 #level2").text().replace(/\s/g,''), "YESbaz12345");
  assert.equal($("#1").text(), "YES");
  assert.equal($("#2").text(), "");
  assert.equal($("#3").attr('class'), "c-foo");
  assert.equal($("#4").text(), "baz");
  assert.equal($("#id5").text(), "5");

  /**
   * ng-include test with file given by string
   */
  $ = cheerio.load("<div id='main' ng-include=\"'includes/include-level1.html'\"></div>");
  compileNgInclude($, {
      content: 'includes/include-level1.html', 
      foo: true,
      bar: false,
      fuz: 'baz',
      collection: [1,2,3,4,5]
    }, __dirname);
  assert.equal($("#main #level1 #level2").text().replace(/\s/g,''), "YESbaz12345");

  /**
   * ng-include test with with contents as string, not a file
   */
  $ = cheerio.load("<div id='main' ng-include='content'></div>");
  var html = fs.readFileSync(__dirname + '/includes/include-level1.html');
  compileNgInclude($, {
      content: html, 
      foo: true,
      bar: false,
      fuz: 'baz',
      collection: [1,2,3,4,5]
    }, __dirname);
  assert.equal($("#main #level1 #level2").text().replace(/\s/g,''), "YESbaz12345");
};
