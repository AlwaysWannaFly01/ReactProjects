// 数据审核  / DC 楼栋
import qs from 'qs'
import makeRequest from './makeRequest'

// DC楼栋列表
export function getBuildList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/buildingDcCheck/list?${data}`
  })
}
// DC楼栋详情
export function getBuildDetail(params) {
  return makeRequest({
    url: `/fdc/buildingDcCheck/info/${params}`
  })
}

// DC楼栋 可匹配FDC楼栋列表
export function fdcBuildList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/buildingDcCheck/fdcBuildingList?${data}`
  })
}

// DC楼栋 按钮操作 接口封装回调
export function fdcBuildCheckCB({ url, params }) {
  return makeRequest({
    url: `/fdc${url}`,
    data: params,
    method: 'POST'
  })
}

// DC房号列表
export function getHouseList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/houseDcCheck/list?${data}`
  })
}

// DC房号详情
export function getHouseDetail(params) {
  return makeRequest({
    url: `/fdc/houseDcCheck/info/${params}`
  })
}

// DC房号 可匹配FDC房号列表
export function fdcHouseList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/houseDcCheck/fdcHouseList?${data}`
  })
}

// // DC房号 确定房号关联列表
// export function preMatchList(params) {
//   const data = qs.stringify(params, { encodeValuesOnly: true })
//   return makeRequest({
//     url: `/fdc/houseDcCheck/preMatchList?${data}`
//   })
// }
// DC房号 确定房号关联列表 换成回调函数
export function getPreMatchList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/houseDcCheck/preMatchList?${data}`
  })
}

// DC房号 房号关联情况
export function getConditionList(params) {
  return makeRequest({
    url: `/fdc/houseDcCheck/matchList/${params}`
  })
}

// DC房号 DC房号转正式房号
export function sureButton(params) {
  return makeRequest({
    url: '/fdc/houseDcCheck/match',
    method: 'POST',
    data: params
  })
}

// DC房号 按钮操作 接口封装回调
export function fdcRoomCheckCB({ url, params }) {
  return makeRequest({
    url: `/fdc${url}`,
    data: params,
    method: 'POST'
  })
}
