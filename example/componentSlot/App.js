import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  name: 'App',
  render() {
    const app = h('div', {}, 'App')
    const foo = h(
      Foo,
      {},
      { header: ({ age }) => [h('p', {}, '123' + age), h('h1', {}, 'header_h1')], footer: () => h('p', {}, '456') }
    )
    return h('div', {}, [app, foo])
  },
  setup() {
    return {}
  },
}
