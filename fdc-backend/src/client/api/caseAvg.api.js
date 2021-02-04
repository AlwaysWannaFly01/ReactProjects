/**
 * 案例均价接口
 */
import req from './makeRequest'
// 查询案例均价详情信息
function fetchCaseAvgDetail(params) {
  return req({
    url: `/fdc/projectAvg/avg/${params.id}`,
    data: params,
    method: 'GET'
  })
}

// 查询案例均价历史详情信息
function fetchCaseAvgHistoryDetail(params) {
  return req({
    url: `/fdc/projectAvg/avgHistory/${params.id}`,
    data: params,
    method: 'GET'
  })
}

// 查询案例均价历史信息
function fetchCaseAvgHistory(formData) {
  return req({
    url: '/fdc/projectAvg/history/avg',
    data: formData,
    method: 'GET'
  })
}

// 导入案例均价历史数据
function exportCaseAvgHistory(formData) {
  return req({
    url: '/fdc/excel/avg/history',
    responseType: 'arraybuffer',
    data: formData,
    method: 'GET'
  })
}

// 基准房价历史导出(异步)
function exportBaseAvgHistory(formData) {
  return req({
    url: '/fdc/excel/avg/weight/history',
    responseType: 'arraybuffer',
    data: formData,
    method: 'GET'
  })
}

// 编辑案例均价历史
function editCaseAvgHistory(formData) {
  return req({
    url: '/fdc/projectAvg/update/avg/history',
    data: formData,
    method: 'PUT'
  })
}

// 编辑案例均价
function editCaseAvg(formData) {
  return req({
    url: '/fdc/projectAvg/update/avg',
    data: formData,
    method: 'PUT'
  })
}

// 新增案例均价历史
function addCaseAvgHistory(formData) {
  return req({
    url: '/fdc/projectAvg/add/avg/history',
    data: formData,
    method: 'POST'
  })
}

export default {
  fetchCaseAvgDetail, // 案例均价详情
  fetchCaseAvgHistoryDetail, // 案例均价历史详情
  editCaseAvg, // 编辑案例均价
  editCaseAvgHistory, // 编辑案例均价历史
  exportCaseAvgHistory, // 导出案例均价历史
  exportBaseAvgHistory, // 导出基准房价历史
  addCaseAvgHistory, // 新增案例均价历史
  fetchCaseAvgHistory
}
