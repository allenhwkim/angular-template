var path = require('path');
var fs = require('fs');
var cheerio = require("cheerio");
var ngCompileExpression = require(__dirname +'/ng-compile-expression.js'),
    ngCompileNgIf = require(__dirname +'/ng-compile-ng-if.js'),
    ngCompileNgClass = require(__dirname +'/ng-compile-ng-class.js'),
    ngCompileNgRepeat = require(__dirname +'/ng-compile-ng-repeat.js');

/**
 * server-side angular one time bind expression with ng-include
 *
 * Ref. http://toddmotto.com/angular-one-time-binding-syntax/
 * i.e <div ng-include="'file.html'"></div>
 * i.e <div ng-include="variable"></div>
 *
 * ng-include also compiles one time bindings using;
 *   * ng-if : ngCompileNgIf
 *   * ng-class : ngCompileNgClass
 *   * ng-include : ngCompileNgInclud
 *   * ng-repeat : ngCompileNgRepeat
 *   * {{::..}} : ngCompileExpression
 *
 * parameters
 *   $: cheerio object (https://github.com/cheeriojs/cheerio)
 *   data: javascript object
 *   basePath: base path to include file
 */

var ngCompileNgInclude = function($, data, basePath) {
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
      ngCompileNgIf($cheerio, data);
      ngCompileNgClass($cheerio, data);
      ngCompileNgInclude($cheerio, data, basePath);
      ngCompileNgRepeat($cheerio, data);
      var compiled = ngCompileExpression($cheerio.html(), data);
      $(this).html(compiled);
    } else {
      var error= "Invalid ng-include, "+filePath;
      console.error(error);
      $(this).html("<!-- " + error + " -->");
    }

    $(this).removeAttr("ng-include");
  });
};

module.exports = ngCompileNgInclude;
