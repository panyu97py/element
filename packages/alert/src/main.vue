<template>
  <!-- 过渡与动画标签即该组件出现及离开都将有过渡动画-->
  <transition name="el-alert-fade">
    <div
      class="el-alert"
      :class="[typeClass, center ? 'is-center' : '', 'is-' + effect]"
      v-show="visible"
      role="alert"
    >
      <!-- 警告组件的图标 -->
      <i class="el-alert__icon" :class="[ iconClass, isBigIcon ]" v-if="showIcon"></i>
      <div class="el-alert__content">
        <!-- 标题部分可通过参数传入也可通过具名插槽传入 若无传入则不显示 -->
        <span class="el-alert__title" :class="[ isBoldTitle ]" v-if="title || $slots.title">
          <slot name="title">{{ title }}</slot>
        </span>
        <!-- 通过匿名插槽传入辅助性文字 当匿名插槽存在且参数传入的辅助性文字不存在时显示 -->
        <p class="el-alert__description" v-if="$slots.default && !description"><slot></slot></p>
        <!-- 通过参数传入的辅助性文字 当参数传入的辅助性文字存在且匿名插槽不存在时显示 -->
        <p class="el-alert__description" v-if="description && !$slots.default">{{ description }}</p>
        <!-- 关闭按钮 若关闭按钮自定义文本存在显示样式为 is-customed 反之则显示 el-icon-close-->
        <i class="el-alert__closebtn" :class="{ 'is-customed': closeText !== '', 'el-icon-close': closeText === '' }" v-show="closable" @click="close()">{{closeText}}</i>
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
/** 图标样式 map */
const TYPE_CLASSES_MAP = {
  'success': 'el-icon-success',
  'warning': 'el-icon-warning',
  'error': 'el-icon-error'
};
export default {
  name: 'ElAlert',

  props: {
    /** 标题 */
    title: {
      type: String,
      default: ''
    },
    /** 辅助性文字 */
    description: {
      type: String,
      default: ''
    },
    /** 主题  success/warning/info/error */
    type: {
      type: String,
      default: 'info'
    },
    /** 是否可关闭 */
    closable: {
      type: Boolean,
      default: true
    },
    /** 关闭按钮自定义文本 */
    closeText: {
      type: String,
      default: ''
    },
    /** 是否显示图标 */
    showIcon: Boolean,
    /** 文字是否居中 */
    center: Boolean,
    /** 选择提供的主题  light/dark*/
    effect: {
      type: String,
      default: 'light',
      validator: function(value) {
        return ['light', 'dark'].indexOf(value) !== -1;
      }
    }
  },

  data() {
    return {
      /** 是否可见 */
      visible: true
    };
  },

  methods: {
    /** 关闭方法 */
    close() {
      this.visible = false;// 取消警告可见
      this.$emit('close');// 触发父组件 close 事件
    }
  },

  computed: {
    /** 类型样式 拼接父组件所传参数 type */
    typeClass() {
      return `el-alert--${ this.type }`;
    },
    /** 图标样式 */
    iconClass() {
      return TYPE_CLASSES_MAP[this.type] || 'el-icon-info';// 根据type选择图标样式map中对应的样式，若样式不存在则将info作为样式显示图标
    },

    /** 是否显示较大的图标 */
    isBigIcon() {
      return this.description || this.$slots.default ? 'is-big' : '';// 存在辅助性文字时显示较大的图标（参数传入或solt传入都算）
    },
    /** 是否显示较大标题 */
    isBoldTitle() {
      return this.description || this.$slots.default ? 'is-bold' : '';// 存在辅助性文字时显示较大的标题（参数传入或solt传入都算）
    }
  }
};
</script>
