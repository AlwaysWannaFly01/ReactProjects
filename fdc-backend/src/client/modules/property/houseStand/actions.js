import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'houseStand',
  actions: {
    getCoefficientList: 'GET_COEFFICIENT_LIST',
    setCoefficientList: 'SET_COEFFICIENT_LIST',

    getImportExcelLogs: 'GET_IMPORT_EXCEL_LOGS',
    setImportExcelLogs: 'SET_IMPORT_EXCEL_LOGS',
    // 写个回调函数，用于导入时无数据查看权限
    getImportExcelLogsCb: 'GET_IMPORT_EXCEL_LOGS_CB',

    delImportLogs: 'DEL_IMPORT_LOGS',

    exportExcelCoefficient: 'EXPORT_EXCEL_COEFFICIENT',

    importExcelCoefficient: 'IMPORT_EXCEL_COEFFICIENT',

    exportTempExcel: 'EXPORT_TEMP_EXCEL',

    delProjectCoef: 'DEL_PROJECT_COEF',

    getProjectDetail: 'GET_PROJECT_DETAIL',
    setProjectDetail: 'SET_PROJECT_DETAIL',

    downCoefficientWord: 'DOWN_COEFFICIENT_WORD',

    exportErrorExcel: 'EXPORT_ERROR_EXCEL',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES',
    maxImportSize: 'MAX_IMPORT_SIZE',
  }
})

export default actions
export { containerActions }
