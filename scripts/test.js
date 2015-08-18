var Validator = require('../build/commonjs/validator').Validator;

console.log(Validator.is.empty(['notEmpty', '']));
console.log(Validator.is.empty(''));

console.log(Validator.is('empty', 'shit'));
console.log(Validator.is('empty', ['notEmpty', '']));

console.log(Validator.all('empty', ['shit', '']));
console.log(Validator.any('empty', ['yes', '']));
console.log(Validator.not('empty', ''));
