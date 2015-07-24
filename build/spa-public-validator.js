(function(factory) {
    factory(window);
}(function(exports) {

var objectType = Object.prototype.toString;

var hasOwn = function(p) {
  return this.hasOwnProperty(p);
};

var utils = {};

// HACK: 验证的时候，不作trim处理
utils.trim = function(str) {
  return str.replace(/^\s+|\s$/g, '');
};

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
 * 解析length规则的参数
 * @param {String} paramString
 * @return {Array} params
 * TODO: 这里的解析可以更复杂，例如，加入对布尔运算(`&&`,`||`)的解析
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
    max = Infinity;
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
 * 解析range规则的参数
 * @param {String} paramString
 * @return {Array} params
 * @throws {TypeError} 'The parameters for range is illegal.'
 */
utils.getRangeParams = function(paramString) {
  var errorString = 'The parameters for range is illegal.';
  paramString = paramString[0]; // HACK: 假设只有一个参数
  var matcher = /\s*([\(\[])\s*(匹配浮点数)?\s*,\s*(匹配浮点数)?\s*([\)\]])\s*/; // 如果没有最小限制，最小限制为负无穷；如果没有最大限制，最大限制为正无穷
  var result = paramString.match(matcher);
  if (result === null) {
    throw new TypeError(errorString);
  }
  var min = result[2], max = result[3], leftEqual, rightEqual;
  if (typeof min === 'undefined') {
    min = -Infinity;
  } else {
    min = +min;
  }
  leftEqual = result[1] === '[';
  if (typeof max === 'undefined') {
    max = Infinity;
  } else {
    max = +max;
  }
  rightEqual = result[4] === ']';
  if (min !== min || max !== max) { // NaN
    debugger // HACK: 不应该跑到这段代码
    throw new TypeError(errorString);
  }
  return [leftEqual, min, max, rightEqual];
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

/**
 * @constructor
 * @class Validator
 * @param {Array|Object} validations
 */
var Validator = function(validations) {
  this.checkers = {};

  validations = validations || [];

  this.validations = [];
  if (!utils.isArray(validations)) {
    validations = [validations];
  }
  for (var i = 0, len = validations.length; i < len; ++i) {
    var fields = validations[i].field;
    if (!utils.isArray(fields)) {
      fields = [fields];
    }
    var $field = [];
    for (var j = 0; j < fields.length; ++j) {
      $field.push(this.$form.querySelectorAll('[name=' + fields[j] + ']')[0]);
    }
    var rules = validations[i].rules;
    rules = utils.isArray(rules) ? rules : [rules];
    this.validations.push({
      $field: $field,
      rules: rules
    });
  }
};

var vprtt = Validator.prototype;

/**
 * @method .add(rules)
 * 添加自定义规则
 * @param {Object} rules
 * @return this
 */
vprtt.add = function(rules) {
  function setRule(rule) {
    switch (utils.type(rule.rule)) {
      case utils.TYPE_FUNCTION:
        this.checkers[rule.name] = rule.rule;
        break;
      case utils.TYPE_STRING:
        this.checkers[rule.name] = function() {
        };
        break;
      case utils.TYPE_REGEXP:
        this.checkers[rule.name] = function(values) {
          var pass = true;
          if (utils.isArray(values)) {
            for (var i = 0, len = values.length; i < len; ++i) {
              if (!rule.rule.test(values[i])) {
                pass = false;
                break;
              }
            }
          } else {
            if (!rule.rule.test(values)) {
              pass = false;
            }
          }
          return pass;
        };
        break;
      default:
        throw new TypeError('Rule type not support.');
    }
  }
  if (utils.isArray(rules)) {
    for (var i = 0, len = rules.length; i < len; ++i) {
      setRule.call(this, rules[i]);
    }
  } else {
    setRule.call(this, rules);
  }
  return this;
};

/**
 * @method .check()
 * @return {Boolean} pass or not
 */
vprtt.check = function() {
  return this;
};

/**
 * @method .remove(rules)
 * 移除自定义规则
 * @param {Array|String} rules
 * @return this
 */
vprtt.remove = function(rules) {
  function removeRule(rule) {
    if (typeof this.checkers[rule] !== 'undefined') {
      delete this.checkers[rule];
    }
  }
  if (utils.isArray(rules)) {
    for (var i = 0, len = rules.length; i < len; ++i) {
      removeRule(rules[i]);
    }
  } else {
    removeRule(rules);
  }
  return this;
};

var defaults = {};

// checker函数的第一个参数总是一个数组，这个数组就是待检测的字符串数组
// 从第二个参数起，每个checker函数带有不同长度的参数列表。例如，empty函数的参数列表长度为0，long函数的参数列表长度为2（暂时，有待改进）
defaults.checkers = {};

defaults.matchers = {
  ////////// 正则匹配
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  , email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i
  , number: /^(0|([\+\-]?[1-9]\d*))$/
  // 正整数
  , positive: /^\+?[1-9]\d*$/
  // 负整数
  , negative: /^\-[1-9]\d*$/
  // 变量名：只能包含英文字母/数字/下划线，且不能以数字开头
  , varName: /^[a-zA-Z_][a-zA-Z0-9_]*$/
  // 昵称：只能包含中文/英文字母/数字/下划线，且不能以数字开头
  , nickName: /^[\u4E00-\u9FA5\uF900-\uFA2Da-zA-Z_][\u4E00-\u9FA5\uF900-\uFA2Da-zA-Z0-9_]*$/
  // QQ
  , QQ: /^[1-9][0-9]{4,}$/
  // 身份证号
  // 手机号
  // 电话号码
  // 邮政编码
  // IP
  // IPV4
  // IPV6
  // 全大写
  , upperCase: /^[A-Z]+$/g
  // 全小写
  , lowerCase: /^[a-z]$/g
  ////////// 非正则匹配
  // 空限制
  , empty: empty
  // 相等
  , equal: equal
  // 长度范围限制
  , long: long
  // 数值大小限制
  , range: range
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
 * defaults.checkers: equal check
 * @param {Array} values
 * @return {Boolean} equal or not
 */
function equal(values) {
  var equal = true;
  for (var i = 0, len = values.length; i < len - 1; ++i) {
    if (values[i] !== values[i+1]) {
      equal = false;
      break;
    }
  }
  return equal;
}

/**
 * defaults.checkers: empty check
 * @param {Array} values
 * @return {Boolean} yes or no
 */
function empty(values) {
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
 * defaults.checkers: length check
 * @param {Array} values
 * @param {Number} min
 * @param {Number} max
 * @return {Boolean} yes or no
 */
function long(values, min, max) {
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
 * defaults.check: number range check
 * 这个函数和long类似，但是不是用来限制长度的，而是用来限制数值本身的
 * @param {Array} values
 * @param {Boolean} leftEqual 是否大于等于
 * @param {Number} min
 * @param {Number} max
 * @param {Boolean} rightEqual 是否小于等于
 * @return {Boolean} yes or no
 */
function range(values, leftEqual, min, max, rightEqual) {
  var pass = true;
  for (var i = 0, len = values.length; i < len; ++i) {
    var value = values[i];
    if (leftEqual && value < min || rightEqual && value > max || !leftEqual && value <= min || !rightEqual && value >= max) {
      pass = false;
      break;
    }
  }
  return pass;
};

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
  var checker = api.checkers[ruleName] || defaults.checkers[ruleName];
  if (!utils.isFunction(checker)) {
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
  switch(utils.type(matcher)) {
    case utils.TYPE_REGEXP:
      callback = function(value) {
        return matcher.test(value);
      };
      break;
    case utils.TYPE_FUNCTION:
      callback = matcher;
      break;
    default:
      throw new TypeError('Matcher Type Error.');
  }
  defaults.checkers[name] = callback;
  is[name] = callback;
  not[name] = function() {
    return callback.apply(null, arguments);
  };
}

for (var m in defaults.matchers) {
  if (defaults.matchers.hasOwnProperty(m)) {
    registDefaultCheckers(m, defaults.matchers[m]);
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

/**
 * @static Validator.extends()
 */
Validator.extend = function(constructorFunction) {

  constructorFunction.prototype = new Validator();
  constructorFunction.prototype.constructor = constructorFunction;

  return constructorFunction;

};

/**
 * @constructor
 * @class FormValidator
 * @extends Validator
 * @param {HTMLElement|String} formOrSelector
 * @param {Object|Array} validations
 */
var FormValidator = Validator.extend(function(formOrSelector, validations) {
  if (typeof formOrSelector === 'string') {
    this.$form = document.querySelectorAll(formOrSelector)[0]; // TODO: querySelectorAll兼容性
  } else {
    this.$form = formOrSelector;
  }
  this.validations = [];
  if (!utils.isArray(validations)) {
    validations = [validations];
  }
  for (var i = 0, len = validations.length; i < len; ++i) {
    var fields = validations[i].field;
    if (!utils.isArray(fields)) {
      fields = [fields];
    }
    var $field = [];
    for (var j = 0; j < fields.length; ++j) {
      $field.push(this.$form.querySelectorAll('[name=' + fields[j] + ']')[0]); // TODO: querySelectorAll兼容性
    }
    var rules = validations[i].rules;
    rules = utils.isArray(rules) ? rules : [rules];
    this.validations.push({
      $field: $field,
      rules: rules
    });
  }
});

/**
 * getChecker
 * 优先级：this.checkers > api.checkers > defaults.checkers
 * @param {String} type
 * @return {Array} [checkerFunction, params]
 */
function getChecker(type) {
  var parts = type.split(':');
  type = parts[0].replace(/length/i, 'long');
  var checker = this.checkers[type] || api.checkers[type] || defaults.checkers[type];
  if (!utils.isFunction(checker)) {
    throw new TypeError('Checker for rule ' + parts[0] + ' must be a Function.');
  }
  var params;
  var _params = parts.slice(1);
  switch (type) {
    case 'long':
      params = utils.getLengthParams(_params);
      break;
    case 'range':
      params = utils.getRangeParams(_params);
      break;
    default:
      params = _params;
  }
  return [checker, params];
};

/**
 * @method .check()
 * @override Validator.prototype.check()
 * @return {Boolean} pass or not
 * TODO:增加对取反符号`!`的支持
 */
FormValidator.prototype.check = function() {
  var $form = this.$form;
  var validations = this.validations;
  var pass = true;
  for (var i = 0, len = validations.length; i < len; ++i) {
    var $field = validations[i].$field;
    var rules = validations[i].rules;
    for (var j = 0; j < rules.length; ++j) {
      var rule = rules[j];
      var not = rule.type[0] === '!';
      var ruleType = not ? rule.type.slice(1) : rule.type;
      var checker = getChecker.call(this, ruleType);
      var values  = [];
      for (var k = 0; k < $field.length; ++k) {
        values.push(utils.getValue($field[k]));
      }
      checker[1].unshift(values);
      var result = checker[0].apply(null, checker[1]);
      if (not && result || !not && !result) {

        var context = $field.length < 2 ? $field[0] : $field;
        rule.fail.call(context, $form);
        pass = false;
        break;
      }
    }
    if (!pass) break;
  }
  return pass;
};


exports.Validator = Validator;

exports.FormValidator = FormValidator;

}));
