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
 */
FormValidator.prototype.check = function() {
  var $form = this.$form;
  var validations = this.vs;
  var pass = true;
  var $fields, rules;
  for (var i = 0; i < validations.length; ++i) {
    var ruleStack = [], rule, ruleStack;
    $fields = validations[i].$fs;
    rules = validations[i].rs;
    for (var j = 0; j < rules.length; ++j) {
      rule = rules[j];
      ruleQueue = rule.queue;
      ruleStack.splice(0, ruleStack.length);
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
