import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'estateRating',
  initialState: {
    ratingRlueList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    }
  },
  actionHandlers: {
    [actions.SET_RATING_RULE_SEARCH]: (state, { payload: [data] }) =>
      state
        .set('ratingRlueList', fromJS(data.records))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_CITY_AVG_PRICE_DETAIL]: (state, { payload: [data] }) =>
      state.set('cityAvgDetail', fromJS(data)),
    [actions.CLEAR_CITY_AVG_PRICE_DETAIL]: state =>
      state.set('cityAvgDetail', fromJS({}))
  }
})
