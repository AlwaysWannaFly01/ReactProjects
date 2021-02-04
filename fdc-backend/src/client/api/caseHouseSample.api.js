// 房产数据 / 住宅 /  样本楼盘数据 API
import qs from 'qs'
import makeRequest from './makeRequest'

// 基础楼盘列表
export function fetchCaseList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/baseProject?${data}`
  })
}

// 保存新增CASE 数据
export function addCase(params) {
  return makeRequest({
    url: '/fdc/baseProject',
    data: params,
    method: 'POST'
  })
}

// 获取案例详情
export function getCaseDetail({ caseId, cityId }) {
  return makeRequest({
    url: `/fdc/baseProject/${caseId}`,
    data: {
      cityId
    }
  })
}

// 删除案例
export function deleteCases({ ids, cityId }) {
  return makeRequest({
    url: '/fdc/baseProject',
    data: { ids, cityId },
    method: 'DELETE'
  })
}

// 样本案例导出
export function exportCase(exportParams) {
  const data = qs.stringify(exportParams, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/baseProject/async/export?${data}`
    // responseType: 'arraybuffer'
  })
}

// 校验激活楼盘
export function isActiveProject({ id, cityId }) {
  return makeRequest({
    url: `/fdc/baseProject/isActiveProject/${id}`,
    data: {
      cityId
    }
  })
}
// 校验激活楼盘
// export function isActiveProject({ id, cityId }) {
//   return makeRequest({
//     url: `/fdc/projects/projectList/${id}`,
//     data: {
//       cityId
//     }
//   })
// }

// 样本列表
export function getSampleList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/sampleProject?${data}`
  })
}

// 样本列表
export function getSampleListInBase({ id, cityId }) {
  return makeRequest({
    url: `/fdc/sampleProject/listByBaseProjectId/${id}`,
    data: {
      cityId
    }
  })
}

// 添加样本楼盘 保存
export function addSamples(params) {
  return makeRequest({
    url: '/fdc/sampleProject/adds',
    data: params,
    method: 'POST'
  })
}

// 删除样本
export function deleteSamples({ ids, cityId }) {
  return makeRequest({
    url: '/fdc/sampleProject',
    data: { ids, cityId },
    method: 'DELETE'
  })
}

// 关联
export function relateSample(params) {
  return makeRequest({
    url: '/fdc/sampleProject/relationship',
    data: params,
    method: 'PUT'
  })
}
// 一键自动关联
export function autoRelated(cityId) {
  return makeRequest({
    url: `/fdc/sampleProject/correlation?cityId=${cityId}`,
    method: 'PUT'
  })
}
// 关联按钮状态（1：可点击，0：不可点击）
export function autoRelatedStatus(cityId) {
  return makeRequest({
    url: `/fdc/sampleProject/correlation/status?cityId=${cityId}`
  })
}
