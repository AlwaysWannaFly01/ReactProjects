import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'propertys',
  initialState: {
    propertysList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },
    answerList: [],
    sourceProduct: []
  },
  actionHandlers: {
    [actions.SET_PROPERTYS_LIST]: (state, { payload: [data] }) =>
      state
        .set('propertysList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_ANSWER_LIST]: (state, { payload: [data] }) =>
      state
        .set('answerList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_SOURCE_PRODUCT]: (state, { payload: [data] }) =>
      state.set('sourceProduct', fromJS(data || []))
  }
})
