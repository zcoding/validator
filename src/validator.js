/**
 * @constructor
 * @class Validator
 * @param {Array|Object} validations
 */
function Validator(validations) {
  this.cs = {};

  validations = validations || [];

  this.vs = [];
  if (!isArray(validations)) {
    validations = [validations];
  }
  for (var i = 0, len = validations.length; i < len; ++i) {
    var fields = validations[i].field;
    if (!isArray(fields)) {
      fields = [fields];
    }
    var $field = [];
    for (var j = 0; j < fields.length; ++j) {
      $field.push(this.$form.querySelectorAll('[name=' + fields[j] + ']')[0]);
    }
    var rules = validations[i].rules;
    rules = isArray(rules) ? rules : [rules];
    this.vs.push({
      $field: $field,
      rules: rules
    });
  }
};

var vprtt = Validator.prototype;

/**
 * @method .add(rules)
 * 添加自定义规则
 * @param {Object} rules
 * @return this
 */
vprtt.add = function(rules) {
  function setRule(rule) {
    switch (getType(rule.rule)) {
      case TYPE_FUNCTION:
        this.cs[rule.name] = rule.rule;
        break;
      case TYPE_STRING:
        this.cs[rule.name] = function() {
        };
        break;
      case TYPE_REGEXP:
        this.cs[rule.name] = function(values) {
          var pass = true;
          if (isArray(values)) {
            for (var i = 0, len = values.length; i < len; ++i) {
              if (!rule.rule.test(values[i])) {
                pass = false;
                break;
              }
            }
          } else {
            if (!rule.rule.test(values)) {
              pass = false;
            }
          }
          return pass;
        };
        break;
      default:
        throw new TypeError('Rule type not support.');
    }
  }
  if (isArray(rules)) {
    for (var i = 0, len = rules.length; i < len; ++i) {
      setRule.call(this, rules[i]);
    }
  } else {
    setRule.call(this, rules);
  }
  return this;
};

/**
 * @method .check()
 * @return {Boolean} pass or not
 */
vprtt.check = function() {
  return this;
};

/**
 * @method .remove(rules)
 * 移除自定义规则
 * @param {Array|String} rules
 * @return this
 */
vprtt.remove = function(rules) {
  function removeRule(rule) {
    if (typeof this.cs[rule] !== TYPE_UNDEFINED) {
      delete this.cs[rule];
    }
  }
  if (isArray(rules)) {
    for (var i = 0, len = rules.length; i < len; ++i) {
      removeRule(rules[i]);
    }
  } else {
    removeRule(rules);
  }
  return this;
};
