# spa-public-validator
spa-public-validator是一个无依赖的表单验证模块，使用基于配置的方式进行表单验证。

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

###`Validator.api`
这个方法在Validator底层添加验证规则
```javascript
// 使用回调函数
Validator.api('is', 'shit', function(value) { // 定义is的同时，同时not也添加了
  return value && value === 'shit';
});
// 使用已有的规则
Validator.api('is', 'biggerThan5', 'length:(5,]');
// 使用正则表达式
Validator.api('is', 'abc', /[abc]+/gi);

// 调用
// 和内置的验证规则不一样，调用自定义的api，直接使用Validator.is或者Validator.not函数
Validator.is('shit', 'notShit');  // false
Validator.not('biggerThan5', 3);  // true
Validator.is('abc', 'AbCCacB');   // true
// 注意不要和内置规则同名！否则调用的还是内置规则。
```
可不可以在添加一个像内置函数那样调用的规则？（可以，但并不推荐使用，这是为了和内置的规则区分，而且这样可能会覆盖内置规则。）
```javascript
Validator.is.something = function(value) {
  // check...
};
Validator.not.something = function(value) {
  return !Validator.is.something(value);
}
```

##不喜欢基于配置的方式？
如果不喜欢这种基于配置的方法，可以直接使用`Validator.is`或者`Validator.not`这两个API进行验证，这样的好处是更加灵活，以及处理很多其它无法配置的验证规则。