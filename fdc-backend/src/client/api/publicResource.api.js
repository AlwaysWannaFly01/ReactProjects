// 房产数据 / 公共配套接口
import qs from 'qs'
import makeRequest from './makeRequest'

// 公共配套列表
export function getCommonFacilities(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/commonFacilities?${data}`
  })
}

// 公共配套删除
export function delCommonFacilities(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/commonFacilities?${data}`,
    method: 'DELETE'
  })
}

// 公共配套编辑
export function editCommonFacility(params) {
  return makeRequest({
    url: '/fdc/commonFacilities',
    method: 'PUT',
    data: params
  })
}

// 公共配套新增
export function addCommonFacility(params) {
  return makeRequest({
    url: '/fdc/commonFacilities',
    method: 'POST',
    data: params
  })
}

// 公共配套详情
export function getCommonFacilitiesDetail(params) {
  const { id, cityId } = params
  return makeRequest({
    url: `/fdc/commonFacilities/${id}`,
    method: 'get',
    data: {
      cityId
    }
  })
}

// 关联楼盘
export function correlateProject(params) {
  return makeRequest({
    url: '/fdc/commonFacilities/correlate',
    method: 'PUT',
    data: params
  })
}

// 获取关联楼盘
export function getCorrelateProject(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/commonFacilities/correlate?${data}`,
    method: 'get'
  })
}

// 设置关联楼盘
export function setCorrelateProject(params) {
  return makeRequest({
    url: '/fdc/commonFacilities/correlate',
    method: 'POST',
    data: params
  })
}

// 公共配套异步导出
export function exportCommonFacilities(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/commonFacilities/export/async?${data}`,
    method: 'get'
  })
}
