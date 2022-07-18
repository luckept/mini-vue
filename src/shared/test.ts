// 0 代表不是，1 代表是
const ShapeFlags = {
  element: 0,
  statefule_component: 0,
  text_children: 0,
  array_children: 0,
}

// vnode ->
// 可以设置，修改
ShapeFlags.statefule_component = 1
ShapeFlags.array_children = 1

// 查找
if (ShapeFlags.element) {
}

// 不够高效 -> 位运算
// 0000
// 0001 -> element
// 0010 -> stateful
// 0100 -> text_children
// 1000 -> array_children

// 多位也行
// 1010 又是一个 stateful 又是一个 array_children

// | (两位都为 0，才为0)
// & (两位都为 1，才为1)

// 修改 ｜

// 查找 &
