import { effect } from '../reactivity/effect'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'

export function createRender(options) {
  const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options

  function render(vnode, rootContainer) {
    patch(null, vnode, rootContainer, null)
  }

  function patch(n1, n2, container, parentComponent) {
    // 去处理组件
    // 判断是不是 element，是的话去 mountElement
    // shapeFlags 它可以标识
    const { type, ShapeFlag } = n2
    // Fragment -> 只渲染 children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (ShapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        } else if (ShapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
        }
    }
  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processFragment(n1, n2, container: any, parentComponent) {
    mountChildren(n2, container, parentComponent)
  }

  function processElement(n1, n2, container: any, parentComponent) {
    // init update
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      pacthElement(n1, n2, container)
    }
  }

  function pacthElement(n1: any, n2: any, container: any) {
    console.log('patch')
    console.log('n1', n1)
    console.log('n2', n2)

    // element 对比
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    const el = (vnode.el = hostCreateElement(vnode.type))
    const { props, children, ShapeFlag } = vnode
    // text_children
    if (ShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (ShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // array_children
      mountChildren(vnode, el, parentComponent)
    }
    for (const key in props) {
      const val = props[key]
      // 具体的 click
      // const isOn = (key: string) => /^on[A-Z]/.test(key)
      // if (isOn(key)) {
      //   const eventName = key.slice(2).toLowerCase()
      //   el.addEventListener(eventName, val)
      // } else {
      //   el.setAttribute(key, val)
      // }
      hostPatchProp(el, key, val)
    }
    hostInsert(el, container)
    // container.append(el)
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((vnode) => {
      patch(null, vnode, container, parentComponent)
    })
  }

  function processComponent(n1, n2, container: any, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }

  function mountComponent(initialVnode: any, container: any, parentComponent) {
    const instance = createComponentInstance(initialVnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initialVnode, container)
  }

  function setupRenderEffect(instance: any, initialVnode, container) {
    effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance
        const subTree = (instance.subTree = instance.render.call(proxy))
        console.log(subTree)
        patch(null, subTree, container, instance)
        initialVnode.el = subTree.el
        instance.isMounted = true
      } else {
        console.log('update')
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree
        patch(prevSubTree, subTree, container, instance)
      }
    })
  }

  return {
    createApp: createAppAPI(render),
  }
}
