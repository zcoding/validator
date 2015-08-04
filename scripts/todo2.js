// 关于规则的另一种定义方式

{
  rules: {
    if: 'condition1', // 这个条件没有field对应，在定义的时候也不要传value
    success: {
      field: 'A',
      rules: {
        if: '!empty', // 这个条件有field对应
        fail: function() {},
        success: {
        }
      }
    }
  }
}

// 场景设定：
// 有一个表单FORM，含有多个域，分为A,B两部分，要求：
// 1. 当所有域为空时，返回验证失败；
// 2. 当A的域不全部为空时，验证A，否则不验证；当B的域不全部为空时，验证B，否则不验证；当A,B都需要验证时，A先于B验证；
// 3. 当A需要验证且验证失败时，返回验证失败；当B需要验证且验证失败时，返回验证失败；

{
  field: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'],
  rules: {
    if: '!all:empty',
    fail: function() {
      alert('A,B不能同时为空');
    },
    success: [{
      field: ['A1', 'A2', 'A3'],
      rules: {
        if: '!all:empty',
        success: [{ // 从这里开始验证A的域
          field: 'A1',
          rules: {
            type: 'length:(5,10]&&nickName',
            fail: function() {
              alert('A1必须为6到10个字符的英文字母/数字/下划线（不能以数字开头）');
            }
          }
        }]
      }
    }, {
      field: ['B1', 'B2', 'B3'],
      rules: {
        if: '!all:empty',
        success: [{
          field: 'B1',
          rules: {
            if: 'length:(20,)',
            success: {
              field: 'B2',
              rules: {
                if: 'length:(10, 20)', // 当且仅当B1长度大于20时才需要验证B2的长度不能超过20
                fail: function() {}
              }
            }
          }
        }]
      }
    }]
  }
}

// 优点：层次分明，几乎没有冗余
// 缺点：定义越来越深，代码易读性变差
// 改进：分别定义，最后结合为一
// 改进如下：

var validationsA = { // 从这里开始验证A的域
  field: 'A1',
  rules: {
    if: 'length:(5,10]&&nickName',
    fail: function() {
      alert('A1必须为6到10个字符的英文字母/数字/下划线（不能以数字开头）');
    }
  }
};

var validationsB = [{
  field: 'B1',
  rules: {
    if: 'length:(20,)',
    success: {
      field: 'B2',
      rules: {
        if: 'length:(10, 20)', // 当且仅当B1长度大于20时才需要验证B2的长度不能超过20
        fail: function() {
          alert('B2长度超出范围');
        }
      }
    }
  }
}];

var validations = {
  field: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'],
  rules: {
    if: '!all:empty',
    fail: function() {
      alert('A,B不能同时为空');
    },
    success: [{
      field: ['A1', 'A2', 'A3'],
      rules: {
        if: '!all:empty',
        success: validationsA
      }
    }, {
      field: ['B1', 'B2', 'B3'],
      rules: {
        if: '!all:empty',
        success: validationsB
      }
    }]
  }
}
