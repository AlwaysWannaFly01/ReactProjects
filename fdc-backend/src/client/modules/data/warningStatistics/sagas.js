import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/warningStatistics.api'
import actions from './actions'
import * as dictApi from 'client/api/dict.api'
function* initialFetch() {
  while (true) {
    const {
      payload: [searchAreaList]
    } = yield take(actions.INITIAL_FETCH)
    try {
      const { data: areaList } = yield call(serverApi.getDistrictAreas, {
        searchAreaList
      })
      const newAreaList = areaList.map(({ id, areaName }) => ({
        key: id,
        label: areaName,
        value: `${id}`
      }))
      yield put(actions.setDistrictAreas(newAreaList))
    } catch (err) {
      handleErr(err)
    }
  }
}
function* getPriceWarningList(){
  while (true) {
    const {
      payload: [param]
    } = yield take(actions.GET_PRICE_WARNING_LIST)
    try {
      const res = yield call(serverApi.priceWarning, {
        param
      })
      yield put(actions.setPriceWarningList(res.data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* priceWarningExport(){
  while (true) {
    const {
      payload: [param,cb]
    } = yield take(actions.PRICE_WARNING_EXPORT)
    try {
      const res = yield call(serverApi.priceWarningExport, {
        param
      })
      cb(res)
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
function* getVisitCities() {
  while (true) {
    const {
      payload: [cb]
    } = yield take(actions.GET_VISIT_CITIES)
    try {
      const { data } = yield call(serverApi.getVisitCities)
      let arr = []
      data.generalCities.map(item =>arr.push(item.id))
      yield put(actions.setVisitCities(arr))
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'warningStatistics',
  sagas: function* warningStatisticsSaga() {
    yield fork(initialFetch)
    yield fork(getPriceWarningList)
    yield fork(priceWarningExport)
    yield fork(getAreaList)
    yield fork(getVisitCities)
  }
})
