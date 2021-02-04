// 房产数据 / 住宅 / 系数差

import makeRequest from './makeRequest'

// 获取系数列表服务
/* 修正系数类型
 * 1033003: 楼层差
 * 1033001：朝向
 * 1033002：景观
 * 1033006: 通风采光
 * 1033004：装修
 * 1033005：面积
 */
export function getCoefficientList(qry) {
  return makeRequest({
    url: '/fdc/project/coefficient/list',
    data: qry
  })
}

// 数据导入日志列表
export function getImportExcelLogs(data) {
  return makeRequest({
    url: '/fdc/excel/importLog',
    data
  })
}
// 数据导入日志列表 写个回调函数，用于导入时无数据查看权限
export function getImportExcelLogsCb(data) {
  return makeRequest({
    url: '/fdc/excel/importLog',
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

// 系数导出
export function exportExcelCoefficient(data) {
  return makeRequest({
    // url: '/fdc/excel/coefficient',
    // responseType: 'arraybuffer',
    url: '/fdc/excel/coefficient/export/async',
    data
  })
}

// 系数导入
export function importExcelCoefficient(data) {
  return makeRequest({
    url: '/fdc/common/import',
    // url: '/fdc/excel/coefficient',
    method: 'POST',
    data
  })
}

// 系数差导入模版下载
export function exportTempExcel() {
  return makeRequest({
    url: '/fdc/excel/template/coeffient',
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

// 查看楼盘详情
export function getProjectDetail({ projectId, cityId }) {
  return makeRequest({
    url: `/fdc/projects/${projectId}`,
    data: {
      cityId
    }
  })
}

// 系数差操作文档下载
export function downCoefficientWord() {
  return makeRequest({
    url: '/fdc/handle/doc/diff/coefficient',
    responseType: 'arraybuffer'
  })
}

// 出错数据下载
export function exportErrorExcel(id) {
  return makeRequest({
    url: '/fdc/excel/importLog/downLoad',
    responseType: 'arraybuffer',
    data: {
      id
    }
  })
}
