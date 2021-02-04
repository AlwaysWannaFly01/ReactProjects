let deep = 0

/**
 * walkKeyPath - 递归查询指定id的数据
 *
 * @param  {Immutable.List} list 数据
 * @param  {Number} id   id
 * @param  {Number} ignoreDeep 要忽略多少层递归查找
 * @return {Array}
 */
function walkKeyPath(list, id, ignoreDeep) {
  let ret = []
  list.some((item, itemIndex) => {
    const { id: itemId, children } = item
    if (ret.length) {
      return true
    }
    if (itemId === id && deep >= ignoreDeep) {
      // index = itemIndex
      ret = [itemIndex]
    } else if (children && children.size) {
      deep += 1
      const childRet = walkKeyPath(children, id, ignoreDeep)
      // 子children没有找到数据，不能将itemIndex添加到数组
      if (childRet.length) {
        ret = [itemIndex, ...childRet]
      } else {
        ret = childRet
      }
    }
    return false
  })
  return ret
}

/**
 * findKeyPathById - 根据指定数据结构，查询到指定层次children字段
 *
 * @param  {Immutable.List} list  数据
 * @param  {Number} id    id
 * @param  {Number} ignoreDeep 要忽略多少层递归查找，默认全查询匹配
 * @return {Array}
 */
export default function findKeyPathById(list, id, ignoreDeep = 0) {
  deep = 0
  const paths = walkKeyPath(list, id, ignoreDeep)
  if (paths.length > 1) {
    const ret = []
    paths.forEach((item, itemIndex) => {
      if (itemIndex > 0 && itemIndex % 1 === 0) {
        ret.push('children')
        ret.push(item)
      } else {
        ret.push(item)
      }
    })
    return ret
  }
  return paths
}

/**
 * 递归添加key
 * 不要在React渲染过程中调用此方法
 */
const { random } = Math
export function addKey(list) {
  return list.map(item => {
    // item.key = item.id
    item.key = random().toString(36)
    if (item.children) {
      item.children = addKey(item.children)
    }
    return item
  })
}
