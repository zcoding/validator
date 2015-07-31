// checker函数的第一个参数总是一个数组，这个数组就是待检测的字符串数组
// 从第二个参数起，每个checker函数带有不同长度的参数列表。例如，empty函数的参数列表长度为0，long函数的参数列表长度为2（暂时，有待改进）
var defaultCheckers = {};

var defaultMatchers = {
  // url
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  // email
  , email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i
  // 数值型
  , number: /^(0|([\+\-]?[1-9]\d*))(\.[0-9]+)?$/
  // 整型
  , int: /^(0|([\+\-]?[1-9]\d*))$/
  // 正整数
  , positive: /^\+?[1-9]\d*$/
  // 负整数
  , negative: /^\-[1-9]\d*$/
  // 变量名：只能包含英文字母/数字/下划线，且不能以数字开头
  , varName: /^[a-zA-Z_][a-zA-Z0-9_]*$/
  // 昵称：只能包含中文/英文字母/数字/下划线，且不能以数字开头
  , nickName: /^[\u4E00-\u9FA5\uF900-\uFA2Da-zA-Z_][\u4E00-\u9FA5\uF900-\uFA2Da-zA-Z0-9_]*$/
  // QQ
  , QQ: /^[1-9][0-9]{4,}$/
  // 身份证号
  // 手机号
  // 电话号码
  // 邮政编码
  // IP
  , ip: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
  // IPV4
  , ipv4: /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/
  // IPV6
  , ipv6: /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
  // 全大写
  , upperCase: /^[A-Z]+$/
  // 全小写
  , lowerCase: /^[a-z]+$/
  // 空限制
  , empty: empty
  // 相等
  , equal: equal
  // 长度范围限制
  , long: long
  // 数值大小限制
  , range: range
};

/**
 * 判断值是否为空
 * @param {Object} value
 * 如果value为null|undefined|空字符串，就判断为真，否则判断为假
 * @return {Boolean} 是否为空
 */
function isEmpty(value) {
  return value === null || typeof value === TYPE_UNDEFINED || value === '';
}

/**
 * defaults.checkers: equal check
 * TODO: 引入布尔矩阵运算
 * @param {Array} values
 * @return {Boolean} equal or not
 */
function equal(values) {
  if (!isArray(values)) {
    return false;
  }
  var equal = true;
  for (var i = 0; i < values.length - 1; ++i) {
    if (values[i] !== values[i+1]) {
      equal = false;
      break;
    }
  }
  return equal;
}

/**
 * defaults.checkers: empty check
 * TODO: 引入布尔矩阵运算
 * @param {String|Array} values
 * @return {Boolean|Array} 如果传入数组，就返回布尔数组；如果传入字符串，就返回布尔值
 */
function empty(values) {
  var pass;
  if (isArray(values)) {
    pass = true;
    for (var i = 0; i < values.length; ++i) {
      if (!isEmpty(values[i])) {
        pass = false;
        break;
      }
    }
  } else {
    pass = isEmpty(values);
  }
  return pass;
}

/**
 * defaults.checkers: length check
 * TODO: 引入布尔矩阵运算
 * @param {Array|String} values
 * @param {Number} min
 * @param {Number} max
 * @return {Array|Boolean} 如果传入数组，就返回布尔矩阵；如果传入字符串，就返回布尔值
 */
function long(values, min, max) {
  var pass, length;
  min = min || -Infinity;
  max = max || Infinity;
  if (isArray(values)) {
    pass = true;
    for (var i = 0; i < values.length; ++i) {
      length = values[i].length;
      if (length < min || length > max) {
        pass = false;
        break;
      }
    }
  } else {
    length = values.length;
    pass = length >= min && length <= max;
  }
  return pass;
}

/**
 * defaults.check: number range check
 * 这个函数和long类似，但是不是用来限制长度的，而是用来限制数值本身的
 * HACK: 这个函数的五个参数缺一不可
 * HACK: values应该转成Number型，因为参数很可能是字符串，可能会引起判断错误
 * @param {Array|String} values
 * @param {Boolean} leftEqual 是否大于等于
 * @param {Number} min
 * @param {Number} max
 * @param {Boolean} rightEqual 是否小于等于
 * @return {Array|Boolean} 如果传入数组，就返回布尔矩阵；否则就返回布尔值
 */
function range(values, leftEqual, min, max, rightEqual) {
  var pass;
  if (isArray(values)) {
    pass = true;
    for (var i = 0; i < values.length; ++i) {
      var value = Number(values[i]);
      if (leftEqual && value < min || rightEqual && value > max || !leftEqual && value <= min || !rightEqual && value >= max) {
        pass = false;
        break;
      }
    }
  } else {
    values = Number(values);
    pass = (leftEqual && values >= min || !leftEqual && values > min) && (rightEqual && values <= max || !rightEqual && values < max);
  }
  return pass;
}
