import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'projectResource',
  actions: {
    getFacilityType: 'GET_FACILITY_TYPE',
    setFacilityType: 'SET_FACILITY_TYPE',

    getProjectFacilities: 'GET_PROJECT_FACILITIES',
    setProjectFacilities: 'SET_PROJECT_FACILITIES',

    getProjectDetail: 'GET_PROJECT_DETAIL',
    setProjectDetail: 'SET_PROJECT_DETAIL',

    delProjectFacilities: 'DEL_PROJECT_FACILITIES',
    exportProjectFacilities: 'EXPORT_PROJECT_FACILITIES',

    addProjectFacility: 'ADD_PROJECT_FACILITY',
    editProjectFacility: 'EDIT_PROJECT_FACILITY',

    getFacilitiesSubTypeCode: 'GET_FACILITIES_SUB_TYPE_CODE',
    setFacilitiesSubTypeCode: 'SET_FACILITIES_SUB_TYPE_CODE',
    clearFacilitiesSubTypeCode: 'CLEAR_FACILITIES_SUB_TYPE_CODE',

    getFacilityClassCode: 'GET_FACILITY_CLASS_CODE',
    setFacilityClassCode: 'SET_FACILITY_CLASS_CODE',

    getProjectFacilityDetail: 'GET_PROJECT_FACILITY_DETAIL',
    setProjectFacilityDetail: 'SET_PROJECT_FACILITY_DETAIL',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES'
  }
})

export default actions
export { containerActions }
