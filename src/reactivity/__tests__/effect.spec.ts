import { reactive } from '../reactive'
import { effect } from '../effect'

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })
    let nextAge
    
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(11)

    // update
    user.age++
    expect(nextAge).toBe(12)
  })
  
  it('should return runner when call effect', () => {
    // 1. effect(fn) 会返回一个 function，我们称之为 runner，当调用该 runner，它会再次执行传给 effect 内部的 fn，并且拿到该 fn 的返回值
    let foo = 10
    const runner = effect(() => {
      foo ++
      return 'foo'
    })
    expect(foo).toBe(11)

    const r = runner()
    expect(foo).toBe(12)
    expect(r).toBe('foo')
  });
});