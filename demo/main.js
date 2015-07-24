// 配置需要验证的规则
var validationConfig = [

  {
    field: 'name',
    rules: [{                           // 两个规则，按先后顺序验证
      type: '!empty',                  // 验证类型：非空
      fail: normalFail('昵称不能为空')  // 验证失败回调
    }, {
      type: 'length:(5,12]',            // 验证类型：长度限制在6到12个字符
      fail: normalFail('昵称6到12个中/英文字符')
    }]
  },

  {
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
  },

  {
    field: ['email', 'address'],
    rules: {
      type: 'notAllEmpty',
      fail: function(form) {
        var fields = this;
        for (var i = 0, len = fields.length; i < len; ++i) {
          fields[i].classList.add('error');
        }
        alert('EMAIL和Address不能同时为空');
      }
    }
  }

];

var myForm = document.getElementById('myForm');

// 创建一个Validator实例
var checkMyForm = new FormValidator(myForm, validationConfig);

// 添加自定义规则
checkMyForm.add({
  name: 'specialChar',
  rule: /^[a-zA-Z0-9]+$/
});

checkMyForm.add({
  name: 'notAllEmpty',
  rule: function(values) { // 需要的规则是：不是全部为空时通过（返回true），全部为空时不通过（返回false）
    var notAllEmpty = false;
    for (var i = 0, len = values.length; i < len; ++i) {
      if (Validator.not.empty(values[i])) {
        notAllEmpty = true;
        break;
      }
    }
    return notAllEmpty;
  }
});

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
