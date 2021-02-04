import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as backConfigApi from 'client/api/backConfig.api'
import actions from './actions'

function* getChannelList() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_CHANNEL_LIST)
    try {
      const { data } = yield call(
        backConfigApi.getChannelList,
        params,
        actions.GET_CHANNEL_LIST
      )
      yield put(actions.setChannelList(data))
      cb(data.records)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getListByCity() {
  while (true) {
    const {
      payload: [cityId, cb]
    } = yield take(actions.GET_LIST_BY_CITY)
    try {
      const { data } = yield call(backConfigApi.getListByCity, cityId)
      cb(data)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getProductByCity() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_PRODUCT_BY_CITY)
    try {
      const { data } = yield call(
        backConfigApi.getProductByCity,
        params,
        actions.GET_PRODUCT_BY_CITY
      )
      cb(data)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* saveProductList() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.SAVE_PRODUCT_LIST)
    try {
      const { code, message } = yield call(
        backConfigApi.saveProductList,
        params
      )
      if (typeof cb === 'function') {
        cb(code, message)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getDataList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_DATA_LIST)
    try {
      const data = yield call(
        backConfigApi.getDataList,
        params,
        actions.GET_DATA_LIST
      )
      yield put(actions.setDataList(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getProductList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_PRODUCT_LIST)
    try {
      const { data } = yield call(
        backConfigApi.getProductList,
        params,
        actions.GET_PRODUCT_LIST
      )
      yield put(actions.setProductList(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 删除 导入日志列表
function* delProduct() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.DEL_PRODUCT)
    try {
      const { code, message } = yield call(backConfigApi.delProduct, params)
      if (typeof cb === 'function') {
        cb(code, message)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 删除 导入日志列表
function* validateAreaConfig() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.VALIDATE_AREA_CONFIG)
    try {
      const { code, message } = yield call(
        backConfigApi.validateAreaConfig,
        params
      )
      if (typeof cb === 'function') {
        cb(code, message)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'DatasourceManage',
  sagas: function* DatasourceManageSaga() {
    yield fork(getChannelList)
    yield fork(getListByCity)
    yield fork(getProductByCity)
    yield fork(saveProductList)
    yield fork(getDataList)
    yield fork(getProductList)
    yield fork(delProduct)
    yield fork(validateAreaConfig)
  }
})
