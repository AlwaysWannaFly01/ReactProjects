/**
 * 案例相关接口
 */
import qs from 'qs'
import req from './makeRequest'

// 查询案例列表接口
function fetchCaseList(filterInfo) {
  const params = qs.stringify(filterInfo, { encodeValuesOnly: true })

  return req({
    url: `/fdc/case?${params}`,
    method: 'GET'
  })
}

// 查询案例详情
function fetchCaseDetail(caseId) {
  return req({
    url: `/fdc/case/${caseId}`,
    method: 'GET'
  })
}

// 加载字典表
function fetchDicts(cityId) {
  // 用途
  const USAGE_TYPES = req({
    url: '/fdc/dict/houseUsage',
    method: 'GET'
  })
  // 朝向
  const TOWARDS = req({
    url: '/fdc/dict/orientationType',
    method: 'GET'
  })
  // 建筑类型
  const BUILDING_TYPES = req({
    url: '/fdc/dict/buildingType',
    method: 'GET'
  })
  // 户型
  const HOUSE_TYPES = req({
    url: '/fdc/dict/houseType',
    method: 'GET'
  })
  // 户型结构
  const HOUSE_STRUCTURES = req({
    url: '/fdc/dict/structureType',
    method: 'GET'
  })
  // 币种
  const COIN_TYPES = req({
    url: '/fdc/dict/currencyType',
    method: 'GET'
  })
  // 案例类型
  const CASE_TYPES = req({
    url: '/fdc/dict/caseType',
    method: 'GET'
  })
  const EXCUTE_ZONES = req({
    url: `/fdc/districts/area?cityId=${cityId}`,
    method: 'GET'
  })
  return Promise.all([
    USAGE_TYPES,
    TOWARDS,
    BUILDING_TYPES,
    HOUSE_TYPES,
    HOUSE_STRUCTURES,
    COIN_TYPES,
    CASE_TYPES,
    EXCUTE_ZONES
  ])
}

// 查询案例导入日志列表接口
function fetchCaseImportLog(filterInfo) {
  return req({
    url: '/fdc/excel/importLog',
    data: filterInfo,
    method: 'GET'
  })
}

// 导入案例数据
function importCase(formData) {
  return req({
    url: '/fdc/case/caseExcelImport',
    data: formData,
    method: 'POST'
  })
}

// 导入模板下载
function downloadTemp() {
  return req({
    url: '/fdc/excel/template/case',
    responseType: 'arraybuffer'
  })
}

// 导出案例数据
function exportCases(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return req({
    url: `/fdc/case/caseExcelExport?${data}`,
    responseType: 'arraybuffer'
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

// 保存新增CASE 数据
function handupCaseInfo(params) {
  return req({
    url: '/fdc/case',
    data: params,
    method: 'POST'
  })
}

// 删除案例
function deleteCases(params) {
  return req({
    url: '/fdc/case',
    data: params,
    method: 'DELETE'
  })
}

// 一键删除案例
function deleteAllCases(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return req({
    url: `/fdc/case/deleteByQueryAll?${data}`,
    method: 'DELETE'
  })
}

// 更新 CASE 数据
function updateCase(params) {
  return req({
    url: '/fdc/case',
    data: params,
    method: 'PUT'
  })
}

// 查询列表接口
function fetchProds(filterInfo) {
  return req({
    url: '/backend/prods',
    data: filterInfo,
    method: 'GET'
  })
}

// 保存产品信息
function saveProd(prod) {
  return req({
    url: '/backend/add/prod',
    data: prod,
    method: 'POST'
  })
}

// 保存产品信息
function deleteProds(prodIds) {
  return req({
    url: '/backend/delete/prods',
    data: prodIds,
    method: 'DELETE'
  })
}

// 根据ID查询产品详情
function queryOne(prodId) {
  return req({
    url: `/backend/prod/${prodId}`,
    method: 'GET'
  })
}
export default {
  fetchProds,
  deleteAllCases,
  handupCaseInfo, // save new case
  deleteCases, // delete cases
  queryOne,
  deleteLogs,
  importCase, // import case data
  exportCases, // export case data
  downloadTemp, // download case import template
  saveProd,
  deleteProds,
  updateCase, // update case info
  fetchCaseList, // load case list
  fetchCaseDetail, // load case detail
  fetchDicts, // load dicts
  fetchCaseImportLog
}
