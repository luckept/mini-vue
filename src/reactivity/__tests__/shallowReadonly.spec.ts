import { isReadonly, shallowReadonly } from '../reactive'

describe('shallowReadonly', () => {
  test('should not make non-reactive properties reactive', () => {
    const props = shallowReadonly({ n: { foo: 1 } })
    expect(isReadonly(props)).toBe(true)
    // 判断是否为响应式对象，而不是判断是否为 readonly
    expect(isReadonly(props.n)).toBe(false)
  })

  it('should call console.warn when set', () => {
    // console.warn()
    // mock
    console.warn = jest.fn()

    const user = shallowReadonly({
      age: 10,
    })

    user.age = 11

    expect(console.warn).toBeCalled()
  })
})
