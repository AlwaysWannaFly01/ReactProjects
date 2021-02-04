/**
 * 案例均价接口
 */
import req from './makeRequest'

// 取消日志导入
function importCanel(params) {
  return req({
    url: '/fdc/excel/importLog',
    data: params,
    method: 'POST'
  })
}
// 查询导入日志列表
function fetchImportLogs(params) {
  return req({
    url: '/fdc/excel/importLog',
    data: params,
    method: 'GET'
  })
}

// 删除导入日志记录
function deleteLogs(params) {
  return req({
    url: '/fdc/excel/importLog',
    data: params,
    method: 'DELETE'
  })
}

// 导入类型字典
function fetchImportTypes() {
  return req({
    url: '/fdc/dict/importType',
    method: 'GET'
  })
}

// 导入模板下载
function downloadTemp(params) {
  return req({
    url: params.url,
    responseType: 'arraybuffer',
    method: 'GET'
  })
}

// FDC通用导入接口
function fdcCommonImport(params) {
  return req({
    url: '/fdc/common/import',
    data: params,
    method: 'POST'
  })
}

// 下载导入错误数据
function exportErr(id) {
  return req({
    url: '/fdc/excel/importLog/downLoad',
    data: id,
    responseType: 'arraybuffer',
    method: 'GET'
  })
}

// 下载楼导入盘名称错误数据
function exportErrProjectName(taskId) {
  return req({
    url: `/fdc/foreclosureCase/export/errorForeclosureCase/`+taskId.id,
    // url: '/fdc/excel/importLog/downLoad',
    responseType: 'arraybuffer',
    method: 'GET'
  })
}

export default {
  importCanel, //取消日志导入
  exportErr,
  exportErrProjectName,
  fdcCommonImport, // 公用导入接口
  fetchImportLogs, // 导入任务列表接口
  downloadTemp, // 下载导入模板接口
  fetchImportTypes, // 加载导入类型接口
  deleteLogs // 删除导入任务列表数据
}
