var validationA = {
  field: getField('A1'),
  rules: {
    if: '!empty&&nickName',
    fail: function() {
      alert('请输入正确格式的昵称');
    }
  }
};

var validationB = [{
  field: getField('B1'),
  rules: [{
    if: 'length:(10,30)&&nickName',
    fail: function() {
      alert('B1格式不正确');
    }
  }, {
    if: 'length:(20,)',
    success: {
      field: getField('B2'),
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
      field: getField('B2'),
      rules: {
        if: 'email||nickName',
        fail: function() {
          alert('B2格式不正确（此时满足condition2）');
        }
      }
    }
  }
}];

var validations = {
  rules: {
    if: 'condition1',
    success: {
      field: [getField('A1'), getField('A2'), getField('A3'), getField('B1'), getField('B2'), getField('B3')],
      rules: {
        if: '!all:empty',
        fail: function() {
          alert('A,B不能同时为空');
        },
        success: [{
          field: [getField('A1'), getField('A2'), getField('A3')],
          rules: {
            if: '!all:empty',
            success: validationA
          }
        }, {
          field: [getField('B1'), getField('B2'), getField('B3')],
          rules: {
            if: '!all:empty',
            success: validationB
          }
        }]
      }
    }
  }
};

function getField(id) {
  return document.getElementById(id);
}

var checker = new Validator(validations);

checker.add({
  condition1: 1+2 === 3,
  condition2: function() {
    return 1+1 === 2;
  }
});

getField('submit-button').addEventListener('click', function(event) {
  event.preventDefault();
  if (!checker.check()) {
    console.count('shit');
    return false;
  }
  console.count('yeah~');
  alert('全部通过');
  return false;
}, false);
