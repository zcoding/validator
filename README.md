# spa-public-validator
spa-public-validator是一个无依赖的、基于配置的表单验证模块。

## 配置表单验证
以下是表单验证配置的基本结构：
```javascript
{ // 当前层级
  field: $field, // 域元素，也可以是数组，或者未定义（如果未定义就是域无关的条件）
  rules: { // 也可以是数组
    if: 'conditionExpression', // 条件表达式
    fail: function failedFunction() {}, // 验证失败回调，回调上下文是$field（可能是数组）
    // fail可能未定义或者为false，此时的rules不会引起验证失败
    success: { // 也可以是数组，或者未定义（如果未定义就表明没有下一层级）
      /* 下一层级 */
    }
  }
}
```

### 条件表达式
`if`通过条件表达式定义了某个层级的验证规则，条件表达式由三个部分组成：
+ 运算符`&&`,`||`,`!`,`*`,`?`,`{`,`}`
+ 规则字符串

关于运算符
1. `&&`表示逻辑与，`||`表示逻辑或，`!`表示逻辑非
2. `*`表示全部满足，会执行`matrix.all`运算
3. `?`表示存在一个满足，会执行`matrix.any`运算
4. 优先级：`!` = `*` = `?` > `&&` > `||`
5. 使用大括号可以提升优先级
6. `!,*,?`是单目运算符，结合性从右到左

规则字符串是用于描述一个规则的表达式，有两种描述形式
1. `规则名称`
2. `规则名称:参数列表`

参数列表没有固定形式，不同的规则有自己的参数列表解析方法

### 一个域验证多个规则
```javascript
// 一个域限制了多个规则，按照定义的顺序进行验证
{
  field: $name,
  rules: [{
    if: '!empty',
    fail: function() {
      this.classList.add('error');
      alert('昵称不能为空');
    }
  }, {
    if: 'length:[6, 12]'
    fail: function() {
      this.classList.add('error');
      alert('昵称为6到12个字符');
    }
  }]
}
// 如果一个域限制了多个规则，而且必须同时满足这几个规则，就可以通过条件表达式来组合规则
{
  field: $name,
  rules: {
    if: 'length:[10, 20]||length:(20,)&&url' // 长度为10到20个字符，或者20个字符以上且必须是url
    fail: function() {
      this.classList.add('error');
      alert('长度不符合要求或者格式不正确');
    }
  }
}
```
需要注意以下三点：
1. 在验证的时候总是按照定义的顺序进行验证
2. 如果当前层级没有通过或者没有定义success，就不会进入下一层级
3. 如果当前层级没有定义fail回调，就不会引起验证失败

### 多个域验证一个规则
有时候需要同时验证多个域是否满足一个规则，例如：判断域A和域B是否同时为空
```javascript
{
  field: [$A, $B]
  rules: {
    if: '!*empty',
    fail: function() {
      var fields = this; // 注意：此时的this是一个数组，按照field的顺序
      for (var i = 0; i < fields.length; ++i) {
        fields[i].classList.add('error');
      }
      alert('fieldA, fieldB不能同时为空');
    }
  }
}
```

### 条件验证
有时候需要在某种条件下验证，在某种情况下不验证。

例如，存在一个表单FORM，里面分为两块，称为A，B，每个块内有多个域。

A，B的域相互独立，即A的域验证与B的域验证相互无关。

现在要求：
1. 如果A，B的每个域都为空，则表单验证失败；
2. 如果A的域不是全部为空，则验证A的域，否则不验证；同理，如果B的域不是全部为空，则验证B的域，否则不验证；
3. 如果A的域或者B的域验证失败，则表单验证失败；

添加条件和添加自定义规则的方式是一样的

关于条件验证参见例子demo-condition

## 规则的类型
优先级： 实例规则 > API规则 > 内建规则
### 内建规则
内建规则可以直接在配置中使用，但可能被api规则或者实例规则覆盖
```javascript
// 配置
{
  if: "length:(5,10]"
  fail: function() { /* todo */ }
}
// 配置可能被覆盖，但通过Validator.is/Validator.not可以直接调用而且总是调用内建规则
Validator.is.long(value, 6, 10); // length规则的内建名称是long
```
### API规则
API规则就是通过Validator.api接口添加的规则，可以应用到所有Validator实例中

### 实例规则
实例规则是通过`.add()`方法添加的规则，只对当前Validator实例有效

### 添加自定义规则
API规则和实例规则都是自定义规则
+ `Validator.api(rules)`
+ `.add(rules)`

