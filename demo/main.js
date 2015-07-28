// 配置需要验证的规则
var validationConfig = [
  {
    field: 'name',
    rules: [{                           // 两个规则，按先后顺序验证
      type: '!empty',                   // 验证类型：非空
      fail: function(form) {           // 验证失败回调
        this.classList.add('error');
        console.dir(form);
        alert('昵称不能为空');
      }
    }, {
      type: 'length:(5,12]',            // 验证类型：长度限制在6到12个字符
      fail: normalFail('昵称6到12个中/英文字符')
    }]
  }, {
    field: 'password',
    rules: [{
      type: '!empty',
      fail: function(form) {
        this.classList.add('error');
        alert('密码不能为空');
      }
    }, {
      type: 'length:[8,20]',
      fail: function(form) {            // fail回调带一个参数form，表示当前的表单;上下文(this)为对应的元素;
        this.classList.add('error');
        alert('密码8到20位');
      }
    }, {
      type: 'specialChar',              // 自定义的规则，必须先定义后使用，否则会抛出TypeError异常
      fail: normalFail('密码只能包含英文字母/数字')
    }]
  }, {
    field: ['password', 'password2'],
    rules: {
      type: 'equal',
      fail: function(form) {
        this.forEach(function(field) {
          field.classList.add('error');
        });
        alert('两次密码不匹配');
      }
    }
  }, {
    field: 'age',
    rules: [{
      type: 'int',
      fail: function() {
        this.classList.add('error');
        alert('年龄必须为整数');
      }
    }, {
      type: 'range:[20,)',
      fail: function() {
        this.classList.add('error');
        alert('您的年龄未符合要求（20岁及以上）');
      }
    }]
  }, {
    field: 'email',
    rules: {
      type: 'email',
      fail: function(form) {
        this.classList.add('error');
        alert('电子邮件格式错误');
      }
    }
  }, {
    field: ['email', 'address'],
    rules: {
      type: '!empty', // HACK: empty的参数是数组，表示所有都不为空，前面加`!``运算符，表示的是并不是所有都不为空（不代表每个都不能为空）
      fail: function(form) {
        var fields = this;
        for (var i = 0, len = fields.length; i < len; ++i) {
          fields[i].classList.add('error');
        }
        alert('EMAIL和Address不能同时为空');
      }
    }
  }, {
    field: 'content',
    rules: {
      type: 'length:(20,)&&url||length:(9, 20]', // 组合规则：10到20个字符（任意），或者20个字符以上（必须是url格式）
      fail: function() {
        this.classList.add('error');
        alert('content长度不符合要求或者格式错误');
      }
    }
  }

];

var myForm = document.getElementById('myForm');

// 创建一个Validator实例
var checkMyForm = new FormValidator(myForm, validationConfig);

// 添加自定义规则
checkMyForm.add([{
  name: 'specialChar',
  rule: /^[a-zA-Z0-9]+$/
}, {
  name: 'notAllEmpty', // alias
  rule: '!empty'
}]);

// 抽取公共处理函数
function normalFail(message) {
  return function() {
    this.classList.add('error');
    alert(message);
  }
}

// 5. 调用.check()方法进行验证
myForm.addEventListener('submit', function(event) {
  event.preventDefault();
  if (!checkMyForm.check()) {
    console.log('not pass!');
    return false;
  }
  // 现在可以直接提交或者用ajax提交
  alert('全部通过');
  return false;
}, false);

var nonForm = document.getElementById("non-form");
var checkNonForm = new FormValidator(nonForm, validationConfig);
checkNonForm.add([{
  name: 'specialChar',
  rule: /^[a-zA-Z0-9]+$/
}]);
document.getElementById("non-form-submit").addEventListener("click", function(event) {
  event.preventDefault();
  if (!checkNonForm.check()) {
    console.log('non-form not pass!');
    return false;
  }
  alert('non form pass!');
  return false;
}, false);
