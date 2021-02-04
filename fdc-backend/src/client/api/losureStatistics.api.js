// 数据统计 / 城市均价
import qs from 'qs'
import makeRequest from './makeRequest'

// 获取区域租售比历史列表数据
export function getAreaRentalHistoryList(params) {
  return makeRequest({
    url: '/fdc/cityRentPriceRate/history/priceRentRate',
    method: 'GET',
    data: params
  })
}

// 法拍统计列表数据
export function getLosureStatisticsList(params) {
  return makeRequest({
    url: '/fdc/foreclosureCaseStat',
    method: 'GET',
    data: params
  })
}

// 法拍案例数据统计-导出
export function exportLosureStatistics(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/foreclosureCaseStat/foreclosureCaseStatExcelExport/async?${data}`
  })
}

// 新增或编辑区域租售比表单
export function saveAreaRental(params) {
  return makeRequest({
    url: '/fdc/cityRentPriceRate/addOrUpdate',
    method: 'POST',
    data: params
  })
}

// 保存区域租售比详情-历史
export function saveAreaRentalHistory(params) {
  return makeRequest({
    url: '/fdc/cityAvgPrice',
    method: 'POST',
    data: params
  })
}

// 获取区域租售比详情
export function areaRentalDetail(params) {
  return makeRequest({
    url: '/fdc/cityRentPriceRate/priceRentRate/detail',
    data: params,
    method: 'GET'
  })
}

// 根据月份改变获取区域租售比详情
export function getAreaRentalDetail(params) {
  return makeRequest({
    url: '/fdc/cityRentPriceRate/detail/month',
    data: params,
    method: 'GET'
  })
}

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

// 查询上个月均价
export function getLastMonthCityAvgPrice(params) {
  return makeRequest({
    url: '/fdc/cityAvgPrice/last',
    data: params
  })
}

// 区域租售比历史-导出
export function exportAreaRentalHistory(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/excel/cityRentPriceRate/history/export/async?${data}`
  })
}

