'use strict';

function IfDirective($, data, options, angularTemplate) {
  /**
   * ht-if expression
   */
  var htIfs = $("*[" + options.prefix + "-if]");
  htIfs.each(function (i, elem) {
    var expr = $(this).attr(options.prefix + '-if').trim();
    $(this).before("&lt;% if (" + expr + ") { %&gt;");
    $(this).after("&lt;% } %&gt;");
    $(this).removeAttr(options.prefix + '-if');
  });
}

module.exports = IfDirective