import qs from 'qs'
import makeRequest from './makeRequest'

// 行政区列表
export function getDistrictAreas({ searchAreaList }) {
  return makeRequest({
    url: '/fdc/districts/area',
    data: searchAreaList
  })
}

// 价格预警统计列表
export function priceWarning({ param }) {
  return makeRequest({
    url: '/fdc/priceWarning',
    data: param
  })
}

// 价格预警统计异步导出
export function priceWarningExport({ param }) {
  return makeRequest({
    url: '/fdc/priceWarning/export/async',
    data: param
  })
}
// 获取常用城市和所有城市
export function getVisitCities() {
  return makeRequest({
    url: '/fdc/visitCities'
  })
}
