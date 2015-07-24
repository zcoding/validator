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

##规则的类型
优先级： 实例规则 > API规则 > 内建规则
###内建规则
内建规则可以直接在配置中使用，但可能被api规则或者实例规则覆盖
```javascript
// 配置
{
  type: "length:(5,10]"
  fail: function() { /* todo */ }
}
// 配置可能被覆盖，但通过Validator.is/Validator.not可以直接调用而且总是调用内建规则
Validator.is.long(value, 6, 10); // length规则的内建名称是long
```
###API规则
API规则就是通过Validator.api接口添加的规则

###实例规则（自定义规则）

##添加自定义规则
###`.add()`
```javascript
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
```

##Validator VS FormValidator
FormValidator是Validator的一个子类
FormValidator重写了`.check`方法，并且支持只有表单才具备的验证条件，例如
```javascript
// 假设fieldA是一个checkbox或者radio
{
  field: ['fieldA']
  rule: {
    type: 'checked',
    fail: function() {
      this.classList.add('error');
      alert('fieldA必须勾选');
    }
  }
}
```

##内建规则
###`notEmpty`
非空限制
+ `{type: "notEmpty"}`

###`length:(min,max)`
长度限制
+ `{type: "length:(5, 13)"}`表示6到12个字符
+ `{type: "length:(5, 12]"}`表示6到12个字符
+ `{type: "length:[6, 12]"}`表示6到12个字符
+ `{type: "length:(5,)"}`表示至少6个字符

###`range:(min,max)`
数值大小限制（使用方法参考`length`）

注意改方法不验证是否为数值类型，即该方法默认用户输入为数值类型，如果不是，会抛出`TypeError`。为了不抛出错误，应该在该验证之前加入数值验证，即先验证其是否为数值，再验证数值是否在范围内

###`number:type`
类型限制：数值型
+ `{type: "number:int"}`限制为整数型
+ `{type: "number:float"}`限制为浮点型
+ `{type: "number"}`限制为数值型，但不限制整形还是浮点型

###`positive`
正整数，相当于先验证`number:int`再验证`range:(0,)`

###`negative`
负整数，相当于先验证`number:int`再验证`range:(,0)`

###`upperCase`
限制只包含大写英文字符
+ `{type: "upperCase"}`

###`lowerCase`
限制只包含小写英文字符
+ `{type: "lowerCase"}`

###`email`
限制为电子邮件格式
+ `{type: "email"}`

###`url`
限制为url格式
+ `{type: "url"}`
+ `{type: "uri"}`

##API
###`Validator.is[type]`
仅限内置规则的使用
+ `Validator.is.empty`
+ `Validator.is.email`
+ `Validator.is.url`
+ `Validator.is.limit`
+ `Validator.is.number`
+ `Validator.is.yes`

###`Validator.not[type]`
仅限内置规则的使用
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
Validator.api({
  shit: function(value) {
    return value && value === 'shit';
  }
});
// 使用已有的规则
Validator.api({biggerThan5: 'length:(5,]'});
// 使用正则表达式
Validator.api({abc: /^[abc]+$/i});

// 调用
// 和内置的验证规则不一样，调用自定义的api，直接使用Validator.is或者Validator.not函数
Validator.is('shit', 'notShit');  // false
Validator.not('biggerThan5', 3);  // true
Validator.is('abc', 'AbCCacB');   // true
// Validator.is/Validator.not既可以调用内置规则，也可以调用API规则，但API规则的优先级更高
```
可不可以在添加一个像内置规则那样调用的规则？（可以，但并不推荐使用，这是为了和内置的规则区分，而且这样会覆盖内置规则。）
```javascript
Validator.is.something = function(value) {
  // check...
};
Validator.not.something = function(value) {
  return !Validator.is.something(value);
}
```

##不喜欢基于配置的方式？
如果不喜欢这种基于配置的方法，可以直接使用`Validator.is`/`Validator.not`/`Validator.api`这三个API进行验证，这样的好处是更加灵活，以及处理很多其它无法配置的验证规则。

##利用API为Validator模块写插件
###自定义API
```javascript
// 为API新增一个规则，判断是否为浏览器
Validator.api({
  browser: /chrome|ie|firfox|opera|safari/i
});
// 使用
var myCheck = new Validator([{
  field: document.querySelectorAll('.browser')
  rules: {
    type: 'browser',
    fail: function(fields) {
      fields.forEach(function(field) {
        field.classList.add('error');
      });
      alert("it\'s not a browser.");
    }
  }
}]);
// 因为是在API层添加的规则，所以对所有的Validator（及其子类）对象都起作用
```
可以借助其它库，例如[is.js](http://arasatasaygin.github.io/is.js/)，写出更复杂规则的插件
###扩展Validator类
```javascript
var MyValidator = Validator.extend(function() {});
```
