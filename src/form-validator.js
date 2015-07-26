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
 * parse rules
 * 解析规则字符串，获取规则名称，规则参数，与或非逻辑
 * 用花括号表示分组，因为小括号和中括号已经作为参数有用
 * @param {String} ruleString
 * @return {Array} rules
 * TODO: 使用后缀表达式的方法解析
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
  // console.log('分词结果：' + wordQueue);
  // 2. 将中缀转成后缀并输入后缀表达式栈：exQueue = ['A', 'B', '!', '||', 'C', '&&'];
  i = 0;
  len = wordQueue.length;
  var j, pop;
  while(i < len) {
    c = wordQueue[i++];
    switch (c) {
      case '{':
      case '||':
      case '&&':
      case '!':
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
  // 下面两步不在这里做，直接在check函数里完成
  // 3. 读取后缀表达式队列并运算
  // 4. 优化：短路优化
}

function execChecker(checker, $fields) {
  var values  = [];
  for (var k = 0; k < $fields.length; ++k) {
    values.push(utils.getValue($fields[k]));
  }
  checker[1].unshift(values);
  return checker[0].apply(null, checker[1]);
}

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
  var ruleStack = [];
  for (var i = 0; i < validations.length; ++i) {
    var $fields = validations[i].$fs;
    var rules = validations[i].rs;
    for (var j = 0; j < rules.length; ++j) {
      var rule = rules[j];

      var ruleQueue = parseRules(rule.type);
      ruleStack.splice(0, ruleStack.length); // 清空栈
      // 现在开始解析后缀表达式
      for (var k = 0; k < ruleQueue.length; ++k) {
        var exp = ruleQueue[k];
        switch (exp) {
          case '&&':
            var s2 = ruleStack.pop();
            var s1 = ruleStack.pop();
            var result = (getType(s1) === TYPE_STRING ? execChecker(getChecker.call(this, s1), $fields) : s1) && (getType(s2) === TYPE_STRING ? execChecker(getChecker.call(this, s2), $fields) : s2);
            ruleStack.push(result);
            break;
          case '||':
            var s2 = ruleStack.pop();
            var s1 = ruleStack.pop();
            var result = (getType(s1) === TYPE_STRING ? execChecker(getChecker.call(this, s1), $fields) : s1) || (getType(s2) === TYPE_STRING ? execChecker(getChecker.call(this, s2), $fields) : s2);
            ruleStack.push(result);
            break;
          case '!':
            var s1 = ruleStack.pop();
            var result = !(getType(s1) === TYPE_STRING ? execChecker(getChecker.call(this, s1), $fields) : s1);
            ruleStack.push(result);
            break;
          default:
            ruleStack.push(exp);
        }
      }
      var pop = ruleStack.pop();
      pass = getType(pop) === TYPE_STRING ? execChecker(getChecker.call(this, pop), $fields) : pop;
      if (!pass) {
        var context = $fields.length < 2 ? $fields[0] : $fields;
        rule.fail.call(context, $form);
        break;  // HACK: 也许应该支持不跳出：这样就是每次都检查所有的域的所有规则
      }

    }
    if (!pass) break;
  }
  return pass;
};
