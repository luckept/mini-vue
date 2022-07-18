'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createComponentInstance(vnode, rootContainer) {
    const component = {
        vnode,
        type: vnode.type,
    };
    return component;
}
function setupComponent(instance) {
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function Object
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}

function render(vnode, rootContainer) {
    patch(vnode);
}
function patch(vnode, rootContainer) {
    // 去处理组件
    // TODO 判断 vnode 是不是一个 elment
    // 判断是不是 element，是的话去 mountElement
    // processElement()
    processComponent(vnode);
}
function processComponent(vnode, rootContainer) {
    mountComponent(vnode);
}
function mountComponent(vnode, rootContainer) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, rootContainer) {
    const subTree = instance.render();
    patch(subTree);
}

function createVnode(type, props, children) {
    // 处于形成核心 vnode 的过程之中
    const vnode = {
        type,
        props,
        children,
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // component -> vnode
            // vue 会先将所有的东西都转换成 vnode，后续操作，都基于 vnode 去处理
            const vnode = createVnode(rootComponent);
            render(vnode);
        },
    };
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
