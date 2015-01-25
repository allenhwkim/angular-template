var cheerio = require("cheerio");
var compileExpression = require(__dirname +'/expression.js');

/**
 * server-side angular one time bind expression with ng-repeat={::...}}
 * Ref. http://toddmotto.com/angular-one-time-binding-syntax/
 * i.e <div ng-repeat="user in ::vm.users"></div>
 * i.e <div ng-repeat="(key, value) in ::myObj"></div>
 *
 * NOTE:
 *   ng-repeat MUST NOT have the following at the moment;
 *     1. ng-if
 *     2. ng-class
 *     3. ng-include
 *     4. filter expression
 *
 * parameters
 *   $: cheerio object (https://github.com/cheeriojs/cheerio)
 *   data: javascript object
 */

var compileNgRepeat = function($, data) {
  var ngRepeats = $("*[ng-repeat*='::']");
  ngRepeats.each(function(i, elem) {
    var expr = $(this).attr('ng-repeat').trim();
    try {
      var matches = expr.match(/^(.*?) in ::(.*?)$/);
      var keyStr, valueStr;

      // i.e. (key,value) in "ng-repeat='(key, value) in ::expression'"
      var keyValueMatches = matches[1].trim().match(/^\(([^,]+),\s?([^\)]+)\)$/);
      if (keyValueMatches) { // (key, val)
        keyStr = keyValueMatches[1];
        valueStr = keyValueMatches[2];
      } else {
        // i.e. variable in "ng-repeat='variable in ::expression'"
        valueStr = matches[1].trim().match(/^[a-zA-Z_0-9]+/)[0];
      }

      // i.e. expression in "ng-repeat='variable in ::expression'"
      var collectionStr = matches[2].trim().match(/[^ ]+/)[0];
      var collection = eval("data."+collectionStr);

      // collect all attributes of this element to use it later 
      var attribsStr="";
      for (var key in this.attribs) {
        if (key != "ng-repeat") {
          attribsStr += ' ' + key + '="' + this.attribs[key] +'"';
        }
      }

      // 1. build repeating tag,
      var compiledHtml = "";
      for (key in collection) {
        var elData = {};
        keyStr && (elData[keyStr] = key);
        elData[valueStr] = collection[key];
        var html = "<"+this.name + attribsStr+">" + $(this).html() +"</"+this.name+">\n";
        compiledHtml += compileExpression(html, elData);
      }

      // 2. add the repeating part after the current tag
      $(this).after(compiledHtml.replace(/\n$/,''));

      // 3. remove the current tag
      $(this).remove();
    } catch (e) {
      var error= "Invalid ng-repeat expression, "+expr;
      console.log('e', e);
      console.log('e.stack', e.stack);
      $(this).html("<!-- " + error + " -->");
    }

    $(this).remove(); //remove the template 
  });

  return $;
};

module.exports = compileNgRepeat;
