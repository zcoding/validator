Validator.api({
  browser: /chrome|ie|firfox|opera|safari/i,
  notAllEmpty: function(values) {
    var pass = false;
    for (var i = 0; i < values.length; ++i) {
      if (!Validator.is.empty(values[i])) {
        pass = true;
        break;
      }
    }
    return pass;
  }
});
