// 房产数据 / 住宅 /  样本楼盘数据 API
import qs from 'qs'
import makeRequest from './makeRequest'

// 基础楼盘列表
export function fetchProjectSet(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/projectSet?${data}`
  })
}

// 保存新增楼盘集合 数据
export function addCase(params) {
  return makeRequest({
    url: '/fdc/projectSet/add',
    data: params,
    method: 'POST'
  })
}

// 4. 获取行政区集合配置列表
export function getUpArea(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/projectSet/selectAreaSetConfigList?${data}`
  })
}

// 获取案例详情
export function getSetDetail({ setId }) {
  return makeRequest({
    url: `/fdc/projectSet/${setId}`
  })
}

// 删除案例
export function deleteCases({ ids, cityId }) {
  return makeRequest({
    url: '/fdc/projectSet',
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

// 集合内楼盘列表  3. 集合内楼盘列表/该行政区未归入集合的楼盘
export function getSetProjectList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/projectSet/selectProjectListBySetId?${data}`
  })
}

// 集合内楼盘列表  3. 集合内楼盘列表/该行政区未归入集合的楼盘
export function getSetPopList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/projectSet/selectProjectListBySetId?${data}`
  })
}

// 修改集合 updateSet
export function updateSet(data) {
  return makeRequest({
    url: '/fdc/projectSet/update',
    method: 'PUT',
    data
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

// 8. 集合内新增楼盘 弹窗中的确定按钮
export function addSamples(params) {
  return makeRequest({
    url: '/fdc/projectSet/addProject',
    data: params,
    method: 'POST'
  })
}

// 集合内剔除楼盘
export function deleteSamples(params) {
  return makeRequest({
    url: '/fdc/projectSet/deleteProject',
    data: params,
    method: 'POST'
  })
}
