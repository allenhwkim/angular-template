'use strict';

function ClassDirective($, data, options, angularTemplate) {
  /**
   * ht-class expression
   */
  var classes = $("*[" + options.prefix + "-class]");
  classes.each(function (i, elem) {
    var expr = $(this).attr(options.prefix + '-class').trim();
    var classes = ($(this).attr('class') || '').trim();
    if (classes) {
      classes += ' ';
    }

    $(this).removeAttr(options.prefix + '-class');
    $(this).attr('class', classes + '<%=$helpers.generateClassList(' + expr + ')%>');
  });
}

ClassDirective.init = function (data, options, angularTemplate) {
  data.$helpers.generateClassList = function generateClassList(input) {
    var list;
    if (Array.isArray(input)) {
      list = input.map(generateClassList);
    } else if (typeof (input) === 'object') {
      list = Object.keys(input).map(function (key) {
        return input[key] ? generateClassList(key) : '';
      });
    } else {
      list = [input ? String(input) : ''];
    }
    // ignore empty values
    return list.filter(function (v) {
      return !!v;
    }).join(' ')
  }
};

module.exports = ClassDirective