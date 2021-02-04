import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'projectAvg',
  actions: {
  
    getProvinceCityList: "GET_PROVINCE_CITY_LIST",
    setProvinceCityList: "SET_PROVINCE_CITY_LIST",
  
    getMapCheckPriceConfig: "GET_MAP_CHECK_PRICE_CONFIG",
    setMapCheckPriceConfig: "SET_MAP_CHECK_PRICE_CONFIG",    //地图核价获取动态配置
  
    GetMapCheckPriceDetail : "GET_MAP_CHECK_PRICE_DETAIL", //获取各个网站详情
    SetMapCheckPriceDetail: "SET_MAP_CHECK_PRICE_DETAIL",
    
    updataMapCheckPrice: "UPDATA_MAP_CHECK_PRICE",   //更新挂牌基准价
    
    getMapCheckPrice: 'GET_MAP_CHECK_PRICE',    //获取挂牌基准价详情
    setMapCheckPrice: 'SET_MAP_CHECK_PRICE',
  
    fetchProjectPriceList: 'FETCH_PROJECT_PRICE_LIST', //获取楼盘名称坐标及挂牌价列表
    setProjectPriceList: 'SET_PROJECT_PRICE_LIST',
    
    exportHouseCaseAvg: 'EXPORT_HOUSE_CASE_AVG', // 导出楼盘均价数据

    fetchAreaDict: 'FETCH_AREA_DICT', // 加载行政区字典
    setAreaDict: 'SET_AREA_DICT',

    fetchCompareData: 'FETCH_COMPARE_DATA', // 加载对比数据
    receiveCompareData: 'RECEIVE_COMPARE_DATA',

    fetchBaseData: 'FETCH_BASE_DATA', // 加载基础数据
    receiveBaseData: 'RECEIVE_BASE_DATA',

    fetchCaseData: 'FETCH_CASE_DATA', // 加载案例数据
    receiveCaseData: 'RECEIVE_CASE_DATA',

    estimateCaseData: 'ESTIMATE_CASE_DATA', // 只看评估案例均价列表
    setCaseData: 'SET_CASE_DATA',

    estimateBaseData: 'ESTIMATE_BASE_DATA', // 只看评估基准价列表
    setBaseData: 'SET_BASE_DATA',

    standardHousePrice: 'STANDARD_HOUSE_PRICE', // 只看标准房价格列表
    setHousePrice: 'SET_HOUSE_PRICE',

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

    estimateAvgHistory: 'ESTIMATE_AVG_HISTORY', // 评估案例均价历史列表
    setAvgHistory: 'SET_AVG_HISTORY',

    estimateWeightHistory: 'ESTIMATE_WEIGHT_HISTORY', // 评估基准价历史列表
    setWeightHistory: 'SET_WEIGHT_HISTORY',

    standardHousePriceHistory: 'STANDARD_HOUSE_PRICE_HISTORY', // 标准房价历史列表
    setHousePriceHistory: 'SET_HOUSE_PRICE_HISTORY',

    exportCaseAvgHistory: 'EXPORT_CASE_AVG_HISTORY',
    exportBaseAvgHistory: 'EXPORT_BASE_AVG_HISTORY',
    exportEstimateAvgHistory: 'EXPORT_ESTIMATE_AVG_HISTORY',
    exportEstimateWeightHistory: 'EXPORT_ESTIMATE_WEIGHT_HISTORY',
    exportStandardHouseHistory: 'EXPORT_STANDARD_HOUSE_HISTORY',

    addAvgHistory: 'ADD_AVG_HISTORY',
    addBaseHistory: 'ADD_BASE_HISTORY',

    addEstimateAvgHistory: 'ADD_ESTIMATE_AVG_HISTORY', // 只看评估案例均价历史 新增
    getEstimateMonthToDetail: 'GET_ESTIMATE_MONTH_TO_DETAIL', // 根据月份获取评估案例均价详情
    setEstimateMonthToDetail: 'SET_ESTIMATE_MONTH_TO_DETAIL',

    addEstimateWeightHistory: 'ADD_ESTIMATE_WEIGHT_HISTORY', // 评估案例基准价新增编辑 新增
    getEstimateMonthToWeightDetail: 'GET_ESTIMATE_MONTH_TO_WEIGHT_DETAIL', // 根据评估月份获取评估基准价详情
    setEstimateMonthToWeightDetail: 'SET_ESTIMATE_MONTH_TO_WEIGHT_DETAIL',

    addStandardHousePriceHistory: 'ADD_STANDARD_HOUSE_PRICE_HISTORY',
    getStandardHousePriceDetail: 'GET_STANDARD_HOUSE_PRICE_DETAIL', // 根据评估月份获取标准房价格详情
    setStandardHousePriceDetail: 'SET_STANDARD_HOUSE_PRICE_DETAIL',

    getProjectDetail: 'GET_PROJECT_DETAIL',
    setProjectDetail: 'SET_PROJECT_DETAIL',
    // wy change 没有楼盘权限要调用的接口
    getAllDetail: 'GET_ALL_DETAIL',
    setAllDetail: 'SET_ALL_DETAIL',

    getLastMonthCasePrice: 'GET_LAST_MONTH_CASE_PRICE',
    setLastMonthCasePrice: 'SET_LAST_MONTH_CASE_PRICE',
    // 根据月份获取案例均价详情 WY
    getMonthToDetail: 'GET_MONTH_TO_DETAIL',
    setMonthToDetail: 'SET_MONTH_TO_DETAIL',
    // 根据月份获取基准房价详情 WY
    getMonthToBase: 'GET_MONTH_TO_BASE',
    setMonthToBase: 'SET_MONTH_TO_BASE',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES',
    updateVisitCities2: 'UPDATE_VISIT_CITIES2',
    // 错误楼盘名称列表
    fetchErrorList: 'FETCH_ERROR_LIST',
    setErrorList: 'SET_ERROR_LIST',

    deleteError: 'DELETE_ERROR',
    deleteAllError: 'DELETE_ALL_ERROR',
    exportProjectAvg: 'EXPORT_PROJECT_AVG',
    editProjectName: 'EDIT_PROJECT_NAME',
    editAuthority: 'EDIT_AUTHORITY',
    getAliaType:'GET_ALIA_TYPE',
    earlyWarningCount: 'EARLY_WARNING_COUNT',
    setEarlyWarningCount: 'SET_EARLY_WARNING_COUNT'
  }
})

export default actions
export { containerActions }