```javascript
// 添加API规则
Validator.api({
  browser: /chrome|ie|firfox|opera|safari/i
});
// 添加实例规则
validator.add({
  browser: /chrome|ie|firfox|opera|safari/i
});
// 实例规则只能在条件表达式中使用，而API规则除了在条件表达式中使用之外，还可以通过`Validator.is`,`Validator.not`,`Validator.all`,`Validator.any`等方式调用
```

## Validator VS FormValidator
FormValidator是Validator的一个子类，它们的不同之处包括但不限于以下几点：
### 支持的验证规则不同
FormValidator重写了`.check`方法，并且支持只有表单才具备的验证条件，例如
```javascript
// 假设fieldA是一个checkbox或者radio
{
  field: ['fieldA']
  rule: {
    if: 'checked',
    fail: function() {
      this.classList.add('error');
      alert('fieldA必须勾选');
    }
  }
}
```
### 初始化配置不同
FormValidator在初始化配置的时候需要传表单元素，并通过name或者data-name属性获取表单元素。而Validator在初始化配置的时候每个配置内都需要元素实例

## 内建规则
### `is:something`
+ `{if: "is:whatiwant"}` 就是字符串"whatiwant"
+ `{if: "!is:whatiwant"}` 等同于 `{if: "not:whatiwant"}`

### `not:something`
+ `{if: "not:whatiwant"}` 不是字符串"whatiwant"
+ `{if: "!not:whatiwant"}` 等同于 `{if: "is:whatiwant"}`

### `empty`
空限制
+ `{if: "!empty"}` 这是限制非空

### `length:(min,max)`
长度限制
+ `{if: "length:(5, 13)"}`表示6到12个字符
+ `{if: "length:(5, 12]"}`表示6到12个字符
+ `{if: "length:[6, 12]"}`表示6到12个字符
+ `{if: "length:(5,)"}`表示至少6个字符

### `range:(min,max)`
数值大小限制（使用方法参考`length`）

区别于长度限制，可以使用浮点数

注意改方法不验证是否为数值类型，即该方法默认用户输入为数值类型，如果不是，会抛出`TypeError`。为了不抛出错误，应该在该验证之前加入数值验证，即先验证其是否为数值，再验证数值是否在范围内

### `number`
类型限制：数值型
+ `{if: "number"}`限制为数值型，但不限制整型还是浮点型

### `int`
类型限制：整型
+ `{if: "int"}`

### `positive`
正整数，相当于先验证`number:int`再验证`range:(0,)`

### `negative`
负整数，相当于先验证`number:int`再验证`range:(,0)`

### `upperCase`
限制只包含大写英文字符
+ `{if: "upperCase"}`

### `lowerCase`
限制只包含小写英文字符
+ `{if: "lowerCase"}`

### `email`
限制为电子邮件格式
+ `{if: "email"}`

### `url`
限制为url格式
+ `{if: "url"}`
+ `{if: "uri"}`

## API
### `Validator.is[type]`
仅限内置规则的使用，除了`is:something`和`not:something`
+ `Validator.is.url`
+ `Validator.is.email`
+ `Validator.is.number`
+ `Validator.is.int`
+ `Validator.is.positive`
+ `Validator.is.negative`
+ `Validator.is.varName`
+ `Validator.is.nickName`
+ `Validator.is.QQ`
+ `Validator.is.upperCase`
+ `Validator.is.lowerCase`
+ `Validator.is.empty`
+ `Validator.is.equal`
+ `Validator.is.long`
+ `Validator.is.range`
+ `Validator.is.ip`
+ `Validator.is.ipv4`
+ `Validator.is.ipv6`

### `Validator.not[type]`
类似`Validator.is`

### `Validator.api`
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

可不可以在添加一个像内置规则那样调用的规则？（可以，但并<strong><em>不推荐使用</em></strong>，这是为了和内置的规则区分，而且这样会覆盖内置规则。）
```javascript
Validator.is.something = function(value) {
  // check...
};
Validator.not.something = function(value) {
  return !Validator.is.something(value);
}
```

## 不喜欢基于配置的方式？
如果不喜欢这种基于配置的方法，可以直接使用`Validator.is`,`Validator.not`,`Validator.api`这三个API进行验证，这样的好处是更加灵活，以及处理很多其它无法配置的验证规则。

## 利用API为Validator模块写插件
### 自定义API
```javascript
// 为API新增一个规则，判断是否为浏览器
Validator.api({
  browser: /chrome|ie|firfox|opera|safari/i
});
// 使用
var myCheck = new Validator([{
  field: document.querySelectorAll('.browser')
  rules: {
    if: 'browser',
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
