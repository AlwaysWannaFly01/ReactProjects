import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'baseInfo',
  actions: {
    initialFetch: 'INITIAL_FETCH',
    initialAddFetchFirst: 'INITIAL_ADD_FETCH_FIRST',
    initialAddFetchThird: 'INITIAL_ADD_FETCH_THIRD',
    initialAddFetchForth: 'INITIAL_ADD_FETCH_FORTH',
    initialAddFetchFifth: 'INITIAL_ADD_FETCH_FIFTH',

    getBaseInfoList: 'GET_BASE_INFO_LIST',
    setBaseInfoList: 'SET_BASE_INFO_LIST',
    getDistrictAreas: 'GET_DISTRICT_AREAS',
    setDistrictAreas: 'SET_DISTRICT_AREAS',

    getSubAreas: 'GET_SUB_AREAS',
    setSubAreas: 'SET_SUB_AREAS',

    getUsageType: 'GET_USAGE_TYPE',
    setUsageType: 'SET_USAGE_TYPE',

    getBuildingType: 'GET_BUILDING_TYPE',
    setBuildingType: 'SET_BUILDING_TYPE',

    getOwnershipType: 'GET_OWNERSHIP_TYPE',
    setOwnershipType: 'SET_OWNERSHIP_TYPE',

    getSchoolDistrictProperty: 'GET_SCHOOL_DISTRICT_PROPERTY', // 获取学区属性
    setSchoolDistrictProperty: 'SET_SCHOOL_DISTRICT_PROPERTY',

    getsubwayProperty: 'GET_SUBWAY_PROPERTY', // 获取地铁属性
    setsubwayProperty: 'SET_SUBWAY_PROPERTY',

    getObjectType: 'GET_OBJECT_TYPE',
    setObjectType: 'SET_OBJECT_TYPE',

    getActualUsageType: 'GET_ACTUAL_USAGE_TYPE',
    setActualUsageType: 'SET_ACTUAL_USAGE_TYPE',

    getDecorationType: 'GET_DECORATION_TYPE',
    setDecorationType: 'SET_DECORATION_TYPE',

    getLandPlanUsage: 'GET_LAND_PLAN_USAGE',
    setLandPlanUsage: 'SET_LAND_PLAN_USAGE',

    getLandLevel: 'GET_LAND_LEVEL',
    setLandLevel: 'SET_LAND_LEVEL',

    getBuildingQuality: 'GET_BUILDING_QUALITY',
    setBuildingQuality: 'SET_BUILDING_QUALITY',

    getCommunitySize: 'GET_COMMUNITY_SIZE',
    setCommunitySize: 'SET_COMMUNITY_SIZE',

    getManagementQuality: 'GET_MANAGEMENT_QUALITY',
    setManagementQuality: 'SET_MANAGEMENT_QUALITY',

    getCommunityCloseness: 'GET_COMMUNITY_CLOSENESS',
    setCommunityCloseness: 'SET_COMMUNITY_CLOSENESS',

    getClassCode: 'GET_CLASS_CODE',
    setClassCode: 'SET_CLASS_CODE',

    getLoopLine: 'GET_LOOP_LINE',
    setLoopLine: 'SET_LOOP_LINE',

    getDiversionVehicle: 'GET_DIVERSION_VEHICLE',
    setDiversionVehicle: 'SET_DIVERSION_VEHICLE',

    getSubwayCode: 'GET_SUBWAY_CODE',
    setSubwayCode: 'SET_SUBWAY_CODE',

    getProjectFeature: 'GET_PORJECT_FEATURE',
    setProjectFeature: 'SET_PROJECT_FEATURE',

    addProject: 'ADD_PROJECT',
    editProject: 'EDIT_PROJECT',
    delProjects: 'DEL_PROJECTS',
    restoreProjects: 'RESTORE_PROJECTS',

    getProjectDetail: 'GET_PROJECT_DETAIL',
    setProjectDetail: 'SET_PROJECT_DETAIL',
    // wy change 没有楼盘权限要调用的接口
    getAllDetail: 'GET_ALL_DETAIL',
    setAllDetail: 'SET_ALL_DETAIL',

    resetProjectDetail: 'RESET_PROJECT_DETAIL',

    validProjectSplit: 'VALID_PROJECT_SPLIT',

    getSplitBuildList: 'GET_SPLIT_BUILD_LIST',
    setSplitBuildList: 'SET_SPLIT_BUILD_LIST',

    getMergeProjectList: 'GET_MERGE_PROJECT_LIST',
    setMergeProjectList: 'SET_MERGE_PROJECT_LIST',

    splitProject: 'SPLIT_PROJECT',

    mergeProjects: 'MERGE_PROJECT',

    getCityCount: 'GET_CITY_COUNT',
    setCityCount: 'SET_CITY_COUNT',

    addValidateProjectName: 'ADD_VALIDATE_PROJECT_NAME',
    editValidateProjectName: 'EDIT_VALIDATE_PROJECT_NAME',
    hasMatchProjectAlias: 'HAS_MATCH_PROJECT_ALIAS',
  
    addValidateProjectAlias: 'ADD_VALIDATE_PROJECT_ALIAS',
    editValidateProjectAlias: 'EDIT_VALIDATE_PROJECT_ALIAS',

    getPinyinStringLo: 'GET_PINYIN_STRING_LO',

    getBuildTotal: 'GET_BUILD_TOTAL',

    getDefaultCity: 'GET_DEFAULT_CITY',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES',
    // 建筑物类型比值
    getBuildRateList: 'GET_BUILD_RATE_LIST',
    setBuildRateList: 'SET_BUILD_RATE_LIST',
    // 行政区
    getAloneArea: 'GET_ALONE_AREA',
    setAloneArea: 'SET_ALONE_AREA',
    // 导出
    exportRate: 'EXPORT_RATE',
    exportOnceCase: 'EXPORT_ONCE_CASE',
    // 片区绘制
    getAreaDraw: 'GET_AREA_DRAW',
    setAreaDraw: 'SET_AREA_DRAW',
    newChangeDraw: 'NEW_CHANGE_DRAW', // 3. 新建/修改绘制
    officialEstate: 'OFFICIAL_ESTATE', // 1. 获取当前城市或片区下所有有经纬度的正式楼盘
    // setOfficialEstate: 'SET_OFFICIAL_ESTATE'
    deleteAreaDraw: 'DELETE_AREA_DRAW',
    relationSubArea: 'RELATION_SUBAREA', // 关联片区
    delProjectAlia: 'DEL_PROJECT_ALIA',
  }
})

export default actions
export { containerActions }
