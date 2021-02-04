import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as API from 'client/api/projectRent.api'
import * as commonApi from 'client/api/common.api'
import actions from './actions'

// 获取行政区列表
function* fetchAreaDict() {
  while (true) {
    const {
      payload: [cityId]
    } = yield take(actions.FETCH_AREA_DICT)
    try {
      const { data: areaList } = yield call(API.fetchAreaDict, cityId)
      let newAreaList = []
      if (areaList) {
        newAreaList = areaList.map(({ id, areaName }) => ({
          key: id,
          label: areaName,
          value: `${id}`
        }))
      }
      yield put(actions.setAreaDict(newAreaList))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 看对比列表
function* fetchCompareData() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.FETCH_COMPARE_DATA)
    try {
      const { data } = yield call(
        API.fetchCompareData,
        params,
        actions.GET_DATA_LIST
      )
      if (data) {
        yield put(actions.receiveCompareData(data))
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 加载基准数据 只看基准租金列表
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

//  加载案例均价数据   只看案例租金列表
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

//  获取楼盘租金租售比历史列表
function* getRentRatioHistoryData() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_RENT_RATIO_HISTORY_DATA)
    console.log(params)
    try {
      const { data } = yield call(
        API.fetchRentRatioHistoryData,
        params,
        actions.GET_RENT_RATIO_HISTORY_DATA // 改成相应的api
      )
      if (data) {
        yield put(actions.setRentRatioHistoryData(data))
      }
    } catch (err) {
      handleErr(err)
    }
  }
}
//  获取楼盘租金租售比列表
function* getRentRatioData() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.GET_RENT_RATIO_DATA)
    try {
      const { data,code,message } = yield call(
        API.fetchRentRatioData,
        params,
        actions.GET_RENT_RATIO_DATA // 改成相应的api
      )
      if (data) {
        yield put(actions.setRentRatioData(data))
      }
      cb({code:code,message:message})
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

// 根据月份获取案例均价详情 WY
function* getMonthToDetail() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_MONTH_TO_DETAIL)
    try {
      const { data } = yield call(
        API.getMonthToDetail,
        params,
        actions.GET_MONTH_TO_DETAIL
      )
      yield put(actions.setMonthToDetail(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 楼盘案列租金详情
function* fetchCaseAvgDetail() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.FETCH_CASE_AVG_DETAIL)
    try {
      const { data: avgDetail } = yield call(API.fetchCaseAvgDetail, data)
      yield put(actions.setCaseAvgDetail(avgDetail))
      cb(avgDetail)
    } catch (err) {
      handleErr(err)
    }
  }
}

// S 基准租金历史数据页
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
// E 基准租金历史数据页

