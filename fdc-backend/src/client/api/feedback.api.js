// 数据审核  / 反馈中心
import qs from 'qs'
import makeRequest from './makeRequest'

// 楼盘列表
export function getPropertysList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/projectSupplement?${data}`
  })
}

// 楼盘列表 回复按钮
export function replyResponse(params) {
  return makeRequest({
    url: '/fdc/projectSupplement',
    method: 'POST',
    data: params
  })
}

// 楼盘列表 回复对话 详情
export function getAnswerList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/projectSupplement/answerList?${data}`
  })
}
