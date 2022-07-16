import { isObject } from '../shared'
import { track, trigger } from './effect'
import { reactive, ReactiveFlags, readonly } from './reactive'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    }
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }

    const res = Reflect.get(target, key)
    // 看看 res 是不是 object
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }
    if (!isReadonly) {
      track(target, key)
    }
    return res
  }
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    trigger(target, key)
    return res
  }
}

export const mutableHandler = {
  get,
  set,
}

export const readonlyHandler = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`key: ${key} set 失败，因为 target 是 readonly`)
    return true
  },
}
