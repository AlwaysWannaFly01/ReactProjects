import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/priceRate.api'
import * as dictApi from 'client/api/dict.api'
import * as commonApi from 'client/api/common.api'
import actions from './actions'

function* getAreaList() {
  while (true) {
    const {
      payload: [cityId]
    } = yield take(actions.GET_AREA_LIST)
    try {
      const { data: areaList } = yield call(dictApi.getAreaList, cityId)
      let newAreaList = []
      if (areaList) {
        newAreaList = areaList.map(({ id, areaName }) => ({
          key: id,
          label: areaName,
          value: `${id}`
        }))
      }
      yield put(actions.setAreaList(newAreaList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* fetchPriceRateList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.FETCH_PRICE_RATE_LIST)
    try {
      const { data } = yield call(
        serverApi.fetchPriceRateList,
        params,
        actions.FETCH_PRICE_RATE_LIST
      )
      yield put(actions.setPriceRateList(data || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportPriceRate() {
  while (true) {
    const {
      payload: [exportParams, cb]
    } = yield take(actions.EXPORT_PRICE_RATE)
    try {
      yield call(serverApi.exportPriceRate, exportParams)
      if (typeof cb === 'function') {
        cb()
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getPriceRateDetail() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_PRICE_RATE_DETAIL)
    try {
      const { data: priceRateDetailList } = yield call(
        serverApi.getPriceRateDetail,
        params,
        actions.GET_PRICE_RATE_DETAIL
      )
      yield put(actions.setPriceRateDetail(priceRateDetailList || []))
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

injectSaga({
  namespace: 'priceRate',
  sagas: function* caseHouseSaga() {
    yield fork(getAreaList)
    yield fork(fetchPriceRateList)
    yield fork(exportPriceRate)
    yield fork(getPriceRateDetail)
    yield fork(updateVisitCities)
  }
})
