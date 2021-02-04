// 房产数据 / 住宅 / 基础数据 API

import makeRequest from './makeRequest'

// 当前楼盘的楼栋列表
export function getCurBuildInfoList({ cityId, projectId }) {
  return makeRequest({
    url: `/fdc/building/all/list/${cityId}/${projectId}`
  })
}

// 获取楼盘列表
export function getBuildInfoList(qry) {
  return makeRequest({
    url: '/fdc/building/list',
    data: qry
  })
}

// 删除楼盘
export function delBuild(data) {
  return makeRequest({
    url: '/fdc/building/delete',
    method: 'DELETE',
    data
  })
}

/*
*  楼栋还原
*  1001：还原成功
*  1002: 还原失败
*  1003：有重名楼栋
*/
export function restoreBuild(data) {
  return makeRequest({
    url: '/fdc/building/restore',
    data
  })
}

// 楼栋批量修改服务
export function batchUpdateBuild(data) {
  return makeRequest({
    url: '/fdc/building/batch/update',
    method: 'PUT',
    data
  })
}

// 新增楼栋
export function addBuild(data) {
  return makeRequest({
    url: '/fdc/building/add',
    method: 'POST',
    data
  })
}

// 编辑楼栋
export function editBuild(data) {
  return makeRequest({
    url: '/fdc/building/update',
    method: 'PUT',
    data
  })
}

// 计算房号差
// 1001, "计算成功",
// 1002, "计算失败",
// 1003, "没有楼层差修正系数标准"
export function calculateHouse(data) {
  return makeRequest({
    url: '/fdc/building/compute/house/diff',
    method: 'POST',
    data
  })
}

// 同步VQ系数服务
export function syncHouse(data) {
  return makeRequest({
    url: '/fdc/building/syn/house/vq/diff',
    method: 'POST',
    data
  })
}

// 楼栋统计,楼栋总数.房号总数
export function getBuildTotal({ cityId, projectId }) {
  return makeRequest({
    url: `/fdc/building/total/${cityId}/${projectId}`
  })
}

// 楼栋信息详情
// tabType 详情类型：1：基本信息，2：楼栋地址，3：楼栋系数，4：楼栋规模
export function getBuildDetail({ buildId, cityId }) {
  return makeRequest({
    url: `/fdc/building/detail/${buildId}`,
    data: {
      cityId
    }
  })
}

// 楼栋复制检验
/** 提示信息CODE，
 * 1001: 目标楼栋为正式楼栋
 * 1003：目标楼栋为全新楼栋
 * 1004：目标楼栋有且只有一个已删除楼栋
 * 1005：目标楼栋有多个已删除楼栋
 * 1006：目标楼栋已有房号
 * 1007：参数错误
 * 1008：复制失败
 * 1009：复制成功
 */
export function validBuildCopy(data) {
  return makeRequest({
    url: '/fdc/building/copy/vaild',
    method: 'POST',
    data
  })
}

// 楼栋复制
export function buildCopy(data) {
  return makeRequest({
    url: '/fdc/building/copy',
    method: 'POST',
    data
  })
}

// 楼栋名称校验
export function validBuildName(data) {
  return makeRequest({
    url: '/fdc/building/valid/name',
    data
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
