export function createVnode(type, props?, children?) {
  // 处于形成核心 vnode 的过程之中
  const vnode = {
    type,
    props,
    children,
  }
  return vnode
}
