'use strict';

function BindDirective($, data, options, angularTemplate) {
  ['bind', 'bind-html'].forEach(function (type) {
    var binds = $("*[" + options.prefix + "-" + type + "]");
    binds.each(function (i, elem) {
      var expr = $(this).attr(options.prefix + '-' + type).trim();
      $(this).text('<%=' + expr + ' %>');
      $(this).removeAttr(options.prefix + '-' + type);
    });
  });
}

module.exports = BindDirective