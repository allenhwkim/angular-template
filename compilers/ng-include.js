var path = require('path');
var fs = require('fs');
var cheerio = require("cheerio");
var compileExpression = require(__dirname +'/expression.js'),
    compileNgIf = require(__dirname +'/ng-if.js'),
    compileNgClass = require(__dirname +'/ng-class.js'),
    compileNgRepeat = require(__dirname +'/ng-repeat.js');

/**
 * server-side angular one time bind expression with ng-include
 *
 * Ref. http://toddmotto.com/angular-one-time-binding-syntax/
 * i.e <div ng-include="'file.html'"></div>
 * i.e <div ng-include="variable"></div>
 *
 * ng-include also compiles one time bindings using;
 *   * ng-if : compileNgIf
 *   * ng-class : compileNgClass
 *   * ng-include : compileNgInclud
 *   * ng-repeat : compileNgRepeat
 *   * {{::..}} : compileExpression
 *
 * parameters
 *   $: cheerio object (https://github.com/cheeriojs/cheerio)
 *   data: javascript object
 *   basePath: base path to include file
 */
var getCompiledHtml = function(html, data, basePath) {
  var $cheerio = cheerio.load(html);
  compileNgIf($cheerio, data);
  compileNgClass($cheerio, data);
  compileNgInclude($cheerio, data, basePath);
  compileNgRepeat($cheerio, data);
  var compiledHtml = compileExpression($cheerio.html(), data);
  return compiledHtml;
};

var compileNgInclude = function($, data, basePath) {
  basePath = basePath || '.';
  $("*[ng-include]").each(function(i, elem) {
    var expr, fileName, filePath, html;
    expr = $(this).attr('ng-include');
    // if file name is string
    if (expr.match(/^['"]|['"]$/)) {
      fileName = expr.replace(/^['"]|['"]$/g, "");
      filePath = path.normalize(basePath + "/" + fileName);
      html = fs.readFileSync(filePath);
    } 
    else {
      fileName = data[expr];
      filePath = path.normalize(basePath + "/" + fileName);
      // ng-include has valule of variable and it is a file
      if (fs.existsSync(filePath)) {
        html = fs.readFileSync(filePath);
      }
      // ng-include has valule of variable and it is string
      else {
        html = ""+data[expr];
      }
    }
    html = getCompiledHtml(html, data, basePath);
    $(this).html(html);
    $(this).removeAttr("ng-include");
  });
};

module.exports = compileNgInclude;
