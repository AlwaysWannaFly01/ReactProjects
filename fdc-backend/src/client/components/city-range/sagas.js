import { take, fork, put, all } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as commonApi from 'client/api/common.api'
import actions from './actions'

function* getAllCityList() {
  while (true) {
    yield take(actions.GET_ALL_CITY_LIST)
    try {
      const [{ data: provinceList }, { data: cityList }] = yield all([
        call(commonApi.getProviceList),
        call(commonApi.getCityList)
      ])
      const treeData = []
      if (provinceList && provinceList.length) {
        provinceList.forEach((province, index) => {
          treeData.push({
            title: province.provinceName,
            // key: `${province.id}-${index}`,
            value: `${province.id}-${index}`,
            realValue: province.id,
            children: []
          })
        })
      }
      if (cityList && cityList.length) {
        treeData.forEach(province => {
          cityList.forEach((city, index) => {
            if (province.realValue === city.provinceId) {
              province.children.push({
                title: city.cityName,
                value: `${province.realValue}-${city.id}-${index}`,
                // key: `${province.realValue}-${city.id}-${index}`,
                realValue: city.id
              })
            }
          })
        })
      }
      yield all([
        put(actions.setAllCityList(treeData)),
        put(actions.setCityList(cityList))
      ])
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getAuthorityCityList() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_AUTHORITY_CITY_LIST)
    try {
      const {
        data: { areaIds, list }
      } = yield call(commonApi.getAuthorityCityList, params)
      yield put(actions.setAuthorityCityList(list))
      cb(areaIds, list)
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'cityRange',
  sagas: function* cityRangeSaga() {
    yield fork(getAllCityList)
    yield fork(getAuthorityCityList)
  }
})
