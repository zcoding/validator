// shortcut
var hasOwn = function(p) {
  return this.hasOwnProperty(p);
};

// Object Type Const String
var TYPE_STRING = '[object String]'
  , TYPE_ARRAY = '[object Array]'
  , TYPE_FUNCTION = '[object Function]'
  , TYPE_REGEXP = '[object RegExp]'
  , TYPE_UNDEFINED = 'undefined';

var utils = {};

/**
 * Utils: Get Object Type
 * @param {Object} obj
 * @return {String} object type
 */
function getType(obj) {
  return Object.prototype.toString.call(obj);
};

// HACK: 验证的时候，不作trim处理
utils.trim = function(str) {
  return str.replace(/^\s+|\s$/g, '');
};

/**
 * Utils: isArray
 * @param {Object} obj
 * @return {Boolean} is Array or not
 */
function isArray(obj) {
  return getType(obj) === TYPE_ARRAY;
};

/**
 * Utils: isFunction
 * @param {Object} obj
 * @return {Boolean} is Function or not
 */
function isFunction(obj) {
  return getType(obj) === TYPE_FUNCTION;
};

/**
 * Utils: getValue
 * @param {HTMLElement} htmlElement
 * @return {String} value of htmlElement
 */
utils.getValue = function(htmlElement) {
  return htmlElement.value || htmlElement.getAttribute('data-value') || '';
};

/**
 * 解析length规则的参数
 * @param {String} paramString
 * @return {Array} params
 */
utils.getLengthParams = function(paramString) {
  var errorString = 'The parameters for length is illegal.';
  paramString = paramString[0]; // HACK: 假设只有一个参数
  var matcher = /\s*([\(\[])\s*(\d+)?\s*,\s*(\d+)?\s*([\)\]])\s*/; // 如果没有最小限制，最小限制为0；如果没有最大限制，最大限制为Infinite
  var result = paramString.match(matcher);
  if (result === null) {
    throw new TypeError(errorString);
  }
  var min = result[2], max = result[3];
  if (typeof min === TYPE_UNDEFINED) {
    min = 0;
  } else if (result[1] === '(') {
    min = +min+1;
  } else if (result[1] === '[') {
    min = +min;
  } else {
    throw new TypeError(errorString);
  }
  if (typeof max === TYPE_UNDEFINED) {
    max = Infinity;
  } else if (result[4] === ')') {
    max = +max-1;
  } else if (result[4] === ']'){
    max = +max;
  } else {
    throw new TypeError(errorString);
  }
  if (min !== min || max !== max) {
    throw new TypeError(errorString);
  }
  return [min, max];
};

/**
 * 解析range规则的参数
 * @param {String} paramString
 * @return {Array} params
 * @throws {TypeError} 'The parameters for range is illegal.'
 * TODO: 类似length规则
 */
utils.getRangeParams = function(paramString) {
  var errorString = 'The parameters for range is illegal.';
  paramString = paramString[0];
  var matcher = /\s*([\(\[])\s*((0|([\+\-]?[1-9]\d*))(\.[0-9]+)?)?\s*,\s*((0|([\+\-]?[1-9]\d*))(\.[0-9]+)?)?\s*([\)\]])\s*/; // 如果没有最小限制，最小限制为负无穷；如果没有最大限制，最大限制为正无穷
  var result = paramString.match(matcher);
  if (result === null) {
    throw new TypeError(errorString);
  }
  var min = result[2], max = result[6], leftEqual, rightEqual;
  if (typeof min === TYPE_UNDEFINED) {
    min = -Infinity;
  } else {
    min = +min;
  }
  leftEqual = result[1] === '[';
  if (typeof max === TYPE_UNDEFINED) {
    max = Infinity;
  } else {
    max = +max;
  }
  rightEqual = result[10] === ']';
  return [leftEqual, min, max, rightEqual];
};
