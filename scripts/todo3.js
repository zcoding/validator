var validations = {
  rules: {
    if: 'condition1',
    success: {
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
            success: validationA
          }
        }, {
          field: ['B1', 'B2', 'B3'],
          rules: {
            if: '!all:empty',
            success: validationB
          }
        }]
      }
    }
  }
};

var validationA = {
  field: 'A1',
  rules: {
    if: '!empty&&nickName',
    fail: function() {
      alert('请输入正确格式的昵称');
    }
  }
};

var validationB = [{
  field: 'B1',
  rules: [{
    if: 'length:(10,30)&&nickName',
    fail: function() {
      alert('B1格式不正确');
    }
  }, {
    if: 'length:(20,)',
    success: {
      field: 'B2',
      rules: {
        if: 'length:(10,20)&&nickName',
        fail: function() {
          alert('B2格式不正确（此时B1太长）');
        }
      }
    }
  }]
}, {
  rules: {
    if: 'condition2',
    success: {
      field: 'B2',
      rules: {
        if: 'email||nickName',
        fail: function() {
          alert('B2格式不正确（此时满足condition2）');
        }
      }
    }
  }
}];

// 这是初始化完成时预期的结果
this.vs = [{
  fs: null,
  rs: [{
    if: ['condition1'],
    no: function callback() {},
    yes: [{
      fs: [$A1, $A2, $A3, $B1, $B2, $B3],
      rs: [{
        if: ['all:empty', '!'],
        no: function callback() {},
        yes: [{
          fs: [$A1, $A2, $A3],
          rs: [{
            if: ['all:empty', '!'],
            no: false,
            yes: [{
              fs: [$A1],
              rs: [{
                if: ['empty', '!', 'nickName', '&&'],
                no: function callback() {},
                yes: false
              }]
            }]
          }]
        }, {
          fs: [$B1, $B2, $B3],
          rs: [{
            if: ['all:empty', '!'],
            no: false,
            yes: [{
              fs: [$B1],
              rs: [{
                if: ['length:(10, 30)', 'nickName', '&&'],
                no: function callback() {},
                yes: false
              }, {
                if: ['length:(20,)'],
                no: false,
                yes: [{
                  fs: [$B2],
                  rs: [{
                    if: ['length:(10, 20)', 'nickName', '&&'],
                    no: function callback() {},
                    yes: false
                  }]
                }]
              }]
            }, {
              fs: null,
              rs: [{
                if: ['condition2'],
                no: false,
                yes: [{
                  fs: [$B2],
                  rs: [{
                    if: ['email', 'nickName', '||'],
                    no: function callback() {},
                    yes: false
                  }]
                }]
              }]
            }]
          }]
        }]
      }]
    }]
  }]
}];

////////// 使用非配置方式 //////////
var _a1 = $A1.value, _a2 = $A2.value, _a3 = $A3.value, _b1 = $B1.value, _b2 = $B2.value, _b3 = $B3.value;
var V = Validator;
if (!condition1()) {
  return false;
}
if (V.is.empty([_a1, _a2, _a3, _b1, _b2, _b3])) {
  alert('A,B不能同时为空');
  return false;
}
if (!V.is.empty([_a1, _a2, _a3])) {
  if (!(V.not.empty(_a1)&&V.is.nickName(_a1))) {
    alert('请输入正确格式的昵称');
    return false;
  }
}
if (!V.is.empty([_b1, _b2, _b3])) {
  if (!(V.is.long(_b1, 10, 30)&&V.is.nickName(_b1)))  {
    alert('B1格式不正确');
    return false;
  }
  if (V.is.long(_b1, 20)) {
    if (!(V.is.long(_b2, 10, 20)&&V.is.nickName(_b2))) {
      alert('B2格式不正确（此时B1太长）');
      return false;
    }
  }
  if (condition2()) {
    if (!(V.is.email(_b2) || V.is.nickName(_b2)) {
      alert('B2格式不正确（此时满足condition2）');
      return false;
    }
  }
}
