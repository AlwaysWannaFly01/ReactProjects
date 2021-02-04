import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'ResRating',
  initialState: {
    // 获取行政区列表
    areaList: [],
    estateRatingList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },
    projectDetail: {},
    ratingRuleDetail: {},
    ratingHistory: [],
    paginationHistory: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    }
  },
  actionHandlers: {
    [actions.SET_AREA_LIST]: (state, { payload: [data] }) =>
      state.set('areaList', fromJS(data)),
    [actions.SET_ESTATE_RATING_SEARCH]: (state, { payload: [data] }) =>
      state
        .set('estateRatingList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_ALL_DETAIL]: (state, { payload: [data] }) =>
      state.set('projectDetail', fromJS(data)),
    [actions.SET_RATING_RULE_DETAIL]: (state, { payload: [data] }) =>
      state.set('ratingRuleDetail', fromJS(data)),
    [actions.SET_RATING_HISTORY]: (state, { payload: [data] }) =>
      state
        .set('ratingHistory', fromJS(data.records || []))
        .mergeIn(['paginationHistory'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        })
  }
})
