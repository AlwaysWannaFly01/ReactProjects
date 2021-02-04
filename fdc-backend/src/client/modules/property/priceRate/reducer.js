import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'priceRate',
  initialState: {
    // 行政区列表
    areaList: [],
    // 价格比值 列表
    priceRateList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },

    // 案例详情
    priceRateDetailList: {}
  },
  actionHandlers: {
    [actions.SET_AREA_LIST]: (state, { payload: [data] }) =>
      state.set('areaList', fromJS(data)),
    [actions.SET_PRICE_RATE_LIST]: (state, { payload: [data] }) =>
      state
        .set('priceRateList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_PRICE_RATE_DETAIL]: (state, { payload: [data] }) =>
      state.set('priceRateDetailList', fromJS(data))
  }
})
