import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'

export function render(vnode, rootContainer) {
  patch(vnode, rootContainer)
}

function patch(vnode, container) {
  // 去处理组件
  // 判断是不是 element，是的话去 mountElement
  // shapeFlags 它可以标识
  const { type, ShapeFlag } = vnode
  // Fragment -> 只渲染 children
  switch (type) {
    case Fragment:
      processFragment(vnode, container)
      break
    case Text:
      processText(vnode, container)
      break
    default:
      if (ShapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
      } else if (ShapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container)
      }
  }
}

function processText(vnode: any, container: any) {
  const { children } = vnode
  const textNode = (vnode.el = document.createTextNode(children))
  container.append(textNode)
}

function processFragment(vnode: any, container: any) {
  mountChildren(vnode, container)
}

function processElement(vnode: any, container: any) {
  // init update
  mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
  const el = (vnode.el = document.createElement(vnode.type))
  const { props, children, ShapeFlag } = vnode
  // text_children
  if (ShapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (ShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // array_children
    mountChildren(vnode, el)
  }
  for (const key in props) {
    const val = props[key]
    // 具体的 click
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const eventName = key.slice(2).toLowerCase()
      el.addEventListener(eventName, val)
    } else {
      el.setAttribute(key, val)
    }
  }
  container.append(el)
}

function mountChildren(vnode, container) {
  vnode.children.forEach((vnode) => {
    patch(vnode, container)
  })
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function mountComponent(initialVnode: any, container: any) {
  const instance = createComponentInstance(initialVnode)
  setupComponent(instance)
  setupRenderEffect(instance, initialVnode, container)
}

function setupRenderEffect(instance: any, initialVnode, container) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, container)
  initialVnode.el = subTree.el
}
