import { createVnode } from './vnode'

export function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // component -> vnode
        // vue 会先将所有的东西都转换成 vnode，后续操作，都基于 vnode 去处理
        const vnode = createVnode(rootComponent)
        render(vnode, rootContainer)
      },
    }
  }
}
