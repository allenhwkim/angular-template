'use strict';

module.exports = {
  parseRepeatExpression: parseRepeatExpression,
  read: read,
  expression: expression
};

var fs = require('fs');
var path = require('path');

function parseRepeatExpression(expr) {
  var matches = expr.match(/^(.*?) in ([^\s]*)(.*?)$/);
  if (!matches) return false;
  var keyValueExpr = matches[1].trim();
  var collectionExpr = matches[2].trim();
  var pipes = matches[3].trim();
  // ignore if content after collection name doesn't have a pipe
  if (pipes && pipes.indexOf('track by') !== -1) {
    pipes = pipes.replace(/track by ([^\s|])*/i, '');
  }
  var keyExpr, valueExpr, m1, m2;
  if (m1 = keyValueExpr.match(/^\((\w+),\s?(\w+)\)$/)) { // (k,v)
    keyExpr = m1[1], valueExpr = m1[2];
  } else if (m2 = keyValueExpr.match(/^(\w+)$/)) {
    valueExpr = m2[1];
    keyExpr = 'i';
  }
  return { keyExpr: keyExpr, valueExpr: valueExpr, collectionName: collectionExpr, collectionExpr: collectionExpr + pipes };
}

function read(file, options) {
  var html = file; // same as before, if file doesn't exist - path will be shown
  // absolute path
  if (fs.existsSync(file)) {
    html = fs.readFileSync(file, 'utf8');
  } else if (options.includeDirs) {
    // relative path, check all includeDirs
    for (var i = 0; i < options.includeDirs.length; i++) {
      var filePath = path.join(options.includeDirs[i], file);//.replace(/\\/g,'/'); // have to replace \ with / or test will fail on windows
      if (fs.existsSync(filePath)) {
        html = fs.readFileSync(filePath, 'utf8');
        break;
      }
    }
  }

  return html;
}
var RESERVED_CHARS = {
  '|': '#__PIPE__#',
  ':': '#__COLON__#'
};
var ESCAPED_COLON_REGEX = /#__COLON__#/g;
var ESCAPED_PIPE_REGEX = /#__PIPE__#/g;
function expression(input, options) {
  if (input && input.indexOf('|') !== -1) {
    var sanitizedInput = input;
    // make sure that || are escaped
    sanitizedInput = sanitizedInput.replace(/\|\|/g, RESERVED_CHARS['|'] + RESERVED_CHARS['|'])
    // make sure that | or : inside quotes are escaped
    var pos = 0, char, inQuote;
    while (pos < sanitizedInput.length) {
      char = sanitizedInput.charAt(pos);
      if (inQuote) {
        // did we encounter reserved char that should be replaced?
        if (RESERVED_CHARS[char]) {
          sanitizedInput = sanitizedInput.substring(0, pos) + RESERVED_CHARS[char] + sanitizedInput.substring(pos + 1);
          pos += (RESERVED_CHARS[char].length - 1); // advance by the lenth of the replacement - 1 
        }
        // found closing quote
        if (char === inQuote && sanitizedInput.charAt(pos - 1) !== '\\') {
          inQuote = null;
        }
      } else if (char === '"' || char === "'") { // found opening quote
        inQuote = char;
      }
      pos++;
    }
    // check if pipe is actually used
    if (sanitizedInput.indexOf('|') !== -1) {
      var steps = sanitizedInput.split('|');
      var value = steps.shift().trim();
      for (var i = 0; i < steps.length; i++) {
        var params = steps[i].split(':');
        var pipe = params.shift();
        params.unshift(value);
        value = '$pipes.' + pipe.trim() + '(' + params.join(', ') + ')';
      }
      value = value.replace(ESCAPED_PIPE_REGEX, '|').replace(ESCAPED_COLON_REGEX, ':');

      return value;
    }
  }
  return input;
}