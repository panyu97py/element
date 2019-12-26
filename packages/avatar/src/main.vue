<script>
export default {
  name: 'ElAvatar',

  props: {
    /** 设置头像大小 */
    size: {
      /** 限定类型 可以为 Number、String */
      type: [Number, String],
      /** 校验传入参数 */
      validator(val) {
        if (typeof val === 'string') {// 若传入参数的类型为 String
          return ['large', 'medium', 'small'].includes(val);// 则传入参数必须为数组中的字段
        }
        return typeof val === 'number';// 或者传入参数为数字
      }
    },
    /** 设置头像的形状 */
    shape: {
      type: String,
      default: 'circle', // 不传则默认为 circle 圆
      /** 校验传入参数 必须输入数组中的字段 */
      validator(val) {
        return ['circle', 'square'].includes(val);
      }
    },
    /** 头像的图标类型 参考icon组件 */
    icon: String,
    /** 图片头像的资源地址 */
    src: String,
    /** 描述图像的替换文本 */
    alt: String,
    /** 以逗号分隔的一个或多个字符串列表表明一系列用户代理使用的可能的图像 */
    srcSet: String, // srcset 属性用于浏览器根据宽、高和像素密度来加载相应的图片资源。例如：<img src="small.jpg " srcset="big.jpg 1440w, middle.jpg 800w, small.jpg 1x" />
    /** 错误回调  返回 false 会关闭组件默认的 fallback 行为*/
    error: Function,
    /** 当展示类型为图片的时候，设置图片如何适应容器框 */
    fit: {
      type: String,
      default: 'cover'// 不传则默认为 cover 覆盖
    }
  },

  data() {
    return {
      /** 是否存在图像 */
      isImageExist: true
    };
  },

  computed: {
    /** 计算头像样式 */
    avatarClass() {
      const { size, icon, shape } = this;
      let classList = ['el-avatar'];

      if (size && typeof size === 'string') {
        classList.push(`el-avatar--${size}`);
      }

      if (icon) {
        classList.push('el-avatar--icon');
      }

      if (shape) {
        classList.push(`el-avatar--${shape}`);
      }

      return classList.join(' ');
    }
  },

  methods: {
    /** 错误回调 */
    handleError() {
      const { error } = this;
      const errorFlag = error ? error() : undefined;// 判断传入参数错误回调是否存在，若存在则调用
      if (errorFlag !== false) {
        this.isImageExist = false; // 若返回不为 false，则取消 img 的显示作为组件默认的 failback 行为
      }
    },
    renderAvatar() {
      const { icon, src, alt, isImageExist, srcSet, fit } = this;
      // 如果图像存在且文件目录存在则返回 img 标签 （ object-fit CSS 属性指定可替换元素的内容应该如何适应到其使用的高度和宽度确定的框。）
      if (isImageExist && src) {
        return <img
          src={src}
          onError={this.handleError}
          alt={alt}
          srcSet={srcSet}
          style={{ 'object-fit': fit }}/>;
      }
      // 如果图标存在则返回图标
      if (icon) {
        return (<i class={icon} />);
      }
      // 若图标、图像及文件目录都不存在则返回匿名插槽中的内容
      return this.$slots.default;
    }
  },
  /** 渲染函数 渲染页面 */
  render() {
    const { avatarClass, size } = this;
    /** 尺寸样式 若传入参数 size 为数字 则拼接生成样式*/
    const sizeStyle = typeof size === 'number' ? {
      height: `${size}px`,
      width: `${size}px`,
      lineHeight: `${size}px`
    } : {};

    return (
      <span class={ avatarClass } style={ sizeStyle }>
        {
          this.renderAvatar()// 调用函数渲染
        }
      </span>
    );
  }

};
</script>
