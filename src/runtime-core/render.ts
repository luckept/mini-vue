import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'

export function render(vnode, rootContainer) {
  patch(vnode, rootContainer)
}

function patch(vnode, rootContainer) {
  // 去处理组件
  // 判断是不是 element，是的话去 mountElement
  // shapeFlags 它可以标识
  const { ShapeFlag } = vnode
  if (ShapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, rootContainer)
  } else if (ShapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, rootContainer)
  }
}

function processElement(vnode: any, rootContainer: any) {
  // init update
  mountElement(vnode, rootContainer)
}

function mountElement(vnode: any, rootContainer: any) {
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

function mountComponent(initialVnode: any, rootContainer: any) {
  const instance = createComponentInstance(initialVnode)
  setupComponent(instance)
  setupRenderEffect(instance, initialVnode, rootContainer)
}

function setupRenderEffect(instance: any, initialVnode, rootContainer) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, rootContainer)
  initialVnode.el = subTree.el
}
