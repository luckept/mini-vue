import { mutableHandler, readonlyHandler } from './baseHandlers'

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}

export function reactive(raw) {
  return createActiveObject(raw, mutableHandler)
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandler)
}

function createActiveObject(raw: any, baseHandlers) {
  return new Proxy(raw, baseHandlers)
}
