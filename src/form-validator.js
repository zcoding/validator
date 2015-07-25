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
