/**
 * 后台配置接口  数据来源管理
 */
import qs from 'qs'
import makeRequest from './makeRequest'

// 数据来源列表
export function getChannelList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/channelConfig/list?${data}`
  })
}

// 数据来源列表（市内各区）
export function getListByCity(cityId) {
  return makeRequest({
    url: `/fdc/channelConfig/listByCity?cityId=${cityId}`
  })
}

// 数据来源详情
export function getProductByCity(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/channelConfig?${data}`
  })
}

// 数据来源批量保存
export function saveProductList(params) {
  return makeRequest({
    url: '/fdc/channelConfig/saveBatch',
    data: params,
    method: 'POST'
  })
}
export function getProductList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/channelConfig/productList?${data}`
  })
}
// 加载数据字典
export function getDataList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  const COMPANY_LIST = makeRequest({
    url: `/fdc/channelConfig/companyList?${data}`,
    method: 'get'
  })

  const BUSINESS_LIST = makeRequest({
    url: `/fdc/channelConfig/businessList?${data}`,
    method: 'get'
  })

  return Promise.all([COMPANY_LIST, BUSINESS_LIST])
}

// 数据来源删除
export function delProduct(params) {
  return makeRequest({
    url: '/fdc/channelConfig',
    data: params,
    method: 'DELETE'
  })
}

// 验证行政区配置
export function validateAreaConfig(params) {
  return makeRequest({
    url: '/fdc/channelConfig/validateAreaConfig',
    data: params,
    method: 'POST'
  })
}
