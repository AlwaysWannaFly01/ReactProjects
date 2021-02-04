import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'DatasourceManage',
  initialState: {
    channelList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },
    dataList: [],
    productDataList: []
  },
  actionHandlers: {
    [actions.SET_CHANNEL_LIST]: (state, { payload: [data] }) =>
      state
        .set('channelList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_PRODUCT_LIST]: (state, { payload: [data] }) =>
      state.set('productDataList', fromJS(data || [])),
    [actions.SET_DATA_LIST]: (state, { payload: [data] }) =>
      state.set('dataList', fromJS(data || [])),
    [actions.CLEAR_CASE_LIST]: state => state.set('dataList', fromJS([]))
  }
})
