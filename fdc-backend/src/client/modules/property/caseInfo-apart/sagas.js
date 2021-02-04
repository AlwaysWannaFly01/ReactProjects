import { take, fork, put, all } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/caseInfoApart.api'
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

function* getRentApartCaseList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_RENTAPART_CASE_LIST)
    try {
      const { data: caseList } = yield call(
        serverApi.getRentApartCaseList,
        params,
        actions.GET_RENTAPART_CASE_LIST
      )
      yield put(actions.setRentApartCaseList(caseList || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* initialFetch() {
  while (true) {
    yield take(actions.INITIAL_FETCH)
    try {
      const { data } = yield call(serverApi.getRentApartmentCaseDict)
      const {
        buildingTypes,
        houseTypes,
        orientationTypes,
        payTypes,
        rentTypes
      } = data
      yield all([
        put(actions.setBuildingTypes(buildingTypes)),
        put(actions.setHouseTypes(houseTypes)),
        put(actions.setOrientationTypes(orientationTypes)),
        put(actions.setPayTypes(payTypes)),
        put(actions.setRentTypes(rentTypes))
      ])
    } catch (err) {
      handleErr(err)
    }
  }
}

function* addRentApartCase() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.ADD_RENTAPART_CASE)
    try {
      const res = yield call(serverApi.addRentApartCase, params)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* delRentApartCase() {
  while (true) {
    const {
      payload: [ids, cityId, cb]
    } = yield take(actions.DEL_RENTAPART_CASE)
    try {
      const data = yield call(serverApi.delRentApartCase, { ids, cityId })
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* deleteAllCases() {
  while (true) {
    const {
      payload: [delParams, cb]
    } = yield take(actions.DELETE_ALL_CASES)
    try {
      const data = yield call(serverApi.deleteAllCases, delParams)
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getCaseDetail() {
  while (true) {
    const {
      payload: [caseId, cityId]
    } = yield take(actions.GET_CASE_DETAIL)
    try {
      const { data: caseDetail } = yield call(serverApi.getCaseDetail, {
        caseId,
        cityId
      })
      yield put(actions.setCaseDetail(caseDetail))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* editRentApartCase() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EDIT_RENTAPART_CASE)
    try {
      const data = yield call(serverApi.editRentApartCase, params)
      cb(data)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportRentApartCase() {
  while (true) {
    const {
      payload: [exportParams, cb]
    } = yield take(actions.EXPORT_RENTAPART_CASE)
    try {
      yield call(serverApi.exportRentApartCase, exportParams)
      if (typeof cb === 'function') {
        cb()
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
  namespace: 'caseInfoApart',
  sagas: function* caseInfoSaga() {
    yield fork(getAreaList)
    yield fork(getRentApartCaseList)
    yield fork(initialFetch)
    yield fork(addRentApartCase)
    yield fork(delRentApartCase)
    yield fork(deleteAllCases)
    yield fork(getCaseDetail)
    yield fork(editRentApartCase)
    yield fork(exportRentApartCase)
    yield fork(updateVisitCities)
  }
})
