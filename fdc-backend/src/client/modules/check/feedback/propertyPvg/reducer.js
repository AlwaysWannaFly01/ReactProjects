import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'propertyPvg',
  initialState: {
    propertyPvgList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },
    answerList: [],
    oneLineList: [],
    sourceProduct: [],
    authorityList: []
  },
  actionHandlers: {
    [actions.SET_PROPERTY_PVG_LIST]: (state, { payload: [data] }) =>
      state
        .set('propertyPvgList', fromJS(data.records || []))
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
    [actions.SET_ONE_LINE_LIST]: (state, { payload: [data] }) =>
      state.set('oneLineList', fromJS(data || [])),
    [actions.SET_SOURCE_PRODUCT]: (state, { payload: [data] }) =>
      state.set('sourceProduct', fromJS(data || [])),
    [actions.SET_AUTHORITY_LIST]: (state, { payload: [data] }) =>
      state.set('authorityList', fromJS(data || []))
  }
})
