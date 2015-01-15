var fs = require('fs');
var cheerio = require("cheerio");
var ngCompileExpression = require(__dirname+'/lib/ng-compile-expression.js'),
    ngCompileNgIf = require(__dirname+'/lib/ng-compile-ng-if.js'),
    ngCompileNgClass = require(__dirname+'/lib/ng-compile-ng-class.js'),
    ngCompileNgRepeat = require(__dirname+'/lib/ng-compile-ng-repeat.js'),
    ngCompileNgInclude = require(__dirname+'/lib/ng-compile-ng-include.js');

/**
 * server-side angular template that converts all one time binding expressions
 * It does process the following one time binding expressions;
 *
 *   * ng-if
 *   * ng-class 
 *   * ng-include
 *   * ng-repeat
 *   * {{::..}}
 *
 * parameters
 *   html : html to be compiled
 *   data: javascript object
 *   basePath: base path to include file
 */
var angularTemplate = function(html, data, basePath) {
  basePath = basePath || '.';
  var $ =cheerio.load(html);
  ngCompileNgIf($, data);
  ngCompileNgClass($, data);
  ngCompileNgInclude($, data, basePath);
  ngCompileNgRepeat($, data);
  var compiledHtml = ngCompileExpression($.html(), data);
  return compiledHtml;
};

module.exports = angularTemplate;
