import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/common.api'
import actions from './actions'

function* getVisitCities() {
  while (true) {
    const {
      payload: [cb]
    } = yield take(actions.GET_VISIT_CITIES)
    try {
      const { data: res } = yield call(serverApi.getVisitCities)
      const { generalCities = [], provinces = [] } = res || {}
      yield put(actions.setGeneralCities(generalCities))
      // if (allProvinces) {
      //   const { data: provinceList } = yield call(serverApi.getProviceList)
      //   yield put(actions.setProvinceList(provinceList))
      // } else {
      yield put(actions.setProvinceList(provinces))
      // }
      cb()
    } catch (err) {
      handleErr(err)
      cb()
    }
  }
}

function* updateVisitCities() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.UPDATE_VISIT_CITIES)
    try {
      const { data: res } = yield call(serverApi.updateVisitCities, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getCityList() {
  while (true) {
    const {
      payload: [provinceId]
    } = yield take(actions.GET_CITY_LIST)
    try {
      const { data: cityList } = yield call(serverApi.getCityList, provinceId)
      yield put(actions.setCityList({ allCities: cityList }))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* searchVisitCity() {
  while (true) {
    const {
      payload: [keyword, cb]
    } = yield take(actions.SEARCH_VISIT_CITY)
    try {
      const { data } = yield call(serverApi.searchVisitCity, keyword)
      cb(data)
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'cityList',
  sagas: function* cityListSaga() {
    yield fork(getVisitCities)
    yield fork(updateVisitCities)
    yield fork(getCityList)
    yield fork(searchVisitCity)
  }
})
