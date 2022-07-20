import { ShapeFlags } from '../shared/ShapeFlags'

export function initSlots(instance, children) {
  // instance.slots = Array.isArray(children) ? children : [children]
  const { vnode } = instance
  if (vnode.ShapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(instance.slots, children)
  }
}

function normalizeObjectSlots(slots, children) {
  for (const key in children) {
    const value = children[key]
    // 这个地方的 Array.isArray 判断的是 value 数据结构，如果是数组，那么就是我们要渲染的 vnode 数组，如果不是，则包装一个数组，方便我们的 children 去遍历渲染
    slots[key] = (props) => normalizeSlotValue(value(props))
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value]
}
