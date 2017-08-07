'use strict';
var cheerio = require('cheerio');
var jsTemplate = require('js-template');
var templateRegex = new RegExp(/[<>]/);
var SimpleCache = require('./lib/cache');

var angularTemplate = function (fileOrHtml, data, options, nested) {

  var html;
  options = options || {};
  options.layoutPath = __filename;
  // try to reuse cached output
  var output = options.cache ? angularTemplate.cache.get(options.cache) : false;

  if (!output) {
    // we've got a template
    if (templateRegex.test(fileOrHtml)) {
      html = fileOrHtml;
    } else {
      // we've got a file path
      options.layoutPath = fileOrHtml;
      // read template from disk
      html = angularTemplate.helpers.read(options.layoutPath, options);
    }

    // invoke custom function if need that manipulates html
    if (typeof options.preprocess === 'function') {
      html = options.preprocess(html);
    }

    if (!options.prefix) {
      options.prefix = 'ht';
    }

    var $ = cheerio.load(html, options.cheerioOptions);

    // namespace for all used functions within template
    data.$helpers = {};

    // run through all supported directives
    angularTemplate.directives.forEach(function (run) {
      run($, data, options, angularTemplate);
    });

    /**
     * curly-braces exprepression
     */
    output = $.html()
      .replace(/&lt;%/g, "<%")                       // <%
      .replace(/%&gt;/g, "%>")                        // %>
      .replace(/; i &lt;/g, "; i <")                  // ; i <
      .replace(/&quot;/g, '"')                       // "
      .replace(/&apos;/g, "'")                       // '
      .replace(/ &amp;&amp; /g, " && ")              // &&
      .replace(/{{(.*?)}}/g, "<%=$1%>"); // {{ .. }}

    if (options.cache) {
      angularTemplate.cache.put(options.cache, output);
    }
  }

  if (options.jsMode) {
    return output;
  } else {
    try {
      return jsTemplate(output, data);
    } catch (e) {
      if (e.raisedOnceException) {
        throw e.raisedOnceException;
      } else {
        var lines = output.split("\n");
        for (var i = e.lineNo - 3; i < e.lineNo + 3; i++) {
          console.log(i + 1, lines[i]);
        }
        console.log("processing template:", options.layoutPath);
        console.log("error in line", e.lineNo);
        e.raisedOnceException = e;
        throw e;
      }
    }
  }
};

// exposed prop that is used to store cached templates to avoid IO (right before calling jsTemplate)
angularTemplate.cache = new SimpleCache('$$');

// list of supported and enabled directives (can be changed at runtime)
angularTemplate.directives = [
  require('./directives/include'),
  require('./directives/if'),
  require('./directives/repeat'),
];

// all internal helpers will be exposed as well and can be override
angularTemplate.helpers = require('./lib/helpers');

module.exports = angularTemplate;
