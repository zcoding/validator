function getField(id) {
  return document.getElementById(id);
}
var validatorConfig = [{
  field: getField('field-name'),
  rules: [{
    type: '!empty',
    fail: function() {
      this.classList.add('error');
      alert('昵称不能为空');
    }
  }, {
    type: 'length:[10, 20)',
    fail: function() {
      this.classList.add('error');
      alert('昵称限制10到20个字符');
    }
  }]
}, {
  field: getField('field-password'),
  rules: []
}];

var checker = new Validator(validatorConfig);

getField('submit-button').addEventListener('click', function(event) {
  event.preventDefault();
  if (!checker.check()) {
    console.count('shit');
    return false;
  }
  console.log('yeah~');
  return false;
}, false);
