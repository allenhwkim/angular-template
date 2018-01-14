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
var DATE_FORMATS = {
  yyyy: dateGetter('FullYear', 4, 0, false, true),
  yy: dateGetter('FullYear', 2, 0, true, true),
  y: dateGetter('FullYear', 1, 0, false, true),
  MMMM: dateStrGetter('Month'),
  MMM: dateStrGetter('Month', true),
  MM: dateGetter('Month', 2, 1),
  M: dateGetter('Month', 1, 1),
  LLLL: dateStrGetter('Month', false, true),
  dd: dateGetter('Date', 2),
  d: dateGetter('Date', 1),
  HH: dateGetter('Hours', 2),
  H: dateGetter('Hours', 1),
  hh: dateGetter('Hours', 2, -12),
  h: dateGetter('Hours', 1, -12),
  mm: dateGetter('Minutes', 2),
  m: dateGetter('Minutes', 1),
  ss: dateGetter('Seconds', 2),
  s: dateGetter('Seconds', 1),
  // while ISO 8601 requires fractions to be prefixed with `.` or `,`
  // we can be just safely rely on using `sss` since we currently don't support single or two digit fractions
  sss: dateGetter('Milliseconds', 3),
  EEEE: dateStrGetter('Day'),
  EEE: dateStrGetter('Day', true),
  a: ampmGetter,
  Z: timeZoneGetter,
  ww: weekGetter(2),
  w: weekGetter(1),
  G: eraGetter,
  GG: eraGetter,
  GGG: eraGetter,
  GGGG: longEraGetter
};
var ZERO_CHAR = '0';

