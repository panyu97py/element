<template>
  <div class="el-form-item" :class="[{
      'el-form-item--feedback': elForm && elForm.statusIcon,
      'is-error': validateState === 'error',
      'is-validating': validateState === 'validating',
      'is-success': validateState === 'success',
      'is-required': isRequired || required,
      'is-no-asterisk': elForm && elForm.hideRequiredAsterisk
    },
    sizeClass ? 'el-form-item--' + sizeClass : ''
  ]">
    <label-wrap
      :is-auto-width="labelStyle && labelStyle.width === 'auto'"
      :update-all="form.labelWidth === 'auto'">
      <label :for="labelFor" class="el-form-item__label" :style="labelStyle" v-if="label || $slots.label">
        <slot name="label">{{label + form.labelSuffix}}</slot>
      </label>
    </label-wrap>
    <div class="el-form-item__content" :style="contentStyle">
      <slot></slot>
      <transition name="el-zoom-in-top">
        <slot
          v-if="validateState === 'error' && showMessage && form.showMessage"
          name="error"
          :error="validateMessage">
          <div
            class="el-form-item__error"
            :class="{
              'el-form-item__error--inline': typeof inlineMessage === 'boolean'
                ? inlineMessage
                : (elForm && elForm.inlineMessage || false)
            }"
          >
            {{validateMessage}}
          </div>
        </slot>
      </transition>
    </div>
  </div>
