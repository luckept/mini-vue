import { createRender } from '../runtime-core'

function createElement(type) {
  // console.log('createElement ===================')
  return document.createElement(type)
}
function patchProp(el, key, val) {
  // 具体的 click
  // console.log('patchProp ===================')
  const isOn = (key: string) => /^on[A-Z]/.test(key)
  if (isOn(key)) {
    const eventName = key.slice(2).toLowerCase()
    el.addEventListener(eventName, val)
  } else {
    el.setAttribute(key, val)
  }
}
function insert(el, parent) {
  // console.log('insert ===================')
  parent.append(el)
}

const renderer: any = createRender({
  createElement,
  patchProp,
  insert,
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from '../runtime-core'
