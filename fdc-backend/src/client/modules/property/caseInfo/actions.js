import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'caseInfo',
  actions: {
    getAreaList: 'GET_AREA_LIST',
    setAreaList: 'SET_AREA_LIST',

    getCaseTypeList: 'GET_CASE_TYPE_LIST',
    setCaseTypeList: 'SET_CASE_TYPE_LIST',

    fetchCaseList: 'FETCH_CASE_LIST',
    setCaseList: 'SET_CASE_LIST',

    initialFetch: 'INITIAL_FETCH',

    setHouseUsage: 'SET_HOUSE_USAGE',
    setOrientType: 'SET_ORIENT_TYPE',
    setBuildingType: 'SET_BUILDING_TYPE',
    setHouseType: 'SET_HOUSE_TYPE',
    setStructType: 'SET_STRUCT_TYPE',
    setCurrencyType: 'SET_CURRENCY_TYPE',

    addCase: 'ADD_CASE',
    editCase: 'EDIT_CASE',

    getCaseDetail: 'GET_CASE_DETAIL',
    setCaseDetail: 'SET_CASE_DETAIL',
    clearCaseDetail: 'CLEAR_CASE_DETAIL',

    deleteCases: 'DELETE_CASES',

    deleteAllCases: 'DELETE_ALL_CASES',

    exportCase: 'EXPORT_CASE',

    clearCaseList: 'CLEAR_CASE_LIST',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES',
    // 错误楼盘名称列表
    fetchErrorList: 'FETCH_ERROR_LIST',
    setErrorList: 'SET_ERROR_LIST',

    deleteError: 'DELETE_ERROR',
    deleteAllError: 'DELETE_ALL_ERROR',
    exportErrorProject: 'EXPORT_ERROR_PROJECT',
    exportProjectAvg:'EXPORT_PROJECT_AVG',
    editProjectName: 'EDIT_PROJECT_NAME',
    editAuthority: 'EDIT_AUTHORITY',
    getAliaType: 'GET_ALIA_TYPE', // 别名类型
    // setAliaType: 'SET_ALIA_TYPE'
  }
})

export default actions
export { containerActions }
