// 附属房屋 API
import qs from 'qs'
import makeRequest from './makeRequest'

// 附属房屋算法列表
export function getSubHouseList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/subHouse?${data}`
  })
}

// 附属房屋新增
export function addAttachedHouse(data) {
  return makeRequest({
    url: '/fdc/subHouse',
    method: 'POST',
    data
  })
}

// 附属房屋算法类型导出
export function exportAttachedHouse(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/subHouse/export/async?${data}`,
    method: 'get'
  })
}

// 删除
export function delAttachedHouse(data) {
  return makeRequest({
    url: '/fdc/subHouse',
    method: 'DELETE',
    data
  })
}

// 附属房屋 计算方法 修改
export function editAttachedHouse(data) {
  return makeRequest({
    url: '/fdc/subHouse',
    method: 'PUT',
    data
  })
}
