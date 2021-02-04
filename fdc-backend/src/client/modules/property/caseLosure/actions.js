import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'caseLosure',
  actions: {
    getEndReasonCode: 'GET_ENDREASON_CODE',
    setEndReasonCode: 'SET_ENDREASON_CODE',
    
    fetchProjectsList: 'FETCH_PROJECTS_LIST',
    setProjectsList: 'SET_PROJECTS_LIST',
    
    getAreaList: 'GET_AREA_LIST',
    setAreaList: 'SET_AREA_LIST',
    fetchCaseList: 'FETCH_CASE_LIST',
    setCaseList: 'SET_CASE_LIST',
  
    getClosureCaseTypeList: 'GET_CLOSURE_CASE_TYPE_LIST',
    setClosureCaseTypeList: 'SET_CLOSURE_CASE_TYPE_LIST',
  
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
  }
})

export default actions
export { containerActions }
