'use strict';
var cheerio = require('cheerio');
var jsTemplate = require('js-template');
var path = require('path');
var fs = require('fs');

var angularTemplate = function(fileOrHtml, data, options) {
  var layoutPath = __filename, html;
  options = options || {};

  if (fs.existsSync(fileOrHtml)) {
    layoutPath = fileOrHtml;
    html = fs.readFileSync(fileOrHtml,'utf8');
  } else {
    html =fileOrHtml;
  }

  if (options.prefix) {
    html = html.replace(new RegExp(options.prefix+"-",'g'), "ht-");
  }

  var $ = cheerio.load(html); 

  data.htIncludeFunc = function(fileName, data) {
    var includePath = path.join(path.dirname(layoutPath), fileName);
    var includeData={}, keys, len;
    keys = Object.keys(data);
    len =  keys.length;
    while (len--) {
      includeData[keys[len]] = data[keys[len]];
    }
    var includedHtml = angularTemplate(includePath, includeData, {
      prefix: 'ng'
    });
    return includedHtml;
  };

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
    $(this).append("&lt;%= htIncludeFunc('"+expr+"', data) %&gt;");
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
      jsTmplStr = "&lt;% for(var i in "+collectionExpr+") { "+
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
    .replace(/&quot;/g, '"')                       // "
    .replace(/&apos;/g, "'")                       // '
    .replace(/ &amp;&amp; /g, " && ")              // &&
    .replace(/{{(.*?)}}/g, "<%=$1%>"); // {{ .. }}

  if (options.jsMode) {
    return output;
  } else {
    try {
      return jsTemplate(output, data)
    } catch(e) {
      if (e.raisedOnceException) {
        throw e.raisedOnceException;
      } else {
        var lines = output.split("\n");
        for(var i = e.lineNo -3; i< e.lineNo +3; i++) { 
          console.log(i+1, lines[i]);
        }
        console.log("processing template:", layoutPath);
        console.log("error in line", e.lineNo);
        e.raisedOnceException = e;
        throw e;
      }
    }
  }
};

module.exports = angularTemplate;
