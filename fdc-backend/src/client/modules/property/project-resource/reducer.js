import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'projectResource',
  initialState: {
    // 楼盘配套列表
    prjectFacilityList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },
    // 楼盘详情
    projectDetail: {},

    // 配套类型
    facilityTypeList: [],
    // 配套子类
    facilitySubTypeList: [],
    // 配套等级
    facilityClassCodeList: [],
    // 配套详情
    facilityDetail: {}
  },
  actionHandlers: {
    [actions.SET_FACILITY_TYPE]: (state, { payload: [data] }) =>
      state.set('facilityTypeList', fromJS(data)),
    [actions.SET_FACILITIES_SUB_TYPE_CODE]: (state, { payload: [data] }) =>
      state.set('facilitySubTypeList', fromJS(data)),
    [actions.CLEAR_FACILITIES_SUB_TYPE_CODE]: state =>
      state.set('facilitySubTypeList', fromJS([])),
    [actions.SET_FACILITY_CLASS_CODE]: (state, { payload: [data] }) =>
      state.set('facilityClassCodeList', fromJS(data)),
    [actions.SET_PROJECT_FACILITIES]: (state, { payload: [data] }) =>
      state
        .set('prjectFacilityList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_PROJECT_DETAIL]: (state, { payload: [data] }) =>
      state.set('projectDetail', fromJS(data)),
    [actions.SET_PROJECT_FACILITY_DETAIL]: (state, { payload: [data] }) =>
      state.set('facilityDetail', fromJS(data))
  }
})
