(function(factory) {
    factory(window);
}(function(exports) {

// 为了兼容不支持querySelectorAll的浏览器，同时又不需要使用jQuery，使用原生API获取元素
// 只是为了获取特定元素，所以只支持简单的选择器
// 1. id选择器
// 2. 类选择器
// 3. 标签选择器
// 4. 属性选择器

/**
 * query selector
 * 这个函数是不完整的！不公开使用
 * @param {String} selector
 * @return {Array} element list
 */
var query = function(selector) {
  
};

// shortcut
var hasOwn = function(p) {
  return this.hasOwnProperty(p);
};

// Object Type Const String
var TYPE_STRING = '[object String]'
  , TYPE_ARRAY = '[object Array]'
  , TYPE_FUNCTION = '[object Function]'
  , TYPE_REGEXP = '[object RegExp]'
  , TYPE_UNDEFINED = 'undefined';

var utils = {};

/**
 * Utils: Get Object Type
 * @param {Object} obj
 * @return {String} object type
 */
function getType(obj) {
  return Object.prototype.toString.call(obj);
};

// HACK: 验证的时候，不作trim处理
utils.trim = function(str) {
  return str.replace(/^\s+|\s$/g, '');
};

/**
 * Utils: isArray
 * @param {Object} obj
 * @return {Boolean} is Array or not
 */
function isArray(obj) {
  return getType(obj) === TYPE_ARRAY;
};

/**
 * Utils: isFunction
 * @param {Object} obj
 * @return {Boolean} is Function or not
 */
function isFunction(obj) {
  return getType(obj) === TYPE_FUNCTION;
};

/**
 * Utils: getValue
 * @param {HTMLElement} htmlElement
 * @return {String} value of htmlElement
 */
utils.getValue = function(htmlElement) {
  return htmlElement.value || htmlElement.getAttribute('data-value') || '';
};

/**
 * 解析length规则的参数
 * @param {String} paramString
 * @return {Array} params
 */
utils.getLengthParams = function(paramString) {
  var errorString = 'The parameters for length is illegal.';
  paramString = paramString[0]; // HACK: 假设只有一个参数
  var matcher = /\s*([\(\[])\s*(\d+)?\s*,\s*(\d+)?\s*([\)\]])\s*/; // 如果没有最小限制，最小限制为0；如果没有最大限制，最大限制为Infinite
  var result = paramString.match(matcher);
  if (result === null) {
    throw new TypeError(errorString);
  }
  var min = result[2], max = result[3];
  if (typeof min === TYPE_UNDEFINED) {
    min = 0;
  } else if (result[1] === '(') {
    min = +min+1;
  } else if (result[1] === '[') {
    min = +min;
  } else {
    throw new TypeError(errorString);
  }
  if (typeof max === TYPE_UNDEFINED) {
    max = Infinity;
  } else if (result[4] === ')') {
    max = +max-1;
  } else if (result[4] === ']'){
    max = +max;
  } else {
    throw new TypeError(errorString);
  }
  if (min !== min || max !== max) {
    throw new TypeError(errorString);
  }
  return [min, max];
};

/**
 * 解析range规则的参数
 * @param {String} paramString
 * @return {Array} params
 * @throws {TypeError} 'The parameters for range is illegal.'
 * TODO: 类似length规则
 */
utils.getRangeParams = function(paramString) {
  var errorString = 'The parameters for range is illegal.';
  paramString = paramString[0];
  var matcher = /\s*([\(\[])\s*((0|([\+\-]?[1-9]\d*))(\.[0-9]+)?)?\s*,\s*((0|([\+\-]?[1-9]\d*))(\.[0-9]+)?)?\s*([\)\]])\s*/; // 如果没有最小限制，最小限制为负无穷；如果没有最大限制，最大限制为正无穷
  var result = paramString.match(matcher);
  if (result === null) {
    throw new TypeError(errorString);
  }
  var min = result[2], max = result[6], leftEqual, rightEqual;
  if (typeof min === TYPE_UNDEFINED) {
    min = -Infinity;
  } else {
    min = +min;
  }
  leftEqual = result[1] === '[';
  if (typeof max === TYPE_UNDEFINED) {
    max = Infinity;
  } else {
    max = +max;
  }
  rightEqual = result[10] === ']';
  return [leftEqual, min, max, rightEqual];
};

/**
 * @constructor
 * @class Validator
 * @param {Array|Object} validations
 */
function Validator(validations) {
  this.cs = {};

  validations = validations || [];

  this.vs = [];
  if (!isArray(validations)) {
    validations = [validations];
  }
  for (var i = 0, len = validations.length; i < len; ++i) {
    var fields = validations[i].field;
    if (!isArray(fields)) {
      fields = [fields];
    }
    var $field = [];
    for (var j = 0; j < fields.length; ++j) {
      $field.push(this.$form.querySelectorAll('[name=' + fields[j] + ']')[0]);
    }
    var rules = validations[i].rules;
    rules = isArray(rules) ? rules : [rules];
    this.vs.push({
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
    switch (getType(rule.rule)) {
      case TYPE_FUNCTION:
        this.cs[rule.name] = rule.rule;
        break;
      case TYPE_STRING:
        this.cs[rule.name] = function() {
        };
        break;
      case TYPE_REGEXP:
        this.cs[rule.name] = function(values) {
          var pass = true;
          if (isArray(values)) {
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
  if (isArray(rules)) {
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
    if (typeof this.cs[rule] !== TYPE_UNDEFINED) {
      delete this.cs[rule];
    }
  }
  if (isArray(rules)) {
    for (var i = 0, len = rules.length; i < len; ++i) {
      removeRule(rules[i]);
    }
  } else {
    removeRule(rules);
  }
  return this;
};

// checker函数的第一个参数总是一个数组，这个数组就是待检测的字符串数组
// 从第二个参数起，每个checker函数带有不同长度的参数列表。例如，empty函数的参数列表长度为0，long函数的参数列表长度为2（暂时，有待改进）
var defaultCheckers = {};

var defaultMatchers = {
  ////////// 正则匹配
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  , email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i
  , number: /^(0|([\+\-]?[1-9]\d*))(\.[0-9]+)?$/
  , int: /^(0|([\+\-]?[1-9]\d*))$/
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
  return value === null || typeof value === TYPE_UNDEFINED || value === '';
}

/**
 * defaults.checkers: equal check
 * @param {Array} values
 * @return {Boolean} equal or not
 */
function equal(values) {
  var equal = true;
  for (var i = 0; i < values.length - 1; ++i) {
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
  for (var i = 0; i < values.length; ++i) {
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
  for (var i = 0; i < values.length; ++i) {
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
  for (var i = 0; i < values.length; ++i) {
    var value = values[i];
    if (leftEqual && value < min || rightEqual && value > max || !leftEqual && value <= min || !rightEqual && value >= max) {
      pass = false;
      break;
    }
  }
  return pass;
};

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

/**
 * @static Validator.extends()
 */
// Validator.extend = function(constructorFunction) {
//
//   constructorFunction.prototype = new Validator();
//   constructorFunction.prototype.constructor = constructorFunction;
//
//   return constructorFunction;
//
// };

/**
 * @constructor
 * @class FormValidator
 * @extends Validator
 * @param {HTMLElement|String} formOrSelector
 * @param {Object|Array} validations
 */
var FormValidator = function(formOrSelector, validations) {
  this.vs = []; // 必须！
  if (typeof formOrSelector === 'string') {
    this.$form = document.querySelectorAll(formOrSelector)[0]; // TODO: querySelectorAll兼容性
  } else {
    this.$form = formOrSelector;
  }
  if (!isArray(validations)) {
    validations = [validations];
  }
  for (var i = 0, len = validations.length; i < len; ++i) {
    var fields = validations[i].field;
    if (!isArray(fields)) {
      fields = [fields];
    }
    var $fields = [];
    for (var j = 0; j < fields.length; ++j) {
      var $field = this.$form.querySelectorAll('[name=' + fields[j] + ']')[0] || this.$form.querySelectorAll('[data-name=' + fields[j] + ']')[0]; // TODO: querySelectorAll兼容性
      if (typeof $field === TYPE_UNDEFINED) {
        throw new TypeError('未找到域：' + fields[j]);
      }
      $fields.push($field);
    }
    var rules = validations[i].rules;
    rules = isArray(rules) ? rules : [rules];
    this.vs.push({
      $fs: $fields,
      rs: rules
    });
  }
};

FormValidator.prototype = new Validator();
FormValidator.prototype.constructor = FormValidator;

/**
 * getChecker
 * 优先级：this.checkers > api.checkers > defaults.checkers
 * @param {String} type
 * @return {Array} [checkerFunction, params]
 */
function getChecker(type) {
  var parts = type.split(':');
  type = parts[0].replace(/length/i, 'long');
  var checker = this.cs[type] || apiCheckers[type] || defaultCheckers[type];
  if (!isFunction(checker)) {
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
 * TODO: 增加对`&&`,`||`的支持
 */
FormValidator.prototype.check = function() {
  var $form = this.$form;
  var validations = this.vs;
  var pass = true;
  for (var i = 0; i < validations.length; ++i) {
    var $fields = validations[i].$fs;
    var rules = validations[i].rs;
    for (var j = 0; j < rules.length; ++j) {
      var rule = rules[j];
      var not = rule.type[0] === '!';
      var ruleType = not ? rule.type.slice(1) : rule.type;
      var checker = getChecker.call(this, ruleType);
      var values  = [];
      for (var k = 0; k < $fields.length; ++k) {
        values.push(utils.getValue($fields[k]));
      }
      checker[1].unshift(values);
      var result = checker[0].apply(null, checker[1]);
      if (not && result || !not && !result) {
        var context = $fields.length < 2 ? $fields[0] : $fields;
        rule.fail.call(context, $form);
        pass = false;
        break; // HACK: 也许应该支持不跳出：这样就是每次都检查所有的域的所有规则
      }
    }
    if (!pass) break;
  }
  return pass;
};


exports.Validator = Validator;

exports.FormValidator = FormValidator;

}));
