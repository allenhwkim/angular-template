var fs = require('fs');
var cheerio = require("cheerio");
var ngCompileExpression = require(__dirname+'/lib/ng-compile-expression.js'),
    ngCompileNgIf = require(__dirname+'/lib/ng-compile-ng-if.js'),
    ngCompileNgClass = require(__dirname+'/lib/ng-compile-ng-class.js'),
    ngCompileNgRepeat = require(__dirname+'/lib/ng-compile-ng-repeat.js'),
    ngCompileNgInclude = require(__dirname+'/lib/ng-compile-ng-include.js');

var angularTemplate = function(htmlFile, data, basePath) {
  basePath = basePath || '.';
  var html = fs.readFileSync(htmlFile);
  var $ =cheerio.load(html);
  ngCompileNgIf($, data);
  ngCompileNgClass($, data);
  ngCompileNgInclude($, data, basePath);
  ngCompileNgRepeat($, data);
  var compiledHtml = ngCompileExpression($.html(), data);
  return compiledHtml;
};

module.exports = angularTemplate;
