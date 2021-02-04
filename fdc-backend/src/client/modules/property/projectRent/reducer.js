import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'projectRent',
  initialState: {
    // 获取行政区列表
    areaList: [],
    // 比对列表数据
    compareDatas: [],
    comPagination: {
      total: 0,
      pageNum: 1,
      pageSize: 10
    },
    //
    baseDatas: [],
    basePagination: {
      total: 0,
      pageNum: 1,
      pageSize: 10
    },
    // 案例列表数据
    caseDatas: [],
    casePagination: {
      total: 0,
      pageNum: 1,
      pageSize: 10
    },
    // 楼盘租金租售比
    rentRatioDatas: [],
    rentRatioPagination: {
      total: 0,
      pageNum: 1,
      pageSize: 10
    },
    rentRatioDatasHistory: [],
    rentRatioDatasHistoryPagination: {
      total: 0,
      pageNum: 1,
      pageSize: 10
    },

    importLogs: [],

    // 楼盘租金租售比详情
    MonthToRentRatioDtail: {},
    RentRatioDetail: {},

    priceSourceList: [],

    // 基准房价详情
    basePriceDetail: {},
    // 案例均价详情
    avgDetail: {},

    basePriceHistory: [],
    basePriceHistoryPagination: {
      total: 0,
      pageNum: 1,
      pageSize: 10
    },

    casePriceHistory: [],
    casePriceHistoryPagination: {
      total: 0,
      pageNum: 1,
      pageSize: 10
    },
    projectDetail: {},
    // 根据月份获取案例均价详情 WY
    monthToDetail: {},
    // 根据月份获取基准房价详情 WY
    monthToBase: {},
    monthToCase: {},
    lastMonthCasePrive: ''
  },
  actionHandlers: {
    [actions.SET_RENT_RATIO_DETAIL]: (state, { payload: [data] }) =>
      state.set('RentRatioDetail', fromJS(data)),
    [actions.SET_MONTH_TO_RENT_RATIO]: (state, { payload: [data] }) =>
      state.set('MonthToRentRatioDtail', fromJS(data)),
    [actions.SET_AREA_DICT]: (state, { payload: [data] }) =>
      state.set('areaList', fromJS(data)),
    [actions.RECEIVE_COMPARE_DATA]: (state, { payload: [data] }) =>
      state
        .set('compareDatas', fromJS(data.records || []))
        .mergeIn(['comPagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.RECEIVE_BASE_DATA]: (state, { payload: [data] }) =>
      state
        .set('baseDatas', fromJS(data.records || []))
        .mergeIn(['basePagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.RECEIVE_CASE_DATA]: (state, { payload: [data] }) =>
      state
        .set('caseDatas', fromJS(data.records || []))
        .mergeIn(['casePagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_RENT_RATIO_DATA]: (state, { payload: [data] }) =>
      state
        .set('rentRatioDatas', fromJS(data.records || []))
        .mergeIn(['rentRatioPagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_RENT_RATIO_HISTORY_DATA]: (state, { payload: [data] }) =>
      state
        .set('rentRatioDatasHistory', fromJS(data.records || []))
        .mergeIn(['rentRatioDatasHistoryPagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.RECEIVE_LOGS]: (state, { payload: [data] }) =>
      state.set('importLogs', fromJS(data)),
    [actions.SET_PRICE_SOURCE]: (state, { payload: [data] }) =>
      state.set('priceSourceList', fromJS(data)),
    [actions.SET_BASE_PRICE_DETAIL]: (state, { payload: [data] }) =>
      state.set('basePriceDetail', fromJS(data)),
    [actions.SET_CASE_AVG_DETAIL]: (state, { payload: [data] }) =>
      state.set('avgDetail', fromJS(data)),
    [actions.SET_BASE_PRICE_HISTORY]: (state, { payload: [data] }) =>
      state
        .set('basePriceHistory', fromJS(data.records || []))
        .mergeIn(['basePriceHistoryPagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_CASE_PRICE_HISTORY]: (state, { payload: [data] }) =>
      state
        .set('casePriceHistory', fromJS(data.records || []))
        .mergeIn(['casePriceHistoryPagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_PROJECT_DETAIL]: (state, { payload: [data] }) =>
      state.set('projectDetail', fromJS(data)),
    [actions.SET_ALL_DETAIL]: (state, { payload: [data] }) =>
      state.set('projectDetail', fromJS(data)),
    // 根据月份获取案例均价详情 WY
    [actions.SET_MONTH_TO_DETAIL]: (state, { payload: [data] }) =>
      state.set('monthToDetail', fromJS(data)),
    // 根据月份获取基准房价详情 WY
    [actions.SET_MONTH_TO_BASE]: (state, { payload: [data] }) =>
      state.set('monthToBase', fromJS(data)),
    // 根据月份获取基准房价详情 WY
    [actions.SET_MONTH_TO_BASE]: (state, { payload: [data] }) =>
      state.set('monthToBase', fromJS(data)),
    [actions.SET_MONTH_TO_CASE]: (state, { payload: [data] }) =>
      state.set('monthToCase', fromJS(data)),
    [actions.SET_LAST_MONTH_CASE_PRICE]: (state, { payload: [data] }) =>
      state.set('lastMonthCasePrive', fromJS(data))
  }
})
