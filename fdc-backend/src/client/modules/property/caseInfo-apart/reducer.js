import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'caseInfoApart',
  initialState: {
    // 行政区列表
    areaList: [],
    // 案例列表
    caseList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },

    buildingTypes: [],
    houseTypes: [],
    orientationTypes: [],
    payTypes: [],
    rentTypes: [],

    caseDetail: {}
  },
  actionHandlers: {
    [actions.SET_AREA_LIST]: (state, { payload: [data] }) =>
      state.set('areaList', fromJS(data)),
    [actions.SET_RENTAPART_CASE_LIST]: (state, { payload: [data] }) =>
      state
        .set('caseList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_BUILDING_TYPES]: (state, { payload: [data] }) =>
      state.set('buildingTypes', fromJS(data)),
    [actions.SET_HOUSE_TYPES]: (state, { payload: [data] }) =>
      state.set('houseTypes', fromJS(data)),
    [actions.SET_ORIENTATION_TYPES]: (state, { payload: [data] }) =>
      state.set('orientationTypes', fromJS(data)),
    [actions.SET_PAY_TYPES]: (state, { payload: [data] }) =>
      state.set('payTypes', fromJS(data)),
    [actions.SET_RENT_TYPES]: (state, { payload: [data] }) =>
      state.set('rentTypes', fromJS(data)),
    [actions.SET_CASE_DETAIL]: (state, { payload: [data] }) =>
      state.set('caseDetail', fromJS(data)),
    [actions.CLEAR_CASE_DETAIL]: state => state.set('caseDetail', fromJS({}))
  }
})
