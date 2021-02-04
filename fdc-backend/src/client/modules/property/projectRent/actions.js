import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'projectRent',
  actions: {
    exportHouseCaseAvg: 'EXPORT_HOUSE_CASE_AVG', // 导出楼盘均价数据

    exportRentRatio: 'EXPORT_RENT_RATIO', // 导出楼盘租金租售比
    exportRentRatioHistory: 'EXPORT_RENT_RATIO_HISTORY', // 导出楼盘租金租售比历史

    fetchAreaDict: 'FETCH_AREA_DICT', // 加载行政区字典
    setAreaDict: 'SET_AREA_DICT',

    fetchCompareData: 'FETCH_COMPARE_DATA', // 加载对比数据
    receiveCompareData: 'RECEIVE_COMPARE_DATA',

    fetchBaseData: 'FETCH_BASE_DATA', // 加载基础数据
    receiveBaseData: 'RECEIVE_BASE_DATA',

    fetchCaseData: 'FETCH_CASE_DATA', // 加载案例数据
    receiveCaseData: 'RECEIVE_CASE_DATA',

    addCaseRent: 'ADD_CASE_RENT', // 新增楼盘租金案例数据

    getRentRatioData: 'GET_RENT_RATIO_DATA', // 获取楼盘租金租售比数据
    setRentRatioData: 'SET_RENT_RATIO_DATA', // 获取楼盘租金租售比数据
    getRentRatioHistoryData: 'GET_RENT_RATIO_HISTORY_DATA', // 楼盘租金租售比get
    setRentRatioHistoryData: 'SET_RENT_RATIO_HISTORY_DATA', // 楼盘租金租售比set
    addRentRatio: 'ADD_RENT_RATIO', // 楼盘租金租售比新增
    saveRentRatioDetail: 'SAVE_RENT_RATIO_DETAIL', // 楼盘租金租售比编辑
    getRentRatioDetail: 'GET_RENT_RATIO_DETAIL', // 楼盘租售比详情
    setRentRatioDetail: 'SET_RENT_RATIO_DETAIL', // 楼盘租售比详情

    fetchImportLog: 'FETCH_IMPORT_LOG', // 加载导入日志列表
    receiveLogs: 'RECEIVE_LOGS',

    // 数据加载loading
    getDataList: 'GET_DATA_LIST',

    getPriceSource: 'GET_PRICE_SOURCE',
    setPriceSource: 'SET_PRICE_SOURCE',

    queryBasePriceDetail: 'QUERY_BASE_PRICE_DETAIL',
    setBasePriceDetail: 'SET_BASE_PRICE_DETAIL',

    saveBasePriceDetail: 'SAVE_BASE_PRICE_DETAIL',

    fetchCaseAvgDetail: 'FETCH_CASE_AVG_DETAIL',
    getCasePriceDetailHistory: 'GET_CASE_PRICE_DETAIL_HISTORY',
    setCaseAvgDetail: 'SET_CASE_AVG_DETAIL',

    saveCaseAvg: 'SAVE_CASE_AVG',
    saveCaseAvgHistory: 'SAVE_CASE_AVG_HISTORY',

    fetchBasePriceHistory: 'FETCH_BASE_PRICE_HISTORY',
    setBasePriceHistory: 'SET_BASE_PRICE_HISTORY',

    fetchCasePriceHistory: 'FETCH_CASE_PRICE_HISTORY',
    setCasePriceHistory: 'SET_CASE_PRICE_HISTORY',

    exportCaseAvgHistory: 'EXPORT_CASE_AVG_HISTORY',
    exportBaseAvgHistory: 'EXPORT_BASE_AVG_HISTORY',

    addAvgHistory: 'ADD_AVG_HISTORY',
    addBaseHistory: 'ADD_BASE_HISTORY',

    getProjectDetail: 'GET_PROJECT_DETAIL',
    setProjectDetail: 'SET_PROJECT_DETAIL',
    // wy change 没有楼盘权限要调用的接口
    getAllDetail: 'GET_ALL_DETAIL',
    setAllDetail: 'SET_ALL_DETAIL',

    // 根据月份获取楼盘租售比详情
    getMonthToRentRatio: 'GET_MONTH_TO_RENT_RATIO',
    setMonthToRentRatio: 'SET_MONTH_TO_RENT_RATIO',

    getLastMonthCasePrice: 'GET_LAST_MONTH_CASE_PRICE',
    setLastMonthCasePrice: 'SET_LAST_MONTH_CASE_PRICE',
    // 根据月份获取案例均价详情 WY
    getMonthToDetail: 'GET_MONTH_TO_DETAIL',
    setMonthToDetail: 'SET_MONTH_TO_DETAIL',
    // 根据月份获取基准房价详情 WY
    getMonthToBase: 'GET_MONTH_TO_BASE',
    setMonthToBase: 'SET_MONTH_TO_BASE',
    getMonthToCase: 'GET_MONTH_TO_CASE',
    setMonthToCase: 'SET_MONTH_TO_CASE',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES',
    getRentRateCorrection: 'GET_RENT_RATE_CORRECTION',
    setRentRateCorrection: 'SET_RENT_RATE_CORRECTION'
  }
})

export default actions
export { containerActions }
