import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'dataQuick',
  actions: {
    saveQuickMaintainData: 'SAVE_QUICK_MAINTAIN_DATA',
  
    verifyProjectName: 'VERIFY_PROJECT_NAME',
    verifyProjectAddress: 'VERIFY_PROJECT_ADDRESS',
    
    getAliaType: 'GET_ALIA_TYPE',
    setAliaType: 'SET_ALIA_TYPE',
  
    setAddrType: 'SET_ADDR_TYPE',
  
    fetchValidateRegion:'FETCH_VALIDATE_REGION',
  
    fetchQuickDataDetail:'FETCH_QUICK_DATA_DETAIL',
    setQuickDataDetail: 'SET_QUICK_DATA_DETAIL',
  
    isMatchBatchProject: 'IS_MATCH_BATCH_PROJECT',
    addressValidate: 'ADDRESS_VALIDATE',
    
    fetchCompleteHouseData: 'FETCH_COMPLETE_HOUSE_DATA',
    setCompleteHouseData: 'SET_COMPLETE_HOUSE_DATA',
  
    getProjectDetail: 'GET_PROJECT_DETAIL',
    setProjectDetail: 'SET_PROJECT_DETAIL',
  
    getBuildingDetail: 'GET_BUILDING_DETAIL',
    setBuildingDetail: 'SET_BUILDING_DETAIL',
  
    fetchUnitNoList: 'FETCH_UNIT_NO_LIST',
    setUnitNoList: 'SET_UNIT_NO_LIST',
  
    fetchValuation: 'FETCH_VALUATION',
    setValuation: 'SET_VALUATION',
  
    getHouseDetail: 'GET_HOUSE_DETAIL',
    setHouseDetail: 'SET_HOUSE_DETAIL',
  
    fetchRoomNumList: 'FETCH_ROOM_NUM_LIST',
    setRoomNumList: 'SET_ROOM_NUM_LIST',
  
    fetchFloorList: 'FETCH_FLOOR_LIST',
    setFloorList: 'SET_FLOOR_LIST',
    
    getProvinceCityList: 'GET_PROVINCE_CITY_LIST',
    setProvinceCityList: 'SET_PROVINCE_CITY_LIST',
    
    getAreaList: 'GET_AREA_LIST',
    setAreaList: 'SET_AREA_LIST',
  
    initialFetch: 'INITIAL_FETCH',
  
    fetchProjectsList: 'FETCH_PROJECTS_LIST',
    setProjectsList: 'SET_PROJECTS_LIST',
  
    fetchBuidingList: 'FETCH_BUIDING_LIST',
    setBuidingList: 'SET_BUIDING_LIST',
  
    setPriceSource: 'SET_PRICE_SOURCE',
    getPriceSource: 'GET_PRICE_SOURCE',
    setUsageType: 'SET_USAGE_TYPE',
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
    editAuthority: 'EDIT_AUTHORITY',
  }
})

export default actions
export { containerActions }
