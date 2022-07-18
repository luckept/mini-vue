import { h } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
  setup(props) {
    // props.count
    console.log(props)
    props.count++
  },
  render() {
    return h('div', {}, 'foo: ' + this.count)
  },
}
