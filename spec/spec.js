var assert = require('assert');
var tmpl, data, expectedOutput, output;
var ht = require('../index.js');

/*******************************************************
 * `{{}}` expression test
 *******************************************************/
assert.equal(ht("{{foo}}", {foo:1}), "1");
assert.equal(ht("{{x.foo}}", {x: {foo: 1}}), "1");
assert.equal(ht("{{x.foo}} {{ x.bar }}", {x: {foo:1, bar: 2}}), "1 2");

/*******************************************************
 * `ht-if` expression test
 *******************************************************/
console.log(1);
assert.equal("<div>YES</div>",
  ht("<div ht-if='x.foo'>YES</div>", {x:{foo:true}}));
console.log(2);
assert.equal("",
  ht("<div ht-if='x.bar'>YES</div>", {x:{foo:true}}));
console.log(3);
assert.equal("<div>NO</div>",
  ht("<div ht-if='!x.bar'>NO</div>", {x:{foo:true}}));

/*******************************************************
 * `ht-repeat` expression test
 *******************************************************/
console.log(4);
assert.equal("<li>1</li><li>2</li><li>3</li>",
  ht("<li ht-repeat='el in [1,2,3]'>{{el}}</li>", {}));
console.log(5);
assert.equal("<li>1</li><li>2</li><li>3</li>",
  ht("<li ht-repeat='el in list'>{{el}}</li>", {list:[1,2,3]}));
console.log(6);
assert.equal("<li>1</li><li>2</li><li>3</li>",
  ht(
    "<li ht-repeat='(k,v) in list'>{{v}}</li>",
    {list:{a:1, b:2, c:3}}
  ));
console.log(7);
assert.equal("<li>a1</li><li>b2</li><li>c3</li>",
  ht(
    "<li ht-repeat='(k,v) in list'>{{k}}{{v}}</li>",
    {list:{a:1, b:2, c:3}}
  ));

/*******************************************************************
 * `ht-include` expression test, passed as non existing property for backwards compatibility
 * file does not exist, so it will print out as html, the file name
 *******************************************************************/
console.log(8);
assert(ht("<div ht-include=\"file1.html\"></div>", {}).match(/<div>.*file1.html<\/div>/));

/*******************************************************************
 * `ht-include` expression test, passed as string
 * file does not exist, so it will print out as html, the file name
 *******************************************************************/
console.log(9);
assert(ht("<div ht-include=\"'file1.html'\"></div>", {}).match(/<div>.*file1.html<\/div>/));

/*******************************************************************
 * `ht-include` expression test, passed as property
 * file does not exist, so it will print out as html, the file name
 *******************************************************************/
console.log(10);
assert(ht("<div ht-include=\"item.template\"></div>", {item:{template:'file2.html'}}).match(/<div>.*file2.html<\/div>/));

/*******************************************************************
 * `ht-include` expression test, passed as property in a repeat
 * file does not exist, so it will print out as html, the file name
 *******************************************************************/
console.log(11);
var exampleResult = ht("<div ht-repeat=\"item in items\"><div ht-include=\"item.template\"></div>", {items:[{template:'file3.html'}, {content:'foo', template:'spec/small.html'}]});
assert(exampleResult.match(/<div>.*file3.html<\/div>/));
assert(exampleResult.match(/<span>foo<\/span>/));

/*******************************************************************
 * `ht-include` expression test, passed as property in a nested repeat with key value
 * file does not exist, so it will print out as html, the file name
 *******************************************************************/
console.log(12);
var exampleResult2 = ht("<div ht-repeat=\"parentItem in items\"><div ht-repeat=\"(key, item) in parentItem.items\"><div ht-include=\"item.template\"></div>", {items:[{items:[{template:'file3.html'}]},{items:[{content:'foo', template:'spec/small.html'}]}]});
assert(exampleResult2.match(/<div>.*file3.html<\/div>/));
assert(exampleResult2.match(/<span>foo<\/span>/));

/*******************************************************************
 * jsdoc template test
 *******************************************************************/
console.log(13);
ht("spec/layout.html",
  {nav:[], children:[{members:[], functions:[]}]},
  {jsMode:false, prefix:'ng'});

  /*******************************************************************
   * cache and preprocess test
   *******************************************************************/

console.log(14);
var exampleResult3 = ht("<div><div ng-include=\"'spec/small.html'\"></div><div ng-include=\"'spec/small.html'\"></div></div>", {item:{content:'foo'}}, {prefix:'ng',cache:'test', preprocess: function(tpl){
  tpl = tpl.replace(/span/g,'div');
  return tpl;
}});
assert(exampleResult3.match(/<div>foo<\/div>/));
assert(ht.cache.get('test').match(/spec\/small\.html/));
assert(ht.cache.get('test$$spec/small.html').match(/item\.content/));
ht.cache.remove('test');
assert(ht.cache.get('test') === undefined);
assert(ht.cache.get('test$$spec/small.html') === undefined);

/*******************************************************************
 * includeDirs test
 *******************************************************************/
console.log(15);
assert.equal('<div><div>test1</div></div>',ht("<div ng-include=\"'small.html'\"></div>", {item:{content:'test1'}}, {prefix:'ng', includeDirs:[__dirname+'/includes',__dirname]}));
