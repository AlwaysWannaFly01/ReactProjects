// 对比
import qs from 'qs'
import req from './makeRequest'

// 加载对比数据API
function fetchAreaDict(cityId) {
  return req({
    url: '/fdc/districts/area',
    data: { cityId },
    method: 'GET'
  })
}

// 加载对比数据API
function fetchCompareData(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/projectAvg?${params}`,
    method: 'GET'
  })
}

// 加载案例均价数据API
function fetchCaseData(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/projectAvg/list/avg?${params}`,
    method: 'GET'
  })
}

// 加载基准数据API
function fetchBaseData(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/projectAvg/list/weight?${params}`,
    method: 'GET'
  })
}

// 导出楼盘均价数据
function exportHouseAvg(formData) {
  // debugger
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/excel/avg?${params}`,
    responseType: 'arraybuffer',
    method: 'GET'
  })
}

// 加载导入日志
function fetchImportLogs() {
  return req({
    url: '/fxt/house/zone/avg/import/log',
    method: 'GET'
  })
}

export default {
  exportHouseAvg,
  fetchAreaDict, // 行政区字典
  fetchCompareData,
  fetchBaseData,
  fetchCaseData,
  fetchImportLogs
}
