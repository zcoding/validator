(function(factory) {
    factory(window);
}(function(exports) {

/**
 * 布尔矩阵运算辅助函数
 */
var matrix = (function() {

  var mat = {};

  /**
   * 求或
   * mat1 = [true, false], mat2 = [false, true], mat1 || mat2 = [true, true]
   * mat1 = [true, false], mat2 = false, mat1 || mat2 = [true, false]
   */
  mat.or = function(mat1, mat2) {
    var newMatrix = [];
    if (isArray(mat2)) {
      for (var i = 0; i < mat1.length; ++i) {
        newMatrix[i] = mat1[i] || mat2[i];
      }
    } else {
      for (var i = 0; i < mat1.length; ++i) {
        newMatrix[i] = mat1[i] || mat2;
      }
    }
    return newMatrix;
  };

  /**
   * 求与
   * mat1 = [true, false], mat2 = [false, true], mat1 && mat2 = [false, false]
   * mat1 = [true, false], mat2 = false, mat1 && mat2 = [false, false]
   */
  mat.and = function(mat1, mat2) {
    var newMatrix = [];
    if (isArray(mat2)) {
      for (var i = 0; i < mat1.length; ++i) {
        newMatrix[i] = mat1[i] && mat2[i];
      }
    } else {
      for (var i = 0; i < mat1.length; ++i) {
        newMatrix[i] = mat1[i] && mat2;
      }
    }
    return newMatrix;
  };

  /**
   * 求反
   * mat1 = [true, false], !mat1 = [false, true]
   */
  mat.not = function(mat1) {
    var newMatrix = [];
    for (var i = 0; i < mat1.length; ++i) {
      newMatrix[i] = !mat1[i];
    }
    return newMatrix;
  };

  /**
   * 求值
   * mat1 = [true, false], return false
   * mat1 = [true, true], return true
   */
  mat.val = function(mat1) {
    var result = true;
    for (var i = 0; i < mat1.length; ++i) {
      result &= mat1[i];
    }
    return result;
  };

})();

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
function getValue(htmlElement) {
  return htmlElement.value || htmlElement.getAttribute('data-value') || '';
}

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

var priorityTable = {
  "||": 0,
  "&&": 1,
  "!": 2
};

function priority(v1, v2) {
  return priorityTable[v1] >= priorityTable[v2];
}

/**
 * parse rules
 * 解析规则字符串，获取规则名称，规则参数，与或非逻辑
 * 用花括号表示分组，因为小括号和中括号已经作为参数有用
 * @param {String} ruleString
 * @return {Array} rules
 */
function parseRules(ruleString) { // 假设输入为： "{A||!B}&&C"
  var wordQueue = []; // 词队列
  var exQueue = []; // 后缀表达式队列
  var opStack = []; // 操作符栈
  // 1. 分词：wordQueue = ['{', 'A', '||', '!', 'B', '}', '&&', 'C']
  var i = 0, c, word = '', op = '', len = ruleString.length;
  while (i < len) {
    c = ruleString[i++];
    switch (c) {
      case '{':
      case '}':
      case '!':
        if (word.length > 0) {
          wordQueue.push(word);
        }
        wordQueue.push(c);
        word = '';
        break;
      case '&':
      case '|':
        if (c === op) {
          if (word.length > 0) {
            wordQueue.push(word);
          }
          wordQueue.push(op+op);
          word = '';
          op = '';
        } else {
          op += c;
        }
        break;
      default:
        word += c;
    }
  }
  if (word.length > 0) {
    wordQueue.push(word);
  }
  // 2. 将中缀转成后缀并输入后缀表达式栈：exQueue = ['A', 'B', '!', '||', 'C', '&&'];
  i = 0;
  len = wordQueue.length;
  var j, pop;
  while(i < len) {
    c = wordQueue[i++];
    switch (c) {
      case '{':
        opStack.push(c);
        break;
      case '||':
      case '&&':
      case '!':
        j = opStack.length - 1;
        while(j >= 0 && (opStack[j] === '||' ||  opStack[j] === '&&' || opStack[j] === '!')) {
          if (priority(opStack[j], c)) { // 如果栈顶操作符优先级比较大或相等，就出栈
            exQueue.push(opStack.pop());
          } else {
            break;
          }
          j--;
        }
        opStack.push(c);
        break;
      case '}':
        j = opStack.length - 1;
        while(j >= 0) {
          pop = opStack.pop();
          if (pop === '{') {
            break;
          }
          exQueue.push(pop);
          j--;
        }
        break;
      default:
        exQueue.push(c);
    }
  }
  if (opStack.length > 0) {
    j = opStack.length - 1;
    while(j >= 0) {
      pop = opStack.pop();
      if (pop === '{') {
        break;
      }
      exQueue.push(pop);
      j--
    }
  }
  // console.log('转成后缀：' + exQueue);
  return exQueue;
}

/**
 * execute checker
 * @param {String} type
 * @param {Array} values
 * @param {Boolean} isApi
 * @return {Boolean} result
 * TODO:所有的checker都将传入一个values数组作为参数，但是返回值不同，可能返回布尔矩阵（数组），或者布尔值
 */
function execFn(type, values, isApi) {
  var parts = type.split(':');
  type = parts[0].replace(/length/i, 'long');
  var checker = isApi ? apiCheckers[type] || defaultCheckers[type] : this.cs[type] || apiCheckers[type] || defaultCheckers[type];

  var result;
  switch(getType(checker)) {
    // checker可能不是函数，checker可能是由另外一些规则组成的表达式，所以要继续计算
    case TYPE_ARRAY:
      result = calculateRules.call(this, checker, values, isApi);
      break;
    case TYPE_FUNCTION:
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
      if (isApi) {
        params.unshift(values);
      } else {
        var _values  = [];
        for (var k = 0; k < values.length; ++k) {
          _values.push(getValue(values[k]));
        }
        params.unshift(_values);
      }
      result = checker.apply(null, params);
      break;
    default:
      throw new TypeError('Checker for rule ' + parts[0] + ' must be a Function.');
  }
  return result;
}

/**
 * 执行后缀表达式运算
 * @param {Array} ruleQueue
 * @param {Array} values
 * @return {Boolean} result
 * TODO: 使用基于矩阵（数组）的与或非运算
 */
function calculateRules(ruleQueue, values, isApi) {

  var ruleStack = [];
  for (var k = 0; k < ruleQueue.length; ++k) {
    var exp = ruleQueue[k];
    switch (exp) {
      case '&&':
        var s2 = ruleStack.pop()
          , s1 = ruleStack.pop();
        var result = (getType(s1) === TYPE_STRING ? execFn.call(this, s1, values, isApi) : s1) && (getType(s2) === TYPE_STRING ? execFn.call(this, s2, values, isApi) : s2);
        ruleStack.push(result);
        break;
      case '||':
        var s2 = ruleStack.pop()
          , s1 = ruleStack.pop();
        var result = (getType(s1) === TYPE_STRING ? execFn.call(this, s1, values, isApi) : s1) || (getType(s2) === TYPE_STRING ? execFn.call(this, s2, values, isApi) : s2);
        ruleStack.push(result);
        break;
      case '!':
        var s1 = ruleStack.pop();
        var result = !(getType(s1) === TYPE_STRING ? execFn.call(this, s1, values, isApi) : s1);
        ruleStack.push(result);
        break;
      default:
        ruleStack.push(exp);
    }
  }
  var pop = ruleStack.pop();
  return getType(pop) === TYPE_STRING ? execFn.call(this, pop, values, isApi) : pop;

}

/**
 * @constructor
 * @class Validator
 * @param {Array|Object} validations
 */
function Validator(validations) {
  validations = validations || [];
  this.cs = {};
  this.vs = parseValidations(validations);
}

function parseValidations(validations) {
  validations = getType(validations) === TYPE_ARRAY ? validations : [validations];
  var v = [];
  for (var i = 0; i < validations.length; ++i) {
    var vi = validations[i];
    var r = {};
    var fieldType = getType(vi['field']);
    r.fs = !vi['field'] ? null : (fieldType === TYPE_ARRAY ? vi.field : [vi.field]);
    r.rs = [];
    var rules = getType(vi.rules) === TYPE_ARRAY ? vi.rules : [vi.rules];
    for (var j = 0; j < rules.length; ++j) {
      var rj = rules[j];
      var _r = {};
      _r.if = parseRules(rj.if);
      _r.no = !rj['fail'] ? false : rj.fail;
      _r.yes = !rj['success'] ? false : parseValidations(rj.success);
      r.rs.push(_r);
    }
    v.push(r);
  }
  return v;
}

function setRule(name, rule) {
  var checker = rule;
  var callback;
  switch (getType(checker)) {
    case TYPE_FUNCTION:
      callback = checker;
      break;
    case TYPE_STRING:
      try {
        callback = parseRules(checker);
      } catch(error) {
        throw new Error("Cannot parse rule expression.");
      }

      break;
    case TYPE_REGEXP:
      callback = function(values) {
        var pass = true;
        if (isArray(values)) {
          for (var i = 0, len = values.length; i < len; ++i) {
            if (!checker.test(values[i])) {
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
  this.cs[name] = callback;
}

function removeRule(rule) {
  if (typeof this.cs[rule] !== TYPE_UNDEFINED) {
    delete this.cs[rule];
  }
}

var vprtt = Validator.prototype;

/**
 * @method .add(rules)
 * @param {Object} rules
 * @return this
 * @description 添加自定义规则，可以是正则，函数或者规则表达式
 */
vprtt.add = function(rules) {
  for (var name in rules) {
    if (hasOwn.call(rules, name)) {
      setRule.call(this, name, rules[name]);
    }
  }
  return this;
};

/**
 * @method .remove(rules)
 * @param {Array|String} rules
 * @return this
 * @description 删除自定义规则
 */
vprtt.remove = function(rules) {
  if (isArray(rules)) {
    for (var i = 0; i < rules.length; ++i) {
      removeRule.call(this, rules[i]);
    }
  } else {
    removeRule.call(this, rules);
  }
  return this
};

/**
 * @method .check()
 * @return {Boolean} pass or not
 */
vprtt.check = function() {
  var pass = true;
  var validations = this.vs;
  for (var i = 0; i < validations.length; ++i) {
    var vi = validations[i];
    var vfs = vi.fs, vrs = vi.rs;
    for (var j = 0; j < vrs.length; ++j) {
      var rj = vrs[j];
      pass = calculateRules.call(this, rj.if, vfs, false);
      if (!pass) {
        var context = vfs.length < 2 ? vfs[0] : vfs;
        if (rj.no) {
          rj.no.call(context);
        }
        break;
      }
    }
    if (!pass) break;
  }
  return pass;
};

// checker函数的第一个参数总是一个数组，这个数组就是待检测的字符串数组
// 从第二个参数起，每个checker函数带有不同长度的参数列表。例如，empty函数的参数列表长度为0，long函数的参数列表长度为2（暂时，有待改进）
var defaultCheckers = {};

var defaultMatchers = {
  // url
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  // email
  , email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i
  // 数值型
  , number: /^(0|([\+\-]?[1-9]\d*))(\.[0-9]+)?$/
  // 整型
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
  , ip: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
  // IPV4
  , ipv4: /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/
  // IPV6
  , ipv6: /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
  // 全大写
  , upperCase: /^[A-Z]+$/
  // 全小写
  , lowerCase: /^[a-z]+$/
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
 * TODO: 引入布尔矩阵运算
 * @param {Array} values
 * @return {Boolean} equal or not
 */
function equal(values) {
  if (!isArray(values)) {
    return false;
  }
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
 * TODO: 引入布尔矩阵运算
 * @param {String|Array} values
 * @return {Boolean|Array} 如果传入数组，就返回布尔数组；如果传入字符串，就返回布尔值
 */
function empty(values) {
  var pass;
  if (isArray(values)) {
    pass = true;
    for (var i = 0; i < values.length; ++i) {
      if (!isEmpty(values[i])) {
        pass = false;
        break;
      }
    }
  } else {
    pass = isEmpty(values);
  }
  return pass;
}

/**
 * defaults.checkers: length check
 * TODO: 引入布尔矩阵运算
 * @param {Array|String} values
 * @param {Number} min
 * @param {Number} max
 * @return {Array|Boolean} 如果传入数组，就返回布尔矩阵；如果传入字符串，就返回布尔值
 */
function long(values, min, max) {
  var pass, length;
  min = min || -Infinity;
  max = max || Infinity;
  if (isArray(values)) {
    pass = true;
    for (var i = 0; i < values.length; ++i) {
      length = values[i].length;
      if (length < min || length > max) {
        pass = false;
        break;
      }
    }
  } else {
    length = values.length;
    pass = length >= min && length <= max;
  }
  return pass;
}

/**
 * defaults.check: number range check
 * 这个函数和long类似，但是不是用来限制长度的，而是用来限制数值本身的
 * HACK: 这个函数的五个参数缺一不可
 * HACK: values应该转成Number型，因为参数很可能是字符串，可能会引起判断错误
 * @param {Array|String} values
 * @param {Boolean} leftEqual 是否大于等于
 * @param {Number} min
 * @param {Number} max
 * @param {Boolean} rightEqual 是否小于等于
 * @return {Array|Boolean} 如果传入数组，就返回布尔矩阵；否则就返回布尔值
 */
function range(values, leftEqual, min, max, rightEqual) {
  var pass;
  if (isArray(values)) {
    pass = true;
    for (var i = 0; i < values.length; ++i) {
      var value = Number(values[i]);
      if (leftEqual && value < min || rightEqual && value > max || !leftEqual && value <= min || !rightEqual && value >= max) {
        pass = false;
        break;
      }
    }
  } else {
    values = Number(values);
    pass = (leftEqual && values >= min || !leftEqual && values > min) && (rightEqual && values <= max || !rightEqual && values < max);
  }
  return pass;
}

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

// 暂时不做扩展：没有必要做扩展了，已经够用了

/**
 * @constructor
 * @class FormValidator
 * @extends Validator
 * @param {HTMLElement|String} formOrSelector
 * @param {Object|Array} validations
 * TODO: 增加对checkbox,radio的支持
 */
var FormValidator = function(formOrSelector, validations) {
  this.vs = [];
  this.cs = {};
  if (typeof formOrSelector === 'string') {
    this.$form = document.querySelectorAll(formOrSelector)[0]; // TODO: querySelectorAll兼容性
  } else {
    this.$form = formOrSelector;
  }
  validations = validations || [];
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
    for (var k = 0; k < rules.length; ++k) {
      rules[k].queue = parseRules(rules[k].type);
    }
    this.vs.push({
      $fs: $fields,
      rs: rules
    });
  }
};

FormValidator.prototype = new Validator();
FormValidator.prototype.constructor = FormValidator;

/**
 * @method .check()
 * @override Validator.prototype.check()
 * @return {Boolean} pass or not
 * TODO: 增加对checkbox和radio的支持
 */
FormValidator.prototype.check = function() {
  return Validator.prototype.check.call(this, this.$form);
};


exports.Validator = Validator;

exports.FormValidator = FormValidator;

}));