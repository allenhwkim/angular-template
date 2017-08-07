'use strict';

function SimpleCache(separator) {
  this.separator = separator;
  this.map = {};
}

SimpleCache.prototype.remove = function cacheRemove(key) {
  
  if (!key) {
    return;
  }

  var self = this;
  // find related keys and remove them
  Object.keys(this.map).filter(function (k) {
    return k === key || k.indexOf(key + self.separator) === 0;
  }).forEach(function (k) {
    delete self.map[k];
  });
}

SimpleCache.prototype.put = function cachePut(key, value) {
  this.map[key] = value;
}

SimpleCache.prototype.get = function cacheGet(key) {
  return this.map[key];
}

module.exports = SimpleCache;