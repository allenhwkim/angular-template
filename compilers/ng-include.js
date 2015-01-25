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

var compileNgInclude = function($, data, basePath) {
  basePath = basePath || '.';
  $("*[ng-include]").each(function(i, elem) {
    var expr, fileName, filePath;
    expr = $(this).attr('ng-include');
    // if filename string, use as string,
    // if filename is variable, use as expression
    fileName = expr.match(/^['"]|['"]$/) ? 
      expr.replace(/^['"]|['"]$/g, "") : data[expr];
    filePath = path.normalize(basePath + "/" + fileName);
    if (fs.existsSync(filePath)) {
      var includedHtml = fs.readFileSync(filePath);
      var $cheerio =cheerio.load(includedHtml);
      compileNgIf($cheerio, data);
      compileNgClass($cheerio, data);
      compileNgInclude($cheerio, data, basePath);
      compileNgRepeat($cheerio, data);
      var compiled = compileExpression($cheerio.html(), data);
      $(this).html(compiled);
    } else {
      var error= "Invalid ng-include, "+filePath;
      console.error(error);
      $(this).html("<!-- " + error + " -->");
    }

    $(this).removeAttr("ng-include");
  });
};

module.exports = compileNgInclude;
