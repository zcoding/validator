/* spa-public-validator by zcoding, MIT license, 2015-05-18 version: 0.1.0 */
(function(factory) {
  if (typeof define === 'function' && define.cmd) {
    define(function(require, exports, module) {
      factory(exports);
    });
  } else {
    factory(window)
  }
}(function(exports) {

var matchers = {
  ////////// 正则匹配
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
  ////////// 非正则匹配
  empty: isEmpty
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

var objectType = Object.prototype.toString;

var hasOwn = function(p) {
  return this.hasOwnProperty(p);
};

var Validator = function() {};

var vprtt = Validator.prototype;

/**
 * 这个方法将会检查是否通过匹配器的验证，当全部通过时返回true，否则返回false
 * @param {String|Array} matchers
 */
vprtt.check = function(matchers) {};

/**
 * 这个方法将会添加一个匹配器到Validator实例
 * @param {String} name 匹配器名
 * @param {Function} matcher 匹配函数
 * @return this
 */
vprtt.add = function(name, matcher) {};

/**
 * 这个方法将会移除实例中的匹配器
 * @param {String} matcherName
 */
vprtt.remove = function(matcherName) {};

function match(type, not) {
  not = not || false;
  var matcher = matchers[type];
  if (typeof matcher === 'undefined') {
    throw new TypeError('Validator Type `' + type + '` is not support.');
    return;
  }
  var checkFn = null;
  switch (objectType.call(matcher)) {
    case '[object Function]':
      checkFn = function(value) {
        var result = matcher(value);
        return not ? !result : result;
      };
      break;
    case '[object RegExp]':
      checkFn = function(value) {
        var result = matcher.test(value);
        return not ? !result : result;
      };
      break;
    default:
      throw new TypeError('Matcher Type Error.The Matcher must be a RegExp or Function.');
  }
  return checkFn;
}

var checkList = ['empty', 'email', 'url'];

////////// is and isnt api //////////
var is = Validator.is = {},
  isnt = Validator.isnt = {};

/**
 * 这个函数用来注册匹配器
 * @param {Array} checkList 检测列表
 */
var registerMatcher = function(checkList) {
  for (var i = 0, len = checkList.length; i < len; ++i) {
    var check = checkList[i];
    if (!hasOwn.call(is, check)) {
      is[check] = match(check);
    }
    if (!hasOwn.call(isnt, check)) {
      isnt[check] = match(check, true);
    }
  }
};

// 注册默认的匹配器
registerMatcher(checkList);

// API: 注册一个自定义的匹配器
Validator.registerMatcher = registerMatcher;

exports.Validator = Validator;

}));