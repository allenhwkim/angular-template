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

    var jsTmplStr = "&lt;% for(var " + result.keyExpr + " in " + result.collectionExpr + ") { " +
      "  var " + result.valueExpr + "=" + result.collectionExpr + "[" + result.keyExpr + "]; %&gt;";

    $(this).before(jsTmplStr);
    $(this).after("&lt;% } %&gt;");

    $(this).removeAttr(options.prefix + '-repeat');
  });
}

module.exports = RepeatDirective