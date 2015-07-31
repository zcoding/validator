/**
 * 布尔矩阵运算辅助函数
 */
var matrix = (function() {

  var mat = {};

  /**
   * 求或
   * mat1 = [true, false], mat2 = [false, true], mat1 || mat2 = [true, true]
   * mat1 = [true, false], mat2 = false, mat1 || mat2 = [true, false]
   */
  mat.or = function(mat1, mat2) {
    var newMatrix = [];
    if (isArray(mat2)) {
      for (var i = 0; i < mat1.length; ++i) {
        newMatrix[i] = mat1[i] || mat2[i];
      }
    } else {
      for (var i = 0; i < mat1.length; ++i) {
        newMatrix[i] = mat1[i] || mat2;
      }
    }
    return newMatrix;
  };

  /**
   * 求与
   * mat1 = [true, false], mat2 = [false, true], mat1 && mat2 = [false, false]
   * mat1 = [true, false], mat2 = false, mat1 && mat2 = [false, false]
   */
  mat.and = function(mat1, mat2) {
    var newMatrix = [];
    if (isArray(mat2)) {
      for (var i = 0; i < mat1.length; ++i) {
        newMatrix[i] = mat1[i] && mat2[i];
      }
    } else {
      for (var i = 0; i < mat1.length; ++i) {
        newMatrix[i] = mat1[i] && mat2;
      }
    }
    return newMatrix;
  };

  /**
   * 求反
   * mat1 = [true, false], !mat1 = [false, true]
   */
  mat.not = function(mat1) {
    var newMatrix = [];
    for (var i = 0; i < mat1.length; ++i) {
      newMatrix[i] = !mat1[i];
    }
    return newMatrix;
  };

  /**
   * 求值
   * mat1 = [true, false], return false
   * mat1 = [true, true], return true
   */
  mat.val = function(mat1) {
    var result = true;
    for (var i = 0; i < mat1.length; ++i) {
      result &= mat1[i];
    }
    return result;
  };

})();
