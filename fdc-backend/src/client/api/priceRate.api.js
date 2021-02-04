// 房产数据 / 楼盘价格 /  价格比值 API
import qs from 'qs'
import makeRequest from './makeRequest'

// 价格比值 列表
export function fetchPriceRateList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/price/rate?${data}`
  })
}

// 价格比值 导出
export function exportPriceRate(exportParams) {
  const data = qs.stringify(exportParams, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/price/rate/export/async?${data}`
  })
}

// 价格比值详情页
export function getPriceRateDetail({ id, cityId }) {
  return makeRequest({
    url: `/fdc/price/rate/${id}`,
    data: {
      cityId
    }
  })
}
