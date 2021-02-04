import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'commonImport',
  actions: {
    importCanel: 'IMPORT_CANEL',
    maxImportSize: 'MAX_IMPORT_SIZE',
    handupFile: 'HANDUP_FILE',
    queryImportType: 'QUERY_IMPORT_TYPE',
    fetchImportLogs: 'FETCH_IMPORT_LOGS',
    downloadTemp: 'DOWNLOAD_TEMPLATE',
    downloadErr: 'DOWNLOAD_ERR',
    downloadErrProjectName: 'DOWNLOAD_ERR_PROJECT_NAME',
    delLogs: 'DELETE_LOGS',
    receiveImportLog: 'RECEIVE_CASE_IMPORT_LOG',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES'
  }
})

export { containerActions, actions }
