import { mutableHandler, readonlyHandler } from './baseHandlers'

export function reactive(raw) {
  return createActiveObject(raw, mutableHandler)
}

export function isReactive(value) {
  return value['is_reactive']
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandler)
}

function createActiveObject(raw: any, baseHandlers) {
  return new Proxy(raw, baseHandlers)
}
