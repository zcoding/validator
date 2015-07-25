var apiCheckers = {};

/**
 * @static Validator.is
 * 优先级： api.checkers > defaults.checkers
 * @param {String} ruleName
 * @param {String} value
 * @return {Boolean} is or not
 */
var is = Validator.is = function(ruleName, value) {
  var checker = apiCheckers[ruleName] || defaultCheckers[ruleName];
  if (!isFunction(checker)) {
    throw new TypeError('Checker for ' + ruleName + ' is not defined.');
  }
  return checker(value);
};

/**
 * @static Validator.not
 * @param {String} ruleName
 * @param {String} testString
 * @return {Boolean} is or not
 */
var not = Validator.not = function(ruleName, value) {
  var checker = apiCheckers[ruleName] || defaultCheckers[ruleName];
  if (!isFunction(checker)) {
    throw new TypeError('Checker for ' + ruleName + ' is not defined.');
  }
  return function(value) {
    return !checker(value);
  };
};

/**
 * This helper helps to regist default checkers, `is` api and `not` api
 * @param {String} name
 * @param {Object} matcher
 */
function registDefaultCheckers(name, matcher) {
  var callback;
  switch(getType(matcher)) {
    case TYPE_REGEXP:
      callback = function(value) {
        return matcher.test(value);
      };
      break;
    case TYPE_FUNCTION:
      callback = matcher;
      break;
    default:
      throw new TypeError('Matcher Type Error.');
  }
  defaultCheckers[name] = callback;
  is[name] = callback;
  not[name] = function() {
    return callback.apply(null, arguments);
  };
}

for (var m in defaultMatchers) {
  if (hasOwn.call(defaultMatchers, m)) {
    registDefaultCheckers(m, defaultMatchers[m]);
  }
}

/**
 * @static Validator.api(type, apiName, checker)
 * TODO: 修改参数列表，只接收一个参数
 * @param {Array|Object} rules
 * @return Validator
 */
Validator.api = function(rules) {

  /**
   * @param {String} type
   * @param {String|RegExp|Function} checker
   * checker可以是字符串，正则表达式，或者函数
   * 当checker是字符串时，表示基于内建的规则添加的新规则（其实完全可以用内建规则实现）
   * 当checker是正则表达式时，表示一条通过该正则表达式测试的规则
   * 当checker是函数时，该函数的返回值必须是布尔
   * This function may throw a `TypeError` if checker's type is not support.
   */
  function registApiChecker(type, checker) {
    var callback;
    switch(getType(checker)) {
      case TYPE_STRING:
        var parts = checker.split(':');
        var _checker = defaultCheckers[parts[0]];
        if (typeof _checker === TYPE_UNDEFINED) {
          throw new TypeError('Checker ' + parts[0] + ' is not defined.');
        }
        callback = function(value) {
          return _checker.call(this, parts.slice(1));
        };
        break;
      case TYPE_REGEXP:
        callback = function(value) {
          return checker.test(value);
        }
        break;
      case TYPE_FUNCTION:
        callback = checker;
        break;
      default:
        throw new TypeError('Checker must be a String/RegExp/Function.');
    }
    apiCheckers[type] = callback;
  }

  if (isArray(rules)) {
    for (var i = 0; i < rules.length; ++i) {
      registApiChecker(rules[i]);
    }
  } else {
    registApiChecker(rules);
  }

  return Validator;
};
