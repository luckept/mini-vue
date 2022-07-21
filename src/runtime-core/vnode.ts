import { ShapeFlags } from '../shared/ShapeFlags'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export function createVnode(type, props?, children?) {
  // 处于形成核心 vnode 的过程之中
  const vnode = {
    type,
    props,
    children,
    el: null,
    ShapeFlag: getShapeFlags(type),
  }

  // children
  if (typeof children === 'string') {
    vnode.ShapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.ShapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  // 组件类型，并且它的 children 必须是一个组件类型
  if (vnode.ShapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === 'object') {
      vnode.ShapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }
  return vnode
}

export function createTextVNode(text: string) {
  return createVnode(Text, {}, text)
}

function getShapeFlags(type) {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}
