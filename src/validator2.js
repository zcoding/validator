/**
 * @constructor
 * @class Validator
 * @param {Array|Object} validations
 */
function Validator(validations) {
  validations = validations || [];
  this.cs = {};
  this.vs = parseValidations(validations);
}

function parseValidations(validations) {
  validations = getType(validations) === TYPE_ARRAY ? validations : [validations];
  var v = [];
  for (var i = 0; i < validations.length; ++i) {
    var vi = validations[i];
    var r = {};
    var fieldType = getType(vi['field']);
    r.fs = !vi['field'] ? null : (fieldType === TYPE_ARRAY ? vi.field : [vi.field]);
    r.rs = [];
    var rules = getType(vi.rules) === TYPE_ARRAY ? vi.rules : [vi.rules];
    for (var j = 0; j < rules.length; ++j) {
      var rj = rules[j];
      var _r = {};
      _r.if = parseRules(rj.if);
      _r.no = !rj['fail'] ? false : rj.fail;
      _r.yes = !rj['success'] ? false : parseValidations(rj.success);
      r.rs.push(_r);
    }
    v.push(r);
  }
  return v;
}

function setRule(name, rule) {
  var checker = rule;
  var callback;
  switch (getType(checker)) {
    case TYPE_FUNCTION:
      callback = checker;
      break;
    case TYPE_STRING:
      try {
        callback = parseRules(checker);
      } catch(error) {
        throw new Error("Cannot parse rule expression.");
      }

      break;
    case TYPE_REGEXP:
      callback = function(values) {
        var pass = true;
        if (isArray(values)) {
          for (var i = 0, len = values.length; i < len; ++i) {
            if (!checker.test(values[i])) {
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
  this.cs[name] = callback;
}

function removeRule(rule) {
  if (typeof this.cs[rule] !== TYPE_UNDEFINED) {
    delete this.cs[rule];
  }
}

var vprtt = Validator.prototype;

/**
 * @method .add(rules)
 * @param {Object} rules
 * @return this
 * @description 添加自定义规则，可以是正则，函数或者规则表达式
 */
vprtt.add = function(rules) {
  for (var name in rules) {
    if (hasOwn.call(rules, name)) {
      setRule.call(this, name, rules[name]);
    }
  }
  return this;
};

/**
 * @method .remove(rules)
 * @param {Array|String} rules
 * @return this
 * @description 删除自定义规则
 */
vprtt.remove = function(rules) {
  if (isArray(rules)) {
    for (var i = 0; i < rules.length; ++i) {
      removeRule.call(this, rules[i]);
    }
  } else {
    removeRule.call(this, rules);
  }
  return this
};

/**
 * @method .check()
 * @return {Boolean} pass or not
 */
vprtt.check = function() {
  var pass = true;
  var validations = this.vs;
  for (var i = 0; i < validations.length; ++i) {
    var vi = validations[i];
    var vfs = vi.fs, vrs = vi.rs;
    for (var j = 0; j < vrs.length; ++j) {
      var rj = vrs[j];
      pass = calculateRules.call(this, rj.if, vfs, false);
      if (!pass) {
        var context = vfs.length < 2 ? vfs[0] : vfs;
        if (rj.no) {
          rj.no.call(context);
        }
        break;
      }
    }
    if (!pass) break;
  }
  return pass;
};
