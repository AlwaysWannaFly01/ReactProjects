import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'buildInfo',
  actions: {
    getBuildInfoList: 'GET_BUILD_INFO_LIST',
    setBuildInfoList: 'SET_BUILD_INFO_LIST',
    addBuild: 'ADD_BUILD',
    editBuild: 'EDIT_BUILD',
    delBuild: 'DEL_BUILD',
    restoreBuild: 'RESTORE_BUILD',
    batchUpdateBuild: 'BATCH_UPDATE_BUILD',

    calculateHouse: 'CALCULATE_HOUSE',
    syncHouse: 'SYNC_HOUSE',

    getBuildTotal: 'GET_BUILD_TOTAL',
    setBuildTotal: 'SET_BUILD_TOTAL',

    getBuildDetail: 'GET_BUILD_DETAIL',
    setBuildDetail: 'SET_BUILD_DETAIL',
    resetBuildDetail: 'RESET_BUILD_DETAIL',

    initialAddFetchFirst: 'INITIAL_ADD_FETCH_FIRST',
    initialAddFetchThird: 'INITIAL_ADD_FETCH_THIRD',
    initialAddFetchForth: 'INITIAL_ADD_FETCH_FORTH',

    setOwershipType: 'SET_OWERSHIP_TYPE',
    setActualUsageType: 'SET_ACTUAL_USAGE_TYPE',
    setObjectType: 'SET_OBJECT_TYPE',
    setUsageType: 'SET_USAGE_TYPE',
    setBuildingType: 'SET_BUILDING_TYPE',
    setOrientType: 'SET_ORIENT_TYPE',
    setSightType: 'SET_SIGHT_TYPE',
    setBuildStructure: 'SET_BUILD_STRUCTURE',

    getLocationCode: 'GET_LOCATION_CODE',
    setLocationCode: 'SET_LOCATION_CODE',

    getHouseAreaCode: 'GET_HOUSE_AREA_CODE',
    setHouseAreaCode: 'SET_HOUSE_AREA_CODE',

    getExternalWall: 'GET_EXTERNAL_WALL',
    setExternalWall: 'SET_EXTERNAL_WALL',

    // getDecorateType: 'GET_DECORATE_TYPE',
    // setDecorateType: 'SET_DECORATE_TYPE',

    getInsideDecorateType: 'GET_INSIDE_DECORATE_TYPE',
    setInsideDecorateType: 'SET_INSIDE_DECORATE_TYPE',

    getWallTypeCode: 'GET_WALL_TYPE_CODE',
    setWallTypeCode: 'SET_WALL_TYPE_CODE',

    getMaintenanceCode: 'GET_MAINTENANCE_CODE',
    setMaintenanceCode: 'SET_MAINTENANCE_CODE',

    getGasCode: 'GET_GAS_CODE',
    setGasCode: 'SET_GAS_CODE',

    getWarmCode: 'GET_WARM_CODE',
    setWarmCode: 'SET_WARM_CODE',

    validBuildCopy: 'VALID_BUILD_COPY',

    buildCopy: 'BUILD_COPY',

    validBuildName: 'VALID_BUILD_NAME',

    getProjectDetail: 'GET_PROJECT_DETAIL',
    setProjectDetail: 'SET_PROJECT_DETAIL',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES'
  }
})

export default actions
export { containerActions }
