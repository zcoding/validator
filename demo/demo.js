// 配置需要验证的规则
var validationConfig = [
  // {
  //   field: 'name',
  //   rules: [{                           // 两个规则，按先后顺序验证
  //     if: '!empty',                   // 验证类型：非空
  //     fail: function() {           // 验证失败回调
  //       this.classList.add('error');
  //       alert('昵称不能为空');
  //     }
  //   }, {
  //     if: 'length:(5,12]',            // 验证类型：长度限制在6到12个字符
  //     fail: normalFail('昵称6到12个中/英文字符')
  //   }]
  // }, {
  //   field: 'password',
  //   rules: [{
  //     if: '!empty',
  //     fail: function() {
  //       this.classList.add('error');
  //       alert('密码不能为空');
  //     }
  //   }, {
  //     if: 'length:[8,20]',
  //     fail: function() {            // fail回调带一个参数form，表示当前的表单;上下文(this)为对应的元素;
  //       this.classList.add('error');
  //       alert('密码8到20位');
  //     }
  //   }, {
  //     if: 'specialChar',              // 自定义的规则，必须先定义后使用，否则会抛出TypeError异常
  //     fail: normalFail('密码只能包含英文字母/数字')
  //   }]
  // }, {
  //   field: ['password', 'password2'],
  //   rules: {
  //     if: 'equal',
  //     fail: function() {
  //       this.forEach(function(field) {
  //         field.classList.add('error');
  //       });
  //       alert('两次密码不匹配');
  //     }
  //   }
  // }, {
  //   field: 'age',
  //   rules: [{
  //     if: 'int',
  //     fail: function() {
  //       this.classList.add('error');
  //       alert('年龄必须为整数');
  //     }
  //   }, {
  //     if: 'range:[20,)',
  //     fail: function() {
  //       this.classList.add('error');
  //       alert('您的年龄未符合要求（20岁及以上）');
  //     }
  //   }]
  // }, {
  //   field: ['email', 'address'],
  //   rules: {
  //     if: '!all:empty',
  //     fail: function() {
  //       var fields = this;
  //       for (var i = 0, len = fields.length; i < len; ++i) {
  //         fields[i].classList.add('error');
  //       }
  //       alert('EMAIL和Address不能同时为空');
  //     }
  //   }
  // }, {
  //   field: 'email',
  //   rules: {
  //     if: 'email',
  //     fail: function() {
  //       this.classList.add('error');
  //       alert('电子邮件格式错误');
  //     }
  //   }
  // }, {
  //   field: 'content',
  //   rules: {
  //     if: 'length:(20,)&&url||length:(9, 20]', // 组合规则：10到20个字符（任意），或者20个字符以上（必须是url格式）
  //     fail: function() {
  //       this.classList.add('error');
  //       alert('content长度不符合要求或者格式错误');
  //     }
  //   }
  // },
  {
    field: 'favourite',
    rules: [{
      if: 'checked:books,movie', // 选了books和movie
      fail: function() {
        alert('只能选books');
      }
    }]
  },

  {
    field: 'howmuch',
    rules: [{
      if: 'checked:24', // 选了24
      fail: function() {
        alert('必选24');
      }
    }]
  }

];

var myForm = document.getElementById('myForm');

// 创建一个Validator实例
var checkMyForm = new FormValidator(myForm, validationConfig);

// 添加自定义规则
checkMyForm.add({
  specialChar: /^[a-zA-Z0-9]+$/,
  notAllEmpty: '!empty'
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

var nonForm = document.getElementById("non-form");
var checkNonForm = new FormValidator(nonForm, validationConfig);
checkNonForm.add({
  specialChar: /^[a-zA-Z0-9]+$/
});
document.getElementById("non-form-submit").addEventListener("click", function(event) {
  event.preventDefault();
  if (!checkNonForm.check()) {
    console.log('non-form not pass!');
    return false;
  }
  alert('non form pass!');
  return false;
}, false);
