/**
 * @constructor
 * @class Validator
 * @param {Array|Object} validations
 */
function Validator(validations) {
  validations = validations || [];
  this.cs = {};
  this.vs = [];
  if (!isArray(validations)) {
    validations = [validations];
  }
  for (var i = 0; i < validations.length; ++i) {
    var fields = validations[i].field;
    if (!isArray(fields)) {
      fields = [fields];
    }
    var rules = validations[i].rules;
    rules = isArray(rules) ? rules : [rules];
    for (var k = 0; k < rules.length; ++k) {
      rules[k].queue = parseRules(rules[k].type);
    }
    this.vs.push({
      $fs: fields,
      rs: rules
    });
  }
};

var vprtt = Validator.prototype;

/**
 * @method .add(rules)
 * 添加自定义规则
 * @param {Object} rules
 * @return this
 * this.checkers可以是函数，或者checker表达式队列
 */
vprtt.add = function(rules) {
  function setRule(rule) {
    var checker = rule.rule;
    var callback;
    switch (getType(checker)) {
      case TYPE_FUNCTION:
        callback = checker;
        break;
      case TYPE_STRING:
        var self = this;
        // TODO: 解析规则，生成的是一个后缀表达式（队列）
        // 可以使用defaultCheckers或者apiCheckers，如果两个里面都没有，就抛出异常
        // 此处不直接生成checker函数，而是把表达式解析成后缀形式（队列存储），在验证的时候（执行.check()时）再执行表达式运算

        // var ruleQueue;
        // try {
        //   ruleQueue = parseRules(checker);
        // } catch(error) {
        //   throw new Error("Cannot parse rule expression.");
        // }
        callback = function(values) {
          var realChecker = self.cs[checker] || apiCheckers[checker] || defaultCheckers[checker];
          if (typeof realChecker === TYPE_UNDEFINED) {
            throw new TypeError('Cannot find checker: ' + checker);
          }
          return realChecker(values);
        };
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
    this.cs[rule.name] = callback;
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
vprtt.check = function(obj) {
  var pass = true;
  var validations = this.vs;
  for (var i = 0; i < validations.length; ++i) {
    var $fields = validations[i].$fs;
    var rules = validations[i].rs;
    for (var j = 0; j < rules.length; ++j) {
      var rule = rules[j];
      // 现在开始解析后缀表达式
      pass = calculateRules.call(this, rule.queue, $fields, false);
      if (!pass) {
        var context = $fields.length < 2 ? $fields[0] : $fields;
        rule.fail.call(context, obj);
        break;
      }
    }
    if (!pass) break;
  }
  return pass;
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
      removeRule.call(this, rules[i]);
    }
  } else {
    removeRule.call(this, rules);
  }
  return this;
};
