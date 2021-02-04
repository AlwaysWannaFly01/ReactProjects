// 房产数据 / 楼盘配套接口
import qs from 'qs'
import makeRequest from './makeRequest'

// 楼盘配套列表
export function getProjectFacilities(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/projectFacilities?${data}`
  })
}

// 楼盘配套删除
export function delProjectFacilities(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/projectFacilities?${data}`,
    method: 'DELETE'
  })
}

// 楼盘配套异步导出
export function exportProjectFacilities(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/projectFacilities/export/async?${data}`,
    method: 'get'
  })
}

// 楼盘配套新增
export function addProjectFacility(params) {
  return makeRequest({
    url: '/fdc/projectFacilities',
    method: 'POST',
    data: params
  })
}

// 楼盘配套编辑
export function editProjectFacility(params) {
  return makeRequest({
    url: '/fdc/projectFacilities',
    method: 'PUT',
    data: params
  })
}

// 楼盘配套详情
export function getProjectFacilityDetail(params) {
  const { id, cityId } = params
  return makeRequest({
    url: `/fdc/projectFacilities/${id}`,
    method: 'get',
    data: {
      cityId
    }
  })
}