// S 案例租金历史数据页
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
// E 楼盘租金历史数据页
// 根据月份获取案例房价详情 WY
function* getMonthToCase() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_MONTH_TO_CASE)
    try {
      const { data } = yield call(
        API.getMonthToCase,
        params,
        actions.GET_MONTH_TO_CASE
      )
      yield put(actions.setMonthToCase(data))
    } catch (err) {
      handleErr(err)
    }
  }
}
// 根据月份获取楼盘租售比详情
function* getMonthToRentRatio() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_MONTH_TO_RENT_RATIO)
    try {
      const { data } = yield call(
        API.getMonthToRentRatio,
        params,
        actions.GET_MONTH_TO_RENT_RATIO
      )
      yield put(actions.setMonthToRentRatio(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 根据月份获取基准房价详情 WY
function* getMonthToBase() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_MONTH_TO_BASE)
    try {
      const { data } = yield call(
        API.getMonthToBase,
        params,
        actions.GET_MONTH_TO_BASE
      )
      yield put(actions.setMonthToBase(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

// S 保存按钮
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

function* addCaseRent() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.ADD_CASE_RENT)
    try {
      const data = yield call(API.addCaseRent, params)
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
//  setRentRatioDetail: 'SET_RENT_RATIO_DETAIL',
// 楼盘租金租售比详情
function* getRentRatioDetail() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_RENT_RATIO_DETAIL)
    try {
      const { data } = yield call(
        API.getRentRatioDetail,
        params,
        actions.GET_RENT_RATIO_DETAIL
      )
      yield put(actions.setRentRatioDetail(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* saveRentRatioDetail() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.SAVE_RENT_RATIO_DETAIL)
    try {
      const res = yield call(API.addRentRatio, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* addRentRatio() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.ADD_RENT_RATIO)
    try {
      const res = yield call(API.addRentRatio, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

// E 保存按钮

// 导出楼盘租金租售比历史
function* exportRentRatioHistory() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EXPORT_RENT_RATIO_HISTORY)
    try {
      yield call(API.exportRentRatioHistory, params)
      if (typeof cb === 'function') {
        cb(true)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 导出楼盘租金租售比
function* exportRentRatio() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EXPORT_RENT_RATIO)
    try {
      yield call(API.exportRentRatio, params)
      if (typeof cb === 'function') {
        cb(true)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 导出楼盘均价数据
function* exportHouseCaseAvg() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EXPORT_HOUSE_CASE_AVG)
    try {
      yield call(API.exportHouseCaseAvg, params)
      if (typeof cb === 'function') {
        cb(true)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}
// 基准租金历史导出
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
function* getRentRateCorrection() {
  while (true) {
    const {
      payload: [formData, cb]
    } = yield take(actions.GET_RENT_RATE_CORRECTION)
    try {
      const res = yield call(API.getRentRateCorrection, formData)
      if (typeof cb === 'function') {
        cb(res)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}
function* setRentRateCorrection() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.SET_RENT_RATE_CORRECTION)
    try {
      const res = yield call(API.setRentRateCorrection, params)
      if (typeof cb === 'function') {
        cb(res)
      }
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
      const res = yield call(commonApi.updateVisitCities, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'projectRent',
  sagas: function* projectRentSaga() {
    yield fork(addCaseRent)
    yield fork(fetchAreaDict)
    yield fork(exportRentRatio)
    yield fork(exportRentRatioHistory)
    yield fork(exportHouseCaseAvg)
    yield fork(fetchBaseData)
    yield fork(fetchCaseData)
    yield fork(fetchCompareData)
    // yield fork(fetchImportLog)
    yield fork(getPriceSource)
    yield fork(queryBasePriceDetail)
    yield fork(saveBasePriceDetail)
    yield fork(fetchCaseAvgDetail)
    yield fork(saveCaseAvg)
    yield fork(saveCaseAvgHistory)
    yield fork(fetchBasePriceHistory)
    yield fork(fetchCasePriceHistory)
    yield fork(exportCaseAvgHistory)
    yield fork(exportBaseAvgHistory)
    // yield fork(getCasePriceDetailHistory)
    yield fork(addRentRatio)
    yield fork(addBaseHistory)
    // yield fork(getProjectDetail)
    yield fork(getAllDetail) // wy change 没有楼盘权限
    // yield fork(getLastMonthCasePrice)
    yield fork(getMonthToDetail) // 根据月份获取案例均价详情 WY
    yield fork(getMonthToBase) // 根据月份获取基准房价详情 WY
    yield fork(getMonthToCase) // 根据月份获取基准房价详情 WY
    yield fork(getRentRatioData)
    yield fork(getRentRatioHistoryData) // 获取楼盘租金租售比列表
    yield fork(getMonthToRentRatio) // 根据月份获取楼盘租金租售比详情
    yield fork(getRentRatioDetail) // 获取楼盘租金租售比详情
    yield fork(saveRentRatioDetail) // 楼盘租金租售比编辑保存
    yield fork(getRentRateCorrection) // 获取租金价格系数填充修正值
    yield fork(setRentRateCorrection) // 租金价格系数填充修正值编辑
    yield fork(updateVisitCities)
  }
})
