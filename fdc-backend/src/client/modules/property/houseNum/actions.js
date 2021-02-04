import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'houseNum',
  actions: {
    getDataList: 'GET_DATA_LIST',
    setDateList: 'SET_DATE_LIST',

    setHouseTitle: 'SET_HOUSE_TITLE',
    setTotalFloorNum: 'SET_TOTAL_FLOOR_NUM',

    addHouseName: 'ADD_HOUSE_NAME',

    getHouseAvgprice: 'GET_HOUSE_AVG_PRICE',
    setHouseAvgprice: 'SET_HOUSE_AVG_PRICE',

    setHouseFloor: 'SET_HOUSE_FLOOR',

    updateHouseCols: 'UPDATE_HOUSE_COLS',

    getUsageType: 'GET_USAGE_TYPE',
    setUsageType: 'SET_USAGE_TYPE',

    getHouseUsage: 'GET_HOUSE_USAGE',
    setHouseUsage: 'SET_HOUSE_USAGE',

    getStructType: 'GET_STRUCT_TYPE',
    setStructType: 'SET_STRUCT_TYPE',

    getOrientType: 'GET_ORIENT_TYPE',
    setOrientType: 'SET_ORIENT_TYPE',

    getSightType: 'GET_SIGHT_TYPE',
    setSightType: 'SET_SIGHT_TYPE',

    getVentLightType: 'GET_VENT_LIGHT_TYPE',
    setVentLightType: 'SET_VENT_LIGHT_TYPE',

    getNoiseType: 'GET_NOISE_TYPE',
    setNoiseType: 'SET_NOISE_TYPE',

    getDecorateType: 'GET_DECORATE_TYPE',
    setDecorateType: 'SET_DECORATE_TYPE',

    getSubHouseType: 'GET_SUB_HOUSE_TYPE',
    setSubHouseType: 'SET_SUB_HOUSE_TYPE',

    getHouseType: 'GET_HOUSE_TYPE',
    setHouseType: 'SET_HOUSE_TYPE',

    delAllHouse: 'DEL_ALL_HOUSE',

    batchUpdateFloor: 'BATCH_UPDTAE_FLOOR',

    getBuildDetail: 'GET_BUILD_DETAIL',
    setBuildDetail: 'SET_BUILD_DETAIL',

    getProjectDetail: 'GET_PROJECT_DETAIL',
    setProjectDetail: 'SET_PROJECT_DETAIL',

    getHouseDict: 'GET_HOUSE_DICT',
    setHouseDict: 'SET_HOUSE_DICT',

    getHouseDetail: 'GET_HOUSE_DETAIL',
    setHouseDetail: 'SET_HOUSE_DETAIL',

    addHouseNum: 'ADD_HOUSE_NUM',
    editHouseNum: 'EDIT_HOUSE_NUM',
    deleteHouseNum: 'DELETE_HOUSE_NUM',

    calculateHousePrice: 'CALCULATE_HOUSE_PRICE',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES'
  }
})

export default actions
export { containerActions }
