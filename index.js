var fs = require('fs');
var cheerio = require("cheerio");
var compileExpression = require(__dirname+'/compilers/expression.js'),
    compileNgIf = require(__dirname+'/compilers/ng-if.js'),
    compileNgClass = require(__dirname+'/compilers/ng-class.js'),
    compileNgRepeat = require(__dirname+'/compilers/ng-repeat.js'),
    compileNgInclude = require(__dirname+'/compilers/ng-include.js');

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
  compileNgIf($, data);
  compileNgClass($, data);
  compileNgInclude($, data, basePath);
  compileNgRepeat($, data);
  var compiledHtml = compileExpression($.html(), data);
  return compiledHtml;
};

module.exports = angularTemplate;
