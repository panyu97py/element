function broadcast(componentName, eventName, params) {
  this.$children.forEach(child => {
    var name = child.$options.componentName;

    if (name === componentName) {
      child.$emit.apply(child, [eventName].concat(params));
    } else {
      broadcast.apply(child, [componentName, eventName].concat([params]));
    }
  });
}
export default {
  methods: {
    /**
     * 向父组件提交事件的方法（ 采用混入的方式注册到每一个 vue 实例中去 ）
     * @param componentName
     * @param eventName
     * @param params
     */
    dispatch(componentName, eventName, params) {
      // 定义 parent 为当前组件的父组件，如果不存在父组件则为当前组件的跟组件
      var parent = this.$parent || this.$root;

      // 定义 name 为 parent 的组件名
      var name = parent.$options.componentName;

      // 递归查找组件名等于 componentName 的组件实例
      while (parent && (!name || name !== componentName)) {

        // 直到递归跟组件时，parent 为 undefined while 循环停止
        parent = parent.$parent;

        if (parent) {
          name = parent.$options.componentName;
        }
      }

      // 向找到的组件实例提交事件名为 eventName 的事件并传递对应参数
      // 如果一直到跟组件还是没有组件名等于 componentName 的组件实例则 parent 为 undefined ,则不提交事件（ 因为跟组件不存在 $parent ）
      if (parent) {

        // 使用 apply 重定向 this 指向到 找的的组件实例中
        parent.$emit.apply(parent, [eventName].concat(params));
      }
    },
    broadcast(componentName, eventName, params) {
      broadcast.call(this, componentName, eventName, params);
    }
  }
};
