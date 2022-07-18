import { createComponentInstance, setupComponent } from './component'

export function render(vnode, rootContainer) {
  patch(vnode, rootContainer)
}

function patch(vnode, rootContainer) {
  // 去处理组件

  // 判断是不是 element，是的话去 mountElement
  processComponent(vnode, rootContainer)
}

function processComponent(vnode: any, rootContainer: any) {
  mountComponent(vnode, rootContainer)
}

function mountComponent(vnode: any, rootContainer: any) {
  const instance = createComponentInstance(vnode, rootContainer)
  setupComponent(instance)
  setupRenderEffect(instance, rootContainer)
}

function setupRenderEffect(instance: any, rootContainer) {
  const subTree = instance.render()
  patch(subTree, rootContainer)
}
