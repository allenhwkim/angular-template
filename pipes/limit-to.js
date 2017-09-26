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
module.exports = function limitTo(options, input, limit, begin) {
  if (Math.abs(Number(limit)) === Infinity) {
    limit = Number(limit);
  } else {
    limit = parseInt(limit, 10);
  }
  if (isNaN(limit)) return input;

  if (typeof (input) === 'number') input = input.toString();

  begin = (!begin || isNaN(begin)) ? 0 : parseInt(begin, 10);
  begin = (begin < 0) ? Math.max(0, input.length + begin) : begin;

  if (limit >= 0) {
    return sliceFn(input, begin, begin + limit);
  } else {
    if (begin === 0) {
      return sliceFn(input, limit, input.length);
    } else {
      return sliceFn(input, Math.max(0, begin + limit), begin);
    }
  }
};

function sliceFn(input, begin, end) {
  if (typeof (input) === 'string') return input.slice(begin, end);

  return Array.prototype.slice.call(input, begin, end);
}