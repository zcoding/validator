// 不喜欢基于配置的方式？那就使用发布/订阅模式

var validator = new Validator();
validator.add({
  name: 'specialChar',
  rule: '[a-zA-Z0-9]+'
});

validator.add({
  name: 'notAllEmpty',
  rule: function(values) { // 需要的规则是：不是全部为空时通过（返回true），全部为空时不通过（返回false）
    var notAllEmpty = false;
    for (var i = 0, len = values.length; i < len; ++i) {
      if (Validator.is.empty(values[i])) {
        notAllEmpty = true;
        break;
      }
    }
    return notAllEmpty;
  }
});

var myForm = document.getElementById('myForm');

var checkMyForm = validator.createFormValidator(myForm);

checkMyForm.on('empty', 'name', function() {
  this.classList.add('error');
  alert('昵称不能为空');
});

checkMyForm.on('not:length:[6, 12]', 'password', function() {
  this.classList.add('error');
  alert('密码为6到12位');
});

checkMyForm.on('allEmpty', 'fieldA,fieldB', function() {
  var fields = this;
  for (var i = 0, len = fields.length; i < len; ++i) {
    fields[i].classList.add('error');
  }
  alert('fieldA和fielsB不能同时为空');
});

myform.addEventListener('submit', function() {
  if(!checkMyForm.check()) {
    return false;
  }
  // now ajax...
  return false;
});