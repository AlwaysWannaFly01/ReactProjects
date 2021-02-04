import { take, fork, put, all } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as commonApi from 'client/api/common.api'
import actions from './actions'

// 获取上次选的城市设置为默认车给是
function* getDefaultCity(){
  while (true) {
    const {
      payload: [cb]
    } = yield take(actions.GET_DEFAULT_CITY)
    try {
      const { data,code } = yield call(
          commonApi.getDealDefaultCity,
          actions.GET_DEFAULT_CITY
      )
      yield put(actions.setDefaultCity(data))
      cb(data,code)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getAllCityList() {
  while (true) {
    const {
      payload: [cb]
    } = yield take(actions.GET_ALL_CITY_LIST)
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
      //  eslint-disable-next-line
      treeData.map(item => {
        if (item.children) {
          item.disabled = true
        }
      })
      yield all([
        put(actions.setAllCityList(treeData)),
        put(actions.setCityList(cityList))
      ])
      cb(treeData)
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
  namespace: 'CityRangeSingle',
  sagas: function* CityRangeSingleSaga() {
    yield fork(getAllCityList)
    yield fork(getAuthorityCityList)
    yield fork(getDefaultCity)
  }
})
