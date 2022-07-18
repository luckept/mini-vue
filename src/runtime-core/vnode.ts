import { ShapeFlags } from '../shared/ShapeFlags'

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
  return vnode
}

function getShapeFlags(type) {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}
