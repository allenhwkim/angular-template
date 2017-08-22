'use strict';

function StyleDirective($, data, options, angularTemplate) {
  /**
   * ht-class expression
   */
  var styles = $("*[" + options.prefix + "-style]");
  styles.each(function (i, elem) {
    var expr = $(this).attr(options.prefix + '-style').trim();
    var style = ($(this).attr('style') || '').trim();
    if (style) {
      style += ';';
    }

    $(this).removeAttr(options.prefix + '-style');
    $(this).attr('style', style + '<%=$helpers.generateStyle(' + expr + ')%>');
  });
}

StyleDirective.init = function (data, options, angularTemplate) {
  data.$helpers.generateStyle = function generateStyle(input) {
    if (typeof (input) === 'object') {
      return Object.keys(input).map(function (property) {
        return property + ':' + input[property];
      }).join(';');
    }
    return '';
  }
};

module.exports = StyleDirective