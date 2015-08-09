// shortcut
var hasOwn = function(p) {
  return this.hasOwnProperty(p);
};

// Object Type Const String
var TYPE_STRING = '[object String]'
  , TYPE_ARRAY = '[object Array]'
  , TYPE_FUNCTION = '[object Function]'
  , TYPE_REGEXP = '[object RegExp]'
  , TYPE_BOOLEAN = '[object Boolean]'
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
        // 用布尔矩阵运算，注意短路优化
        var result1 = getType(s1) === TYPE_STRING ? execFn.call(this, s1, values, isApi) : s1;
        var result2 = getType(s2) === TYPE_STRING ? execFn.call(this, s2, values, isApi) : s2;
        var result = matrix.and(result1, result2);
        ruleStack.push(result);
        break;
      case '||':
        var s2 = ruleStack.pop()
          , s1 = ruleStack.pop();
        var result1 = getType(s1) === TYPE_STRING ? execFn.call(this, s1, values, isApi) : s1;
        var result2 = getType(s2) === TYPE_STRING ? execFn.call(this, s2, values, isApi) : s2;
        var result = matrix.or(result1, result2);
        ruleStack.push(result);
        break;
      case '!':
        var s1 = ruleStack.pop();
        var result = matrix.not(getType(s1) === TYPE_STRING ? execFn.call(this, s1, values, isApi) : s1);
        ruleStack.push(result);
        break;
      default:
        ruleStack.push(exp);
    }
  }
  var pop = ruleStack.pop();
  return getType(pop) === TYPE_STRING ? execFn.call(this, pop, values, isApi) : pop;

}
