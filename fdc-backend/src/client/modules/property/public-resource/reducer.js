import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'publicResource',
  initialState: {
    // 公共配套列表
    commonFacilityList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },

    // 配套类型
    facilityTypeList: [],
    // 配套子类型
    facilitySubTypeList: [],
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
    [actions.SET_COMMON_FACILITIES]: (state, { payload: [data] }) =>
      state
        .set('commonFacilityList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_COMMON_FACILITY_DETAIL]: (state, { payload: [data] }) =>
      state.set('facilityDetail', fromJS(data)),
    [actions.CLEAR_COMMON_FACILITIES_DETAIL]: state =>
      state.set('facilityDetail', fromJS({}))
  }
})
