/*
* 用于项目中 Select 中value为 Number、null、undefined、0
* 将 value 转换为 string
* FUNC
* author: YJF
*/

const INFINITY = 1 / 0

function formatString(value) {
  if (value === null || value === undefined) {
    return undefined
  }

  if (typeof value === 'string') {
    return value
  }

  const result = `${value}`
  return result === '0' && 1 / value === -INFINITY ? '-0' : result
}

export default formatString
