/**
 * @constructor
 * @class Validator
 */
var Validator = function() {
  this.rules = [];
};

var vprtt = Validator.prototype;

/**
 * @method .add(rules)
 * 添加自定义规则
 * 自定义的规则，可以和内建规则同名，但调用时只会使用内建规则。如果要覆盖内建规则，就使用Validator.api（全局覆盖）
 * HACK: 因为自定义规则是用数组存的，所以也可能重名
 * @param {Object} rules
 * @return this
 */
vprtt.add = function(rules) {
  if (utils.isArray(rules)) {
    this.rules = this.rules.concat(rules);
  } else {
    this.rules.push(rules);
  }
  return this;
};

/**
 * @method .remove(rules)
 * 移除自定义规则
 * @param {Array|String} rules
 * @return this
 */
vprtt.remove = function(rules) {
  if (utils.isArray(rules)) {
    for (var i = 0, len = rules.length; i < len; ++i) {
      for (var j = 0; j < this.rules.length; ++j) {
        if (this.rules[j].name === rules[i]) {
          this.rules.splice(j, 1);
        }
      }
    }
  } else {
    for (var j = 0; j < this.rules.length; ++j) {
      if (this.rules[j].name === rules) {
        this.rules.splice(j, 1);
      }
    }
  }
  return this;
};

/**
 * @method .createFormValidator()
 * @param {Element|String} form|selector
 * @param {Object} validations
 */
vprtt.createFormValidator = function(formOrSelector, validations) {
  return new FormValidator(formOrSelector, validations);
};

/**
 * @constructor
 * @class FormValidator
 * @extends Validator
 * @param {HTMLElement|String} formOrSelector
 * @param {Object|Array} validations
 */
var FormValidator = function(formOrSelector, validations) {
  if (typeof formOrSelector === 'string') {
    this.$form = document.querySelectorAll(formOrSelector)[0];
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
      $field.push(this.$form.querySelectorAll('[name=' + fields[j] + ']')[0]);
    }
    var rules = validations[i].rules;
    rules = utils.isArray(rules) ? rules : [rules];
    this.validations.push({
      $field: $field,
      rules: rules
    });
  }
}

FormValidator.prototype = new Validator();
FormValidator.prototype.constructor = FormValidator;

/**
 * @method .check()
 * @return {Boolean} pass or not
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
      var checker = utils.getChecker(rule.type);
      var values  = [];
      for (var k = 0; k < $field.length; ++k) {
        values.push(utils.getValue($field[k]));
      }
      checker[1].unshift(values);
      if (!checker[0].apply(null, checker[1])) {
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
