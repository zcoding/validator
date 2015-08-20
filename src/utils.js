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

/**
 * Utils: Get Object Type
 * @param {Object} obj
 * @return {String} object type
 */
function getType(obj) {
  return Object.prototype.toString.call(obj);
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
  if (typeof htmlElement['value'] !== TYPE_UNDEFINED) {
    return htmlElement.value || '';
  } else if (typeof htmlElement['getAttribute'] !== TYPE_UNDEFINED) {
    return htmlElement.getAttribute('data-value') || '';
  } else {
    return htmlElement || '';
  }
}

/**
 * 解析length规则的参数
 * @param {String} paramString
 * @return {Array} params
 */
function getLengthParams(paramString) {
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
 */
function getRangeParams(paramString) {
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
  "!": 2,
  "*": 2,
  "?": 2
};

function priority(v1, v2) {
  return priorityTable[v1] >= priorityTable[v2];
}

/**
 * parse rules 解析条件表达式，保存后缀队列
 * 条件表达式由两个部分组成
 * 1. 运算符 `&&`, `||`, `!`, `*`, `?`, `{`, `}`
 * 2. 规则字符串
 * @param {String} ruleString
 * @return {Array} rules
 */
function parseConditionExpression(ruleString) { // 假设输入为： "{A||!B}&&C"
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
      case '*':
      case '?':
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
      case '*':
      case '?':
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
  return exQueue;
}

/**
 * execute checker
 * @param {String} type
 * @param {Array} values
 * @param {Boolean} isApi
 * @return {Boolean} result
 */
function executeChecker(type, values, isApi) {
  var parts = type.split(':');
  type = parts[0].replace(/length/i, 'long');
  var checker = isApi ? apiCheckers[type] || defaultCheckers[type] : this.cs[type] || apiCheckers[type] || defaultCheckers[type];

  var result;
  switch(getType(checker)) {
    case TYPE_ARRAY:
      result = calculateConditionExpression.call(this, checker, values, isApi);
      break;
    case TYPE_FUNCTION:
      var params;
      var _params = parts.slice(1);
      switch (type) {
        case 'long':
          params = getLengthParams(_params);
          break;
        case 'range':
          params = getRangeParams(_params);
          break;
        default:
          params = _params;
      }
      if (isApi) {
        params.unshift(values);
      } else {
        var _values  = [];
        if (values !== null) {
          for (var k = 0; k < values.length; ++k) {
            _values.push(getValue(values[k]));
          }
        }
        params.unshift(_values);
      }
      result = checker.apply(null, params);
      break;
    case TYPE_BOOLEAN:
      result = checker;
      break;
    default:
      throw new TypeError('Checker for rule ' + parts[0] + ' must be a Function.');
  }
  return result;
}

/**
 * 计算条件表达式（必须是已经解析成后缀表达式）
 * @param {Array} ruleQueue
 * @param {Array} values
 * @return {Boolean} result
 */
function calculateConditionExpression(ruleQueue, values, isApi) {

  var ruleStack = [];
  for (var k = 0; k < ruleQueue.length; ++k) {
    var exp = ruleQueue[k];
    switch (exp) {
      case '&&':
        var s2 = ruleStack.pop()
          , s1 = ruleStack.pop();
        var result1 = getType(s1) === TYPE_STRING ? executeChecker.call(this, s1, values, isApi) : s1;
        var result2 = getType(s2) === TYPE_STRING ? executeChecker.call(this, s2, values, isApi) : s2;
        var result = matrix.and(result1, result2);
        ruleStack.push(result);
        break;
      case '||':
        var s2 = ruleStack.pop()
          , s1 = ruleStack.pop();
        var result1 = getType(s1) === TYPE_STRING ? executeChecker.call(this, s1, values, isApi) : s1;
        var result2 = getType(s2) === TYPE_STRING ? executeChecker.call(this, s2, values, isApi) : s2;
        var result = matrix.or(result1, result2);
        ruleStack.push(result);
        break;
      case '!':
        var s1 = ruleStack.pop();
        var result = matrix.not(getType(s1) === TYPE_STRING ? executeChecker.call(this, s1, values, isApi) : s1);
        ruleStack.push(result);
        break;
      case '*':
        var s1 = ruleStack.pop();
        var result = matrix.all(getType(s1) === TYPE_STRING ? executeChecker.call(this, s1, values, isApi) : s1);
        ruleStack.push(result);
        break;
      case "?":
        var s1 = ruleStack.pop();
        var result = matrix.any(getType(s1) === TYPE_STRING ? executeChecker.call(this, s1, values, isApi) : s1);
        ruleStack.push(result);
        break;
      default:
        ruleStack.push(exp);
    }
  }
  var pop = ruleStack.pop();
  return getType(pop) === TYPE_STRING ? executeChecker.call(this, pop, values, isApi) : pop;

}
