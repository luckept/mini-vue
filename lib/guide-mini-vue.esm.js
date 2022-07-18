const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // 实现 setupState 中获取值
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
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
    instance.proxy = new Proxy({
        _: instance,
    }, PublicInstanceProxyHandlers);
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
    // shapeFlags 它可以标识
    const { ShapeFlag } = vnode;
    if (ShapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        processElement(vnode, rootContainer);
    }
    else if (ShapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        processComponent(vnode, rootContainer);
    }
}
function processElement(vnode, rootContainer) {
    // init update
    mountElement(vnode, rootContainer);
}
function mountElement(vnode, rootContainer) {
    const el = (vnode.el = document.createElement(vnode.type));
    const { props, children, ShapeFlag } = vnode;
    // text_children
    if (ShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (ShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        // array_children
        mountChildren(vnode, el);
    }
    for (const key in props) {
        const val = props[key];
        // 具体的 click
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const eventName = key.slice(2).toLowerCase();
            el.addEventListener(eventName, val);
        }
        else {
            el.setAttribute(key, val);
        }
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
function mountComponent(initialVnode, rootContainer) {
    const instance = createComponentInstance(initialVnode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVnode, rootContainer);
}
function setupRenderEffect(instance, initialVnode, rootContainer) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, rootContainer);
    initialVnode.el = subTree.el;
}

function createVnode(type, props, children) {
    // 处于形成核心 vnode 的过程之中
    const vnode = {
        type,
        props,
        children,
        el: null,
        ShapeFlag: getShapeFlags(type),
    };
    // children
    if (typeof children === 'string') {
        vnode.ShapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.ShapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlags(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
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
