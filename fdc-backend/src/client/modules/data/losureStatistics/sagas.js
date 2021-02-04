import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/losureStatistics.api'
import * as dictApi from 'client/api/dict.api'
import actions from './actions'

// 获取法拍统计列表数据
function* getLosureStatisticsList() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_LOSURE_STATISTICS_LIST)
    try {
      const { data, code, message } = yield call(
        serverApi.getLosureStatisticsList,
        params,
        actions.GET_LOSURE_STATISTICS_LIST
      )
      yield put(actions.setLosureStatisticsList(data))
      cb(data, code, message)
    } catch (err) {
      handleErr(err)
    }
  }
}

// 法拍统计-导出
function* exportLosureStatistics() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EXPORT_LOSURE_STATISTICS)
    try {
      yield call(serverApi.exportLosureStatistics, params)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getAreaList() {
  while (true) {
    const {
      payload: [cityId, cb]
    } = yield take(actions.GET_AREA_LIST)
    try {
      const { data } = yield call(dictApi.getAreaList, cityId)
      cb(data)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getSubAreas() {
  while (true) {
    const {
      payload: [areaId, cb]
    } = yield take(actions.GET_SUB_AREAS)
    try {
      const { data } = yield call(dictApi.getSubAreas, areaId)
      cb(data)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getLastMonthCityAvgPrice() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_LAST_MONTH_CITY_AVG_PRICE)
    try {
      const { data } = yield call(serverApi.getLastMonthCityAvgPrice, params)
      yield put(actions.setLastMonthCityAvgPrice(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* addCityAvgPrice() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.ADD_CITY_AVG_PRICE)
    try {
      const res = yield call(serverApi.addCityAvgPrice, params)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* editCityAvgPrice() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EDIT_CITY_AVG_PRICE)
    try {
      const res = yield call(serverApi.editCityAvgPrice, params)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

// 区域租售比历史-导出
function* exportAreaRentalHistory() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EXPORT_AREA_RENTAL_HISTORY)
    try {
      yield call(serverApi.exportAreaRentalHistory, params)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

// 保存区域租售比详情(新增-编辑)
function* saveAreaRental() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.SAVE_AREA_RENTAL)
    try {
      const { message, code } = yield call(serverApi.saveAreaRental, params)
      cb(message, code)
    } catch (err) {
      handleErr(err)
    }
  }
}

// 获取区域租售比详情
function* getAreaRentalDetail() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_AREA_RENTAL_DETAIL)
    try {
      const { data } = yield call(
        serverApi.areaRentalDetail,
        params,
        actions.GET_AREA_RENTAL_DETAI
      )
      cb()
      yield put(actions.setAreaRentalDetailt(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 月份改变获取区域租售比详情-请求
function* fetchAreaRentalDetail() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.FETCH_AREA_RENTAL_DETAIL)
    try {
      const { data } = yield call(
        serverApi.getAreaRentalDetail,
        params,
        actions.FETCH_AREA_RENTAL_DETAIL
      )
      cb()
      yield put(actions.setAreaRentalDetail(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 获取区域租售比详情-历史中-请求
function* fetchAreaRentalDetailHistory() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.FETCH_AREA_RENTAL_DETAIL_HISTORY)
    try {
      const { data } = yield call(serverApi.getAreaRentalDetail, params)
      yield put(actions.setAreaRentalDetailHistory(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 获取区域租售比历史列表
function* getAreaRentalHistoryList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_AREA_RENTAL_HISTORY_LIST)
    try {
      const { data } = yield call(
        serverApi.getAreaRentalHistoryList,
        params,
        actions.GET_AREA_RENTAL_HISTORY_LIST
      )
      yield put(actions.setAreaRentalHistoryList(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'losureStatistics',
  sagas: function* dataAreaRentalSaga() {
    yield fork(getLosureStatisticsList)
    yield fork(exportAreaRentalHistory)
    yield fork(getAreaList)
    yield fork(getSubAreas)
    yield fork(addCityAvgPrice)
    yield fork(getLastMonthCityAvgPrice)
    yield fork(editCityAvgPrice)
    yield fork(fetchAreaRentalDetail)
    yield fork(fetchAreaRentalDetailHistory)
    yield fork(saveAreaRental)
    yield fork(exportLosureStatistics)
    yield fork(getAreaRentalHistoryList)
    yield fork(getAreaRentalDetail)
  }
})
