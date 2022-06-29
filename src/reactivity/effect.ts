import { extend } from "../shared"

class ReactiveEffect {
  private _fn: any
  active = true
  deps = []
  constructor(fn, public scheduler?, public onStop?) {
    this._fn = fn
  }
  run() {
    activeEffect = this
    return this._fn()
  }
  stop() {
    if (this.active) {
      cleanUpEffect(this)
      this.onStop?.()
      this.active = false
    }
  }
}

function cleanUpEffect (effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}

const targetMap = new Map()
export function track (target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  if (!activeEffect) return
  
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target)
  let deps = depsMap.get(key)
  for (let effect of deps) {
    if(effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

let activeEffect
export function effect (fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn)
  extend(_effect, options)
  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

export function stop (runner) {
  runner.effect.stop()
}