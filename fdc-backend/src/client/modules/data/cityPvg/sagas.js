import moment from 'moment'
import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/cityAvg.api'
import * as dictApi from 'client/api/dict.api'
import actions from './actions'

function* getObjectType() {
  while (true) {
    yield take(actions.GET_OBJECT_TYPE)
    try {
      const { data: typeList } = yield call(dictApi.getPropertyType)
      let newTypeList = []
      if (typeList) {
        newTypeList = typeList.map(({ code, name }) => ({
          key: code,
          label: name,
          value: code
        }))
      }
      yield put(actions.setObjectType(newTypeList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getCityAvgPrice() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_CITY_AVG_PRICE)
    try {
      const { data } = yield call(
        serverApi.getCityAvgPrice,
        params,
        actions.GET_CITY_AVG_PRICE
      )
      if (data && data.records) {
        data.records = data.records.map((item, index) => {
          item.id = index
          if (item.list instanceof Array) {
            item.list.forEach(list => {
              const dateMonth = moment(list.avgPriceDate).format('YYYY-MM')
              if (list.avgPrice !== null && list.avgPrice !== undefined) {
                if (
                  list.avgPriceGained !== null &&
                  list.avgPriceGained !== undefined
                ) {
                  if (list.avgPriceGained >= 0) {
                    item[dateMonth] = `${list.id || ''},${list.avgPrice}(↑${
                      list.avgPriceGained
                    }%)`
                  } else {
                    item[dateMonth] = `${list.id || ''},${
                      list.avgPrice
                    }(↓${-list.avgPriceGained}%)`
                  }
                } else {
                  item[dateMonth] = `${list.id || ''},${list.avgPrice}`
                }
              } else {
                item[dateMonth] = `${list.id || ''},——,${item.cityId},${item.areaId},${item.subAreaId},${item.propertyTypeCode}`
              }
            })
          }
          return item
        })
        yield put(actions.setCityAvgPrice(data))
      }
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

function* getCityAvgPriceDetail() {
  while (true) {
    const {
      payload: [id]
    } = yield take(actions.GET_CITY_AVG_PRICE_DETAIL)
    try {
      const { data } = yield call(serverApi.getCityAvgPriceDetail, id)
      yield put(actions.setCityAvgPriceDetail(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportCityAvgPrice() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EXPORT_CITY_AVG_PRICE)
    try {
      yield call(serverApi.exportCityAvgPrice, params)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

function* cityAvgPriceMonth(){
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.CITYAVGPRICEMONTH)
    try {
      const data = yield call(serverApi.cityAvgPriceMonth, params)
      cb(data)
    } catch (err) {
      handleErr(err)
      cb(err)
    }
  }
}

injectSaga({
  namespace: 'dataCityAvg',
  sagas: function* dataCityAvgSaga() {
    yield fork(cityAvgPriceMonth)
    yield fork(getObjectType)
    yield fork(getCityAvgPrice)
    yield fork(getAreaList)
    yield fork(getSubAreas)
    yield fork(addCityAvgPrice)
    yield fork(getLastMonthCityAvgPrice)
    yield fork(editCityAvgPrice)
    yield fork(getCityAvgPriceDetail)
    yield fork(exportCityAvgPrice)
  }
})
