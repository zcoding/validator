var apiCheckers = {};

/**
 * @static Validator.is
 * 优先级： api.checkers > defaults.checkers
 * @param {String} ruleName
 * @param {Array|String} values
 * @return {Boolean} is or not
 */
var is = Validator.is = function(ruleName, values) {
  return executeChecker.call(null, ruleName, values, true);
};

/**
 * @static Validator.not
 * @param {String} ruleName
 * @param {Array|String} values
 * @return {Boolean} is or not
 */
var not = Validator.not = function(ruleName, values) {
  return matrix.not(is(ruleName, values));
};

var any = Validator.any = function(ruleName, values) {
  return matrix.any(is(ruleName, values));
};

var all = Validator.all = function(ruleName, values) {
  return matrix.all(is(ruleName, values));
};

/**
 * This helper helps to regist default checkers, `is` api and `not` api
 * 所有的defaultCheckers都是函数
 * @param {String} name
 * @param {Object} matcher
 */
function registDefaultCheckers(name, matcher) {
  var callback;
  switch(getType(matcher)) {
    case TYPE_REGEXP:
      callback = function(value) {
        var result;
        if (isArray(value)) {
          result = [];
          for (var i = 0; i < value.length; ++i) {
            result.push(matcher.test(value[i]));
          }
        } else {
          result = matcher.test(value);
        }
        return result;
      };
      break;
    case TYPE_FUNCTION:
      callback = matcher;
      break;
    default:
      throw new TypeError('Default Matcher Type Error.');
  }
  defaultCheckers[name] = callback;
  is[name] = callback;
  not[name] = function() {
    return matrix.not(callback.apply(null, arguments));
  };
  all[name] = function() {
    return matrix.all(callback.apply(null, arguments));
  };
  any[name] = function() {
    return matrix.any(callback.apply(null, arguments));
  };
}

for (var m in defaultMatchers) {
  if (hasOwn.call(defaultMatchers, m)) {
    registDefaultCheckers(m, defaultMatchers[m]);
  }
}

/**
 * @param {String} type
 * @param {String|RegExp|Function} checker
 * checker可以是字符串，正则表达式，或者函数
 * 当checker是字符串时，表示基于内建规则组合（表达式）的新规则
 * 当checker是正则表达式时，表示一条规则，它必须通过该正则表达式的完全匹配
 * This function may throw a `TypeError` if checker's type is not support.
 */
function registApiChecker(type, checker) {
  var callback;
  switch(getType(checker)) {
    case TYPE_STRING:
      // 解析规则，生成的是一个后缀表达式（队列）
      // 只能使用defaultCheckers，如果defaultCheckers里没有，就抛出异常
      // 此处不直接生成checker函数，而是把表达式解析成后缀形式（队列存储），在验证的时候（执行.check()或者Validator.is()/Validator.not()时）再执行表达式运算
      var queue;
      try {
        queue = parseConditionExpression(checker);
      } catch(err) {
        console.error('无法解析的条件表达式');
        throw new Error(err);
      }
      callback = queue;
      break;
    case TYPE_REGEXP:
      callback = function(value) {
        var result;
        if (isArray(value))  {
          result = [];
          for (var i = 0; i < value.length; ++i) {
            result.push(checker.test(value[i]));
          }
        } else {
          result = checker.test(value);
        }
        return result;
      }
      break;
    case TYPE_FUNCTION:
      callback = checker;
      break;
    default:
      throw new TypeError('API Checker Type Error.');
  }
  apiCheckers[type] = callback;
}

/**
 * @static Validator.api(rules)
 * @param {Object} rules
 * @return Validator
 */
Validator.api = function(rules) {

  for (var name in rules) {
    if (hasOwn.call(rules, name)) {
      registApiChecker.call(this, name, rules[name]);
    }
  }
  return this;

};

// just for test
Validator.api.list = function() {
  console.log(apiCheckers);
};
