/**
 * @class Validator
 * @constructor
 */
var Validator = function() {};

var vprtt = Validator.prototype;

/**
 * .add()
 * @param {Object} rules
 * @return this
 */
vprtt.add = function(rules) {
  return this;
};

/**
 * .createFormValidator()
 * @param {Element|String} form|selector
 * @param {Object} validations
 */
vprtt.createFormValidator = function(formOrSelector, validations) {
  return new FormValidator(formOrSelector, validations);
};

/**
 * @class FormValidator extends Validator
 * @constructor
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
 * .check()
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
      var checker = defaults.checkers[rule.type];
      if (!utils.isFunction(checker)) {
        throw new TypeError('Checker for rule ' + rule.type + ' must be a Function.');
      }
      var value = utils.getValue($field);
      if (!checker(value)) {
        rule.fail.call($field, $form);
        pass = false;
        break;
      }
    }
    if (!pass) break;
  }
  return pass;
};
