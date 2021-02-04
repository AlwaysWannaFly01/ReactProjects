import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'caseInfoApart',
  actions: {
    getAreaList: 'GET_AREA_LIST',
    setAreaList: 'SET_AREA_LIST',

    getRentApartCaseList: 'GET_RENTAPART_CASE_LIST',
    setRentApartCaseList: 'SET_RENTAPART_CASE_LIST',

    initialFetch: 'INITIAL_FETCH',

    setBuildingTypes: 'SET_BUILDING_TYPES',
    setHouseTypes: 'SET_HOUSE_TYPES',
    setOrientationTypes: 'SET_ORIENTATION_TYPES',
    setPayTypes: 'SET_PAY_TYPES',
    setRentTypes: 'SET_RENT_TYPES',

    addRentApartCase: 'ADD_RENTAPART_CASE',
    delRentApartCase: 'DEL_RENTAPART_CASE',
    deleteAllCases: 'DELETE_ALL_CASES',
    editRentApartCase: 'EDIT_RENTAPART_CASE',
    exportRentApartCase: 'EXPORT_RENTAPART_CASE',

    getCaseDetail: 'GET_CASE_DETAIL',
    setCaseDetail: 'SET_CASE_DETAIL',
    clearCaseDetail: 'CLEAR_CASE_DETAIL',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES'
  }
})

export default actions
export { containerActions }
