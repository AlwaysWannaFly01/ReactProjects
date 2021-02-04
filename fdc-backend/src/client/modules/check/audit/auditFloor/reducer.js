import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'auditFloor',
  initialState: {
    auditFloorList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },
    matchList: [],
    showInformationList: {},
    authorityList: []
  },
  actionHandlers: {
    [actions.SET_AUDIT_LIST]: (state, { payload: [data] }) =>
      state
        .set('auditFloorList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_INFORMATION_LIST]: (state, { payload: [data] }) =>
      state.set('showInformationList', fromJS(data || {})),
    [actions.SET_MATCH_LIST]: (state, { payload: [data] }) =>
      state
        .set('matchList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_AUTHORITY_LIST]: (state, { payload: [data] }) =>
      state.set('authorityList', fromJS(data || []))
  }
})
