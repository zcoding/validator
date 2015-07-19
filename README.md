# spa-public-validator
validator module

##配置表单验证
###一个域验证多个规则
```javascript
{
  field: 'name',
  rules: [{
    type: 'notEmpty',
    fail: function(form) {
      this.classList.add('error');
      alert('昵称不能为空');
    }
  }, {
    type: 'length:[6, 12]'
    fail: function() {
      this.classList.add('error');
      alert('昵称为6到12个字符');
    }
  }]
}
```
当一个域含有多个验证规则的时候，在验证的时候总是按照定义的顺序进行验证，一旦某个规则没有通过，就会立即停止验证，不会再继续后面的验证

###多个域验证一个规则
有时候需要同时验证多个域是否满足一个规则，例如：判断域A和域B是否同时为空
```javascript
{
  field: ['fieldA', 'fieldB']
  rules: {
    type: 'notAllEmpty',
    fail: function(form) {
      var fields = this; // 注意：此时的this是一个数组，按照field的顺序
      for (var i = 0, len = fields.length; i < len; ++i) {
        fields[i].classList.add('error');
      }
      alert('fieldA, fieldB不能同时为空');
    }
  }
}
```

###条件验证
有时候需要在某种条件下验证，在某种情况下不验证

##API
###`Validator.is`
几个内置的验证规则
+ `Validator.is.empty`
+ `Validator.is.email`
+ `Validator.is.url`
+ `Validator.is.limit`
+ `Validator.is.number`
+ `Validator.is.yes`

###`Validator.not`
+ `Validator.not.empty`
+ `Validator.not.email`
+ `Validator.not.url`
+ `Validator.not.limit`
+ `Validator.not.number`
+ `Validator.not.yes`