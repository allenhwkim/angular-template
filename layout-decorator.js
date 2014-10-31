var fs = require('fs');
var debug = debug || 0;
var LayoutDecorator = function(options) {
  /**
   * set layout
   */
  if (typeof options == "object") {
    this.layoutPath = options.layout || options.layoutPath;
    if (fs.existsSync(this.layoutPath)) {
      this.layout = fs.readFileSync(this.layoutPath, 'utf8');
    } else {
      throw "Invalid layoutPath," + this.layoutPath;
    }
  } else { // layout html is given directly
    this.layout = options;
  }

  /**
   * set tags, contents tags. i.e., head, body
   */
  this.tags = [];
  var matches = this.layout.match(/\s*<contents-html\s+tag=['"][a-z]+['"]\s*\/?>(<\/contents-html>)?/g);
  if (matches) {
    for (var i=0; i<matches.length; i++) {
      var tagName = matches[i].match(/tag=['"]([a-z]+)['"]/)[1];
      var indent  = matches[i].match(/([\t\ ]*)[^\s]/)[1];
      this.tags.push({ name: tagName, html: matches[i], indent: indent});
    }
  }
  debug && console.log('contents tags', this.tags);

  this.compile = function(contentsHtml) {
    /**
     * <pre>...</pre> must not be indented, thus save and restore after indent
     */
    var preTagsSaved = contentsHtml.match(/<pre[\s\S]*?<\/pre>/gm);
    contentsHtml = contentsHtml.replace(/<pre[\s\S]*?<\/pre>/gm, "<pre>SAVED</pre>");

    var replacements = {};
    for (var i=0; i<this.tags.length; i++) {
      var tag = this.tags[i];
      var contentsTagRe = "<" + tag.name + ">([\\s\\S]*?)<\/" + tag.name + ">";
      var contentsMatches = contentsHtml.match(new RegExp(contentsTagRe));
      var contentsIndent = "";
      (contentsMatches)  && 
        (contentsIndent= contentsMatches[1].match(/([\t\ ]*?)[^\s]/)[1]);
      replacements[tag.name] = {
        layoutPart : tag.html,
        contentsMatches : contentsMatches,
        tagIndent: tag.indent,
        contentsIndent: contentsIndent
      }
    }
    debug && console.log('contents replacements', replacements);

    var outputHtml = this.layout;
    var replacement;
    for (var key in replacements) {
      replacement = replacements[key];
      if (replacement.contentsMatches) {
        var extraIndent = replacement.tagIndent.replace(replacement.contentsIndent,"");
        var indentedOutput = replacement.contentsMatches[1].replace(/\n/g, "\n"+extraIndent);
        indentedOutput = indentedOutput.replace(/\s+$/,"");
        outputHtml = outputHtml.replace(replacement.layoutPart, indentedOutput);
      }
      debug && console.log('outputHtml after replacement: '+key, outputHtml);
    }

    // if contents does not have <body>.., then make body with left-over
    if (!replacements.body.contentsMathches) {
      var bodyHtml = contentsHtml;
      for (var tagName in replacements) {
        if (replacements[tagName].contentsMatches) {
          debug && console.log('removing START ---'+ replacements[tagName].contentsMatches[0] +'--- END');
          bodyHtml = bodyHtml.replace(replacements[tagName].contentsMatches[0], "");
        }
      }
      debug && console.log('assumed body html after remove START ---'+ bodyHtml +'--- END');
      replacement = replacements.body;
      replacement.contentsIndent= bodyHtml.match(/([\t\ ]*)[^\s]/)[1];
      var additionalIndent = replacement.tagIndent.replace(replacement.contentsIndent, "");
      debug && console.log('additional indent for body tag >>>>'+additionalIndent+'<<<<<<');
      var indentedBody = bodyHtml.replace(/\n/g, "\n"+additionalIndent);
      indentedBody = indentedBody.replace(/\s+$/,"");
      outputHtml = outputHtml.replace(replacements.body.layoutPart, indentedBody);
    }

    /**
     * <pre>...</pre> must not be indented, thus restoring
     */
    outputHtml = outputHtml.replace(/<pre>SAVED<\/pre>/g, function() {
      return preTagsSaved.shift();
    });
    return outputHtml;
  }
};

module.exports = LayoutDecorator;
