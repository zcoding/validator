// 关于规则的另一种定义方式

{
  field: 'A',
  rules: {
    type: 'length:(10, 20)',
    fail: false, // fail为false表示失败时不处理。因为这是一个条件，所以不需要处理，当条件成立时，再去验证其它规则
    success: { // success定义当当前条件成立时需要做的验证
      field: 'B',
      rules: {
        type: 'length:(20,)&&url',
        fail: function() {}
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
    type: '!all:empty',
    fail: function() {
      alert('A,B不能同时为空');
    },
    success: [{
      field: ['A1', 'A2', 'A3'],
      rules: {
        type: '!all:empty',
        fail: false, // 这里就不需要失败处理了，因为A是允许全部为空的（只要同时B不是全部为空）
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
        type: '!all:empty',
        fail: false,
        success: [{
          field: 'B1',
          rules: {
            type: 'length:(20,)',
            fail: false, // B1本身的长度并未限制，这只是一个用来限制B2的条件
            success: {
              field: 'B2',
              rules: {
                type: 'length:(10, 20)' // 当且仅当B1长度大于20时才需要验证B2的长度不能超过20
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
    type: 'length:(5,10]&&nickName',
    fail: function() {
      alert('A1必须为6到10个字符的英文字母/数字/下划线（不能以数字开头）');
    }
  }
};

var validationsB = [{
  field: 'B1',
  rules: {
    type: 'length:(20,)',
    fail: false, // B1本身的长度并未限制，这只是一个用来限制B2的条件
    success: {
      field: 'B2',
      rules: {
        type: 'length:(10, 20)' // 当且仅当B1长度大于20时才需要验证B2的长度不能超过20
      }
    }
  }
}];

var validations = {
  field: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'],
  rules: {
    type: '!all:empty',
    fail: function() {
      alert('A,B不能同时为空');
    },
    success: [{
      field: ['A1', 'A2', 'A3'],
      rules: {
        type: '!all:empty',
        fail: false, // 这里就不需要失败处理了，因为A是允许全部为空的（只要同时B不是全部为空）
        success: validationsA
      }
    }, {
      field: ['B1', 'B2', 'B3'],
      rules: {
        type: '!all:empty',
        fail: false,
        success: validationsB
      }
    }]
  }
}
