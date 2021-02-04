import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'commonExportTask',
  actions: {
    getExportType: 'GET_EXPORT_TYPE',
    setExportType: 'SET_EXPORT_TYPE',

    getExportTaskList: 'GET_EXPORT_TASK_LIST',
    setExportTaskList: 'SET_EXPORT_TASK_LIST',
    // 删除 WY
    getDelExport: 'GET_DEL_EXPORT',

    downExportTaskExcel: 'DOWN_EXPORT_TASK_EXCEL',
    getExportTaskListCb: 'GET_EXPORT_TASK_LIST_CB'
  }
})

export default actions
export { containerActions }
