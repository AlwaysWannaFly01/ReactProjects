import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'publicResource',
  actions: {
    getFacilityType: 'GET_FACILITY_TYPE',
    setFacilityType: 'SET_FACILITY_TYPE',

    getCommonFacilities: 'GET_COMMON_FACILITIES',
    setCommonFacilities: 'SET_COMMON_FACILITIES',

    delCommonFacilities: 'DEL_COMMON_FACILITIES',
    addCommonFacility: 'ADD_COMMON_FACILITY',
    editCommonFacility: 'EDIT_COMMON_FACILITY',
    exportCommonFacilities: 'EXPORT_COMMON_FACILITIES',
    correlateProject: 'CORRELATE_PROJECT',

    getCommonFacilitiesDetail: 'GET_COMMON_FACILITY_DETAIL',
    setCommonFacilitiesDetail: 'SET_COMMON_FACILITY_DETAIL',
    clearCommonFacilitiesDetail: 'CLEAR_COMMON_FACILITIES_DETAIL',

    getFacilitiesSubTypeCode: 'GET_FACILITIES_SUB_TYPE_CODE',
    setFacilitiesSubTypeCode: 'SET_FACILITIES_SUB_TYPE_CODE',
    clearFacilitiesSubTypeCode: 'CLEAR_FACILITIES_SUB_TYPE_CODE',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES',

    getCorrelateProject: 'GET_CORRELATE_PROJECT',
    setCorrelateProject: 'SET_CORRELATE_PROJECT',
  }
})

export default actions
export { containerActions }
