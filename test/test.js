var assert = require("assert");
var cheerio = require("cheerio");
var html = require('html');
var fs = require('fs');
var ngCompileExpression = require(__dirname + '/../lib/ng-compile-expression.js');
var ngCompileNgIf = require(__dirname + '/../lib/ng-compile-ng-if.js');
var ngCompileNgClass = require(__dirname + '/../lib/ng-compile-ng-class.js');
var ngCompileNgRepeat = require(__dirname + '/../lib/ng-compile-ng-repeat.js');
var ngCompileNgInclude = require(__dirname + '/../lib/ng-compile-ng-include.js');
var angularTemplate = require(__dirname + '/../index.js');

/**
 * expression test
 */
assert.equal(ngCompileExpression(" {{::foo}} ", {foo:1}), " 1 ");
assert.equal(ngCompileExpression(" {{::x.foo}} ", {x: {foo: 1}}), " 1 ");
assert.equal(ngCompileExpression(" {{::x.foo}} {{ ::x.bar }} ", {x: {foo:1, bar: 2}}), " 1 2 ");

/**
 * ng-if test
 */
var $=cheerio.load(
  "<div id=1 ng-if='::x.foo'>YES</div>\n"+
  "<div id=2 ng-if='::x.bar'>NO</div>\n"+
  "<div id=3 ng-if='x.bar'>YES</div>\n"
);
ngCompileNgIf($, {x:{foo:true}});
assert.equal($("#1").html(), "YES");
assert.equal($("#2").html(), "");
assert.equal($("#3").html(), "YES");


/**
 * ng-class test
 */
var $ = cheerio.load(
  "<p id='1' class='existing' ng-class='::{foo: c-foo, bar: c-bar}'></p>\n" + 
  "<p id='2' class='existing' ng-class='{foo: c-foo, bar: c-bar}'></p>\n" 
);
ngCompileNgClass($, {foo:true, bar: false});
assert.equal($('#1').attr('class'), 'existing c-foo');
assert.equal($('#2').attr('class'), 'existing');


/**
 * ng-repeat test
 */
var $ = cheerio.load(
  "<ul id=1><li ng-repeat='user in ::array'>{{::user.name}}</li></ul>\n" + 
  "<ul id=2><li ng-repeat='user in array'>{{user.name}}</li></ul>\n"+
  "<ul id=3><li ng-repeat='(key,value) in ::obj'>{{::key}}:{{::value}}</li></ul>\n"  
);
ngCompileNgRepeat($, {array: [{name:'foo'}, {name:'bar'}, {name: 'baz'}], obj: {foo:1, bar:2, baz:3}});
assert.equal($('#1').html(), "<li>foo</li>\n<li>bar</li>\n<li>baz</li>");
assert.equal($('#2').children().length, 1);
assert.equal($('#3').html(), "<li>foo:1</li>\n<li>bar:2</li>\n<li>baz:3</li>");

/**
 * ng-include test
 */
var $ = cheerio.load("<div id='main' ng-include='content'></div>");
ngCompileNgInclude($, {
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
