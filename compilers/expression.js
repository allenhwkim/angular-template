var entities = require("entities");

/**
 * server-side angular one time bind expression with {{ ... }}
 * Ref. http://toddmotto.com/angular-one-time-binding-syntax/
 * i.e {{ ::vm.user }}, {{::vm.user}}
 * parameters
 *   html: string
 *   data: javascript object
 */
var compileExpression = function(html, data) {
  var compiledHtml = html;
  compiledHtml = compiledHtml.replace(/{{[ ]*::([^}]+)[ ]*}}/g, function(_, expr) {
    expr = entities.decodeHTML(expr);
    try {
      return  eval("data."+expr);
    } catch(e) {
      console.error(" invalid expression ", expr);
    }
  });

  return compiledHtml;
};

var assert = require("assert");
assert.equal(compileExpression(" {{::foo}} ", {foo:1}), " 1 ");
assert.equal(compileExpression(" {{::x.foo}} ", {x: {foo: 1}}), " 1 ");
assert.equal(compileExpression(" {{::x.foo}} {{ ::x.bar }} ", {x: {foo:1, bar: 2}}), " 1 2 ");

module.exports = compileExpression;
