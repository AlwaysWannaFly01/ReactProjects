import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'building',
  initialState: {
    buildList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },
    buildDetail: {},
    fdcBuildList: [],
    authorityList: []
  },
  actionHandlers: {
    [actions.SET_BUILD_LIST]: (state, { payload: [data] }) =>
      state
        .set('buildList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_BUILD_DETAIL]: (state, { payload: [data] }) =>
      state.set('buildDetail', fromJS(data || {})),
    [actions.SET_FDC_BUILD_LIST]: (state, { payload: [data] }) =>
      state
        .set('fdcBuildList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_AUTHORITY_LIST]: (state, { payload: [data] }) =>
      state.set('authorityList', fromJS(data || []))
  }
})
