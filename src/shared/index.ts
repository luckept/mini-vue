export const extend = Object.assign

export const isObject = (val) => {
  return val !== null && typeof val === 'object'
}

export const hasChanged = (val, newValue) => !Object.is(val, newValue)

export const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key)

// TPP
// 先去写一个特定的行为，再慢慢把它给重构成通用的行为
// add -> 首字母大写
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : ''
  })
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase().concat(str.slice(1))
}

export const toHandlerKey = (str) => {
  return str ? 'on'.concat(capitalize(str)) : ''
}
