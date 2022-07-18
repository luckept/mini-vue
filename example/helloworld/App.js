import { h } from '../../lib/guide-mini-vue.esm.js'

window.self = null

export const App = {
  render() {
    window.self = this
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'hard'],
      },
      'hi ' + this.msg
      // string 类型
      // 'hi，mini-vue'
      // array 类型
      // [h('p', { class: 'red' }, 'hi'), h('p', { class: 'blue' }, 'mini-vue')]
    )
  },

  setup() {
    return {
      msg: 'mini-vue-hi',
    }
  },
}
