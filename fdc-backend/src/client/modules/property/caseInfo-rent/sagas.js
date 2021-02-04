import { take, fork, put, all } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/caseInfoRent.api'
import * as dictApi from 'client/api/dict.api'
import * as commonApi from 'client/api/common.api'
import actions from './actions'

function* getAreaList() {
  while (true) {
    const {
      payload: [cityId]
    } = yield take(actions.GET_AREA_LIST)
    try {
      const { data: areaList } = yield call(serverApi.getAreaList, cityId)
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

function* getCaseTypeList() {
  while (true) {
    yield take(actions.GET_CASE_TYPE_LIST)
    try {
      const { data: caseTypeList } = yield call(dictApi.getRentCaseCode)
      let newCaseTypeList = []
      if (caseTypeList) {
        newCaseTypeList = caseTypeList.map(({ code, name }) => ({
          key: code,
          label: name,
          value: `${code}`
        }))
      }
      yield put(actions.setCaseTypeList(newCaseTypeList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* fetchCaseList() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.FETCH_CASE_LIST)
    try {
      const res = yield call(
        serverApi.fetchCaseList,
        params,
        actions.FETCH_CASE_LIST
      )
      yield put(actions.setCaseList(res.data || []))
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* initialFetch() {
  while (true) {
    yield take(actions.INITIAL_FETCH)
    try {
      const [
        { data: houseUsageList },
        { data: caseTypeList },
        { data: orientTypeList },
        { data: buildTypeList },
        { data: houseTypeList },
        { data: structTypeList },
        { data: currencyTypeList },
        { data: payTypeCodeList },
        { data: rentTypeCodeList }
      ] = yield all([
        call(dictApi.getHouseUsage),
        call(dictApi.getRentCaseCode),
        call(dictApi.getOrientType),
        call(dictApi.getBuildingType),
        call(dictApi.getHouseType),
        call(dictApi.getStructType),
        call(dictApi.getCurrencyType),
        call(dictApi.getPayTypeCode),
        call(dictApi.getRentTypeCode)
      ])
      let newCaseTypeList = []
      if (caseTypeList) {
        newCaseTypeList = caseTypeList.map(({ code, name }) => ({
          key: code,
          label: name,
          value: code
        }))
      }
      yield all([
        put(actions.setHouseUsage(houseUsageList)),
        put(actions.setCaseTypeList(newCaseTypeList)),
        put(actions.setOrientType(orientTypeList)),
        put(actions.setBuildingType(buildTypeList)),
        put(actions.setHouseType(houseTypeList)),
        put(actions.setStructType(structTypeList)),
        put(actions.setCurrencyType(currencyTypeList)),
        put(actions.setPayTypeCode(payTypeCodeList)),
        put(actions.setRentTypeCode(rentTypeCodeList))
      ])
    } catch (err) {
      handleErr(err)
    }
  }
}

// 新增案例
function* addCase() {
  while (true) {
    const {
      payload: [caseDto, cb]
    } = yield take(actions.ADD_CASE)
    try {
      const data = yield call(serverApi.addCase, caseDto)
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* editCase() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EDIT_CASE)
    try {
      const data = yield call(serverApi.editCase, params)
      cb(data)
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

function* deleteCases() {
  while (true) {
    const {
      payload: [ids, cityId, cb]
    } = yield take(actions.DELETE_CASES)
    try {
      const data = yield call(serverApi.deleteCases, { ids, cityId })
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

function* exportCase() {
  while (true) {
    const {
      payload: [exportParams, cb]
    } = yield take(actions.EXPORT_CASE)
    try {
      yield call(serverApi.exportCase, exportParams)
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
  namespace: 'caseInfoRent',
  sagas: function* caseInfoSaga() {
    yield fork(getAreaList)
    yield fork(getCaseTypeList)
    yield fork(fetchCaseList)
    yield fork(initialFetch)
    yield fork(addCase)
    yield fork(editCase)
    yield fork(getCaseDetail)
    yield fork(deleteCases)
    yield fork(deleteAllCases)
    yield fork(exportCase)
    yield fork(updateVisitCities)
  }
})