</template>
<script>
  import AsyncValidator from 'async-validator';
  import emitter from 'element-ui/src/mixins/emitter';
  import objectAssign from 'element-ui/src/utils/merge';
  import { noop, getPropByPath } from 'element-ui/src/utils/util';
  import LabelWrap from './label-wrap';
  export default {
    name: 'ElFormItem',

    componentName: 'ElFormItem',

    mixins: [emitter],

    // 父组件中返回要传给下级的数据
    provide() {
      return {
        elFormItem: this
      };
    },

    // 接收父组件传递的值
    inject: ['elForm'],

    props: {
      label: String,
      labelWidth: String,
      prop: String,
      required: {
        type: Boolean,
        default: undefined
      },
      /**
       * 校验规则
       */
      rules: [Object, Array],
      error: String,
      validateStatus: String,
      for: String,
      inlineMessage: {
        type: [String, Boolean],
        default: ''
      },
      showMessage: {
        type: Boolean,
        default: true
      },
      size: String
    },
    components: {
      // use this component to calculate auto width
      LabelWrap
    },
    watch: {
      error: {
        immediate: true,
        handler(value) {
          this.validateMessage = value;
          this.validateState = value ? 'error' : '';
        }
      },
      validateStatus(value) {
        this.validateState = value;
      }
    },
    computed: {
      labelFor() {
        return this.for || this.prop;
      },
      labelStyle() {
        const ret = {};
        if (this.form.labelPosition === 'top') return ret;
        const labelWidth = this.labelWidth || this.form.labelWidth;
        if (labelWidth) {
          ret.width = labelWidth;
        }
        return ret;
      },
      contentStyle() {
        const ret = {};
        const label = this.label;
        if (this.form.labelPosition === 'top' || this.form.inline) return ret;
        if (!label && !this.labelWidth && this.isNested) return ret;
        const labelWidth = this.labelWidth || this.form.labelWidth;
        if (labelWidth === 'auto') {
          if (this.labelWidth === 'auto') {
            ret.marginLeft = this.computedLabelWidth;
          } else if (this.form.labelWidth === 'auto') {
            ret.marginLeft = this.elForm.autoLabelWidth;
          }
        } else {
          ret.marginLeft = labelWidth;
        }
        return ret;
      },
      /**
       * 向上查找到的第一个组件名为 ElForm 的组件实例
       */
      form() {
        let parent = this.$parent;
        let parentName = parent.$options.componentName;
        // 向上递归查找组件名为 ElForm 的组件
        while (parentName !== 'ElForm') {
          // 如果他的父组件中包含组件名为 ElFormItem 的组件，则这是一个嵌套表单
          if (parentName === 'ElFormItem') {
            this.isNested = true;
          }
          parent = parent.$parent;
          parentName = parent.$options.componentName;
        }
        return parent;
      },
      fieldValue() {
        const model = this.form.model;
        if (!model || !this.prop) { return; }

        let path = this.prop;
        if (path.indexOf(':') !== -1) {
          path = path.replace(/:/, '.');
        }

        return getPropByPath(model, path, true).v;
      },
      /**
       * 是否非空
       */
      isRequired() {
        let rules = this.getRules();
        let isRequired = false;

        if (rules && rules.length) {
          rules.every(rule => {
            if (rule.required) {
              isRequired = true;
              return false; // 用于终止循环
            }
            return true;
          });
        }
        return isRequired;
      },
      _formSize() {
        return this.elForm.size;
      },
      elFormItemSize() {
        return this.size || this._formSize;
      },
      sizeClass() {
        return this.elFormItemSize || (this.$ELEMENT || {}).size;
      }
    },
    data() {
      return {
        validateState: '',
        validateMessage: '',
        /**
         * 验证禁用状态
         */
        validateDisabled: false,
        validator: {},
        /**
         * 是否为嵌套
         */
        isNested: false,
        computedLabelWidth: ''
      };
    },
    methods: {
      /**
       * 校验参数
       * @param trigger 触发事件（change/blur）
       * @param callback 回调函数（默认为一个空函数）
       * @returns {boolean}
       */
      validate(trigger, callback = noop) {
        this.validateDisabled = false;
        const rules = this.getFilteredRule(trigger);
        if ((!rules || rules.length === 0) && this.required === undefined) {
          callback();
          return true;
        }

        this.validateState = 'validating';

        const descriptor = {};
        if (rules && rules.length > 0) {
          rules.forEach(rule => {
            delete rule.trigger;
          });
        }
        descriptor[this.prop] = rules;

        // 表单异步验证js库：async-validator
        const validator = new AsyncValidator(descriptor);
        const model = {};

        model[this.prop] = this.fieldValue;

        validator.validate(model, { firstFields: true }, (errors, invalidFields) => {
          this.validateState = !errors ? 'success' : 'error';
          this.validateMessage = errors ? errors[0].message : '';

          callback(this.validateMessage, invalidFields);
          this.elForm && this.elForm.$emit('validate', this.prop, !errors, this.validateMessage || null);
        });
      },
      clearValidate() {
        this.validateState = '';
        this.validateMessage = '';
        this.validateDisabled = false;
      },
      resetField() {
        this.validateState = '';
        this.validateMessage = '';

        let model = this.form.model;
        let value = this.fieldValue;
        let path = this.prop;
        if (path.indexOf(':') !== -1) {
          path = path.replace(/:/, '.');
        }

        let prop = getPropByPath(model, path, true);

        this.validateDisabled = true;
        if (Array.isArray(value)) {
          prop.o[prop.k] = [].concat(this.initialValue);
        } else {
          prop.o[prop.k] = this.initialValue;
        }

        // reset validateDisabled after onFieldChange triggered
        this.$nextTick(() => {
          this.validateDisabled = false;
        });

        this.broadcast('ElTimeSelect', 'fieldReset', this.initialValue);
      },
      /**
       * 获取全部校验规则
       */
      getRules() {
        let formRules = this.form.rules;
        const selfRules = this.rules;
        const requiredRule = this.required !== undefined ? { required: !!this.required } : [];

        const prop = getPropByPath(formRules, this.prop || '');
        formRules = formRules ? (prop.o[this.prop || ''] || prop.v) : [];

        return [].concat(selfRules || formRules || []).concat(requiredRule);
      },
      /**
       * 获取并过滤指定事件类型的校验规则
       * @param trigger 事件类型
       * @returns {*}
       */
      getFilteredRule(trigger) {
        // 获取全部校验规则
        const rules = this.getRules();

        return rules.filter(rule => {
          // 如果没有规则列表中没有定义规则的事件类型则返回
          if (!rule.trigger || trigger === '') return true;
          // 如果定义的事件类型为数组则……
          if (Array.isArray(rule.trigger)) {
            // 判断指定的事件类型是否在数组中
            return rule.trigger.indexOf(trigger) > -1;
          } else {
            // 判断规则列表中定义的事件类型是否为指定的事件类型
            return rule.trigger === trigger;
          }
        }).map(rule => objectAssign({}, rule));//循环过滤所得的校验规则，与一个空对象合并（//TODO 这波操作看不懂啊）
      },
      onFieldBlur() {
        this.validate('blur');
      },
      onFieldChange() {
        if (this.validateDisabled) {
          this.validateDisabled = false;
          return;
        }

        this.validate('change');
      },
      updateComputedLabelWidth(width) {
        this.computedLabelWidth = width ? `${width}px` : '';
      },
      addValidateEvents() {
        const rules = this.getRules();

        if (rules.length || this.required !== undefined) {
          this.$on('el.form.blur', this.onFieldBlur);
          this.$on('el.form.change', this.onFieldChange);
        }
      },
      removeValidateEvents() {
        this.$off();
      }
    },
    mounted() {
      if (this.prop) {
        // 向上查找组件名为 ElForm 的组件提交事件名为 el.form.addField 的事件，参数为this
        // 结合 ElForm 组件中的逻辑代码，这里是将当前组件实例注册到父组件中去
        this.dispatch('ElForm', 'el.form.addField', [this]);

        let initialValue = this.fieldValue;
        if (Array.isArray(initialValue)) {
          initialValue = [].concat(initialValue);
        }
        Object.defineProperty(this, 'initialValue', {
          value: initialValue
        });

        this.addValidateEvents();
      }
    },
    beforeDestroy() {
      // 向上查找组件名为 ElForm 的组件提交事件名为 el.form.removeField 的事件，参数为this
      // 结合 ElForm 组件中的逻辑代码，这里是将当前组件实例从父组件中的注册列表中移除
      this.dispatch('ElForm', 'el.form.removeField', [this]);
    }
  };
</script>
