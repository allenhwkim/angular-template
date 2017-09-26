'use strict';

function RepeatDirective($, data, options, angularTemplate) {
  /**
    * ht-repeat expression
    */
  var htRepeats = $("*[" + options.prefix + "-repeat]");
  htRepeats.each(function (i, elem) {
    var expr = $(this).attr(options.prefix + '-repeat').trim();
    var result = angularTemplate.helpers.parseRepeatExpression(expr);
    if (!result) return;
    var tmpName = ('_' + result.collectionName).replace(/[^a-zA-Z0-9]/g, '_');
    var jsTmplStr =
      "&lt;% var " + tmpName + " = " + angularTemplate.helpers.expression(result.collectionExpr, options) + ";" +
      "  for(var " + result.keyExpr + " in " + tmpName + ") { " +
      "  var " + result.valueExpr + " = " + tmpName + "[" + result.keyExpr + "]; %&gt;";

    $(this).before(jsTmplStr);
    $(this).after("&lt;% } %&gt;");

    $(this).removeAttr(options.prefix + '-repeat');
  });
}

module.exports = RepeatDirective