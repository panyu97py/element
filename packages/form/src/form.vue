<template>
    <form class="el-form" :class="[
    labelPosition ? 'el-form--label-' + labelPosition : '',
    { 'el-form--inline': inline }
  ]">
        <slot></slot>
    </form>
</template>
<script>
  import objectAssign from 'element-ui/src/utils/merge';

  export default {
    name: 'ElForm',

    componentName: 'ElForm',

    // 父组件中返回要传给下级的数据
    provide() {
      return {
        elForm: this
      };
    },

    props: {
      /** 表单数据对象*/
      model: Object,
      /** 表单验证规则*/
      rules: Object,
      labelPosition: String,
      labelWidth: String,
      labelSuffix: {
        type: String,
        default: ''
      },
      /** 行内表单模式*/
      inline: Boolean,
      inlineMessage: Boolean,
      statusIcon: Boolean,
      showMessage: {
        type: Boolean,
        default: true
      },
      size: String,
      disabled: Boolean,
      validateOnRuleChange: {
        type: Boolean,
        default: true
      },
      hideRequiredAsterisk: {
        type: Boolean,
        default: false
      }
    },
    watch: {
      // 规则变更则重置事件
      rules() {
        // remove then add event listeners on form-item after form rules change
        this.fields.forEach(field => {
          field.removeValidateEvents();
          field.addValidateEvents();
        });

        if (this.validateOnRuleChange) {
          this.validate(() => {
          });
        }
      }
    },
    computed: {
      autoLabelWidth() {
        if (!this.potentialLabelWidthArr.length) return 0;
        const max = Math.max(...this.potentialLabelWidthArr);
        return max ? `${max}px` : '';
      }
    },
    data() {
      return {
        /**
         * 子组件 form-item 列表（用于表单校验）
         */
        fields: [],
        potentialLabelWidthArr: [] // use this array to calculate auto width
      };
    },
    created() {
      /**
       * 监听 el.form.addField 事件
       */
      this.$on('el.form.addField', (field) => {
        if (field) {
          this.fields.push(field);
        }
      });
      /**
       * 监听 el.form.removeField 事件
       */
      /* istanbul ignore next */
      this.$on('el.form.removeField', (field) => {
        if (field.prop) {
          //    从列表中移除子组件 formItem
          this.fields.splice(this.fields.indexOf(field), 1);
        }
      });
    },
    methods: {
      /**
       * 遍历重置所有字段
       */
      resetFields() {
        if (!this.model) {
          console.warn('[Element Warn][Form]model is required for resetFields to work.');
          return;
        }
        this.fields.forEach(field => {
          field.resetField();
        });
      },
      /**
       * 清除验证,如果不传prop就清除所有
       */
      clearValidate(props = []) {
        const fields = props.length
          ? (typeof props === 'string'
              ? this.fields.filter(field => props === field.prop)
              : this.fields.filter(field => props.indexOf(field.prop) > -1)
          ) : this.fields;
        fields.forEach(field => {
          field.clearValidate();
        });
      },
      /**
       * 表单校验方法
       * 这里就可以体现出关联组件,解耦代码的思想,每个组件仅仅做自己事.
       * form只做了统一的管理与调度,真正干活的还是小弟
       * @param callback 回调函数
       * @returns {Promise<any>}
       */
      validate(callback) {
        if (!this.model) {
          console.warn('[Element Warn][Form]model is required for validate to work!');
          return;
        }

        let promise;

        // if no callback, return promise（如果没有传入 callback 函数，则返回一个promise，由此可见 el-form 组件可以使用 await 等待表单校验通过后执行之后的操作）
        if (typeof callback !== 'function' && window.Promise) {
          promise = new window.Promise((resolve, reject) => {

            // 为 callback 函数赋值一个匿名函数用于校验
            callback = function(valid) {
              valid ? resolve(valid) : reject(valid);
            };
          });
        }

        // 变量初始化
        let valid = true;
        let count = 0;

        // 如果需要验证的fields为空，调用验证时立刻返回callback
        if (this.fields.length === 0 && callback) {
          callback(true);
        }
        let invalidFields = {};

        // 循环子组件 form-item 列表
        this.fields.forEach(field => {

          // 调用子组件 form-item 本身的校验方法
          field.validate('', (message, field) => {
            if (message) {
              valid = false;
            }
            invalidFields = objectAssign({}, invalidFields, field);

            // 每一次循环都对 count+1 （ ++count返回返回的是自增之后的值 ）每次循环时判断 count+1 是否等于 this.fields 的长度。
            // 即判断是否为子组件列表中最后一个子组件
            if (typeof callback === 'function' && ++count === this.fields.length) {

              // 执行回调函数
              callback(valid, invalidFields);
            }
          });
        });

        // promise 存在则返回 promise （ 由此可见 el-form 的校验可以用 await 等待）
        if (promise) {
          return promise;
        }
      },
      /**
       * 指定字段进行验证
       * @param props
       * @param cb
       */
      validateField(props, cb) {
        props = [].concat(props);
        const fields = this.fields.filter(field => props.indexOf(field.prop) !== -1);
        if (!fields.length) {
          console.warn('[Element Warn]please pass correct props!');
          return;
        }

        fields.forEach(field => {
          field.validate('', cb);
        });
      },
      getLabelWidthIndex(width) {
        const index = this.potentialLabelWidthArr.indexOf(width);
        // it's impossible
        if (index === -1) {
          throw new Error('[ElementForm]unpected width ', width);
        }
        return index;
      },
      registerLabelWidth(val, oldVal) {
        if (val && oldVal) {
          const index = this.getLabelWidthIndex(oldVal);
          this.potentialLabelWidthArr.splice(index, 1, val);
        } else if (val) {
          this.potentialLabelWidthArr.push(val);
        }
      },
      deregisterLabelWidth(val) {
        const index = this.getLabelWidthIndex(val);
        this.potentialLabelWidthArr.splice(index, 1);
      }
    }
  };
</script>
