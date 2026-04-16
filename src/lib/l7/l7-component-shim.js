/**
 * L7 在 Scene 聚合入口里会静态依赖 Logo 控件，这里提供最小 shim 以绕开 less 样式入口。
 */
export class Logo {
  /**
   * 构造函数保留入参签名，避免 Scene 在实例化控件时出错。
   */
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * addTo 保持链式返回，兼容控件服务的默认调用约定。
   */
  addTo() {
    return this;
  }

  /**
   * remove 作为空实现即可满足当前 logoVisible=false 的使用场景。
   */
  remove() {
    return this;
  }
}

export default {
  Logo
};
