var $form = document.getElementById('myForm');
var validations = [{
  field: 'name1',
  rules: {
    type: '!empty',
    fail: function() {
      this.classList.add('error');
      alert('name1不能为空');
    }
  }
}, {
  field: ['name2', 'name3'],
  rules: {
    type: '!empty',
    fail: function() {
      for (var i = 0; i < this.length; ++i) {
        this[i].classList.add('error');
      }
      alert('name2,name3都不能为空');
    }
  }
}, {
  field: ['name4', 'name5'],
  rules: {
    type: 'notAllEmpty',
    fail: function() {
      for (var i = 0; i < this.length; ++i) {
        this[i].classList.add('error');
      }
      alert('name4,name5不能同时为空');
    }
  }
}, {
  field: ['name1', 'name2', 'name3'],
  rules: {
    type: 'email||nickName',
    fail: function() {
      for (var i = 0; i < this.length; ++i) {
        this[i].classList.add('error');
      }
      alert('name1,name2,name3必须为邮箱或昵称');
    }
  }
}];

var checkMyForm = new FormValidator($form, validations);

checkMyForm.add({
  validName: 'email||nickName',
  notAllEmpty: function(values) { // 预期：只要有一个不为空就成功，否则失败
    var pass = false;
    for (var i = 0; i < values.length; ++i) {
      if (!Validator.is.empty(values[i])) {
        pass = true;
        break;
      }
    }
    return pass;
  },
  allIsWell: function(values) { // 预期：只要有一个包含'wuzijie'就成功，否则失败
    var pass = false;
    for (var i = 0; i < values.length; ++i) {
      if (/wuzijie/i.test(values[i])) {
        pass = true;
        break;
      }
    }
    return pass;
  }
});

$form.addEventListener('submit', function(event) {
  event.preventDefault();
  if (!checkMyForm.check()) {
    return false;
  }
  console.log('yeah~');
  return false;
}, false);
