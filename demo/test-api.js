Validator.api({
  A: /^A+$/,
  B: 'A||email'
});

console.log(Validator.is('B', ['AA', 'wuzijie@163.com'])); // false
// TODO: 预期应该是true，这里是错的，因为：验证的时候同时把整个数组输入单个验证条件中，每个验证条件又是相互独立的
// 验证A时因为存在'wuzijie@163.com'所以返回false，验证email时因为存在'AA'所以返回false
// 预期应该是：验证'AA'时满足A，验证'wuzijie@163.com'时满足email，整体返回true
