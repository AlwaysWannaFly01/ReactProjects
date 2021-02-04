/* eslint-disable no-underscore-dangle */
// 服务端和客户端通过此类共享数据
export default {
  __context: {},
  initial(context = {}) {
    this.__context = context
    return this.__context
  },
  getContext() {
    return this.__context
  },
  setContext(context = {}) {
    this.__context = Object.assign(this.__context, context)
    return this.__context
  },

  print: {
    error: ''
  }
}
