import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'dataCityAvg',
  initialState: {
    // 城市均价列表
    cityAvgList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },
    // 物业类型
    objectTypeList: [],
    // 城市均价详情
    cityAvgDetail: {},
    // 上个月城市均价
    lastMonthPrice: ''
  },
  actionHandlers: {
    [actions.SET_OBJECT_TYPE]: (state, { payload: [data] }) =>
      state.set('objectTypeList', fromJS(data)),
    [actions.SET_CITY_AVG_PRICE]: (state, { payload: [data] }) =>
      state
        .set('cityAvgList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_CITY_AVG_PRICE_DETAIL]: (state, { payload: [data] }) =>
      state.set('cityAvgDetail', fromJS(data)),
    [actions.CLEAR_CITY_AVG_PRICE_DETAIL]: state =>
      state.set('cityAvgDetail', fromJS({})),
    [actions.SET_LAST_MONTH_CITY_AVG_PRICE]: (state, { payload: [data] }) =>
      state.set('lastMonthPrice', data)
  }
})
