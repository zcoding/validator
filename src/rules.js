var defaults = {};

var rules = defaults.rules = ['empty', 'long', 'email', 'url', 'yes']; // 内置规则

var matchers = {
  ////////// 正则匹配
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  , email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i
  , number: /[\+\-]?\d+/
  , positive: /todo/
  , negative: /todo/
  // 全大写
  , upperCase: /^[A-Z]+$/g
  // 全小写
  , lowerCase: /^[a-z]$/g
  ////////// 非正则匹配
  , empty: isEmpty
  , equal: isEqual
};

/**
 * 判断值是否为空
 * @param {Object} value
 * 如果value为null|undefined|空字符串，就判断为真，否则判断为假
 * @return {Boolean} 是否为空
 */
function isEmpty(value) {
  return value === null || typeof value === 'undefined' || value === '';
}

/**
 * 判断是否相等
 * @param {Array} values
 * @return {Boolean} equal or not
 */
function isEqual(values) {
  var equal = true;
  for (var i = 0, len = values.length; i < len - 1; ++i) {
    if (values[i] !== values[i+1]) {
      equal = false;
      break;
    }
  }
  return equal;
}

// checker函数的第一个参数总是一个数组，这个数组就是待检测的字符串数组
// 从第二个参数起，每个checker函数带有不同长度的参数列表。例如，empty函数的参数列表长度为0，long函数的参数列表长度为2（暂时，有待改进）
var checkers = {};

/**
 * checker: not empty
 * @param {Array} values
 * @return {Boolean} yes or no
 */
checkers.notEmpty = function(values) {
  var pass = true;
  for (var i = 0, len = values.length; i < len; ++i) {
    if (isEmpty(values[i])) {
      pass = false;
      break;
    }
  }
  return pass;
};

checkers.empty = function(values) {
  var pass = true;
  for (var i = 0, len = values.length; i < len; ++i) {
    if (!isEmpty(values[i])) {
      pass = false;
      break;
    }
  }
  return pass;
};

/**
 * checker: length limit
 * @param {Array} values
 * @param {Number} min
 * @param {Number} max
 * @return {Boolean} yes or no
 */
checkers.long = function(values, min, max) {
  var pass = true;
  for (var i = 0, len = values.length; i < len; ++i) {
    var length = values[i].length;
    if (length < min || length > max) {
      pass = false;
      break;
    }
  }
  return pass;
};

/**
 * checker: number limit
 * 这个函数和long类似，但是不是用来限制长度的，而是用来限制数值本身的
 * @param {Array} values
 * @param {Number} min
 * @param {Number} max
 * @return {Boolean} yes or no
 */
checkers.range = function(values, min, max) {
  var pass = true;
  for (var i = 0, len = values.length; i < len; ++i) {
    // 首先应该保证是数值型，如果不是就抛出异常（在实际验证中应该在这个规则之前写一个数值型验证）
  }
  return pass;
};

/**
 * checker: string UPPERCASE
 * @param {Array} values
 * @return {Boolean} yes or no
 */
checkers.upperCase = function(values) {
  var pass = true;
  return pass;
};

/**
 * checker: string lowercase
 * @param {Array} values
 * @return {Boolean} yes or no
 */
checkers.lowerCase = function(values) {
  var pass = true;
  return pass;
};

defaults.checkers = checkers;
