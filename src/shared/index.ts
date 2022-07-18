export const extend = Object.assign

export const isObject = (val) => {
  return val !== null && typeof val === 'object'
}

export const hasChanged = (val, newValue) => !Object.is(val, newValue)

export const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key)
