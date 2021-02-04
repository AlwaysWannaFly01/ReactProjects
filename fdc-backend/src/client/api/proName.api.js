// 房产数据 / 住宅 / 楼盘别名接口

import makeRequest from './makeRequest'

// 获取别名列表
export function getProjectAliaList({ searchProjectAlia }) {
  return makeRequest({
    url: '/fdc/project/aliases',
    data: searchProjectAlia
  })
}

// 新增
export function addProjectAlia(data) {
  return makeRequest({
    url: '/fdc/project/aliases',
    method: 'POST',
    data
  })
}

// 编辑
export function editProjectAlia(data) {
  return makeRequest({
    url: '/fdc/project/aliases',
    method: 'PUT',
    data
  })
}

// 删除
export function delProjectAlia(data) {
  return makeRequest({
    url: '/fdc/project/aliases',
    method: 'DELETE',
    data
  })
}

// 获取正式楼盘列表
export function getBaseInfoList({ searchBaseInfo }) {
  return makeRequest({
    url: '/fdc/projects',
    data: searchBaseInfo
  })
}

// 行政区列表
export function getDistrictAreas({ searchAreaList }) {
  return makeRequest({
    url: '/fdc/districts/area',
    data: searchAreaList
  })
}

// 获取别名类型
export function getAliaType() {
  return makeRequest({
    url: '/fdc/dict/aliasType'
  })
}

// 楼盘别名导出
export function exportProjectName(exportQry) {
  return makeRequest({
    // url: '/fdc/excel/alias',
    url: '/fdc/excel/alias/export/async',
    // responseType: 'arraybuffer',
    data: exportQry
  })
}

// 查看楼盘详情
export function getProjectDetail({ projectId, cityId }) {
  return makeRequest({
    url: `/fdc/projects/${projectId}`,
    data: {
      cityId
    }
  })
}
