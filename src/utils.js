var objectType = Object.prototype.toString;

var hasOwn = function(p) {
  return this.hasOwnProperty(p);
};

var utils = {};

utils.isArray = function(obj) {
  return utils.type(obj) === utils.TYPE_ARRAY;
};

utils.isFunction = function(obj) {
  return utils.type(obj) === utils.TYPE_FUNCTION;
};

utils.getValue = function(htmlElement) {
  if (typeof htmlElement.value === 'undefined') {
    return htmlElement.getAttribute('data-value') || '';
  } else {
    return htmlElement.value;
  }
};

utils.type = function(type) {
  return objectType.call(type);
};

utils.TYPE_STRING = '[object String]';
utils.TYPE_ARRAY = '[object Array]';
utils.TYPE_FUNCTION = '[object Function]';
utils.TYPE_REGEXP = '[object RegExp]';
