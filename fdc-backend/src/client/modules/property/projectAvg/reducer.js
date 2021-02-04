import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'projectAvg',
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
    // 只看评估案例均价列表
    caseEstimate: [],
    // 只看评估基准价列表
    baseEstimate: [],
    housePrice: [],
    importLogs: [],

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
    estimateAvg: [],
    estimateWeight: [],
    standardHousePriceTwo: [],
    projectDetail: {},
    // 根据月份获取案例均价详情 WY
    monthToDetail: {},
    // 根据月份获取基准房价详情 WY
    monthToBase: {},
    lastMonthCasePrive: '',
    // 错误楼盘名称列表
    errorCaseList: [],
    estimateMonthToDetail: {}, // 根据月份获取评估案例均价详情 WY
    estimateMonthToWeightDetail: {},
    standardHousePriceDetail: {},
    earlyWarningCountList:{},
    projectPriceList: [],   //获取楼盘坐标及挂牌价集合
    mapCheckPriceDetail: "", //获取各个网站详情
    mapCheckPriceConfig: {},   // 地图核价配置
    provinceCityList: []
  },
  actionHandlers: {
      [actions.SET_PROVINCE_CITY_LIST]: (state, { payload: [data] }) =>
          state.set('provinceCityList', fromJS(data)),
      [actions.SET_MAP_CHECK_PRICE_CONFIG]: (state, { payload: [data] }) =>
          state.set('mapCheckPriceConfig', fromJS(data)),
      [actions.SET_MAP_CHECK_PRICE_DETAIL]: (state, { payload: [data] }) =>
          state.set('mapCheckPriceDetail', fromJS(data)),
      [actions.SET_PROJECT_PRICE_LIST]: (state, { payload: [data] }) =>
          state.set('projectPriceList', fromJS(data)),
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
    [actions.SET_CASE_DATA]: (state, { payload: [data] }) =>
      state
        .set('caseEstimate', fromJS(data.records || []))
        .mergeIn(['casePagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_BASE_DATA]: (state, { payload: [data] }) =>
      state
        .set('baseEstimate', fromJS(data.records || []))
        .mergeIn(['casePagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_HOUSE_PRICE]: (state, { payload: [data] }) =>
      state
        .set('housePrice', fromJS(data.records || []))
        .mergeIn(['casePagination'], {
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
    [actions.SET_AVG_HISTORY]: (state, { payload: [data] }) =>
      state
        .set('estimateAvg', fromJS(data.records || []))
        .mergeIn(['casePriceHistoryPagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_WEIGHT_HISTORY]: (state, { payload: [data] }) =>
      state
        .set('estimateWeight', fromJS(data.records || []))
        .mergeIn(['basePriceHistoryPagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_HOUSE_PRICE_HISTORY]: (state, { payload: [data] }) =>
      state
        .set('standardHousePriceTwo', fromJS(data.records || []))
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
    [actions.SET_LAST_MONTH_CASE_PRICE]: (state, { payload: [data] }) =>
      state.set('lastMonthCasePrive', fromJS(data)),


    [actions.SET_ERROR_LIST]: (state, { payload: [data] }) =>
      state
        .set('errorCaseList', fromJS(data.records || []))
        .mergeIn(['casePagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),


    // 根据月份获取评估案例均价详情 WY
    [actions.SET_ESTIMATE_MONTH_TO_DETAIL]: (state, { payload: [data] }) =>
      state.set('estimateMonthToDetail', fromJS(data)),
    [actions.SET_ESTIMATE_MONTH_TO_WEIGHT_DETAIL]: (
      state,
      { payload: [data] }
    ) => state.set('estimateMonthToWeightDetail', fromJS(data)),
    [actions.SET_STANDARD_HOUSE_PRICE_DETAIL]: (state, { payload: [data] }) =>
      state.set('standardHousePriceDetail', fromJS(data)),
  
    [actions.SET_EARLY_WARNING_COUNT]: (state, { payload: [data] }) =>
      state.set('earlyWarningCountList', fromJS(data)),
  }
})
