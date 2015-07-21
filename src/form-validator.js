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
 * getChecker
 * @param {String} type
 * @return {Array} [checkerFunction, params]
 */
getChecker = function(type) {
  var parts = type.split(':');
  type = parts[0].replace(/length/i, 'long');
  var checker = defaults.checkers[type] || this.checkers[type];
  if (!utils.isFunction(checker)) {
    throw new TypeError('Checker for rule ' + parts[0] + ' must be a Function.');
  }
  var params;
  var _params = parts.slice(1);
  switch (type) {
    case 'long':
    case 'range':
      params = utils.getLengthParams(_params);
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
      var checker = getChecker.call(this, rule.type);
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
