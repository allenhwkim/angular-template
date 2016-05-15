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

  data.htIncludeFunc = function(fileName, data, context) {

    var includePath = path.join(path.dirname(layoutPath), fileName).replace(/\\/g,'/'); // have to replace \ with / or test will fail on windows
    var includeData=context, keys, len;
    keys = Object.keys(data);
    len =  keys.length;
    while (len--) {
      if(!includeData[keys[len]]){
        includeData[keys[len]] = data[keys[len]];
      }
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
    var context = '{}';
    var repeatParents = [];
    var existingContextProperties = [];
    // parse all repeat expressions from all the parents
    $(this).parents('[ht-repeat]').each(function(pi, parent){
      var result = parseRepeatExpression($(this).attr('ht-repeat'));
      if(result){
        repeatParents.push(result); // remember all of them in bottom-top order
      }
    });
    // go through each repeat expression (if any) and generate context with correct variables, ignoring already set props. aka deeper value is more important
    if(repeatParents.length>0){
      context = '{'+repeatParents.map(function(el){
        var props = [];
        if(existingContextProperties.indexOf(el.keyExpr)===-1){
          props.push(el.keyExpr+':'+el.keyExpr);
        }
        if(existingContextProperties.indexOf(el.valueExpr)===-1){
          props.push(el.valueExpr+':'+el.valueExpr);
        }
        return props.length>0?props.join(','):null;
      }).join(',')+'}'
    }
    var expr = $(this).attr('ht-include').trim();
    if(expr.charAt(0)!=="'"){ // if expression is given, try to take values from context and fallback to string value otherwise
      var parts = expr.split('.');
      var expressions = [];
      for(var i = 0; i< parts.length; i++){
        expressions.push(parts.slice(0,i+1).join('.'));
      }
      $(this).append("&lt;%= htIncludeFunc(typeof "+parts[0]+"!=='undefined' && "+expressions.join(' && ')+" ? "+expr+" : '"+expr.replace(/'/g,"\\'")+"', data, "+context+") %&gt;");
    }else{
      $(this).append("&lt;%= htIncludeFunc("+expr+", data,"+context+") %&gt;");
    }
    $(this).removeAttr('ht-include');
  });

  /**
   * ht-repeat expression
   */
  var htRepeats = $("*[ht-repeat]");
  htRepeats.each(function(i,elem) {
    var expr = $(this).attr('ht-repeat').trim();
    var result = parseRepeatExpression(expr);
    if (!result)  return;

    var jsTmplStr = "&lt;% for(var "+result.keyExpr+" in "+result.collectionExpr+") { "+
        "  var "+result.valueExpr+"="+result.collectionExpr+"["+result.keyExpr+"]; %&gt;";

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

function parseRepeatExpression(expr) {
  var matches = expr.match(/^(.*?) in (.*?)$/);
  if (!matches) return false;

  var keyValueExpr = matches[1].trim();
  var collectionExpr = matches[2].trim();
  var keyExpr, valueExpr, m1, m2;
  if (m1 = keyValueExpr.match(/^\((\w+),\s?(\w+)\)$/)) { // (k,v)
    keyExpr = m1[1], valueExpr = m1[2];
  } else if (m2 = keyValueExpr.match(/^(\w+)$/)) {
    valueExpr = m2[1];
    keyExpr = 'i';
  }
  return {keyExpr:keyExpr, valueExpr:valueExpr, collectionExpr: collectionExpr};
}

module.exports = angularTemplate;
