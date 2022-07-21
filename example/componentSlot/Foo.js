import { h, renderSlots } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
  setup() {
    return {}
  },
  render() {
    const age = 20
    const foo = h('p', {}, 'Foo')
    return h('p', {}, [
      renderSlots(this.$slots, 'header', {
        age,
      }),
      foo,
      renderSlots(this.$slots, 'footer'),
    ])
  },
}
