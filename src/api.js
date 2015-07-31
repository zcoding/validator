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
  var result;
  switch(getType(checker)) {
    case TYPE_ARRAY:
      result = calculateRules.call(this, checker, value, true);
      break;
    case TYPE_FUNCTION:
      result = checker(value);
      break;
    default:
      throw new TypeError('Checker for ' + ruleName + ' is not defined.');
  }
  return result;
};

/**
 * @static Validator.not
 * @param {String} ruleName
 * @param {String} testString
 * @return {Boolean} is or not
 */
var not = Validator.not = function(ruleName, value) {
  return !is(ruleName, value);
};

// TODO: 增加Validator.any(),Validator.all()

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
      // value may be an array or string
      // TODO:如果传入数组，就返回布尔数组
      // 如果是字符串，就返回布尔值
      callback = function(value) {
        var pass;
        if (isArray(value)) {
          pass = true;
          for (var i = 0; i < value.length; ++i) {
            if (!matcher.test(value[i])) {
              pass = false;
              break;
            }
          }
        } else {
          pass = matcher.test(value);
        }
        return pass;
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
    return !callback.apply(null, arguments);
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
 * TODO: 当checker是函数时，该函数的返回值必须是布尔型或者布尔矩阵
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
        queue = parseRules(checker);
      } catch(err) {
        throw new Error(err);
      }
      callback = queue;
      break;
    case TYPE_REGEXP:
      callback = function(value) {
        var pass = true;
        if (isArray(value))  {
          for (var i = 0; i < value.length; ++i) {
            if (!checker.test(value[i])) {
              pass = false;
              break;
            }
          }
        } else {
          pass = checker.test(value);
        }
        return pass;
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
