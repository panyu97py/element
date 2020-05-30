/**
 * 合并对象
 * @param target 目标对象
 * @returns {*}
 */
export default function(target) {
  // 循环参数列表 i 的初始值为 1 ，即排除掉第一个参数 target
  for (let i = 1, j = arguments.length; i < j; i++) {
    let source = arguments[i] || {};
    for (let prop in source) { //循环属性
      if (source.hasOwnProperty(prop)) { // 判断属性 prop 是否存在
        let value = source[prop]; //获取对象属性的值
        if (value !== undefined) {
          target[prop] = value; // 赋值
        }
      }
    }
  }

  return target;
};
