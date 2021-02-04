// 房产数据 / 住宅 / 案例基础数据 API
import qs from 'qs'
import makeRequest from './makeRequest'

// 行政区列表
export function getAreaList(cityId) {
  return makeRequest({
    url: '/fdc/districts/area',
    data: { cityId }
  })
}

// 案列类型列表
export function getCaseTypeList() {
  return makeRequest({
    url: '/fdc/dict/caseType'
  })
}

// 查询案例列表接口
export function fetchCaseList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/case?${data}`
  })
}

// 获取别名类型
export function getAliaType() {
  return makeRequest({
    url: '/fdc/dict/aliasType'
  })
}

// 保存新增CASE 数据
export function addCase(params) {
  return makeRequest({
    url: '/fdc/case',
    data: params,
    method: 'POST'
  })
}

// 更新 CASE 数据
export function editCase(params) {
  return makeRequest({
    url: '/fdc/case',
    data: params,
    method: 'PUT'
  })
}

// 获取案例详情
export function getCaseDetail({ caseId, cityId }) {
  return makeRequest({
    url: `/fdc/case/${caseId}`,
    params: { cityId }
  })
}

// 删除案例
export function deleteCases({ ids, cityId }) {
  return makeRequest({
    url: '/fdc/case',
    data: { ids, cityId },
    method: 'DELETE'
  })
}

// 一键删除案例
export function deleteAllCases(delParams) {
  const data = qs.stringify(delParams, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/case/deleteByQueryAll?${data}`,
    method: 'DELETE'
  })
}

// 导出案例数据
export function exportCase(exportParams) {
  const data = qs.stringify(exportParams, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/case/caseExcelExport/async?${data}`
    // responseType: 'arraybuffer'
  })
}
