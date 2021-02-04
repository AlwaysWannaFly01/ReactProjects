import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'caseInfoSample',
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
    updateVisitCities: 'UPDATE_VISIT_CITIES'
  }
})

export default actions
export { containerActions }
