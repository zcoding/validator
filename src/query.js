// 为了兼容不支持querySelectorAll的浏览器，同时又不需要使用jQuery，使用原生API获取元素
// 只是为了获取特定元素，所以只支持简单的选择器
// 1. id选择器
// 2. 类选择器
// 3. 标签选择器
// 4. 属性选择器

/**
 * query selector
 * 这个函数是不完整的！不公开使用
 * @param {String} selector
 * @return {Array} element list
 */
var query = function(selector) {
};
