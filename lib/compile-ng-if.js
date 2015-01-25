var entities = require("entities");
var cheerio = require("cheerio");

/**
 * server-side angular one time bind expression with ng-if={::...}}
 * Ref. http://toddmotto.com/angular-one-time-binding-syntax/
 * i.e <div ng-if="::vm.user.loggedIn">xxx</div>
 * parameters
 *   $: cheerio object (https://github.com/cheeriojs/cheerio)
 *   data: javascript object
 */

var compileNgIf = function($, data) {
  var ngIfs = $("*[ng-if^='::']");
  ngIfs.each(function(i, elem) {
    var expr = $(this).attr('ng-if').replace(/^::/,'');
    var condition = !!eval("data."+expr);
    (!condition) && $(this).html("");
    $(this).removeAttr("ng-if");
  });
  return $;
};

module.exports = compileNgIf;
