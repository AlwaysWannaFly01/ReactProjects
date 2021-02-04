/**
 * 基准房价接口
 */
import req from './makeRequest'
// 查询基准房价历史列表
function fetchBasePriceHistory(params) {
  return req({
    url: '/fdc/projectAvg/history/weight',
    data: params,
    method: 'GET'
  })
}

// 查询基准房价详情
function queryDetail(params) {
  return req({
    url: '/fdc/projectAvg/weight/detail',
    data: params,
    method: 'GET'
  })
}

// 加载字典
function queryDicts() {
  return req({
    url: '/fdc/dict/priceSourceType',
    method: 'GET'
  })
}
// 编辑基准房价数据
function updateDetail(formData) {
  return req({
    url: '/fdc/projectAvg/update/weight',
    data: formData,
    method: 'PUT'
  })
}

export default {
  fetchBasePriceHistory,
  updateDetail,
  queryDicts,
  queryDetail
}
