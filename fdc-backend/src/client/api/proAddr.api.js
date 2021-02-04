// 房产数据 / 住宅 / 楼盘地址接口

import makeRequest from './makeRequest'

// 获取楼盘地址列表
export function getProjectAddrList({ searchProjectAddr }) {
  return makeRequest({
    url: '/fdc/project/address/list',
    data: searchProjectAddr
  })
}

// 楼盘地址新增
export function addProjectAddr(data) {
  return makeRequest({
    url: '/fdc/project/address/add',
    method: 'POST',
    data
  })
}

// 楼盘地址修改
export function editProjectAddr(data) {
  return makeRequest({
    url: '/fdc/project/address/update',
    method: 'PUT',
    data
  })
}

// 删除楼盘地址
export function delProjectAddr(data) {
  return makeRequest({
    url: '/fdc/project/address/delete',
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

// 获取地址类型
export function getAddrType() {
  return makeRequest({
    url: '/fdc/dict/addressType'
  })
}

// 楼盘地址导出
export function exportProjectAddr(exportQry) {
  return makeRequest({
    // url: '/fdc/project/address/exporter',
    // responseType: 'arraybuffer',
    url: '/fdc/project/address/export/async',
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
