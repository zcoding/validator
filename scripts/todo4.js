// 异步方式
var $form = document.getElementById('myForm');
var checkMe = new FormValidator($form, {
  field: 'name',
  rules: {
    if: 'au',
    fail: function() { // async
      // todo
    }
  }
});

checkMe.add({
  au: function(value) {
    return Promise.resolve($.ajax({ // 返回一个Promises/A+规范的Promise
      url: '/au',
      type: 'POST',
      data: {
        name: value
      }
    }));
  }
});

// 非配置的方式
Promise.resolve($.ajax({ // 返回一个Promises/A+规范的Promise
  url: '/au',
  type: 'POST',
  data: {
    name: value
  }
})).then(function success() {
  // success
}, function failed() {
  // fail
})
