
function HideDirective($, data, options, angularTemplate) {
  /**
   * ht-hide expression
   */
  const selector = `${options.prefix}-hide`;
  const htHide = $(`*[${selector}]`);
  htHide.each(function (i, elem) {
    const expr = $(this).attr(selector).trim();
    $(this).before(`&lt;% if (!(${expr})) { %&gt;`);
    $(this).after('&lt;% } %&gt;');
    $(this).removeAttr(selector);
  });
}

module.exports = HideDirective;
