import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'AccountManage',
  initialState: {
    accountList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },
    roleList: []
  },
  actionHandlers: {
    [actions.SET_ACCOUNT_LIST]: (state, { payload: [data] }) =>
      state
        .set('accountList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_ROLE_LIST]: (state, { payload: [data] }) =>
      state.set('roleList', fromJS(data.list || []))
  }
})
