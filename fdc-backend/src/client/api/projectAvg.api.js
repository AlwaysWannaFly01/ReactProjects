import qs from 'qs'
import req from './makeRequest'

// 获取省市区
export function getProvinceCityList(params) {
  return req({
    url: '/fdc/visitCities/authorizedDistrict',
    data: params
  })
}

// 动态获取地图核价配置
export function getMapCheckPriceConfig(params) {
  return req({
    url: '/fdc/mapCheckPrice/config',
    data: params,
    method: 'GET'
  })
}

// 获取各个网站详情
export function GetMapCheckPriceDetail(params) {
  return req({
    url: '/fdc/mapCheckPrice/detail',
    data: params,
    method: 'GET'
  })
}

// 更新挂牌基准价
export function updataMapCheckPrice(params) {
  return req({
    url: '/fdc/mapCheckPrice/weight',
    data: params,
    method: 'POST'
  })
}

// 获取挂牌价详情
export function getMapCheckPrice(params) {
  return req({
    url: '/fdc/mapCheckPrice/weight',
    data: params,
    method: 'GET'
  })
}

// 获取楼盘坐标及挂牌价列表集合
export function fetchProjectPriceList(params) {
  return req({
    url: '/fdc/mapCheckPrice/projects',
    data: params,
    method: 'GET'
  })
}

// 加载对比数据API
export function fetchAreaDict(cityId) {
  return req({
    url: '/fdc/districts/area',
    data: { cityId },
    method: 'GET'
  })
}

// 加载对比数据API
export function fetchCompareData(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/projectAvg?${params}`,
    method: 'GET'
  })
}

// 加载案例均价数据API
export function fetchCaseData(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/projectAvg/list/avg?${params}`,
    method: 'GET'
  })
}

// 加载基准数据API
export function fetchBaseData(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/projectAvg/list/weight?${params}`,
    method: 'GET'
  })
}

// 只看评估案例均价列表
export function estimateCaseData(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/projectAvg/list/estimateAvg?${params}`,
    method: 'GET'
  })
}

