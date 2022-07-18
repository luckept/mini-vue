const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
}

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    // 实现 setupState 中获取值
    const { setupState } = instance
    if (key in setupState) {
      return setupState[key]
    }
    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  },
}
