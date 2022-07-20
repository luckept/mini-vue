import { hasOwn } from '../shared/index'

const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
  // $slots
  $slots: (i) => i.slots,
}

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    // 实现 setupState 中获取值
    const { setupState, props } = instance
    if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (hasOwn(props, key)) {
      return props[key]
    }
    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  },
}
