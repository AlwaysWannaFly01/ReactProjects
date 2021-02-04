import qs from 'qs'
import makeRequest from './makeRequest'

// 楼盘评级列表
export function getEstateRatingSearch(searchEstateRating) {
  return makeRequest({
    url: '/fdc/project/grade',
    data: searchEstateRating
  })
}

// 行政区列表
export function getDistrictAreas({ searchAreaList }) {
  return makeRequest({
    url: '/fdc/districts/area',
    data: searchAreaList
  })
}

// 楼盘评级结果导出(异步)
export function exportRatingResult(exportParams) {
  const data = qs.stringify(exportParams, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/project/grade/export/async?${data}`
  })
}

// 楼盘评级修改
export function editRatingResult(params) {
  return makeRequest({
    url: '/fdc/project/grade',
    method: 'POST',
    data: params
  })
}

// 楼盘评级修改
export function addRatingResult(params) {
  return makeRequest({
    url: '/fdc/project/grade',
    method: 'POST',
    data: params
  })
}

// 查看楼盘详情 楼盘没权限的时候
export function getAllDetail({ projectId, cityId }) {
  return makeRequest({
    url: `/fdc/projects/msg/${projectId}`,
    data: {
      cityId
    }
  })
}

// 楼盘评级历史
export function getRatingHistory(searchRatingHistory) {
  return makeRequest({
    url: '/fdc/project/grade/history',
    data: searchRatingHistory
  })
}

// 楼盘评级结果历史导出(异步)
export function exportRatingResultHistory(exportParams) {
  const data = qs.stringify(exportParams, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/project/grade/history/export/async?${data}`
  })
}

// 楼盘评级规则修改(规则不存在就添加)
// export function editGrade(params) {
//   return makeRequest({
//     url: '/fdc/project/gradeRules',
//     method: 'PUT',
//     data: params
//   })
// }

// 楼盘评级规则列表
export function getRatingRuleSearch(searchRatingRule) {
  return makeRequest({
    url: '/fdc/project/gradeRules',
    data: searchRatingRule
  })
}

// 楼盘评级规则详情
export function getRatingRuleDetail(ratingRuleDetail) {
  return makeRequest({
    url: '/fdc/project/gradeRules/detail',
    data: ratingRuleDetail
  })
}

// 楼盘评级规则导出(异步)
export function exportGradeRules(exportParams) {
  const data = qs.stringify(exportParams, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/project/gradeRules/export/async?${data}`
  })
}

// 行政区列表
export function getAreaList(cityId) {
  return makeRequest({
    url: '/fdc/districts/area',
    data: { cityId }
  })
}

// 环线位置
export function getLoopLine() {
  return makeRequest({
    url: '/fdc/dict/loopLine'
  })
}

// 楼盘评级规则修改(规则不存在就添加)
export function editEstateRating(params) {
  return makeRequest({
    url: '/fdc/project/gradeRules',
    method: 'POST',
    data: params
  })
}
export function getGradeDetail(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/project/grade/detail?${data}`
  })
}
