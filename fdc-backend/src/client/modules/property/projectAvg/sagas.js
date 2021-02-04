import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as API from 'client/api/projectAvg.api'
import * as commonApi from 'client/api/common.api'
import actions from './actions'
// 获取动态配置
function* getMapCheckPriceConfig() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.GET_MAP_CHECK_PRICE_CONFIG)
    try {
      const { data,code, message} = yield call(
          API.getMapCheckPriceConfig,
          params,
          actions.GET_MAP_CHECK_PRICE_CONFIG
      )
      yield put(actions.setMapCheckPriceConfig(data))
      if (typeof cb === 'function') {
        cb({code:code,message:message,data:data})
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 获取各个网站价格详情
function* GetMapCheckPriceDetail() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.GET_MAP_CHECK_PRICE_DETAIL)
    try {
      const { data,code, message} = yield call(
          API.GetMapCheckPriceDetail,
          params,
          actions.GET_MAP_CHECK_PRICE_DETAIL
      )
      yield put(actions.SetMapCheckPriceDetail(data))
      if (typeof cb === 'function') {
        cb({code:code,message:message,data:data})
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 更新挂牌基准价
function* updataMapCheckPrice() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.UPDATA_MAP_CHECK_PRICE)
    try {
      const { data,code, message} = yield call(
          API.updataMapCheckPrice,
          params,
          actions.UPDATA_MAP_CHECK_PRICE
      )
      if (typeof cb === 'function') {
        cb({code:code,message:message,data:data})
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 获取挂牌基准价详情
function* getMapCheckPrice() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.GET_MAP_CHECK_PRICE)
    try {
      const { data,code, message} = yield call(
          API.getMapCheckPrice,
          params,
          actions.GET_MAP_CHECK_PRICE
      )
      yield put(actions.setMapCheckPrice(data))
      if (typeof cb === 'function') {
        cb({code:code,message:message,data:data})
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 获取楼盘及挂牌价列表
function* fetchProjectPriceList() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.FETCH_PROJECT_PRICE_LIST)
    try {
      const { data,code, message} = yield call(
          API.fetchProjectPriceList,
          params,
          actions.FETCH_PROJECT_PRICE_LIST
      )
      yield put(actions.setProjectPriceList(data))
      if (typeof cb === 'function') {
        cb({code:code,message:message,data:data})
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 获取行政区列表
function* fetchAreaDict() {
  while (true) {
    const {
      payload: [cityId,cb]
    } = yield take(actions.FETCH_AREA_DICT)
    try {
      const { data: areaList } = yield call(API.fetchAreaDict, cityId)
      let newAreaList = []
      if (areaList) {
        newAreaList = areaList.map(({ id, areaName,latitude,longitude }) => ({
          key: id,
          label: areaName,
          latitude: latitude,
          longitude: longitude,
          value: `${id}`
        }))
      }
      yield put(actions.setAreaDict(newAreaList))
      cb(newAreaList)
    } catch (err) {
      handleErr(err)
    }
  }
}

// 加载基准数据
function* fetchBaseData() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.FETCH_BASE_DATA)
    try {
      const { data } = yield call(
        API.fetchBaseData,
        params,
        actions.GET_DATA_LIST
      )
      if (data) {
        yield put(actions.receiveBaseData(data))
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 加载案例均价数据
function* fetchCaseData() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.FETCH_CASE_DATA)
    try {
      const { data } = yield call(
        API.fetchCaseData,
        params,
        actions.GET_DATA_LIST
      )
      if (data) {
        yield put(actions.receiveCaseData(data))
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 只看评估案例均价列表
function* estimateCaseData() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.ESTIMATE_CASE_DATA)
    try {
      const { data } = yield call(
        API.estimateCaseData,
        params,
        actions.GET_DATA_LIST
      )
      if (data) {
        yield put(actions.setCaseData(data))
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 只看评估基准价列表
function* estimateBaseData() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.ESTIMATE_BASE_DATA)
    try {
      const { data } = yield call(
        API.estimateBaseData,
        params,
        actions.GET_DATA_LIST
      )
      if (data) {
        yield put(actions.setBaseData(data))
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 只看标准房价格列表
function* standardHousePrice() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.STANDARD_HOUSE_PRICE)
    try {
      const { data } = yield call(
        API.standardHousePrice,
        params,
        actions.GET_DATA_LIST
      )
      if (data) {
        yield put(actions.setHousePrice(data))
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 加载对比数据
function* fetchCompareData() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.FETCH_COMPARE_DATA)
    try {
      const { data,code,message } = yield call(
        API.fetchCompareData,
        params,
        actions.GET_DATA_LIST
      )
      if (data) {
        yield put(actions.receiveCompareData(data))
      }
      cb({code:code,message:message,data:data})
    } catch (err) {
      handleErr(err)
    }
  }
}

// 导出楼盘均价数据
function* exportHouseAvg() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EXPORT_HOUSE_CASE_AVG)
    try {
      yield call(API.exportHouseAvg, params)
      if (typeof cb === 'function') {
        cb(true)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 加载楼盘均价导入日志
function* fetchImportLog() {
  while (true) {
    const {
      payload: [cb]
    } = yield take(actions.FETCH_IMPORT_LOG)
    try {
      const { data } = yield call(API.fetchImportLogs)
      if (typeof cb === 'function') {
        cb(true)
      }
      yield put(actions.receiveLogs(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getPriceSource() {
  while (true) {
    yield take(actions.GET_PRICE_SOURCE)
    try {
      const { data } = yield call(API.getPriceSource)
      yield put(actions.setPriceSource(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* queryBasePriceDetail() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.QUERY_BASE_PRICE_DETAIL)
    try {
      const { data } = yield call(API.queryBasePriceDetail, params)
      if (typeof cb === 'function') {
        cb(data)
      }
      yield put(actions.setBasePriceDetail(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 保存基准房价详情信息
function* saveBasePriceDetail() {
  while (true) {
    const {
      payload: [formData, cb]
    } = yield take(actions.SAVE_BASE_PRICE_DETAIL)
    try {
      const data = yield call(API.saveBasePriceDetail, formData)
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 案例均价列表页查看详情
function* fetchCaseAvgDetail() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.FETCH_CASE_AVG_DETAIL)
    // console.log({ payload: [data, cb] })
    try {
      const { data: avgDetail } = yield call(API.fetchCaseAvgDetail, data)
      yield put(actions.setCaseAvgDetail(avgDetail))
      cb(avgDetail)
      // console.log(data)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* saveCaseAvg() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.SAVE_CASE_AVG)
    try {
      const data = yield call(API.saveCaseAvg, params)
      cb(data)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* saveCaseAvgHistory() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.SAVE_CASE_AVG_HISTORY)
    try {
      const data = yield call(API.saveCaseAvgHistory, params)
      cb(data)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* fetchBasePriceHistory() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.FETCH_BASE_PRICE_HISTORY)
    try {
      const { data: basePriceHistory } = yield call(
        API.fetchBasePriceHistory,
        params,
        actions.FETCH_BASE_PRICE_HISTORY
      )
      yield put(actions.setBasePriceHistory(basePriceHistory))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* fetchCasePriceHistory() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.FETCH_CASE_PRICE_HISTORY)
    try {
      const { data: casePriceHistory } = yield call(
        API.fetchCasePriceHistory,
        params,
        actions.FETCH_CASE_PRICE_HISTORY
      )
      yield put(actions.setCasePriceHistory(casePriceHistory))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 评估案例均价历史列表
function* estimateAvgHistory() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.ESTIMATE_AVG_HISTORY)
    try {
      const { data: estimateAvg } = yield call(
        API.estimateAvgHistory,
        params,
        actions.ESTIMATE_AVG_HISTORY
      )
      yield put(actions.setAvgHistory(estimateAvg))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 评估案例均价历史列表
function* estimateWeightHistory() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.ESTIMATE_WEIGHT_HISTORY)
    try {
      const { data: estimateWeight } = yield call(
        API.estimateWeightHistory,
        params,
        actions.ESTIMATE_WEIGHT_HISTORY
      )
      yield put(actions.setWeightHistory(estimateWeight))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 标准房价历史列表
function* standardHousePriceHistory() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.STANDARD_HOUSE_PRICE_HISTORY)
    try {
      const { data: standardHousePriceTwo } = yield call(
        API.standardHousePriceHistory,
        params,
        actions.STANDARD_HOUSE_PRICE_HISTORY
      )
      yield put(actions.setHousePriceHistory(standardHousePriceTwo))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportCaseAvgHistory() {
  while (true) {
    const {
      payload: [formData, cb]
    } = yield take(actions.EXPORT_CASE_AVG_HISTORY)
    try {
      yield call(API.exportCaseAvgHistory, formData)
      if (typeof cb === 'function') {
        cb(true)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportBaseAvgHistory() {
  while (true) {
    const {
      payload: [formData, cb]
    } = yield take(actions.EXPORT_BASE_AVG_HISTORY)
    try {
      yield call(API.exportBaseAvgHistory, formData)
      if (typeof cb === 'function') {
        cb(true)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportEstimateAvgHistory() {
  while (true) {
    const {
      payload: [formData, cb]
    } = yield take(actions.EXPORT_ESTIMATE_AVG_HISTORY)
    try {
      yield call(API.exportEstimateAvgHistory, formData)
      if (typeof cb === 'function') {
        cb(true)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportEstimateWeightHistory() {
  while (true) {
    const {
      payload: [formData, cb]
    } = yield take(actions.EXPORT_ESTIMATE_WEIGHT_HISTORY)
    try {
      yield call(API.exportEstimateWeightHistory, formData)
      if (typeof cb === 'function') {
        cb(true)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportStandardHouseHistory() {
  while (true) {
    const {
      payload: [formData, cb]
    } = yield take(actions.EXPORT_STANDARD_HOUSE_HISTORY)
    try {
      yield call(API.exportStandardHouseHistory, formData)
      if (typeof cb === 'function') {
        cb(true)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getCasePriceDetailHistory() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.GET_CASE_PRICE_DETAIL_HISTORY)
    try {
      const { data: avgDetail } = yield call(
        API.getCasePriceDetailHistory,
        data
      )
      yield put(actions.setCaseAvgDetail(avgDetail))
      if (typeof cb === 'function') {
        cb(true)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* addAvgHistory() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.ADD_AVG_HISTORY)
    try {
      const res = yield call(API.addAvgHistory, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

// 只看评估案例均价历史 新增
function* addEstimateAvgHistory() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.ADD_ESTIMATE_AVG_HISTORY)
    try {
      const res = yield call(API.addEstimateAvgHistory, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

// 评估案例基准价新增编辑 新增
function* addEstimateWeightHistory() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.ADD_ESTIMATE_WEIGHT_HISTORY)
    try {
      const res = yield call(API.addEstimateWeightHistory, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

// 评估案例基准价新增编辑 新增
function* addStandardHousePriceHistory() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.ADD_STANDARD_HOUSE_PRICE_HISTORY)
    try {
      const res = yield call(API.addStandardHousePriceHistory, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

// 基准房价新增编辑
function* addBaseHistory() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.ADD_BASE_HISTORY)
    try {
      const res = yield call(API.addBaseHistory, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getProjectDetail() {
  while (true) {
    const {
      payload: [projectId, cityId]
    } = yield take(actions.GET_PROJECT_DETAIL)
    try {
      const { data: projectDetail } = yield call(API.getProjectDetail, {
        projectId,
        cityId
      })
      yield put(actions.setProjectDetail(projectDetail))
    } catch (err) {
      handleErr(err)
    }
  }
}

// wy change 没有楼盘权限要调用的接口
function* getAllDetail() {
  while (true) {
    const {
      payload: [projectId, cityId]
    } = yield take(actions.GET_ALL_DETAIL)
    try {
      const { data: projectDetail } = yield call(API.getAllDetail, {
        projectId,
        cityId
      })
      yield put(actions.setAllDetail(projectDetail))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getLastMonthCasePrice() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_LAST_MONTH_CASE_PRICE)
    try {
      const { data: lastMonthCasePrive } = yield call(
        API.getLastMonthCasePrice,
        params
      )
      yield put(actions.setLastMonthCasePrice(lastMonthCasePrive))
      cb(lastMonthCasePrive)
    } catch (err) {
      handleErr(err)
    }
  }
}
// 根据月份获取案例均价详情 WY
function* getMonthToDetail() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_MONTH_TO_DETAIL)
    try {
      const { data } = yield call(
        API.getMonthToDetail,
        params,
        actions.GET_MONTH_TO_DETAIL
      )
      yield put(actions.setMonthToDetail(data))
      if (typeof cb === 'function') {
        cb(true)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 根据月份获取基准房价详情 WY
function* getMonthToBase() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_MONTH_TO_BASE)
    try {
      const { data } = yield call(
        API.getMonthToBase,
        params,
        actions.GET_MONTH_TO_BASE
      )
      if (typeof cb === 'function') {
        cb(true)
      }
      yield put(actions.setMonthToBase(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* updateVisitCities() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.UPDATE_VISIT_CITIES)
    try {
      const { data: res } = yield call(commonApi.updateVisitCities, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* updateVisitCities2() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.UPDATE_VISIT_CITIES2)
    try {
      const res = yield call(commonApi.updateVisitCities, data)
      cb(res)
    }catch (err) {
      handleErr(err)
    }
  }
}
// 错误楼盘名称列表
function* fetchErrorList() {
  while (true) {
    const {
      payload: [errorInfo]
    } = yield take(actions.FETCH_ERROR_LIST)
    try {
      const { data: errorCaseList } = yield call(
        commonApi.fetchErrorList,
        { errorInfo },
        actions.FETCH_ERROR_LIST
      )
      yield put(actions.setErrorList(errorCaseList))
    } catch (err) {
      handleErr(err)
    }
  }
}
// 删除 错误楼盘名称列表
function* deleteError() {
  while (true) {
    const {
      payload: [ids, cb]
    } = yield take(actions.DELETE_ERROR)
    try {
      const data = yield call(commonApi.deleteError, ids)
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}


// S 评估案例均价
// 根据月份获取案例均价详情 WY
function* getEstimateMonthToDetail() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_ESTIMATE_MONTH_TO_DETAIL)
    try {
      const { data } = yield call(
        API.getEstimateMonthToDetail,
        params,
        actions.GET_ESTIMATE_MONTH_TO_DETAIL
      )
      yield put(actions.setEstimateMonthToDetail(data))
      if (typeof cb === 'function') {
        cb(true)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}


// 一键删除 错误楼盘名称列表
function* deleteAllError() {
  while (true) {
    const {
      payload: [delParams, cb]
    } = yield take(actions.DELETE_ALL_ERROR)
    try {
      const data = yield call(commonApi.deleteAllError, delParams)
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}
// 根据月份获取基准详情 WY
function* getEstimateMonthToWeightDetail() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_ESTIMATE_MONTH_TO_WEIGHT_DETAIL)
    try {
      const { data } = yield call(
        API.getEstimateMonthToWeightDetail,
        params,
        actions.GET_ESTIMATE_MONTH_TO_WEIGHT_DETAIL
      )
      yield put(actions.setEstimateMonthToWeightDetail(data))
      if (typeof cb === 'function') {
        cb(true)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 错误楼盘名称列表 导出
function* exportProjectAvg() {
  while (true) {
    const {
      payload: [exportQry, cb]
    } = yield take(actions.EXPORT_PROJECT_AVG)
    try {
      yield call(commonApi.exportProjectAvg, exportQry)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

// 编辑楼盘名称
function* editProjectName() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.EDIT_PROJECT_NAME)
    try {
      const res = yield call(commonApi.editProjectName, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

// 城市权限
function* editAuthority() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EDIT_AUTHORITY)
    try {
      const { code, data, message } = yield call(
        commonApi.editAuthority,
        params
      )
      cb(code, data, message)
    } catch (err) {
      handleErr(err)
    }
    cb()
  }
}
// E 评估案例均价

// 根据评估月份获取标准房价格详情 WY
function* getStandardHousePriceDetail() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_STANDARD_HOUSE_PRICE_DETAIL)
    try {
      const { data } = yield call(
        API.getStandardHousePriceDetail,
        params,
        actions.GET_STANDARD_HOUSE_PRICE_DETAIL
      )
      yield put(actions.setStandardHousePriceDetail(data))
      if (typeof cb === 'function') {
        cb(true)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}
function* getAliaType() {
  while (true) {
    const {
      payload: [projectParams, cb]
    } = yield take(actions.GET_ALIA_TYPE)
    try {
      const res = yield call(API.getAliaType, projectParams)
      if (typeof cb === 'function') {
        cb(res)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* earlyWarningCount() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EARLY_WARNING_COUNT)
    try {
      const res = yield call(API.earlyWarningCount, params)
      if(res.code==='200'){
        yield put(actions.setEarlyWarningCount(res.data))
      }
      if (typeof cb === 'function') {
        cb()
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getProvinceCityList() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.GET_PROVINCE_CITY_LIST)
    try {
      const res = yield call(API.getProvinceCityList, params, actions.GET_PROVINCE_CITY_LIST)
      cb(res)
      yield put(actions.setProvinceCityList(res.data || []))
    } catch (err) {
      cb(err)
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'projectAvg',
  sagas: function* projectAvgSaga() {
    yield fork(getProvinceCityList)
    yield fork(fetchAreaDict)
    yield fork(exportHouseAvg)
    yield fork(fetchBaseData)
    yield fork(fetchCaseData)
    yield fork(estimateCaseData)
    yield fork(estimateBaseData)
    yield fork(standardHousePrice)
    yield fork(fetchCompareData)
    yield fork(fetchImportLog)
    yield fork(getPriceSource)
    yield fork(queryBasePriceDetail)
    yield fork(saveBasePriceDetail)
    yield fork(fetchCaseAvgDetail)
    yield fork(saveCaseAvg)
    yield fork(saveCaseAvgHistory)
    yield fork(fetchBasePriceHistory)
    yield fork(fetchCasePriceHistory)
    yield fork(estimateAvgHistory)
    yield fork(estimateWeightHistory)
    yield fork(standardHousePriceHistory)
    yield fork(exportCaseAvgHistory)
    yield fork(exportBaseAvgHistory)
    yield fork(getCasePriceDetailHistory)
    yield fork(addAvgHistory)
    yield fork(addBaseHistory)
    yield fork(getProjectDetail)
    yield fork(getAllDetail) // wy change 没有楼盘权限
    yield fork(getLastMonthCasePrice)
    yield fork(getMonthToDetail) // 根据月份获取案例均价详情 WY
    yield fork(getMonthToBase) // 根据月份获取基准房价详情 WY
    yield fork(updateVisitCities)

    yield fork(updateVisitCities2)

    yield fork(fetchErrorList)
    yield fork(deleteError)
    yield fork(deleteAllError)
    yield fork(exportProjectAvg)
    yield fork(editProjectName)
    yield fork(editAuthority)

    yield fork(addEstimateAvgHistory) // 只看评估案例均价历史 新增
    yield fork(getEstimateMonthToDetail)
    yield fork(addEstimateWeightHistory) // 评估案例基准价新增编辑 新增
    yield fork(getEstimateMonthToWeightDetail)
    yield fork(getStandardHousePriceDetail) // 根据评估月份获取标准房价格详情
    yield fork(addStandardHousePriceHistory)
    yield fork(exportStandardHouseHistory)
    yield fork(exportEstimateWeightHistory)
    yield fork(exportEstimateAvgHistory)
    yield fork(getAliaType)
    yield fork(earlyWarningCount)
    yield fork(fetchProjectPriceList)
    yield fork(getMapCheckPrice)
    yield fork(updataMapCheckPrice)
    yield fork(GetMapCheckPriceDetail)
    yield fork(getMapCheckPriceConfig)
  }
})
