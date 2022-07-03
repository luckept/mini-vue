import { reactive, isReactive } from '../reactive'

describe('reactive', () => {
  it('happy path ', () => {
    let original = { foo: 1 }
    let observed = reactive(original)
    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)
    expect(isReactive(observed)).toBe(true)
  })
})
