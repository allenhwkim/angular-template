module.exports = function uppercase(options, value, fractionSize) {
  return value == null ? value : String(value).toUpperCase();
}