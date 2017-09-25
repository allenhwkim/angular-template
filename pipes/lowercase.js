module.exports = function lowercase(options, value, fractionSize) {
  return value == null ? value : String(value).toLowerCase();
}