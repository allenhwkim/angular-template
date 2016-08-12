'use strict';
var cheerio = require('cheerio');
var jsTemplate = require('js-template');
var path = require('path');
var fs = require('fs');
var extend = require('extend');
var cache = {};
var templateRegex = new RegExp(/[<>]/);
var angularTemplate = function(fileOrHtml, data, options, nested) {
  var layoutPath = __filename, html;
  options = options || {};
  // try to reuse cached output
  var output = options.cache ? angularTemplate.cache.get(options.cache) : false;
  if (!output) {
    // we've got a template
    if (templateRegex.test(fileOrHtml)) {
      html = fileOrHtml;
    } else {
      // we've got a file path
      layoutPath = fileOrHtml;
      html = fileOrHtml; // same as before, if file doesn't exist - path will be shown
      // absolute path
      if (fs.existsSync(layoutPath)) {
        html = fs.readFileSync(layoutPath,'utf8');
      } else if(options.includeDirs) {
        // relative path, check all includeDirs
        for (var i = 0; i < options.includeDirs.length; i++) {
          layoutPath = path.join(options.includeDirs[i], fileOrHtml);//.replace(/\\/g,'/'); // have to replace \ with / or test will fail on windows
          if (fs.existsSync(layoutPath)) {
            html = fs.readFileSync(layoutPath,'utf8');
            break;
          }
        }
      }
    }
    // same behavior as before
    if (nested && (!options.prefix)) {
      options.prefix = 'ng';
    }
    // invoke custom function if need that manipulates html
    if (typeof options.preprocess==='function') {
      html = options.preprocess(html);
    }
    if (options.prefix) {
      html = html.replace(new RegExp(options.prefix+"-",'g'), "ht-");
    }

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
    output = $.html()
      .replace(/&lt;%/g, "<%")                       // <%
      .replace(/%&gt;/g,"%>")                        // %>
      .replace(/; i &lt;/g,"; i <")                  // ; i <
      .replace(/&quot;/g, '"')                       // "
      .replace(/&apos;/g, "'")                       // '
      .replace(/ &amp;&amp; /g, " && ")              // &&
      .replace(/{{(.*?)}}/g, "<%=$1%>"); // {{ .. }}
    if(options.cache){
      angularTemplate.cache.put(options.cache, output);
    }
  }
  data.htIncludeFunc = htIncludeFunc;
  if (options.jsMode) {
    return output;
  } else {
    try {
      return jsTemplate(output, data);
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

  function htIncludeFunc(fileName, data, context) {
    var includeOptions = extend({}, options);
    var defaultDir = path.dirname(layoutPath);
    includeOptions.includeDirs = [].concat(options.includeDirs || []);
    if(includeOptions.includeDirs.indexOf(defaultDir)===-1){
      includeOptions.includeDirs.push(defaultDir);
    }
    if(options.cache){
      includeOptions.cache = options.cache+angularTemplate.cache.separator+fileName;
    }

    var includeData = context, keys, len;
    keys = Object.keys(data);
    len =  keys.length;
    while (len--) {
      if(!includeData[keys[len]]){
        includeData[keys[len]] = data[keys[len]];
      }
    }

    var includedHtml = angularTemplate(fileName, includeData, includeOptions, true);
    return includedHtml;
  };
};


function parseRepeatExpression(expr) {
  var matches = expr.match(/^(.*?) in ([^\s]*?)$/);
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
// few functions related to caching
function cacheRemove(key) {
  if(!key){
    return;
  }
  // find related keys and remove them
  Object.keys(cache).filter(function(k){
    return k === key || k.indexOf(key+angularTemplate.cache.separator)===0;
  }).forEach(function(k){
    delete cache[k];
  });
}
function cachePut(key, value) {
  cache[key] = value;
}
function cacheGet(key) {
  return cache[key];
}
// exposed prop that is used to store cached templates to avoid IO (right before calling jsTemplate)
angularTemplate.cache = {
  get: cacheGet,
  put: cachePut,
  remove: cacheRemove,
  separator: '$$'
};
module.exports = angularTemplate;
