/**
 * 布尔矩阵运算辅助函数
 */
var matrix = (function() {

  var mat = {};

  /**
   * 求或
   * mat1 = [true, false], mat2 = [false, true], mat1 || mat2 = [true, true]
   * mat1 = [true, false], mat2 = false, mat1 || mat2 = [true, false]
   * mat1 = false, mat2 = [true, false], mat1 || mat2 = [true, false]
   * mat1 = true, mat2 = false, mat1 || mat2 = true
   */
  mat.or = function(mat1, mat2) {
    var newMatrix = [];
    var t1 = isArray(mat1), t2 = isArray(mat2);
    if (t1 && t2) {
      for (var i = 0; i < mat1.length; ++i) {
        newMatrix[i] = mat1[i] || mat2[i];
      }
    } else if (t1) {
      for (var i = 0; i < mat1.length; ++i) {
        newMatrix[i] = mat1[i] || mat2;
      }
    } else if (t2) {
      for (var i = 0; i < mat2.length; ++i) {
        newMatrix[i] = mat2[i] || mat1;
      }
    } else {
      newMatrix = mat1 || mat2;
    }
    return newMatrix;
  };

  /**
   * 求与
   * mat1 = [true, false], mat2 = [false, true], mat1 && mat2 = [false, false]
   * mat1 = [true, false], mat2 = false, mat1 && mat2 = [false, false]
   * mat1 = false, mat2 = [true, false], mat1 && mat2 = [false, false]
   * mat1 = true, mat2 = false, mat1 && mat2 = false
   */
  mat.and = function(mat1, mat2) {
    var newMatrix = [];
    var t1 = isArray(mat1), t2 = isArray(mat2);
    if (t1 && t2) {
      for (var i = 0; i < mat1.length; ++i) {
        newMatrix[i] = mat1[i] && mat2[i];
      }
    } else if (t1) {
      for (var i = 0; i < mat1.length; ++i) {
        newMatrix[i] = mat1[i] && mat2;
      }
    } else if (t2) {
      for (var i = 0; i < mat2.length; ++i) {
        newMatrix[i] = mat2[i] && mat1;
      }
    } else {
      newMatrix = mat1 && mat2;
    }
    return newMatrix;
  };

  /**
   * 求反
   * mat = [true, false], !mat = [false, true]
   * mat = true, !mat = false
   */
  mat.not = function(mat) {
    var newMatrix = [];
    if (isArray(mat)) {
      for (var i = 0; i < mat.length; ++i) {
        newMatrix[i] = !mat[i];
      }
    } else {
      newMatrix = !mat;
    }
    return newMatrix;
  };

  /**
   * 求值
   * mat = [true, false], return false
   * mat = true, return true
   */
  mat.val = function(mat) {
    var result = true;
    if (isArray(mat)) {
      for (var i = 0; i < mat.length; ++i) {
        result = result && mat[i];
      }
    } else {
      result = result && mat;
    }
    return result;
  };

  return mat;

})();
