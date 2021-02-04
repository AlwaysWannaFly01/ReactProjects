import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'roomNO',
  initialState: {
    houseList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },
    houseDetail: {},
    fdcHouseList: [],
    preMatchList: {},
    conditionList: {},
    authorityList: []
  },
  actionHandlers: {
    [actions.SET_HOUSE_LIST]: (state, { payload: [data] }) =>
      state
        .set('houseList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_HOUSE_DETAIL]: (state, { payload: [data] }) =>
      state.set('houseDetail', fromJS(data || {})),
    [actions.SET_FDC_HOUSE_LIST]: (state, { payload: [data] }) =>
      state
        .set('fdcHouseList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_PRE_MATCH_LIST]: (state, { payload: [data] }) =>
      state.set('preMatchList', fromJS(data || {})),
    [actions.SET_CONDITION_LIST]: (state, { payload: [data] }) =>
      state.set('conditionList', fromJS(data || {})),
    [actions.SET_AUTHORITY_LIST]: (state, { payload: [data] }) =>
      state.set('authorityList', fromJS(data || []))
  }
})
