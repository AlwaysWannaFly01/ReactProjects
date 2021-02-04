// 房产数据 / 住宅 / 楼盘图片

import makeRequest from './makeRequest'

// 获取楼盘图片列表
export function getProjectImageList(qry) {
  return makeRequest({
    url: '/fdc/pictures',
    data: qry
  })
}

// 图片类型
export function getPhotoType() {
  return makeRequest({
    url: '/fdc/dict/photoTypeCode'
  })
}

// 图片编辑
export function editPhoto(params) {
  return makeRequest({
    url: '/fdc/pictures',
    method: 'PUT',
    data: params
  })
}

// 删除图片
export function delProjectImages(ids) {
  return makeRequest({
    url: '/fdc/pictures',
    method: 'DELETE',
    data: {
      ids
    }
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

// 楼栋信息详情
// tabType 详情类型：1：基本信息，2：楼栋地址，3：楼栋系数，4：楼栋规模
export function getBuildDetail({ buildId, cityId }) {
  return makeRequest({
    // url: `/fdc/building/detail/${tabType}/${buildId}`,
    url: `/fdc/building/detail/${buildId}`,
    data: {
      cityId
    }
  })
}

// 图片保存
export function pictureSave(params) {
  return makeRequest({
    url: '/fdc/pictures/batch/add',
    data: params,
    method: 'POST'
  })
}
