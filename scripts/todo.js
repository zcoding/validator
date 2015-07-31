// ================================================================================================================== //
myChecker.add({
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

// ================================================================================================================== //
{
  field: 'A',
  rules: {
    type: '!empty', // 预期：A不能为空
    fail: function() {}
  }
}
['empty', '!']
// 读到'empty'时，传入'wuzijie@163.com'，得到 false
// 读到'!'时，运算!false，得到 true
// 结束

// ================================================================================================================== //
{
  field: ['A', 'B'],
  rules: {
    type: '!empty', // 预期：A,B都不为空
    fail: function() {}
  }
}
['empty', '!']
// 读到'empty'时，传入['wuzijie@163.com', 'wuzijie']，得到 [false, false]
// 读到'!'时，运算![false, false]，得到 [true, true]
// 最后运算true && true，得到 true
// 结束

// ================================================================================================================== //
{
  field: ['A', 'B'],
  rules: {
    type: 'notAllEmpty', // 预期：A,B不同时为空
    fail: function() {}
  }
}
['notAllEmpty']
// 读到'notAllEmpty'时，传入['wuzijie@163.com', 'wuzijie']，得到true
// 结束

// ================================================================================================================== //
{
  field: ['A', 'B'],
  rules: {
    type: 'email||nickName', // 预期：A,B为email或nickName
    fail: function() {}
  }
}
['email', 'nickName', '||']
// 读到'email'时，传入['wuzijie@163.com', 'wuzijie']，得到 [true, false]
// 读到'nickName'时，传入['wuzijie@163.com', 'wuzijie']，得到 [false, true]
// 读到'||'时，运算[true, false] || [false, true]，得到 [true, true]
// 运算true && true，得到 true
// 结束

// ================================================================================================================== //
{
  field: ['A', 'B'],
  rules: {
    type: 'validName', // 预期：和上一条一样
    fail: function() {}
  }
}
['validName']
// 读到'validName'时，解析为['email', 'nickName', '||']
// 读到'email'时，传入['wuzijie@163.com', 'wuzijie']，得到 [true, false]
// 读到'nickName'时，传入['wuzijie@163.com', 'wuzijie']，得到 [false, true]
// 读到'||'时，运算[true, false] || [false, true]，得到 [true, true]
// 运算true && true，得到 true
// 结束

// ================================================================================================================== //
{
  field: ['A', 'B'],
  rules: {
    type: 'validName&&allIsWell', // 预期：A,B都满足email||nickName，并且其中至少一个包含'wuzijie'
    // validName和allIsWell是独立的
    // validName会分别验证A,B是否满足（此时A,B是独立的）
    // allIsWell则不同，A,B的值会同时传入allIsWell并进行验证（此时A,B不是独立的）

    // A,B的值需要单独传入email,nickName，但是必须同时传入allIsWell
    fail: function() {}
  }
}
['validName', 'allIsWell', '&&']
// 读到'validName'时，解析为['email', 'nickName', '||']
// 运算['email', 'nickName', '||']，参见前面的步骤，得到 true
// 读到'allIsWell'时，传入['wuzijie@163.com', 'wuzijie']，得到 true
// 读到'&&'时，运算true && true，得到 true
// 结束

// 对组合规则传入数组作为参数，应该是逐个验证数组元素是否满足组合规则，而不是逐个验证规则是否满足整个数组
// 例如：规则为email||nickName，传入['wuzijie@163.com', 'wuzijie']，应该分别验证'wuzijie@163.com'和'wuzijie'是否满足email||nickName，这里返回true
// 如果规则本身就是组合成的，也是同理
// 例如：规则validName&&length:(10,20)，传入['wuzijie@163.com', 'wuzijie']，应该分别验证'wuzijie@163.com'和'wuzijie'是否满足{email||nickName}&&length:(10,20)，这里返回false，因为第二个不满足

// ================================================================================================================== //
[{
  type: 'ANotEmpty&&BNotEmpty', // 注意这里没有field，因为field已经包含在条件里了
  fail: function() {
    alert('A，B必选一个');
  }
}, {
  field: 'A1',
  if: 'ANotEmpty' // 只有当满足`ANotEmpty`这个条件时才会触发这个验证
  rules: {
    type: '!empty',
    fail: function() {}
  }
}, {
  field: 'A2',
  if: 'ANotEmpty&&dyCondition' // 这个条件对整个A2域的所有规则起作用
  rules: {
    type: 'nickName',
    fail: function() {}
  }
}, {
  field: 'B1',
  rules: {
    type: 'email||nickName',
    fail: function() {}
  }
}, {
  field: 'B2',
  rules: [{
    type: 'email||nickName',
    fail: function() {}
  }, {
    type: 'length:(,20]',
    if: 'B1TooLong', // 可以把条件限制只对某个规则起作用
    fail: function() {
      // B1本身是不限制长度的，但是一旦B1的长度超过20，就限制B2的长度不能超过20；如果B1长度不超过20，那么B2也是不限制长度的
      alert('B1长度太长，B2不能超过20个字符');
    }
  }]
}]

// 添加条件，支持条件验证
// 条件可以是动态的或者静态的，使用表单域的条件都是动态条件
// 条件本身就可以作为验证规则进行验证
// 在执行一次.check()的时候，动态条件应该只执行一次，然后缓存成静态。验证时按照域顺序进行的，所以每次验证一个域的时候都会触发条件判断，但条件时不需要重新计算的。
myChecker.condition({
  ANotEmpty: { // 这是一个用表单域定义的动态条件，在运行时运算。为了避免重复运算，条件应该缓存
    field: ['A1', 'A2', 'A3'],
    rules: '!empty'
  }
  , BNotEmpty: {
    field: ['B1', 'B2', 'B3'],
    rules: '!empty'
  }
  , B1TooLong: {
    field: 'B1',
    rules: 'length:(20,)'
  }
  , stCondition: true // 这是一个静态条件
  , dyCondition: function() { // 这是一个动态条件，在运行时执行一次
    return false;
  }
});
