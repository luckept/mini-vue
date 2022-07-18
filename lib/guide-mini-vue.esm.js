const isObject = (val) => {
    return val !== null && typeof val === 'object';
};

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
    patch(vnode, rootContainer);
}
function patch(vnode, rootContainer) {
    // 去处理组件
    // 判断是不是 element，是的话去 mountElement
    if (typeof vnode.type === 'string') {
        processElement(vnode, rootContainer);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, rootContainer);
    }
}
function processElement(vnode, rootContainer) {
    // init update
    mountElement(vnode, rootContainer);
}
function mountElement(vnode, rootContainer) {
    const el = document.createElement(vnode.type);
    const { props, children } = vnode;
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    rootContainer.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach((vnode) => {
        patch(vnode, container);
    });
}
function processComponent(vnode, rootContainer) {
    mountComponent(vnode, rootContainer);
}
function mountComponent(vnode, rootContainer) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, rootContainer);
}
function setupRenderEffect(instance, rootContainer) {
    const subTree = instance.render();
    patch(subTree, rootContainer);
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
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

export { createApp, h };
