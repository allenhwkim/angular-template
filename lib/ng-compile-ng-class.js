var cheerio = require("cheerio");

/**
 * server-side angular one time bind expression with ng-class={::...}}
 * Ref. http://toddmotto.com/angular-one-time-binding-syntax/
 * i.e <div ng-class="::{loggedIn: vm.user.loggedIn}"></div>
 * parameters
 *   $: cheerio object (https://github.com/cheeriojs/cheerio)
 *   data: javascript object
 */

function JSONize(str) {
  return str.
    // wrap keys without quote with valid double quote
    replace(/([\$\w]+)\s*:/g, function(_, $1){return '"'+$1+'":';}).
    // replacing single quote wrapped ones to double quote 
    replace(/'([^']+)'/g, function(_, $1){return '"'+$1+'"';}).
    // replacing all values to string
    replace(/(:[ ]*)([^"', ]+)([ ]*[,}])/g, function(_, $1, $2, $3){return $1+'"'+$2+'"'+$3;});
}

var ngCompileNgClass = function($, data) {
  var ngClasses = $("*[ng-class^='::{']");
  ngClasses.each(function(i, elem) {
    var expr = $(this).attr('ng-class').replace(/^::/,'');
    expr = JSONize(expr);
    var obj = JSON.parse(expr);
    for(var key in obj) {
      var condition = !!eval("data."+key);
      condition && $(this).addClass(obj[key]);
    }
    $(this).removeAttr("ng-class");
  });
  return $;
};


module.exports = ngCompileNgClass;
