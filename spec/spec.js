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
 * `ht-include` expression test
 * file does not exist, so it will print out as html, the file name
 *******************************************************************/
console.log(8);
assert(ht("<div ht-include=\"file1.html\"></div>", {}).match(/<div>.*file1.html<\/div>/));

/*******************************************************************
 * jsdoc template test
 *******************************************************************/
console.log(9);
var output = ht("spec/layout.html", 
  {nav:[], children:[{members:[], functions:[]}]}, 
  {jsMode:false, prefix:'ng'});

