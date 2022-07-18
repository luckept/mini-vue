import { isObject } from './../shared/index'
import { createComponentInstance, setupComponent } from './component'

export function render(vnode, rootContainer) {
  patch(vnode, rootContainer)
}

function patch(vnode, rootContainer) {
  // 去处理组件
  // 判断是不是 element，是的话去 mountElement
  if (typeof vnode.type === 'string') {
    processElement(vnode, rootContainer)
  } else if (isObject(vnode.type)) {
    processComponent(vnode, rootContainer)
  }
}

function processElement(vnode: any, rootContainer: any) {
  // init update
  mountElement(vnode, rootContainer)
}

function mountElement(vnode: any, rootContainer: any) {
  const el = document.createElement(vnode.type)
  const { props, children } = vnode
  if (typeof children === 'string') {
    el.textContent = children
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el)
  }
  for (const key in props) {
    const val = props[key]
    el.setAttribute(key, val)
  }
  rootContainer.append(el)
}

function mountChildren(vnode, container) {
  vnode.children.forEach((vnode) => {
    patch(vnode, container)
  })
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
