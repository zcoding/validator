var objectType = Object.prototype.toString;

var hasOwn = function(p) {
  return this.hasOwnProperty(p);
};

var utils = {};

utils.isArray = function(obj) {
  return objectType.call(obj) === '[object Array]';
};

utils.isFunction = function(obj) {
  return objectType.call(obj) === '[object Function]';
};

utils.getValue = function(HTMLElement) {
  if (typeof HTMLElement.value === 'undefined') {
    return HTMLElement.getAttribute('data-value') || '';
  } else {
    return HTMLElement.value;
  }
};
