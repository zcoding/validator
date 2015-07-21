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

/**
 * getChecker
 * @param {String} type
 * @return {Array} [checkerFunction, params]
 */
utils.getChecker = function(type) {
  var parts = type.split(':');
  type = parts[0].replace(/length/i, 'long');
  var checker = defaults.checkers[type];
  if (!utils.isFunction(checker)) {
    throw new TypeError('Checker for rule ' + parts[0] + ' must be a Function.');
  }
  // TODO: 直接把parts作为参数传进去是不行的，参数还没有解析完成，例如length的参数"(5,12]"要解析成参数列表[6, 12]
  var params;
  var _params = parts.slice(1);
  switch (type) {
    case 'long':
      params = utils.getLengthParams(_params);
      break;
    default:
      params = _params;
  }
  return [checker, params];
};

/**
 * 解析length规则的参数
 * @param {String} paramString
 * @return {Array} params
 * HACK: 这里的解析可以更复杂，例如，加入对布尔运算的解析
 */
utils.getLengthParams = function(paramString) {
  paramString = paramString[0]; // 暂时只做最简单的解析
  var matcher = /\s*([\(\[])\s*(\d+)?\s*,\s*(\d+)?\s*([\)\]])\s*/; // 如果没有最小限制，最小限制为0；如果没有最大限制，最大限制为Infinite
  var result = paramString.match(matcher);
  if (result === null) {
    throw new TypeError('The parameters for length is illegal.');
  }
  var min = result[2], max = result[3];
  if (typeof min === 'undefined') {
    min = 0;
  } else if (result[1] === '(') {
    min = +min+1;
  } else if (result[1] === '[') {
    min = +min;
  } else {
    throw new TypeError('The parameters for length is illegal.');
  }
  if (typeof max === 'undefined') {
    max = Infinite;
  } else if (result[4] === ')') {
    max = +max-1;
  } else if (result[4] === ']'){
    max = +max;
  } else {
    throw new TypeError('The parameters for length is illegal.');
  }
  if (min !== min || max !== max) {
    throw new TypeError('The parameters for length is illegal.');
  }
  return [min, max];
};

/**
 * Utils: Get Object Type
 * @param {Object} obj
 * @return {String} object type
 */
utils.type = function(obj) {
  return objectType.call(obj);
};

// Object Type Const String
utils.TYPE_STRING = '[object String]';
utils.TYPE_ARRAY = '[object Array]';
utils.TYPE_FUNCTION = '[object Function]';
utils.TYPE_REGEXP = '[object RegExp]';
