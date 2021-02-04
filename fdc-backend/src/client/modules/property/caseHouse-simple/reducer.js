import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'caseHouseSample',
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

    // 案例详情
    caseDetail: {},
    sampleList: [],
    sampleListInBase: [],
    newHouseList: []
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
    [actions.SET_CASE_LIST]: (state, { payload: [data] }) =>
      state
        .set('caseList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_CASE_DETAIL]: (state, { payload: [data] }) =>
      state.set('caseDetail', fromJS(data)),
    [actions.SET_SAMPLE_LIST]: (state, { payload: [data] }) =>
      state
        .set('sampleList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_SAMPLE_LIST_INBASE]: (state, { payload: [data] }) =>
      state.set('sampleListInBase', fromJS(data || [])),
    [actions.SET_PROJECT_POP]: (state, { payload: [data] }) =>
      state.set('newHouseList', fromJS(data.records || []))
  }
})
