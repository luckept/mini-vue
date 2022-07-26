'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
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
    // 组件类型，并且它的 children 必须是一个组件类型
    if (vnode.ShapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.ShapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVnode(Text, {}, text);
}
function getShapeFlags(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVnode(Fragment, {}, slot(props));
        }
    }
}

const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const hasChanged = (val, newValue) => !Object.is(val, newValue);
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

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler, onStop) {
        this.scheduler = scheduler;
        this.onStop = onStop;
        this.active = true;
        this.deps = [];
        this._fn = fn;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        var _a;
        if (this.active) {
            cleanUpEffect(this);
            (_a = this.onStop) === null || _a === void 0 ? void 0 : _a.call(this);
            this.active = false;
        }
    }
}
function cleanUpEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
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
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn);
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
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
        if (!isReadonly) {
            track(target, key);
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

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // 对比的时候应该是两个普通的对象进行对比
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue;
            this._value = convert(newValue);
            triggerEffects(this.dep);
        }
    }
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        },
    });
}

function emit(instance, event, ...args) {
    // console.log('emit', event)
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
    // $slots
    $slots: (i) => i.slots,
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

function initSlots(instance, children) {
    // instance.slots = Array.isArray(children) ? children : [children]
    const { vnode } = instance;
    if (vnode.ShapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(instance.slots, children);
    }
}
function normalizeObjectSlots(slots, children) {
    for (const key in children) {
        const value = children[key];
        // 这个地方的 Array.isArray 判断的是 value 数据结构，如果是数组，那么就是我们要渲染的 vnode 数组，如果不是，则包装一个数组，方便我们的 children 去遍历渲染
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    // console.log('parent', parent)
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { },
        slots: {},
        parent,
        subTree: {},
        provides: parent ? parent.provides : {},
        isMounted: false,
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({
        _: instance,
    }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function Object
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    // 存
    // key value 存在哪里
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const { parent } = currentInstance;
        const parentProvides = parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // component -> vnode
                // vue 会先将所有的东西都转换成 vnode，后续操作，都基于 vnode 去处理
                const vnode = createVnode(rootComponent);
                render(vnode, rootContainer);
            },
        };
    };
}

function createRender(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;
    function render(vnode, rootContainer) {
        patch(null, vnode, rootContainer, null);
    }
    function patch(n1, n2, container, parentComponent) {
        // 去处理组件
        // 判断是不是 element，是的话去 mountElement
        // shapeFlags 它可以标识
        const { type, ShapeFlag } = n2;
        // Fragment -> 只渲染 children
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (ShapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (ShapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
        }
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function processElement(n1, n2, container, parentComponent) {
        // init update
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            pacthElement(n1, n2);
        }
    }
    function pacthElement(n1, n2, container) {
        console.log('patch');
        console.log('n1', n1);
        console.log('n2', n2);
        // element 对比
    }
    function mountElement(vnode, container, parentComponent) {
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { props, children, ShapeFlag } = vnode;
        // text_children
        if (ShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (ShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            // array_children
            mountChildren(vnode, el, parentComponent);
        }
        for (const key in props) {
            const val = props[key];
            // 具体的 click
            // const isOn = (key: string) => /^on[A-Z]/.test(key)
            // if (isOn(key)) {
            //   const eventName = key.slice(2).toLowerCase()
            //   el.addEventListener(eventName, val)
            // } else {
            //   el.setAttribute(key, val)
            // }
            hostPatchProp(el, key, val);
        }
        hostInsert(el, container);
        // container.append(el)
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach((vnode) => {
            patch(null, vnode, container, parentComponent);
        });
    }
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVnode, container, parentComponent) {
        const instance = createComponentInstance(initialVnode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVnode, container);
    }
    function setupRenderEffect(instance, initialVnode, container) {
        effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                console.log(subTree);
                patch(null, subTree, container, instance);
                initialVnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log('update');
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppAPI(render),
    };
}

function createElement(type) {
    // console.log('createElement ===================')
    return document.createElement(type);
}
function patchProp(el, key, val) {
    // 具体的 click
    // console.log('patchProp ===================')
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, val);
    }
    else {
        el.setAttribute(key, val);
    }
}
function insert(el, parent) {
    // console.log('insert ===================')
    parent.append(el);
}
const renderer = createRender({
    createElement,
    patchProp,
    insert,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.createApp = createApp;
exports.createRender = createRender;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
