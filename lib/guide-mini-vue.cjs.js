'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
// TPP
// 先去写一个特定的行为，再慢慢把它给重构成通用的行为
// add -> 首字母大写
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase().concat(str.slice(1));
};
const toHandlerKey = (str) => {
    return str ? 'on'.concat(capitalize(str)) : '';
};

const targetMap = new Map();
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (let effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        }
        if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 看看 res 是不是 object
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandler = {
    get,
    set,
};
const readonlyHandler = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key: ${key} set 失败，因为 target 是 readonly`);
        return true;
    },
};
const shallowReadonlyHandler = extend({}, readonlyHandler, {
    get: shallowReadonlyGet,
});

var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isReadonly";
})(ReactiveFlags || (ReactiveFlags = {}));
function reactive(raw) {
    return createActiveObject(raw, mutableHandler);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandler);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandler);
}
function createActiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        console.warn(`target ${target} 必须是一个对象`);
        return target;
    }
    return new Proxy(target, baseHandlers);
}

function emit(instance, event, ...args) {
    console.log('emit', event);
    // instance.props -> event
    const { props } = instance;
    const hander = props[toHandlerKey(camelize(event))];
    hander && hander(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps !== null && rawProps !== void 0 ? rawProps : {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // 实现 setupState 中获取值
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
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
        props: {},
        emit: () => { },
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
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
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
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

exports.createApp = createApp;
exports.h = h;
