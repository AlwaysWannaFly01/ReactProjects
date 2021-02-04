import qs from 'qs'
import makeRequest from './makeRequest'

// 获取默认城市
export function getDealDefaultCity() {
  return makeRequest({
    url: '/fdc/projectDealCount/defaultCity',
    method: 'GET'
  })
}

export function getUserInfo(sid) {
  let headers = {}
  if (sid) {
    headers = {
      Cookie: `sid=${sid};`
    }
  }
  return makeRequest({
    url: '/fdc/user/current_user',
    headers
  })
}

// 获取菜单权限列表
export function getMenuPermissions() {
  return makeRequest({
    url: '/fdc/user/menu/permissions'
  })
}

// 获取常用城市和所有城市
export function getVisitCities() {
  return makeRequest({
    url: '/fdc/visitCities'
  })
}

// 获取省份列表
export function getProviceList() {
  return makeRequest({
    url: '/fdc/districts/province'
  })
}

// 获取城市列表
export function getCityList(provinceId) {
  return makeRequest({
    url: '/fdc/districts/city',
    data: {
      provinceId
    }
  })
}

// 获取权限城市列表 wy change
export function getAuthorityCityList(roleId) {
  return makeRequest({
    url: `/fdc/roles/${roleId}/getRolesCity`
  })
}

// 行政区列表
export function getAreaList(cityId) {
  return makeRequest({
    url: '/fdc/districts/area',
    data: {
      cityId
    }
  })
}

// 获取片区列表
export function getSubAreas(areaId) {
  return makeRequest({
    url: '/fdc/districts/subArea',
    data: {
      areaId
    }
  })
}

// 更新默认城市
export function updateVisitCities(data) {
  return makeRequest({
    url: '/fdc/visitCities',
    method: 'PUT',
    data
  })
}

// 楼盘列表
export function getBaseInfoList(searchBaseInfo) {
  return makeRequest({
    url: '/fdc/projects',
    data: searchBaseInfo
  })
}

// 楼盘搜索
export function getBaseInfoSearch(searchBaseInfo) {
  return makeRequest({
    url: '/fdc/projects/search',
    data: searchBaseInfo
  })
}

// 楼盘列表 添加projectList 弹窗
export function getProjectPop(searchBaseInfo) {
  return makeRequest({
    url: '/fdc/projects/projectList',
    data: searchBaseInfo
  })
}

// 获取默认城市
export function getDefaultCity() {
  return makeRequest({
    url: '/fdc/visitCities/default'
  })
}

// 根据城市名称关键字搜索
export function searchVisitCity(keyword) {
  return makeRequest({
    url: '/fdc/visitCities/search',
    data: {
      keyword
    }
  })
}


// 获取限制导入文件大小
export function maxImportSize(cityId) {
  return makeRequest({
    url: '/fdc/common/import/maxImportSize',
    data: {
      cityId
    }
  })
}
// 错误楼盘名称列表
export function fetchErrorList({ errorInfo }) {
  return makeRequest({
    url: '/fdc/project/error',
    data: errorInfo
  })
}

// 删除 错误楼盘名称列表
export function deleteError(ids) {
  return makeRequest({
    url: '/fdc/project/error',
    data: ids,
    method: 'DELETE'
  })
}

// 一键删除 错误楼盘名称列表
export function deleteAllError(delParams) {
  const data = qs.stringify(delParams, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/project/error/deleteAll?${data}`,
    method: 'DELETE'
  })
}

// 错误楼盘名称列表 导出 案例
export function exportErrorProject(exportQry) {
  return makeRequest({
    url: '/fdc/case/export/async/errorCase',
    data: exportQry
  })
}

// 错误楼盘名称列表 导出 网络参考价
export function exportProjectAvg(exportQry) {
  return makeRequest({
    url: '/fdc/reference/async/export',
    data: exportQry
  })
}

// 编辑相关楼盘名称 确定按钮
export function editProjectName(data) {
  return makeRequest({
    url: '/fdc/project/error',
    method: 'POST',
    data
  })
}

// DC楼盘，楼栋，单元室号,编辑 是否有城市权限点击进去
export function editAuthority(params) {
  return makeRequest({
    url: '/fdc/visitCities/limit',
    params
  })
}
// 批量查询相关楼盘地址能在所关联楼盘的楼盘地址里找到完全匹配的地址
export function IsMatchBatchProject(params) {
  return makeRequest({
    url: '/fdc/project/address/IsMatchBatchProject',
    params
  })
}