var DATE_FORMATS_SPLIT = /((?:[^yMLdHhmsaZEwG']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|L+|d+|H+|h+|m+|s+|a|Z|G+|w+))([\s\S]*)/,
  NUMBER_STRING = /^-?\d+$/;

module.exports = function (options, date, format, timezone) {
  var $locale = options.locale;
  var text = '',
    parts = [],
    fn, match;

  format = format || 'mediumDate';
  format = $locale.DATETIME_FORMATS[format] || format;
  if (typeof (date) === 'string') {
    date = NUMBER_STRING.test(date) ? parseInt(date, 10) : jsonStringToDate(date);
  }

  if (typeof (date) === 'number') {
    date = new Date(date);
  }

  if (!isDate(date) || !isFinite(date.getTime())) {
    return date;
  }

  while (format) {
    match = DATE_FORMATS_SPLIT.exec(format);
    if (match) {
      parts = concat(parts, match, 1);
      format = parts.pop();
    } else {
      parts.push(format);
      format = null;
    }
  }

  var dateTimezoneOffset = date.getTimezoneOffset();
  if (timezone) {
    dateTimezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
    date = convertTimezoneToLocal(date, timezone, true);
  }
  parts.forEach(function (value) {
    fn = DATE_FORMATS[value];
    text += fn ? fn(date, $locale.DATETIME_FORMATS, dateTimezoneOffset)
      : value === '\'\'' ? '\'' : value.replace(/(^'|'$)/g, '').replace(/''/g, '\'');
  });

  return text;
};

function isDate(value) {
  return Object.prototype.toString.call(value) === '[object Date]';
}

function concat(array1, array2, index) {
  return array1.concat(array2.slice(index));
}

var R_ISO8601_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
// 1        2       3         4          5          6          7          8  9     10      11
function jsonStringToDate(string) {
  var match;
  if ((match = string.match(R_ISO8601_STR))) {
    var date = new Date(0),
      tzHour = 0,
      tzMin = 0,
      dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear,
      timeSetter = match[8] ? date.setUTCHours : date.setHours;

    if (match[9]) {
      tzHour = parseInt(match[9] + match[10], 10);
      tzMin = parseInt(match[9] + match[11]), 10;
    }
    dateSetter.call(date, parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
    var h = parseInt(match[4] || 0, 10) - tzHour;
    var m = parseInt(match[5] || 0, 10) - tzMin;
    var s = parseInt(match[6] || 0, 10);
    var ms = Math.round(parseFloat('0.' + (match[7] || 0)) * 1000);
    timeSetter.call(date, h, m, s, ms);
    return date;
  }
  return string;
}

function padNumber(num, digits, trim, negWrap) {
  var neg = '';
  if (num < 0 || (negWrap && num <= 0)) {
    if (negWrap) {
      num = -num + 1;
    } else {
      num = -num;
      neg = '-';
    }
  }
  num = '' + num;
  while (num.length < digits) num = ZERO_CHAR + num;
  if (trim) {
    num = num.substr(num.length - digits);
  }
  return neg + num;
}

function dateGetter(name, size, offset, trim, negWrap) {
  offset = offset || 0;
  return function (date) {
    var value = date['get' + name]();
    if (offset > 0 || value > -offset) {
      value += offset;
    }
    if (value === 0 && offset === -12) value = 12;
    return padNumber(value, size, trim, negWrap);
  };
}

function dateStrGetter(name, shortForm, standAlone) {
  return function (date, formats) {
    var value = date['get' + name]();
    var propPrefix = (standAlone ? 'STANDALONE' : '') + (shortForm ? 'SHORT' : '');
    var get = uppercase(propPrefix + name);

    return formats[get][value];
  };
}

function uppercase (string) { return typeof string === 'string' ? string.toUpperCase() : string; };

function timeZoneGetter(date, formats, offset) {
  var zone = -1 * offset;
  var paddedZone = (zone >= 0) ? '+' : '';

  paddedZone += padNumber(Math[zone > 0 ? 'floor' : 'ceil'](zone / 60), 2) +
    padNumber(Math.abs(zone % 60), 2);

  return paddedZone;
}

function getFirstThursdayOfYear(year) {
  // 0 = index of January
  var dayOfWeekOnFirst = (new Date(year, 0, 1)).getDay();
  // 4 = index of Thursday (+1 to account for 1st = 5)
  // 11 = index of *next* Thursday (+1 account for 1st = 12)
  return new Date(year, 0, ((dayOfWeekOnFirst <= 4) ? 5 : 12) - dayOfWeekOnFirst);
}

function getThursdayThisWeek(datetime) {
  return new Date(datetime.getFullYear(), datetime.getMonth(),
    // 4 = index of Thursday
    datetime.getDate() + (4 - datetime.getDay()));
}

function weekGetter(size) {
  return function (date) {
    var firstThurs = getFirstThursdayOfYear(date.getFullYear()),
      thisThurs = getThursdayThisWeek(date);

    var diff = +thisThurs - +firstThurs,
      result = 1 + Math.round(diff / 6.048e8); // 6.048e8 ms per week

    return padNumber(result, size);
  };
}

function ampmGetter(date, formats) {
  return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1];
}

function eraGetter(date, formats) {
  return date.getFullYear() <= 0 ? formats.ERAS[0] : formats.ERAS[1];
}

function longEraGetter(date, formats) {
  return date.getFullYear() <= 0 ? formats.ERANAMES[0] : formats.ERANAMES[1];
}

var ALL_COLONS = /:/g;
function timezoneToOffset(timezone, fallback) {
  // Support: IE 9-11 only, Edge 13-15+
  // IE/Edge do not "understand" colon (`:`) in timezone
  timezone = timezone.replace(ALL_COLONS, '');
  var requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;
  return isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
}


function addDateMinutes(date, minutes) {
  date = new Date(date.getTime());
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}


function convertTimezoneToLocal(date, timezone, reverse) {
  reverse = reverse ? -1 : 1;
  var dateTimezoneOffset = date.getTimezoneOffset();
  var timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
  return addDateMinutes(date, reverse * (timezoneOffset - dateTimezoneOffset));
}
