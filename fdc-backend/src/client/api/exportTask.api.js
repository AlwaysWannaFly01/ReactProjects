import qs from 'qs'
import makeRequest from './makeRequest'

// 导出任务列表
export function getExportTaskList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/task/export?${data}`
  })
}
// 导出任务列表 change wy 没有数据查看权限
export function getExportTaskListCb(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/task/export?${data}`
  })
}

// 导出文件下载
export function downExportTaskExcel(id) {
  return makeRequest({
    url: '/fdc/task/export/download',
    responseType: 'arraybuffer',
    data: {
      id
    }
  })
}

// 删除 WY
export function getDelExport({ ids }) {
  return makeRequest({
    url: '/fdc/task/export',
    data: { ids },
    method: 'DELETE'
  })
}
