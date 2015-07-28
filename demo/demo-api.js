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
  sname: 'QQ||length:(3,5)&&nickName'
});

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
    type: 'sname',
    fail: function() {
      this.classList.add('error');
      alert('昵称不符合');
    }
  }
}]);

myForm.addEventListener('submit', function(event) {
  event.preventDefault();
  if (!checkMe.check()) {
    console.log('no');
    return false;
  }
  console.log('yes');
  return false;
}, false);
