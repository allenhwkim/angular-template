'use strict';
var path = require('path');

function IncludeDirective($, data, options, angularTemplate) {
  /**
    * ht-include expression
    */
  var htIncludes = $("*[" + options.prefix + "-include]");
  htIncludes.each(function (i, elem) {
    var context = ($(this).attr(options.prefix + '-include-context') || '{}').trim();
    var repeatParents = [];
    var existingContextProperties = [];
    // parse all repeat expressions from all the parents
    $(this).parents("[" + options.prefix + "-repeat]").each(function (pi, parent) {
      var result = angularTemplate.helpers.parseRepeatExpression($(this).attr(options.prefix + '-repeat'));
      if (result) {
        repeatParents.push(result); // remember all of them in bottom-top order
      }
    });

    // go through each repeat expression (if any) and generate context with correct variables, ignoring already set props. aka deeper value is more important
    if (repeatParents.length > 0) {
      // remove last char from {} or {a:b}
      context = context.substr(0, context.length - 1);
      if (context.indexOf(':') !== -1) { // is there any property in context value? e.g. {item:value}
        context += ',';
      }

      context += '' + repeatParents.map(function (el) {
        var props = [];
        if (existingContextProperties.indexOf(el.keyExpr) === -1) {
          props.push(el.keyExpr + ':' + el.keyExpr);
        }
        if (existingContextProperties.indexOf(el.valueExpr) === -1) {
          props.push(el.valueExpr + ':' + el.valueExpr);
        }
        return props.length > 0 ? props.join(',') : null;
      }).join(',') + '}';
    }
    var expr = $(this).attr(options.prefix + '-include').trim();
    if (expr.charAt(0) !== "'") { // if expression is given, try to take values from context and fallback to string value otherwise
      var parts = expr.split('.');
      var expressions = [];
      for (var i = 0; i < parts.length; i++) {
        expressions.push(parts.slice(0, i + 1).join('.'));
      }
      $(this).append("&lt;%= $helpers.htIncludeFunc(typeof " + parts[0] + "!=='undefined' && " + expressions.join(' && ') + " ? " + expr + " : '" + expr.replace(/'/g, "\\'") + "', data, " + context + ") %&gt;");
    } else {
      $(this).append("&lt;%= $helpers.htIncludeFunc(" + expr + ", data," + context + ") %&gt;");
    }
    $(this).removeAttr(options.prefix + '-include');
    $(this).removeAttr(options.prefix + '-include-context');
  });
}

IncludeDirective.init = function (data, options, angularTemplate) {
  data.$helpers.htIncludeFunc = function htIncludeFunc(fileName, data, context) {
    var includeOptions = Object.assign({}, options);
    var defaultDir = path.dirname(options.layoutPath);
    includeOptions.includeDirs = [].concat(options.includeDirs || []);
    if (includeOptions.includeDirs.indexOf(defaultDir) === -1) {
      includeOptions.includeDirs.push(defaultDir);
    }
    if (options.cache) {
      includeOptions.cache = options.cache + angularTemplate.cache.separator + fileName;
    }

    var includeData = context, keys, len;
    keys = Object.keys(data);
    len = keys.length;
    while (len--) {
      if (!includeData[keys[len]]) {
        includeData[keys[len]] = data[keys[len]];
      }
    }

    var includedHtml = angularTemplate(fileName, includeData, includeOptions, true);
    return includedHtml;
  };
};

module.exports = IncludeDirective