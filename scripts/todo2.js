// 集合型规则
// 集合型规则适用于待检测值为数组型的验证

// 检测是否包含
{
  if: 'include: (A, B)', // 包含A和B
  fail: function() {}
}

{
  if: 'include: [A, B]', // 包含A,B或子集
  fail: function() {}
}

{
  if: 'include: ([A, B], C)', // 包含A,B或子集，同时必须包含C
  fail: function() {}
}

{
  if: 'include: [(A, B), C]', // 同时包含A,B或者包含C，这两种情况的子集
  fail: function() {}
}
