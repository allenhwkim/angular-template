'use strict';

module.exports = {
  parseRepeatExpression: parseRepeatExpression,
  read: read
};

var fs = require('fs');
var path = require('path');

function parseRepeatExpression(expr) {
  var matches = expr.match(/^(.*?) in ([^\s]*)(.*?)$/);
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
  return { keyExpr: keyExpr, valueExpr: valueExpr, collectionExpr: collectionExpr };
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
