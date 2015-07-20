(function(factory) {
  if (typeof define === 'function' && define.cmd) {
    define(function(require, exports, module) {
      factory(exports);
    });
  } else {
    factory(window)
  }
}(function(exports) {

var objectType = Object.prototype.toString;

var hasOwn = function(p) {
  return this.hasOwnProperty(p);
};

var utils = {};

utils.isArray = function(obj) {
  return objectType.call(obj) === '[object Array]';
};

utils.isFunction = function(obj) {
  return objectType.call(obj) === '[object Function]';
};

utils.getValue = function(HTMLElement) {
  if (typeof HTMLElement.value === 'undefined') {
    return HTMLElement.getAttribute('data-value') || '';
  } else {
    return HTMLElement.value;
  }
};

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

var rules = ['empty', 'length', 'email', 'url', 'yes']; // 内置规则

var matchers = {
  ////////// 正则匹配
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
  ////////// 非正则匹配
  empty: isEmpty
};

/**
 * 判断值是否为空
 * @param {Object} value
 * 如果value为null|undefined|空字符串，就判断为真，否则判断为假
 * @return {Boolean} 是否为空
 */
function isEmpty(value) {
  return value === null || typeof value === 'undefined' || value === '';
}

var defaults = {};

var checkers = {};

checkers.notEmpty = function(value) {
  return value && value !== '';
}

defaults.checkers = checkers;

var api = {}, _api = {};

var rules = ['empty', 'length', 'email', 'url', 'yes'];

Validator.is = api;

Validator.not = _api;


exports.Validator = Validator;

}));
