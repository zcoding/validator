/**
 * @static Validator.extends()
 */
Validator.extend = function(constructorFunction) {

  constructorFunction.prototype = new Validator();
  constructorFunction.prototype.constructor = constructorFunction;

  return constructorFunction;

};
