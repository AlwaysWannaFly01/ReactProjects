// 数据审核  / DC
import qs from 'qs'
import makeRequest from './makeRequest'

// DC楼盘列表
export function getAuditList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/projectDcCheck/list?${data}`
  })
}

// DC楼盘 详情页面 该条楼盘信息展示
export function getShowInformation(projectId) {
  return makeRequest({
    url: `/fdc/projectDcCheck/info/${projectId}`
  })
}

// DC楼盘 可匹配FDC楼盘列表
export function getMatchList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/projectDcCheck/fdcProjectList?${data}`
  })
}

// DC楼盘 可匹配FDC楼盘列表
export function projectDcCheckCB({ url, params }) {
  return makeRequest({
    url: `/fdc${url}`,
    data: params,
    method: 'POST'
  })
}

// DC楼盘，楼栋，单元室号 是否有城市权限点击进去
export function getAuthority(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/visitCities/limit?${data}`
  })
}
