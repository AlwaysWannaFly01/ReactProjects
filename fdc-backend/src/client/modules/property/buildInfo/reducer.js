import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'buildInfo',
  initialState: {
    buildInfoList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 10
    },

    // 楼栋统计,楼栋总数.房号总数
    buildTotal: {
      buildingNumber: 0,
      houseNumber: 0,
      projectName: ''
    },

    // 楼栋详情
    buildDetail: {
      prjStatus: 1,
      status: 1
    },
    // 产权形式
    owershipTypeList: [],
    // 实际用途
    actualUsageTypeList: [],
    // 物业类型
    objectTypeList: [],
    // 楼栋用途
    usageTypeList: [],
    // 主体建筑类型
    buildingTypeList: [],
    // 朝向
    orientTypeList: [],
    // 景观
    sightTypeList: [],
    // 建筑结构
    buildStructureList: [],
    // 楼栋位置
    locationCodeList: [],
    // 楼栋户型面积
    houseAreaCodeList: [],

    externalWallList: [],
    insideDecorateTypeList: [],
    wallTypeList: [],
    maintenanceCodeList: [],
    gasCodeList: [],
    warmCodeList: [],

    // 楼盘详情
    projectDetail: {}
  },
  actionHandlers: {
    [actions.SET_BUILD_INFO_LIST]: (state, { payload: [data] }) =>
      state.set('buildInfoList', fromJS(data.records)).mergeIn(['pagination'], {
        total: +data.total,
        pageNum: data.pageNum,
        pageSize: data.pageSize
      }),
    [actions.SET_BUILD_TOTAL]: (state, { payload: [data] }) =>
      state.set('buildTotal', fromJS(data)),
    [actions.SET_BUILD_DETAIL]: (state, { payload: [data] }) =>
      state.set('buildDetail', fromJS(data)),
    [actions.RESET_BUILD_DETAIL]: state => state.set('buildDetail', fromJS({})),
    [actions.SET_OWERSHIP_TYPE]: (state, { payload: [data] }) =>
      state.set('owershipTypeList', fromJS(data)),
    [actions.SET_ACTUAL_USAGE_TYPE]: (state, { payload: [data] }) =>
      state.set('actualUsageTypeList', fromJS(data)),
    [actions.SET_OBJECT_TYPE]: (state, { payload: [data] }) =>
      state.set('objectTypeList', fromJS(data)),
    [actions.SET_USAGE_TYPE]: (state, { payload: [data] }) =>
      state.set('usageTypeList', fromJS(data)),
    [actions.SET_BUILDING_TYPE]: (state, { payload: [data] }) =>
      state.set('buildingTypeList', fromJS(data)),
    [actions.SET_ORIENT_TYPE]: (state, { payload: [data] }) =>
      state.set('orientTypeList', fromJS(data)),
    [actions.SET_SIGHT_TYPE]: (state, { payload: [data] }) =>
      state.set('sightTypeList', fromJS(data)),
    [actions.SET_BUILD_STRUCTURE]: (state, { payload: [data] }) =>
      state.set('buildStructureList', fromJS(data)),
    [actions.SET_LOCATION_CODE]: (state, { payload: [data] }) =>
      state.set('locationCodeList', fromJS(data)),
    [actions.SET_HOUSE_AREA_CODE]: (state, { payload: [data] }) =>
      state.set('houseAreaCodeList', fromJS(data)),
    [actions.SET_EXTERNAL_WALL]: (state, { payload: [data] }) =>
      state.set('externalWallList', fromJS(data)),
    [actions.SET_INSIDE_DECORATE_TYPE]: (state, { payload: [data] }) =>
      state.set('insideDecorateTypeList', fromJS(data)),
    [actions.SET_WALL_TYPE_CODE]: (state, { payload: [data] }) =>
      state.set('wallTypeList', fromJS(data)),
    [actions.SET_MAINTENANCE_CODE]: (state, { payload: [data] }) =>
      state.set('maintenanceCodeList', fromJS(data)),
    [actions.SET_GAS_CODE]: (state, { payload: [data] }) =>
      state.set('gasCodeList', fromJS(data)),
    [actions.SET_WARM_CODE]: (state, { payload: [data] }) =>
      state.set('warmCodeList', fromJS(data)),
    [actions.SET_PROJECT_DETAIL]: (state, { payload: [data] }) =>
      state.set('projectDetail', fromJS(data))
  }
})
