// 长租公寓
import qs from 'qs'
import makeRequest from './makeRequest'

// 长租公寓案例列表
export function getRentApartCaseList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/rentApartmentCase/list?${data}`
  })
}

// 长租公寓案例页面数据字典集合
export function getRentApartmentCaseDict() {
  return makeRequest({
    url: '/fdc/dict/rentApartmentCaseDict'
  })
}

// 长租公寓案例新增
export function addRentApartCase(params) {
  return makeRequest({
    url: '/fdc/rentApartmentCase',
    method: 'POST',
    data: params
  })
}

// 长租公寓删除
export function delRentApartCase({ ids, cityId }) {
  return makeRequest({
    url: '/fdc/rentApartmentCase',
    method: 'DELETE',
    data: { ids, cityId }
  })
}

// 一键删除
export function deleteAllCases(delParams) {
  const data = qs.stringify(delParams, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/rentApartmentCase/deleteAll?${data}`,
    method: 'DELETE'
  })
}

// 长租公寓案例详情
export function getCaseDetail({ caseId, cityId }) {
  return makeRequest({
    url: `/fdc/rentApartmentCase/${caseId}`,
    data: {
      cityId
    }
  })
}

// 长租公寓案例编辑
export function editRentApartCase(params) {
  return makeRequest({
    url: '/fdc/rentApartmentCase',
    method: 'PUT',
    data: params
  })
}

// 长租公寓案例导出
export function exportRentApartCase(exportParams) {
  const data = qs.stringify(exportParams, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/rentApartmentCase/export/async?${data}`
    // responseType: 'arraybuffer'
  })
}
