import { take, fork } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import API from 'client/api/baseDataExport.api'
import * as commonApi from 'client/api/common.api'
import { actions } from './action'
// import HouseZoneAvgList from '../HouseZoneAvgList'

// 楼盘信息导出
function* exportAreaData() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EXPORT_AREA_DATA)
    try {
      yield call(API.exportAreaData, params)
      if (typeof cb === 'function') {
        cb()
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 房号信息导出
function* exportRoomData() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EXPORT_ROOM_DATA)
    try {
      yield call(API.exportRoomData, params)
      if (typeof cb === 'function') {
        cb()
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 楼栋信息导出
function* exportBuildingData() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EXPORT_BUILDING_DATA)
    try {
      yield call(API.exportBuildingData, params)
      if (typeof cb === 'function') {
        cb()
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* loadAreas() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.FETCH_AREAS)
    try {
      const { data } = yield call(API.fetchAreas, params)
      if (typeof cb === 'function') {
        cb(data)
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
      const { data: res } = yield call(commonApi.updateVisitCities, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'baseExport',
  sagas: function* baseExport() {
    yield fork(exportAreaData)
    yield fork(exportBuildingData)
    yield fork(exportRoomData)
    yield fork(loadAreas)
    yield fork(updateVisitCities)
  }
})
