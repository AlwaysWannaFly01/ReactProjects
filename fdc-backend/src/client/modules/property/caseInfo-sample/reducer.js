import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'caseInfoSample',
  initialState: {
    // 行政区列表
    areaList: [],
    // 案例类型列表
    caseTypeList: [],
    // 案例列表
    caseList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },
    houseUsageList: [],
    orientTypeList: [],
    buildTypeList: [],
    houseTypeList: [],
    structTypeList: [],
    currencyTypeList: [],

    // 案例详情
    caseDetail: {}
  },
  actionHandlers: {
    [actions.SET_AREA_LIST]: (state, { payload: [data] }) =>
      state.set('areaList', fromJS(data)),
    [actions.CLEAR_CASE_LIST]: state =>
      state.set('caseList', fromJS([])).set(
        'pagination',
        fromJS({
          total: 0,
          pageNum: 1,
          pageSize: 20
        })
      ),
    [actions.SET_CASE_TYPE_LIST]: (state, { payload: [data] }) =>
      state.set('caseTypeList', fromJS(data)),
    [actions.SET_CASE_LIST]: (state, { payload: [data] }) =>
      state
        .set('caseList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_HOUSE_USAGE]: (state, { payload: [data] }) =>
      state.set('houseUsageList', fromJS(data)),
    [actions.SET_ORIENT_TYPE]: (state, { payload: [data] }) =>
      state.set('orientTypeList', fromJS(data)),
    [actions.SET_BUILDING_TYPE]: (state, { payload: [data] }) =>
      state.set('buildTypeList', fromJS(data)),
    [actions.SET_HOUSE_TYPE]: (state, { payload: [data] }) =>
      state.set('houseTypeList', fromJS(data)),
    [actions.SET_STRUCT_TYPE]: (state, { payload: [data] }) =>
      state.set('structTypeList', fromJS(data)),
    [actions.SET_CURRENCY_TYPE]: (state, { payload: [data] }) =>
      state.set('currencyTypeList', fromJS(data)),
    [actions.SET_CASE_DETAIL]: (state, { payload: [data] }) =>
      state.set('caseDetail', fromJS(data)),
    [actions.CLEAR_CASE_DETAIL]: state => state.set('caseDetail', fromJS({}))
  }
})
