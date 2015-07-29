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
