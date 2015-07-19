
var Validator = function() {};

var vprtt = Validator.prototype;

/**
 * 这个方法将会检查是否通过匹配器的验证，当全部通过时返回true，否则返回false
 * @return {Boolean} pass or not
 */
var checkFn = function() {};

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

////////// is and not api //////////
var is = Validator.is = {},
  isnt = Validator.not = {};

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
// Validator.registerMatcher = registerMatcher;

vprtt.createFormValidator = function(form, configuration) {
  for (var i = 0; i < configuration.length; ++i) {
    var config = configuration[i];
    var field = form.querySelectorAll(config.field)[0]; //  only first
    this.checkList.push({
      field: field,
      rules: config.rules
    });
  }
  var self = this;
  return {
    check: checkFn.bind(self)
  }
};

exports.Validator = Validator;
