Validator.api({
  graterThan5: function(values) {
    var pass = true;
    for (var i = 0; i < values.length; ++i) {
      if (+values[i] <= 5) {
        pass = false;
        break;
      }
    }
    return pass;
  },
  sevenNumbers: /^\d{7}$/,
  sname: 'QQ||length:(3,5)&&nickName', // 注意这是一个用内置规则定义的api规则
  pname: 'length:(,20)&&email' // 注意这是一个用内置规则定义的api规则
});

// TODO: 现在不支持用API规则定义API规则，或者自定义规则定义自定义规则

console.log(Validator.is('graterThan5', ['1', '5']));
console.log(Validator.not('graterThan5', ['1', '5']));

console.log(Validator.is('sevenNumbers', ['1234567']));
console.log(Validator.not('sevenNumbers', ['1234567']));

console.log(Validator.is('sname', ['1wer']));
console.log(Validator.is('sname', ['wer1']));
console.log(Validator.is('sname', ['werrew']));
console.log(Validator.is('sname', ['12345']));
console.log(Validator.not('sname', ['1234']));

var myForm = document.getElementById('checkMe');
var checkMe = new FormValidator(myForm, [{
  field: 'name',
  rules: {
    if: 'kname||length:(,20)&&email', // 注意这是用api规则和内置规则组合成的规则，实际规则应该是： QQ || length:(3,5) && nickName || url || length:(,20) && email
    fail: function() {
      this.classList.add('error');
      alert('昵称不符合');
    }
  }
}]);

checkMe.add({
  kname: 'sname||url' // 注意这是一个用API规则和内置规则组合成的实例规则
});

myForm.addEventListener('submit', function(event) {
  event.preventDefault();
  if (!checkMe.check()) {
    console.log('no');
    return false;
  }
  console.log('yes');
  return false;
}, false);
