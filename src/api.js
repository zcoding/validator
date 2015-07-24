/**
 * @static Validator.is
 * 优先级： api.checkers > defaults.checkers
 * @param {String} ruleName
 * @param {String} value
 * @return {Boolean} is or not
 */
var is = Validator.is = function(ruleName, value) {
  var checker = api.checkers[ruleName] || defaults.checkers[ruleName];
  if (!utils.isFunction(checker)) {
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
  var checker = api.checkers[ruleName] || checkers[ruleName];
  if (!utils.isFunction(checker)) {
    throw new TypeError('Checker for ' + ruleName + ' is not defined.');
  }
  return function(value) {
    return !checker(value);
  };
};

/**
 * This helper helps to regist default checkers into is/not 注册内建规则到is/not
 * 注册is/not的时候，注意不要和属性名重名，为了避免这一情况，只有默认规则注册到is/not，通过.api()注册的其它规则注册到api.checkers对象
 */
function registIsNot(name, checker) {
  is[name] = checker;
  not[name] = function(value) {
    return !checker(value);
  };
}
for (var c in defaults.checkers) {
  if (defaults.checkers.hasOwnProperty(c)) {
    registIsNot(c, defaults.checkers[c]);
  }
}

var api = {};

api.checkers = {};

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
    var _type = utils.type(checker);
    var callback;
    switch(_type) {
      case utils.TYPE_STRING:
        var parts = checker.split(':');
        var _checker = defaults.checkers[parts[0]];
        if (typeof _checker === 'undefined') {
          throw new TypeError('Checker ' + parts[0] + ' is not defined.');
        }
        callback = function(value) {
          return _checker.call(this, parts.slice(1));
        };
        break;
      case utils.TYPE_REGEXP:
        callback = function(value) {
          return checker.test(value);
        }
        break;
      case utils.TYPE_FUNCTION:
        callback = checker;
        break;
      default:
        throw new TypeError('Checker must be a String/RegExp/Function.');
    }
    api[type] = callback;
  }

  if (utils.isArray(rules)) {
    for (var i = 0, len = rules.length; i < len; ++i) {
      registApiChecker(rules[i]);
    }
  } else {
    registApiChecker(rules);
  }

  return Validator;
};
