
function ShowDirective($, data, options, angularTemplate) {
  /**
   * ht-show expression
   */
  const selector = `${options.prefix}-show`;
  const htShow = $(`*[${selector}]`);
  htShow.each(function (i, elem) {
    const expr = $(this).attr(selector).trim();
    $(this).before(`&lt;% if (${expr}) { %&gt;`);
    $(this).after('&lt;% } %&gt;');
    $(this).removeAttr(selector);
  });
}

module.exports = ShowDirective;
