// 数据审核  / 反馈中心
import qs from 'qs'
import makeRequest from './makeRequest'

// 楼盘均价列表
export function getPropertyPvgList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/projectAvgSupplement?${data}`
  })
}

// 楼盘均价列表 回复按钮
export function replyPvgResponse(params) {
  return makeRequest({
    url: '/fdc/projectAvgSupplement',
    method: 'POST',
    data: params
  })
}

// 楼盘均价列表 回复对话 详情
export function getAnswerList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/projectAvgSupplement/answerList?${data}`
  })
}

// 楼盘均价列表 一行表格 详情
export function getOneLine(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/projectAvg/avgCompare?${data}`
  })
}

// 楼盘均价列表 一行表格 基准房价和案例均价是否有城市权限点击进去
export function getAuthority(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/visitCities/limit?${data}`
  })
}
