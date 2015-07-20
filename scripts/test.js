var rules = require('./rules');

var emails = [
  'wuzijie_1991@163.com',
  'a.b.c.d.e.f.g@h.i'
];

emails.forEach(function(email) {
  if (rules['email'].test(email)) {
    console.log('Valid Email: ' + email);
  } else {
    console.log('Invalid Email: ' + email);
  }
});
