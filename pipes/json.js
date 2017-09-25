module.exports = function json(options, value, spacing) {
  if (spacing === undefined) {
    spacing = 2;
  }
  return value == null ? value : JSON.stringify(value, undefined, spacing);
}