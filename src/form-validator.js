/**
 * @constructor
 * @class FormValidator
 * @extends Validator
 * @param {HTMLElement|String} formOrSelector
 * @param {Object|Array} validations
 * TODO: 增加对checkbox,radio的支持
 */
var FormValidator = function(formOrSelector, validations) {
  validations = validations || [];
  this.$form = getType(formOrSelector) === TYPE_STRING ? document.querySelectorAll(formOrSelector)[0] : formOrSelector;
  this.cs = {};
  var self = this;
  this.vs = parseValidations(validations, function(fields) {
    if (!fields) return fields;
    var $fields = [];
    if (isArray(fields)) {
      for (var i = 0; i < fields.length; ++i) {
        var $field = self.$form.querySelectorAll('[name=' + fields[i] + ']')[0] || self.$form.querySelectorAll('[data-name=' + fields[i] + ']')[0]
        $fields.push($field);
      }
    } else {
      var $field = self.$form.querySelectorAll('[name=' + fields + ']')[0] || self.$form.querySelectorAll('[data-name=' + fields + ']')[0];
      $fields.push($field);
    }
    return $fields;
  });
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
