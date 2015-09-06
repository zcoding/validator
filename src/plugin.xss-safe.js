// 这是一个检测XSS安全的验证插件

function xssSafe(values) {}

Validator.api({
  xss: xssSafe
});
