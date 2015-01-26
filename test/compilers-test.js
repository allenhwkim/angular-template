var assert = require("assert");
var cheerio = require("cheerio");
var html = require('html');
var fs = require('fs');
var compileExpression = require(__dirname + '/../compilers/expression.js');
var compileNgIf = require(__dirname + '/../compilers/ng-if.js');
var compileNgClass = require(__dirname + '/../compilers/ng-class.js');
var compileNgRepeat = require(__dirname + '/../compilers/ng-repeat.js');

module.exports = function() {
  /**
   * expression test
   */
  assert.equal(compileExpression(" {{::foo}} ", {foo:1}), " 1 ");
  assert.equal(compileExpression(" {{::x.foo}} ", {x: {foo: 1}}), " 1 ");
  assert.equal(compileExpression(" {{::x.foo}} {{ ::x.bar }} ", {x: {foo:1, bar: 2}}), " 1 2 ");

  /**
   * ng-if test
   */
  var $=cheerio.load(
    "<div id=1 ng-if='::x.foo'>YES</div>\n"+
    "<div id=2 ng-if='::x.bar'>NO</div>\n"+
    "<div id=3 ng-if='x.bar'>YES</div>\n"
  );
  compileNgIf($, {x:{foo:true}});
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
  compileNgClass($, {foo:true, bar: false});
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
  compileNgRepeat($, {array: [{name:'foo'}, {name:'bar'}, {name: 'baz'}], obj: {foo:1, bar:2, baz:3}});
  assert.equal($('#1').html(), "<li>foo</li>\n<li>bar</li>\n<li>baz</li>");
  assert.equal($('#2').children().length, 1);
  assert.equal($('#3').html(), "<li>foo:1</li>\n<li>bar:2</li>\n<li>baz:3</li>");
};
