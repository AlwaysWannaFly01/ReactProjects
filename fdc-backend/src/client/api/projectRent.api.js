import qs from 'qs'
import req from './makeRequest'

// 加载对比数据API
export function fetchAreaDict(cityId) {
  return req({
    url: '/fdc/districts/area',
    data: { cityId },
    method: 'GET'
  })
}

// 加载对比数据API
export function fetchCompareData(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/projectRent?${params}`,
    method: 'GET'
  })
}

// 加载基准数据API   只看基准租金列表
export function fetchBaseData(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/projectRent/list/baseRent?${params}`,
    method: 'GET'
  })
}

// 加载案例均价数据API   只看案例租金列表
export function fetchCaseData(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/projectRent/list/caseRent?${params}`,
    method: 'GET'
  })
}

// 加载楼盘租金租售比历史列表
export function fetchRentRatioHistoryData(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/projectPriceRentRate/history/priceRentRate?${params}`,
    method: 'GET'
  })
}

// 加载楼盘租金租售比列表
export function fetchRentRatioData(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/projectPriceRentRate/list/priceRentRate?${params}`,
    method: 'GET'
  })
}

// 查询基准房价详情   基准租金详情
export function queryBasePriceDetail(params) {
  return req({
    url: '/fdc/projectRent/baseRent/detail',
    data: params,
    method: 'GET'
  })
}

// 加载来源字典
export function getPriceSource() {
  return req({
    url: '/fdc/dict/priceSourceType',
    method: 'GET'
  })
}

// 案例租金详情
export function fetchCaseAvgDetail(params) {
  return req({
    url: '/fdc/projectRent/caseRent/detail',
    data: params,
    method: 'GET'
  })
}

// S 基准租金历史数据页
// 2019/5/28修改多余的一个接口，楼盘没权限的时候
export function getAllDetail({ projectId, cityId }) {
  return req({
    url: `/fdc/projects/msg/${projectId}`,
    data: {
      cityId
    }
  })
}

// 基准租金历史列表
export function fetchBasePriceHistory(params) {
  return req({
    url: '/fdc/projectRent/history/baseRent',
    data: params,
    method: 'GET'
  })
}
// E 基准租金历史数据页
// S 案例租金历史数据页
// 查询案例租金历史列表
export function fetchCasePriceHistory(params) {
  return req({
    url: '/fdc/projectRent/history/caseRent',
    data: params,
    method: 'GET'
  })
}
// E 案例租金历史数据页

// 添加楼盘租金租售比
export function addRentRatio(params) {
  return req({
    url: '/fdc/projectPriceRentRate/addOrUpdate',
    data: params,
    method: 'POST'
  })
}

// 添加楼盘租金案例数据
export function addCaseRent(params) {
  return req({
    url: '/fdc/projectRent/caseRent/addOrUpdate',
    data: params,
    method: 'POST'
  })
}

// 获取楼盘租金租售比详情
export function getRentRatioDetail(params) {
  return req({
    url: '/fdc/projectPriceRentRate/priceRentRate/detail',
    data: params,
    method: 'GET'
  })
}
// 根据月份获取楼盘租售比详情
export function getMonthToRentRatio(params) {
  return req({
    url: '/fdc/projectPriceRentRate/detail/month',
    data: params
  })
}

// 根据月份获取基准租金详情 WY
export function getMonthToBase(params) {
  return req({
    url: '/fdc/projectRent/baseRent/detail',
    data: params
  })
}

export function getMonthToCase(params) {
  return req({
    url: '/fdc/projectRent/caseRent/detail',
    data: params
  })
}

// 根据月份获取案例均价详情 WY
export function getMonthToDetail(params) {
  return req({
    url: '/fdc/projectRent/caseRent/detail',
    data: params
  })
}

// S 保存按钮
// 保存基准租金数据
export function saveBasePriceDetail(formData) {
  return req({
    url: '/fdc/projectRent/update/baseRent',
    data: formData,
    method: 'PUT'
  })
}

// 基准房价新增编辑 WY
export function addBaseHistory(params) {
  return req({
    url: '/fdc/projectRent/baseRent/addOrUpdate',
    method: 'POST',
    data: params
  })
}

// 案例租金编辑
export function saveCaseAvg(params) {
  return req({
    url: '/fdc/projectRent/caseRent/addOrUpdate',
    data: params,
    method: 'POST'
  })
}

// 案例均价历史编辑
export function saveCaseAvgHistory(params) {
  return req({
    url: '/fdc/projectRent/caseRent/addOrUpdate',
    data: params,
    method: 'POST'
  })
}

// 案例租金新增
export function addAvgHistory(params) {
  return req({
    url: '/fdc/projectRent/caseRent/addOrUpdate',
    method: 'POST',
    data: params
  })
}

// E 保存按钮
// 导出楼盘租金租售比历史
export function exportRentRatioHistory(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/excel/projectRentPriceRate/history/export/async?${params}`,
    method: 'GET'
  })
}

// 导出楼盘租金租售比
export function exportRentRatio(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/excel/projectRentPriceRate/export/async?${params}`,
    method: 'GET'
  })
}

// 导出楼盘均价数据
export function exportHouseCaseAvg(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/excel/rent/export/async?${params}`,
    method: 'GET'
  })
}

// 基准租金历史导出(异步)
export function exportBaseAvgHistory(formData) {
  return req({
    url: '/fdc/excel/rent/base/history/export/async',
    data: formData,
    method: 'GET'
  })
}

// 导入案例均价历史数据
export function exportCaseAvgHistory(formData) {
  return req({
    url: '/fdc/excel/rent/case/history/export/async',
    data: formData,
    method: 'GET'
  })
}

// 获取租金价格系数填充修正值
export function getRentRateCorrection(formData) {
  return req({
    url: '/fdc/projectRent/rentRateCorrection',
    data: formData,
    method: 'GET'
  })
}
// 租金价格系数填充修正值编辑
export function setRentRateCorrection(params) {
  return req({
    url: '/fdc/projectRent/rentRateCorrection',
    data: params,
    method: 'POST'
  })
}
