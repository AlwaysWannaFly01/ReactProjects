// 住宅 >片区绘制 >住宅基础数据 >片区经纬度导入

import makeRequest from './makeRequest'

// 数据导入日志列表
export function getImportExcelLogs(data) {
  return makeRequest({
    url: '/fdc/excel/importLog',
    data
  })
}

// 下载导入错误数据
export function downloadErr(id) {
  return makeRequest({
    url: '/fdc/excel/importLog/downLoad',
    data: id,
    responseType: 'arraybuffer',
    method: 'GET'
  })
}

// 系数导入
export function importExcelCoefficient(data) {
  return makeRequest({
    url: '/fdc/common/import',
    method: 'POST',
    data
  })
}

// 片区经纬度导入模板下载
export function exportTempExcel() {
  return makeRequest({
    url: '/fdc/excel/template/subareaMapPoints',
    responseType: 'arraybuffer'
  })
}

// 清除系数服务
export function delProjectCoef(data) {
  return makeRequest({
    url: '/fdc/project/coefficient/delete',
    method: 'DELETE',
    data
  })
}

// 数据导入日志删除
export function delImportLogs(data) {
  return makeRequest({
    url: '/fdc/excel/importLog',
    method: 'DELETE',
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

// // 系数差操作文档下载
// export function downCoefficientWord() {
//   return makeRequest({
//     url: '/fdc/handle/doc/diff/coefficient',
//     responseType: 'arraybuffer'
//   })
// }

// // 出错数据下载
// export function exportErrorExcel(id) {
//   return makeRequest({
//     url: '/fdc/excel/importLog/downLoad',
//     responseType: 'arraybuffer',
//     data: {
//       id
//     }
//   })
// }
