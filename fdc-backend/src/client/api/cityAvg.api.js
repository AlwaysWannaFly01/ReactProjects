// 数据统计 / 城市均价
import qs from 'qs'
import makeRequest from './makeRequest'

// 城市均价列表
export function getCityAvgPrice(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/cityAvgPrice?${data}`
  })
}

// 城市均价新增
export function addCityAvgPrice(params) {
  return makeRequest({
    url: '/fdc/cityAvgPrice',
    method: 'POST',
    data: params
  })
}

// 城市均价编辑
export function editCityAvgPrice(params) {
  return makeRequest({
    url: '/fdc/cityAvgPrice',
    method: 'PUT',
    data: params
  })
}

// 城市均价详情
export function getCityAvgPriceDetail(id) {
  return makeRequest({
    url: `/fdc/cityAvgPrice/${id}`
  })
}

// 查询上个月均价
export function getLastMonthCityAvgPrice(params) {
  return makeRequest({
    url: '/fdc/cityAvgPrice/last',
    data: params
  })
}

// 城市均价异步导出
export function exportCityAvgPrice(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/cityAvgPrice/export/async?${data}`
  })
}

// 根据月份查询均价
export function cityAvgPriceMonth(params) {
  return makeRequest({
    url: '/fdc/cityAvgPrice/queryByMonth',
    data: params,
    method: 'GET',
  })
}
