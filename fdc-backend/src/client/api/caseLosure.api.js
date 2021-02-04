// 房产数据 / 住宅 /  法拍案例数据 API
import qs from 'qs'
import makeRequest from './makeRequest'

// 行政区列表
export function getAreaList(cityId) {
  return makeRequest({
    url: '/fdc/districts/area',
    data: { cityId }
  })
}

//模糊查询楼盘名称列表
export function fetchProjectsList(params) {
  return makeRequest({
    url: '/fdc/projects/search',
    data: params
  })
}

// 法拍案列类型列表
export function  getClosureCaseTypeList() {
  return makeRequest({
    url: '/fdc/dict/foreclosureCaseTypeCode'
  })
}

//法拍售卖类型
export function  getEndReasonCode() {
  return makeRequest({
    url: '/fdc/dict/endReasonCode'
  })
}

// 法拍案例列表
export function fetchCaseList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/foreclosureCase?${data}`
  })
}

// 保存新增法拍案例数据
export function addCase(params) {
  return makeRequest({
    url: '/fdc/foreclosureCase',
    data: params,
    method: 'POST'
  })
}

// 更新 CASE 数据
export function editCase(params) {
  return makeRequest({
    url: '/fdc/foreclosureCase',
    data: params,
    method: 'PUT'
  })
}

// 获取案例详情
export function getCaseDetail({ caseId, cityId }) {
  return makeRequest({
    url: `/fdc/foreclosureCase/${caseId}`,
    data: {
      cityId
    }
  })
}

// 删除案例
export function deleteCases({ ids, cityId }) {
  return makeRequest({
    url: '/fdc/foreclosureCase',
    data: { ids, cityId },
    method: 'DELETE'
  })
}

// 一键删除案例
export function deleteAllCases(delParams) {
  const data = qs.stringify(delParams, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/foreclosureCase/deleteByQueryAll?${data}`,
    method: 'DELETE'
  })
}

// 法拍案例导出
export function exportCase(exportParams) {
  const data = qs.stringify(exportParams, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/foreclosureCase/foreclosureCaseExcelExport/async?${data}`
    // responseType: 'arraybuffer'
  })
}
