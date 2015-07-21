/**
 * @static Validator.is
 * @param {String} ruleName
 * @param {String} testString
 * @return {Boolean} is or not
 * HACK: is是一个函数对象，注意属性不能被覆盖
 */
var is = function is(ruleName, testString) {
  return is[ruleName](testString);
};

/**
 * @static Validator.not
 * @param {String} ruleName
 * @param {String} testString
 * @return {Boolean} is or not
 */
var not = function not(ruleName, testString) {
  return not[ruleName](testString);
};

Validator.is = is;

Validator.not = not;

/**
 * This helper helps to regist api
 * @param {String} name
 * @param {Function} callback
 */
function registAPI(name, callback) {
  if (typeof is[name] !== 'undefined') {
    console.warn('Warning: current api "' + name + '" will be overridden.');
  }
  is[name] = callback;
  not[name] = function(value) {
    return !is[name](value);
  };
}

Validator.not = not;

// 注册内建规则
for (var i = 0, len = defaults.rules.length; i < len; ++i) {
  registAPI(defaults.rules[i], defaults.checkers[defaults.rules[i]]);
}

/**
 * @static Validator.api(type, apiName, checker)
 * @param {String} type
 * @param {String} apiName
 * @param {String|RegExp|Function} checker
 * checker可以是字符串，正则表达式，或者函数
 * 当checker是字符串时，表示基于内建的规则添加的新规则（其实完全可以用内建规则实现）
 * 当checker是正则表达式时，表示一条通过该正则表达式测试的规则
 * 当checker是函数时，该函数的返回值必须是布尔
 * This function may throw a `TypeError` if checker's type is not support.
 * @return Validator
 */
Validator.api = function(type, apiName, checker) {
  var _type = utils.type(checker);
  if (!/is|not/.test(type)) {
    throw new TypeError('The api type "' + type + '" is not support.');
  }
  var is = type === 'is';
  var callback;
  switch(_type) {
    case utils.TYPE_STRING:
      var parts = checker.split(':');
      var _checker = defaults.checkers[parts[0]];
      if (typeof _checker === 'undefined') {
        throw new TypeError('Checker ' + parts[0] + ' is not defined.');
      }
      callback = function(value) {
        var result = _checker.call(this, parts.slice(1));
        return is ?  result: !result;
      };
      break;
    case utils.TYPE_REGEXP:
      callback = function(value) {
        var result = checker.test(value);
        return is ? result : !result;
      }
      break;
    case utils.TYPE_FUNCTION:
      callback = checker;
      break;
    default:
      throw new TypeError('Checker must be a String/RegExp/Function.');
  }
  registAPI(apiName, callback);
  return Validator;
};

/**
 * list all registed api
 */
Validator.api.list = function() {
  return rules;
};
