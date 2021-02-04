import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'baseInfo',
  initialState: {
    baseInfoList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 10
    },

    // 行政区列表
    areaList: [],
    // 片区列表
    subAreaList: [],
    // 主用途列表
    usageTypeList: [],
    // 主建筑类型列表
    buildingTypeList: [],
    // 产权形式列表
    ownershipTypeList: [],
    // 获取学区属性
    schoolDistrictList: [],
    // 物业类型列表
    objectTypeList: [],
    // 实际用途列表
    actualUsageTypeList: [],
    // 装修情况列表
    decorationTypeList: [],
    // 土地规划用途列表
    landPlanUsageList: [],
    // 土地级别
    landLevelList: [],
    // 建筑质量
    buildingQualityList: [],
    // 小区规模
    communitySizeList: [],
    // 物业管理质量
    managementQualityList: [],
    // 小区封闭性
    communityClosenessList: [],
    // 配套等级
    classCodeList: [],
    // 环线位置
    loopLineList: [],
    // 人车分流情况
    diversionVehicleList: [],
    // 获取地铁属性
    subwayPropertyList: [],
    // 轨道沿线列表
    subwayCodeList: [],
    // 项目特色
    projectFeatureList: [],

    // 查询楼盘详情
    projectDetail: {},
    // 需要拆分的楼栋列表
    splitBuildList: [],
    // 获取当前城市所有正式楼盘
    mergeProjectList: [],

    // 统计楼盘的楼栋数和房号数
    cityCount: {
      projectNumber: 0,
      buildingNumber: 0,
      houseNumber: 0
    },
    // 建筑物类型比值列表
    buildRateList: [],
    aloneArea: [],
    // 片区绘制
    areaDrawList: []
  },
  actionHandlers: {
    [actions.SET_BASE_INFO_LIST]: (state, { payload: [data] }) =>
      state.set('baseInfoList', fromJS(data.records)).mergeIn(['pagination'], {
        total: +data.total,
        pageNum: data.pageNum,
        pageSize: data.pageSize
      }),
    [actions.SET_DISTRICT_AREAS]: (state, { payload: [data] }) =>
      state.set('areaList', fromJS(data)),
    [actions.SET_ALONE_AREA]: (state, { payload: [data] }) =>
      state.set('aloneArea', fromJS(data)),
    [actions.SET_SUB_AREAS]: (state, { payload: [data] }) =>
      state.set('subAreaList', fromJS(data)),
    [actions.SET_USAGE_TYPE]: (state, { payload: [data] }) =>
      state.set('usageTypeList', fromJS(data)),
    [actions.SET_BUILDING_TYPE]: (state, { payload: [data] }) =>
      state.set('buildingTypeList', fromJS(data)),
    [actions.SET_OWNERSHIP_TYPE]: (state, { payload: [data] }) =>
      state.set('ownershipTypeList', fromJS(data)),
    [actions.SET_SCHOOL_DISTRICT_PROPERTY]: (state, { payload: [data] }) =>
      state.set('schoolDistrictList', fromJS(data)),
    [actions.SET_OBJECT_TYPE]: (state, { payload: [data] }) =>
      state.set('objectTypeList', fromJS(data)),
    [actions.SET_ACTUAL_USAGE_TYPE]: (state, { payload: [data] }) =>
      state.set('actualUsageTypeList', fromJS(data)),
    [actions.SET_DECORATION_TYPE]: (state, { payload: [data] }) =>
      state.set('decorationTypeList', fromJS(data)),
    [actions.SET_LAND_PLAN_USAGE]: (state, { payload: [data] }) =>
      state.set('landPlanUsageList', fromJS(data)),
    [actions.SET_LAND_LEVEL]: (state, { payload: [data] }) =>
      state.set('landLevelList', fromJS(data)),
    [actions.SET_BUILDING_QUALITY]: (state, { payload: [data] }) =>
      state.set('buildingQualityList', fromJS(data)),
    [actions.SET_COMMUNITY_SIZE]: (state, { payload: [data] }) =>
      state.set('communitySizeList', fromJS(data)),
    [actions.SET_MANAGEMENT_QUALITY]: (state, { payload: [data] }) =>
      state.set('managementQualityList', fromJS(data)),
    [actions.SET_COMMUNITY_CLOSENESS]: (state, { payload: [data] }) =>
      state.set('communityClosenessList', fromJS(data)),
    [actions.SET_CLASS_CODE]: (state, { payload: [data] }) =>
      state.set('classCodeList', fromJS(data)),
    [actions.SET_LOOP_LINE]: (state, { payload: [data] }) =>
      state.set('loopLineList', fromJS(data)),
    [actions.SET_DIVERSION_VEHICLE]: (state, { payload: [data] }) =>
      state.set('diversionVehicleList', fromJS(data)),
    [actions.SET_SUBWAY_PROPERTY]: (state, { payload: [data] }) =>
      state.set('subwayPropertyList', fromJS(data)),
    [actions.SET_SUBWAY_CODE]: (state, { payload: [data] }) =>
      state.set('subwayCodeList', fromJS(data)),
    [actions.SET_PROJECT_FEATURE]: (state, { payload: [data] }) =>
      state.set('projectFeatureList', fromJS(data)),
    [actions.SET_PROJECT_DETAIL]: (state, { payload: [data] }) =>
      state.set('projectDetail', fromJS(data)),
    [actions.SET_ALL_DETAIL]: (state, { payload: [data] }) =>
      state.set('projectDetail', fromJS(data)),
    [actions.RESET_PROJECT_DETAIL]: state =>
      state.set('projectDetail', fromJS({})),
    [actions.SET_SPLIT_BUILD_LIST]: (state, { payload: [data] }) =>
      state.set('splitBuildList', fromJS(data)),
    [actions.SET_MERGE_PROJECT_LIST]: (state, { payload: [data] }) =>
      state.set('mergeProjectList', fromJS(data)),
    [actions.SET_CITY_COUNT]: (state, { payload: [data] }) =>
      state.set('cityCount', fromJS(data)),
    [actions.SET_BUILD_RATE_LIST]: (state, { payload: [data] }) =>
      state
        .set('buildRateList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_AREA_DRAW]: (state, { payload: [data] }) =>
      state.set('areaDrawList', fromJS(data))
  }
})
