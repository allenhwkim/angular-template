var path = require('path');
var fs = require('fs');
var cheerio = require("cheerio");
var LayoutDecorator = require("./layout-decorator.js");
var debug = debug || 0;


/**
 * change ng-if, ng-include, ng-repeat to server-*,
 * so that, it won't be performed by angular later
 */
var nullifyAttr = function(elem, attrName) {
  elem.attr('server-'+attrName, elem.attr(attrName));
  elem.removeAttr(attrName);
  elem.removeAttr('bind-once');
  debug && console.log('changed', attrName, 'to server-'+attrName);
};

/**
 * process angularjs bind once expressions. i.e. {{::expression}}
 */
var compileExpression = function(html, scope) {
  var compiledHtml = html;
  compiledHtml = compiledHtml.replace(/{{::([^}]+)}}/g, function(_, expr) {
    var val = eval("scope."+expr);
    var ret;
    if (val) {
      ret = val;
    } else {
      ret = "<!-- invalid expression, " + expr + " -->";
    }
    debug && console.log("compiling", expr, "to", ret);
    return ret;
  });

  return compiledHtml;
};

/**
 * validate ng-if, and remove contents if false
 */
var compileNgIf = function($, scope) {
  var ngIfs = $("*[ng-if][bind-once]");
  ngIfs.each(function(i, elem) {
    var expr = $(this).attr('ng-if');
    var condition = !!eval("scope."+expr);
    if (!condition) {
      $(this).html("");
      debug && console.log('removed the contents of ng-if', expr);
    }

    nullifyAttr($(this), 'ng-if'); // to server-ng-if
  });
  return $;
};

/**
 * include the contents of ng-include
 */
var compileNgInclude = function($, basePath, scope) {
  if (!basePath || !fs.existsSync(basePath)) {
    throw "Invalid basePath for ng-include. please set basePath";
  }
  var ngIncludes = $("*[ng-include][bind-once]");
  ngIncludes.each(function(i, elem) {
    var expr = $(this).attr('ng-include');
    var fileName = expr.replace(/^['"]|['"]$/g, "");
    var filePath = path.normalize(basePath + "/" + fileName);
    if (fs.existsSync(filePath)) {
      debug && console.log('processing ng-include', filePath);
      var includedHtml = fs.readFileSync(filePath);
      var template = AngularTemplate({basePath: basePath});
      $(this).html(template.compile(includedHtml, scope));
    } else {
      var error= "Invalid ng-include, "+filePath;
      console.error(error);
      $(this).html("<!-- " + error + " -->");
    }

    nullifyAttr($(this), 'ng-include');// to server-ng-include
  });
  return $;
};

/**
 * process ng-repeat
 */
var compileNgRepeat = function($, scope) {
  var ngRepeats = $("*[ng-repeat][bind-once]");
  ngRepeats.each(function(i, elem) {
    var expr = $(this).attr('ng-repeat').trim();
    debug && console.log('processing ng-repeat', expr);
    try {
      var matches = expr.match(/^(.*?) in (.*?)$/);
      var keyStr, valueStr;
      var keyValueMatches = matches[1].trim().match(/^\(([^,]+),\s?([^\)]+)\)$/);
      if (keyValueMatches) { // (key, val)
        keyStr = keyValueMatches[1];
        valueStr = keyValueMatches[1];
      } else {
        valueStr = matches[1].trim().match(/^[a-zA-Z_0-9]+/)[0];
      }
      var collectionStr = matches[2].trim().match(/[^ ]+/)[0];
      var collection = eval("scope."+collectionStr);

      var compiledHtml = "";
      for (var key in collection) {
        var elScope = {};
        elScope[keyStr] = key;
        elScope[valueStr] = collection[key];
        var template = "\n" + $(this).html().trim();
        compiledHtml += compileExpression(template, elScope);
      }

      $(this).html(compiledHtml);
    } catch (e) {
      var error= "Invalid ng-repeat expression, "+expr;
      console.log('e', e);
      console.log('e.stack', e.stack);
      console.error(error);
      $(this).html("<!-- " + error + " -->");
    }

    nullifyAttr($(this), 'ng-repeat');// to server-ng-include
  });

  return $;
};

var AngularTemplate = function(options) {
  debug && console.log('options', options);
  options = options || {};

  if (options.basePath) {
    if (!fs.existsSync(options.basePath)) {
      throw "Invalid basePath, " + options.basePath;
    }
  } else {
    options.basePath = path.normalize(".");
  }

  if (options.layout && !fs.existsSync(options.layout)) {
    throw "Invalid layout, " + options.layout;
  }

  return {
    layout: options.layout,
    basePath: options.basePath,
    compile : function(html, scope) {
      var $=cheerio.load(html);
      compileNgIf($, scope);
      compileNgInclude($, options.basePath, scope);
      compileNgRepeat($, scope);
      var compiled = compileExpression($.html(), scope);
      if (options.layout) {
        var layout = new LayoutDecorator({layout:options.layout});
        compiled = layout.compile(compiled);
      }
      return compiled;
    }
  }
  this.init(options);
};

module.exports = AngularTemplate;
