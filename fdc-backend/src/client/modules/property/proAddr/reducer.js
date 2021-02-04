import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'proAddr',
  initialState: {
    projectAddrList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },

    // 地址类型
    addrTypeList: [],
    projectDetail: {}
  },
  actionHandlers: {
    [actions.SET_PROJECT_ADDR_LIST]: (state, { payload: [data] }) =>
      state
        .set('projectAddrList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_ADDR_TYPE]: (state, { payload: [data] }) =>
      state.set('addrTypeList', fromJS(data)),
    [actions.SET_PROJECT_DETAIL]: (state, { payload: [data] }) =>
      state.set('projectDetail', fromJS(data))
  }
})
