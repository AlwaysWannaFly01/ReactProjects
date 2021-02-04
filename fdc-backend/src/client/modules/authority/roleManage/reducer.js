import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'roleManage',
  initialState: {
    authorityList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 10
    },
    roleResMenuPerms: [],
    roleAllMenu: [],
    // 权限城市
    authorityCity: {}
  },
  actionHandlers: {
    [actions.SET_AUTHORITY_LIST]: (state, { payload: [data] }) =>
      state
        .set('authorityList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: 10
        }),
    [actions.SET_SAVE_ROLE]: (state, { payload: [data] }) =>
      state.set('roleResMenuPerms', fromJS(data || [])),
    [actions.ALL_SAVE_ROLE]: (state, { payload: [data] }) =>
      state.set('roleAllMenu', fromJS(data || [])),
    [actions.SET_AUTHORITY_CITY_LIST]: (state, { payload: [data] }) =>
      state.set('authorityCity', fromJS(data))
  }
})
