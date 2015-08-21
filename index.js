'use strict';
var cheerio = require('cheerio');
var jsTemplate = require('js-template');

var htmlTemplate = function(html, data, jsMode) {

  var $ = cheerio.load(html); 

  /**
   * ht-if expression
   */
  var htIfs = $("*[ht-if]");
  htIfs.each(function(i,elem) {
    var expr = $(this).attr('ht-if').trim();
    $(this).before("&lt;% if ("+ expr +") { %&gt;");
    $(this).after("&lt;% } %&gt;");
    $(this).removeAttr('ht-if');
  });

  /**
   * ht-include expression
   */
  var htIncludes = $("*[ht-include]");
  htIncludes.each(function(i,elem) {
    var expr = $(this).attr('ht-include').trim();
    $(this).append("&lt;%= include("+expr+", data) %&gt;");
    $(this).removeAttr('ht-include');
  });

  /**
   * ht-repeat expression
   */
  var htRepeats = $("*[ht-repeat]");
  htRepeats.each(function(i,elem) {
    var expr = $(this).attr('ht-repeat').trim();
    var matches = expr.match(/^(.*?) in (.*?)$/);
    if (!matches)  return;
    
    var keyValueExpr = matches[1].trim();
    var collectionExpr = matches[2].trim();
    var keyExpr, valueExpr, m1, m2;
    if (m1 = keyValueExpr.match(/^\((\w+),\s?(\w+)\)$/)) { // (k,v)
      keyExpr = m1[1], valueExpr = m1[2];
    } else if (m2 = keyValueExpr.match(/^(\w+)$/)) {
      valueExpr = m2[1];
    }
   
    var jsTmplStr;
    if (keyExpr) {
      jsTmplStr = "&lt;% for(var "+keyExpr+" in "+collectionExpr+") { "+
        "  var "+valueExpr+"="+collectionExpr+"["+keyExpr+"]; %&gt;";
    } else if (valueExpr) {
      jsTmplStr = "&lt;% for(var i=0; i < "+collectionExpr+".length; i++) { "+
        "  var "+valueExpr+"="+collectionExpr+"[i]; %&gt;";
    }
    $(this).before(jsTmplStr);
    $(this).after("&lt;% } %&gt;");

    $(this).removeAttr('ht-repeat');
  });

  /**
   * curly-braces exprepression
   */
  var output = $.html()
    .replace(/&lt;%/g, "<%")                       // <%
    .replace(/%&gt;/g,"%>")                        // %>
    .replace(/; i &lt;/g,"; i <")                  // ; i <
    .replace(/\[&apos;/g, "['")                    // ['
    .replace(/&apos;\]/g, "']")                    // ']
    .replace(/\(&apos;([^&]+)&apos;/g, "('$1'")    // ('...')
    .replace(/{{[ ]*([^}]+)[ ]*}}/g, "<%= $1 %>"); // {{ .. }}

  return jsMode ? output : jsTemplate(output, data)
};

module.exports = htmlTemplate;