// 只看评估基准价列表
export function estimateBaseData(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/projectAvg/list/estimateWeight?${params}`,
    method: 'GET'
  })
}

// 只看标准房价格列表
export function standardHousePrice(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    url: `/fdc/projectAvg/list/standardHousePrice?${params}`,
    method: 'GET'
  })
}

// 导出楼盘均价数据
export function exportHouseAvg(formData) {
  const params = qs.stringify(formData, { encodeValuesOnly: true })
  return req({
    // url: `/fdc/excel/avg?${params}`,
    url: `/fdc/excel/avg/export/async?${params}`,
    // responseType: 'arraybuffer',
    method: 'GET'
  })
}

// 加载导入日志
export function fetchImportLogs() {
  return req({
    url: '/fxt/house/zone/avg/import/log',
    method: 'GET'
  })
}

// 查询基准房价历史列表
export function fetchBasePriceHistory(params) {
  return req({
    url: '/fdc/projectAvg/history/weight',
    data: params,
    method: 'GET'
  })
}

// 查询案例均价历史列表
export function fetchCasePriceHistory(params) {
  return req({
    url: '/fdc/projectAvg/history/avg',
    data: params,
    method: 'GET'
  })
}

// 评估案例均价历史列表
export function estimateAvgHistory(params) {
  return req({
    url: '/fdc/projectAvg/history/estimateAvg',
    data: params,
    method: 'GET'
  })
}

// 评估基准价历史列表
export function estimateWeightHistory(params) {
  return req({
    url: '/fdc/projectAvg/history/estimateWeight',
    data: params,
    method: 'GET'
  })
}

// 标准房价历史列表
export function standardHousePriceHistory(params) {
  return req({
    url: '/fdc/projectAvg/history/standardHousePrice',
    data: params,
    method: 'GET'
  })
}

// 查询基准房价详情
export function queryBasePriceDetail(params) {
  return req({
    url: '/fdc/projectAvg/weight/detail',
    data: params,
    method: 'GET'
  })
}

// 加载来源字典
export function getPriceSource() {
  return req({
    url: '/fdc/dict/priceSourceType',
    method: 'GET'
  })
}

// 保存基准房价数据
export function saveBasePriceDetail(formData) {
  return req({
    url: '/fdc/projectAvg/update/weight',
    data: formData,
    method: 'PUT'
  })
}

// 查询案例均价详情信息 【从案例均价列表进入】
export function fetchCaseAvgDetail(params) {
  return req({
    url: '/fdc/projectAvg/avg/detail',
    data: params,
    method: 'GET'
  })
}

// 查询案例均价详情信息 【从历史列表进入】
export function getCasePriceDetailHistory({ avgId, cityId }) {
  return req({
    url: `/fdc/projectAvg/avgHistory/${avgId}`,
    data: {
      cityId
    }
  })
}

// 案例均价编辑
export function saveCaseAvg(params) {
  return req({
    url: '/fdc/projectAvg/update/avg',
    data: params,
    method: 'PUT'
  })
}

// 案例均价历史编辑
export function saveCaseAvgHistory(params) {
  return req({
    url: '/fdc/projectAvg/update/avg/history',
    data: params,
    method: 'PUT'
  })
}

// 导入案例均价历史数据
export function exportCaseAvgHistory(formData) {
  return req({
    // url: '/fdc/excel/avg/history',
    // responseType: 'arraybuffer',
    url: '/fdc/excel/avg/history/export/async',
    data: formData,
    method: 'GET'
  })
}

// 基准房价历史导出(异步)
export function exportBaseAvgHistory(formData) {
  return req({
    url: '/fdc/excel/avg/weight/history/export/async',
    data: formData,
    method: 'GET'
  })
}

// 评估均价历史导出(异步)
export function exportEstimateAvgHistory(formData) {
  return req({
    url: '/fdc/excel/avg/estimateAvg/history/export/async',
    data: formData,
    method: 'GET'
  })
}

// 评估基准价历史导出(异步)
export function exportEstimateWeightHistory(formData) {
  return req({
    url: '/fdc/excel/avg/estimateWeight/history/export/async',
    data: formData,
    method: 'GET'
  })
}

// 标准房价格历史导出(异步)
export function exportStandardHouseHistory(formData) {
  return req({
    url: '/fdc/excel/avg/standardHouseAvg/history/export/async',
    data: formData,
    method: 'GET'
  })
}

// 案例均价历史新增
export function addAvgHistory(params) {
  return req({
    url: '/fdc/projectAvg/add/avg/history',
    method: 'POST',
    data: params
  })
}

// 基准房价新增编辑 WY
export function addBaseHistory(params) {
  return req({
    url: '/fdc/projectAvg/addOrUpdate',
    method: 'POST',
    data: params
  })
}

// 查看楼盘详情
export function getProjectDetail({ projectId, cityId }) {
  return req({
    url: `/fdc/projects/${projectId}`,
    data: {
      cityId
    }
  })
}
// 2019/5/28修改多余的一个接口，楼盘没权限的时候
export function getAllDetail({ projectId, cityId }) {
  return req({
    url: `/fdc/projects/msg/${projectId}`,
    data: {
      cityId
    }
  })
}

// 获取上个月的案例均价
export function getLastMonthCasePrice(params) {
  return req({
    url: '/fdc/projectAvg/last/price',
    data: params
  })
}

// 根据月份获取案例均价详情 WY
export function getMonthToDetail(params) {
  return req({
    url: '/fdc/projectAvg/avg/detail/month',
    data: params
  })
}

// 根据月份获取基准房价详情 WY
export function getMonthToBase(params) {
  return req({
    url: '/fdc/projectAvg/weight/detail/month',
    data: params
  })
}

// S 评估案例均价
// 只看评估案例均价历史 新增
export function addEstimateAvgHistory(params) {
  return req({
    url: '/fdc/projectAvg/addOrUpdate/estimateAvg/history',
    method: 'POST',
    data: params
  })
}
// 根据月份获取案例均价详情 WY
export function getEstimateMonthToDetail(params) {
  return req({
    url: '/fdc/projectAvg/estimateAvg/detail',
    data: params
  })
}
// E 评估案例均价

// S 评估基准价
// 评估案例基准价新增编辑 新增
export function addEstimateWeightHistory(params) {
  return req({
    url: '/fdc/projectAvg/addOrUpdate/estimateWeight/history',
    method: 'POST',
    data: params
  })
}
// 根据评估月份获取评估基准价详情
export function getEstimateMonthToWeightDetail(params) {
  return req({
    url: '/fdc/projectAvg/estimateWeight/detail',
    data: params
  })
}
// E 评估基准价

// S 标准房价格
// 评估案例基准价新增编辑 新增
export function addStandardHousePriceHistory(params) {
  return req({
    url: '/fdc/projectAvg/addOrUpdate/standardHousePrice/history',
    method: 'POST',
    data: params
  })
}
// 根据评估月份获取标准房价格详情
export function getStandardHousePriceDetail(params) {
  return req({
    url: '/fdc/projectAvg/standardHousePrice/detail',
    data: params
  })
}
// E 标准房价格
// 获取别名类型
export function getAliaType() {
  return req({
    url: '/fdc/dict/aliasType'
  })
}

export function earlyWarningCount(params) {
  return req({
    url: `/fdc/projectAvg/earlyWarningCount`,
    data: params
  })
}
