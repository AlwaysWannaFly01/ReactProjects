import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'houseNum',
  initialState: {
    // table数据
    dataList: [],
    houseTitle: [],
    // 楼栋总楼层
    totalFloorNum: 0,
    // 项目均价和楼盘均价
    houseAvgPrice: {},

    floorList: [],
    houseColList: [],

    // 用途列表
    usageTypeList: [],
    structTypeList: [],
    orientTypeList: [],
    sightTypeList: [],
    ventLightTypeList: [],
    noiseTypeList: [],
    decorateTypeList: [],
    subHouseTypeList: [],
    houseTypeList: [],
    houseUsageList: [],

    // 楼栋详情
    buildDetail: {},
    // 楼栋状态
    buildStatus: 1,
    // 楼盘详情
    projectDetail: {},
    // 房号编辑页 字典数据合集
    houseDict: {},
    // 房号详情
    houseDetail: {}
  },
  actionHandlers: {
    [actions.SET_DATE_LIST]: (state, { payload: [data] }) =>
      state.set('dataList', fromJS(data)),
    [actions.SET_HOUSE_TITLE]: (state, { payload: [data] }) =>
      state.set('houseTitle', fromJS(data)),
    [actions.SET_TOTAL_FLOOR_NUM]: (state, { payload: [data] }) =>
      state.set('totalFloorNum', fromJS(data)),
    [actions.SET_HOUSE_AVG_PRICE]: (state, { payload: [data] }) =>
      state.set('houseAvgPrice', fromJS(data)),
    [actions.SET_HOUSE_FLOOR]: (
      state,
      { payload: [floorList, houseColList] }
    ) => state.set('floorList', floorList).set('houseColList', houseColList),
    [actions.SET_USAGE_TYPE]: (state, { payload: [data] }) =>
      state.set('usageTypeList', fromJS(data)),
    [actions.SET_STRUCT_TYPE]: (state, { payload: [data] }) =>
      state.set('structTypeList', fromJS(data)),
    [actions.SET_ORIENT_TYPE]: (state, { payload: [data] }) =>
      state.set('orientTypeList', fromJS(data)),
    [actions.SET_SIGHT_TYPE]: (state, { payload: [data] }) =>
      state.set('sightTypeList', fromJS(data)),
    [actions.SET_VENT_LIGHT_TYPE]: (state, { payload: [data] }) =>
      state.set('ventLightTypeList', fromJS(data)),
    [actions.SET_NOISE_TYPE]: (state, { payload: [data] }) =>
      state.set('noiseTypeList', fromJS(data)),
    [actions.SET_DECORATE_TYPE]: (state, { payload: [data] }) =>
      state.set('decorateTypeList', fromJS(data)),
    [actions.SET_SUB_HOUSE_TYPE]: (state, { payload: [data] }) =>
      state.set('subHouseTypeList', fromJS(data)),
    [actions.SET_HOUSE_TYPE]: (state, { payload: [data] }) =>
      state.set('houseTypeList', fromJS(data)),
    [actions.SET_HOUSE_USAGE]: (state, { payload: [data] }) =>
      state.set('houseUsageList', fromJS(data)),
    [actions.SET_BUILD_TOTAL]: (state, { payload: [data] }) =>
      state.set('buildTotal', fromJS(data)),
    [actions.SET_BUILD_DETAIL]: (state, { payload: [data] }) => {
      // 判定楼栋的状态
      let buildStatus = 1
      const { prjStatus, status } = data
      if (prjStatus === 1) {
        buildStatus = status
      } else {
        buildStatus = 0
      }
      return state
        .set('buildDetail', fromJS(data))
        .set('buildStatus', buildStatus)
    },
    [actions.SET_PROJECT_DETAIL]: (state, { payload: [data] }) =>
      state.set('projectDetail', fromJS(data)),
    [actions.SET_HOUSE_DICT]: (state, { payload: [data] }) =>
      state.set('houseDict', fromJS(data)),
    [actions.SET_HOUSE_DETAIL]: (state, { payload: [data] }) =>
      state.set('houseDetail', fromJS(data))
  }
})
