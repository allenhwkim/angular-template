'use strict';
/*
The MIT License

Copyright (c) 2010-2017 Google, Inc. http://angularjs.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 

*/

module.exports = function filter(options, array, expression, comparator, anyPropertyKey) {
  if (!Array.isArray(array)) {
    if (array == null) {
      return array;
    } else {
      throw new Error('filter only works with arrays');
    }
  }

  anyPropertyKey = anyPropertyKey || '$';
  var expressionType = getTypeForFilter(expression);
  var predicateFn;
  var matchAgainstAnyProp;

  switch (expressionType) {
    case 'function':
      predicateFn = expression;
      break;
    case 'boolean':
    case 'null':
    case 'number':
    case 'string':
      matchAgainstAnyProp = true;
    // falls through
    case 'object':
      predicateFn = createPredicateFn(expression, comparator, anyPropertyKey, matchAgainstAnyProp);
      break;
    default:
      return array;
  }

  return Array.prototype.filter.call(array, predicateFn);
};

// Helper functions for `filterFilter`
function createPredicateFn(expression, comparator, anyPropertyKey, matchAgainstAnyProp) {
  var shouldMatchPrimitives = typeof (expression) == 'object' && (anyPropertyKey in expression);
  var predicateFn;

  if (comparator === true) {
    comparator = equals;
  } else if (!isFunction(comparator)) {
    comparator = function (actual, expected) {
      if (typeof (actual) === 'undefined') {
        // No substring matching against `undefined`
        return false;
      }
      if ((actual === null) || (expected === null)) {
        // No substring matching against `null`; only match against `null`
        return actual === expected;
      }
      if (typeof (expected) === 'object' || (typeof (actual) === 'object' && !hasCustomToString(actual))) {
        // Should not compare primitives against objects, unless they have custom `toString` method
        return false;
      }

      actual = ('' + actual).toLowerCase();
      expected = ('' + expected).toLowerCase();
      return actual.indexOf(expected) !== -1;
    };
  }

  predicateFn = function (item) {
    if (shouldMatchPrimitives && typeof (item) !== 'object') {
      return deepCompare(item, expression[anyPropertyKey], comparator, anyPropertyKey, false);
    }
    return deepCompare(item, expression, comparator, anyPropertyKey, matchAgainstAnyProp);
  };

  return predicateFn;
}

function deepCompare(actual, expected, comparator, anyPropertyKey, matchAgainstAnyProp, dontMatchWholeObject) {
  var actualType = getTypeForFilter(actual);
  var expectedType = getTypeForFilter(expected);

  if ((expectedType === 'string') && (expected.charAt(0) === '!')) {
    return !deepCompare(actual, expected.substring(1), comparator, anyPropertyKey, matchAgainstAnyProp);
  } else if (isArray(actual)) {
    // In case `actual` is an array, consider it a match
    // if ANY of it's items matches `expected`
    return actual.some(function (item) {
      return deepCompare(item, expected, comparator, anyPropertyKey, matchAgainstAnyProp);
    });
  }

  switch (actualType) {
    case 'object':
      var key;
      if (matchAgainstAnyProp) {
        for (key in actual) {
          // Under certain, rare, circumstances, key may not be a string and `charAt` will be undefined
          // See: https://github.com/angular/angular.js/issues/15644
          if (key.charAt && (key.charAt(0) !== '$') &&
            deepCompare(actual[key], expected, comparator, anyPropertyKey, true)) {
            return true;
          }
        }
        return dontMatchWholeObject ? false : deepCompare(actual, expected, comparator, anyPropertyKey, false);
      } else if (expectedType === 'object') {
        for (key in expected) {
          var expectedVal = expected[key];
          if (typeof (expectedVal) === 'function' || typeof (expectedVal) === 'undefined') {
            continue;
          }

          var matchAnyProperty = key === anyPropertyKey;
          var actualVal = matchAnyProperty ? actual : actual[key];
          if (!deepCompare(actualVal, expectedVal, comparator, anyPropertyKey, matchAnyProperty, matchAnyProperty)) {
            return false;
          }
        }
        return true;
      } else {
        return comparator(actual, expected);
      }
    case 'function':
      return false;
    default:
      return comparator(actual, expected);
  }
}

// Used for easily differentiating between `null` and actual `object`
function getTypeForFilter(val) {
  return (val === null) ? 'null' : typeof val;
}