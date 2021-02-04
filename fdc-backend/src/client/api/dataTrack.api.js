/**
 * 数据跟踪服务
 */
import makeRequest from './makeRequest'

export function getDataTrack(qryData) {
  const { url } = qryData
  delete qryData.url
  return makeRequest({
    url,
    data: qryData
  })
}
