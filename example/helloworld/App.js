import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null

export const App = {
  name: 'App',
  render() {
    window.self = this
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'hard'],
        onClick() {
          console.log('click')
        },
        onMousedown() {
          console.log('mousedown')
        },
        onMouseover() {
          console.log('mouseover')
        },
      },
      // 'hi ' + this.msg
      // string 类型
      // 'hi，mini-vue'
      // array 类型
      // [h('p', { class: 'red' }, 'hi'), h('p', { class: 'blue' }, 'mini-vue')]
      [h('div', {}, 'hi ' + this.msg), h(Foo, { count: 2 })]
    )
  },

  setup() {
    return {
      msg: 'mini-vue-hi',
    }
  },
}
