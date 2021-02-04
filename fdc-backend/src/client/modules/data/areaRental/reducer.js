import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'dataAreaRental',
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
    // 区域租售比详情
    areaRentalDetail: {},
    // 区域租售比历史列表
    areaRentalHistoryList: [],
    // 上个月城市均价
    lastMonthPrice: '',
    areaRentalList: [],
    areaPagination: {
      total: 0,
      pageNum: 1,
      pageSize: 10
    }
  },
  actionHandlers: {
    [actions.SET_AREA_RENTAL_LIST]: (state, { payload: [data] }) =>
      state
        .set('areaRentalList', fromJS(data.records || []))
        .mergeIn(['areaPagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_AREA_RENTAL_HISTORY_LIST]: (state, { payload: [data] }) =>
      state
        .set('areaRentalHistoryList', fromJS(data.records || []))
        .mergeIn(['areaPagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_AREA_RENTAL_DETAIL]: (state, { payload: [data] }) =>
      state.set('areaRentalDetail', fromJS(data)),
    [actions.SET_AREA_RENTAL_DETAILT]: (state, { payload: [data] }) =>
      state.set('areaRentalDetail', fromJS(data)),
    [actions.SET_OBJECT_TYPE]: (state, { payload: [data] }) =>
      state.set('objectTypeList', fromJS(data)),
    [actions.SET_CITY_AVG_PRICE]: (state, { payload: [data] }) =>
      state
        .set('cityAvgList', fromJS(data.records || []))
        .mergeIn(['areaPagination'], {
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
