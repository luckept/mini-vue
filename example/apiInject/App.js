import { h, provide, inject } from '../../lib/guide-mini-vue.esm.js'

const Provider = {
  name: 'Provider',
  setup() {
    provide('foo', 'fooval')
    provide('bar', 'barval')
  },
  render() {
    return h('div', {}, [h('p', {}, 'provider'), h(Provider2)])
  },
}

const Provider2 = {
  name: 'Provider2',
  setup() {
    provide('foo', 'fooTwo')
    const foo = inject('foo')
    return {
      foo,
    }
  },
  render() {
    return h('div', {}, [h('p', {}, `providerTwo foo:${this.foo}`), h(Consumer)])
  },
}

const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('foo')
    const bar = inject('bar')
    const baz = inject('baz', 'bazDefault')
    return {
      foo,
      bar,
      baz,
    }
  },
  render() {
    return h('div', {}, `Consumer: - ${this.foo} - ${this.bar}-${this.baz}`)
  },
}

export default {
  name: 'App',
  setup() {},
  render() {
    return h('div', {}, [h('p', {}, 'apiInject'), h(Provider)])
  },
}
