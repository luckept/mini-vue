import { camelize, toHandlerKey } from '../shared/index'

export function emit(instance, event, ...args) {
  console.log('emit', event)
  // instance.props -> event
  const { props } = instance

  const hander = props[toHandlerKey(camelize(event))]
  hander && hander(...args)
}
