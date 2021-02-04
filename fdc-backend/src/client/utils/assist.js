/**
 * FDC 公用工具方法
 */

/**
 *@param {String} key 查询对应的value
 *descrition: 获取sessionStorage的数据
 */

export function getSession(key) {
  if (!key) {
    return ''
  }
  const data = window.sessionStorage.getItem(key)
  try {
    return JSON.parse(data)
  } catch (e) {
    return data
  }
}

/**
 *@param {String} key 删除对应的value
 *descrition: 删除sessionStorage的数据
 */

export function removeSession(key) {
  if (!key) {
    return ''
  }
  return window.sessionStorage.removeItem(key)
}

/**
 * @param {any} data 要存储的数据
 *@param {String} key 要存储数据的key
 *descrition: 存储sessionStorage的数据
 */
export function setSession(key, data) {
  if (arguments.length < 2) {
    throw new SyntaxError('must provide key && data')
  }
  if (key === '' || key === undefined || key === null) {
    throw new TypeError('setSession: key must be a valid string key')
  }
  const json = JSON.stringify(data)
  window.sessionStorage.setItem(key, json)
}

/**
 * Convert a value to a string that is actually rendered.
 */
export function toString(val = '') {
  if (val === null) return ''
  return typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)
}

// 校验一些字段只能是整形数
export function toNumber(num) {
  const reg = /^-{1}$/
  const regzero = /^0-{1}$/
  if (regzero.test(num)) {
    return '-'
  }
  if (reg.test(num)) {
    return num
  }
  const val = window.parseInt(num)
  return Number.isNaN(val) ? '' : val
}

// 只能有2位小数
export function toFixed(val, len) {
  if (len !== 1) {
    len = 2
  }
  const regStr = `\\d+\\.[0-9]{${len + 1}}`
  const reg = new RegExp(regStr)
  // const reg = /\d+\.[0-9]{3,}/
  if (reg.test(val)) {
    val -= 0
    return val.toFixed(len)
  }
  return val
}

// 当前月份 yyyy-MM-dd
export function getCurMonth() {
  const data = new Date()
  const y = data.getFullYear()
  const M =
    data.getMonth() + 1 < 10 ? `0${data.getMonth() + 1}` : data.getMonth() + 1
  return `${y}-${M}-01`
}
