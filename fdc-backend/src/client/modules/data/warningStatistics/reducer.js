import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'warningStatistics',
  initialState: {
    // 行政区列表
    areaList: [],
    priceWarningList: [],
    priceWarningPagination:{
      total: 0,
      pageNum: 1,
      pageSize: 20
    },
    visitCities:[]
  },
  actionHandlers: {
    [actions.SET_DISTRICT_AREAS]: (state, { payload: [data] }) =>
      state.set('areaList', fromJS(data)),
    [actions.SET_PRICE_WARNING_LIST]: (state, { payload: [data] }) =>
      state
      .set('priceWarningList', fromJS(data.records))
      .mergeIn(['priceWarningPagination'], {
        total: +data.total,
        pageNum: data.pageNum,
        pageSize: data.pageSize
      }),
    [actions.SET_VISIT_CITIES]: (state, { payload: [data] }) =>
      state.set('visitCities', fromJS(data)),
  }
})
