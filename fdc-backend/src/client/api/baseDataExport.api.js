/**
 * 楼盘、楼栋、房号导出接口
 */
import req from './makeRequest'

// 导出楼盘数据
function exportAreaData(params) {
  return req({
    // url: '/fdc/excel/project/export',
    url: '/fdc/excel/project/export/async',
    method: 'POST',
    // responseType: 'arraybuffer',
    data: params
  })
}

// 导出房号信息
function exportRoomData(params) {
  return req({
    // url: '/fdc/house/export',
    url: '/fdc/house/export/async',
    method: 'POST',
    // responseType: 'arraybuffer',
    data: params
  })
}

// 导出楼栋信息
function exportBuildingData(params) {
  return req({
    // url: '/fdc/building/export',
    url: '/fdc/building/export/async',
    method: 'POST',
    // responseType: 'arraybuffer',
    data: params
  })
}

// 加载区域列表
function fetchAreas(params) {
  return req({ url: '/fdc/districts/area', data: params })
}
export default {
  exportAreaData,
  exportRoomData,
  exportBuildingData,
  fetchAreas
}
