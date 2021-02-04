import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/publicResource.api'
import * as dictApi from 'client/api/dict.api'
import * as commonApi from 'client/api/common.api'
import actions from './actions'

function* getFacilityType() {
  while (true) {
    yield take(actions.GET_FACILITY_TYPE)
    try {
      const { data: typeList } = yield call(dictApi.getCommonFacilitiesTypeCode)
      let newTypeList = []
      if (typeList) {
        newTypeList = typeList.map(({ code, name }) => ({
          key: code,
          label: name,
          value: code
        }))
      }
      yield put(actions.setFacilityType(newTypeList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getCommonFacilities() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.GET_COMMON_FACILITIES)
    try {
      const { data,code,message } = yield call(
        serverApi.getCommonFacilities,
        params,
        actions.GET_COMMON_FACILITIES
      )
      if (data) {
        yield put(actions.setCommonFacilities(data))
      }
      cb({code:code,message:message})
    } catch (err) {
      handleErr(err)
    }
  }
}

function* addCommonFacility() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.ADD_COMMON_FACILITY)
    try {
      const res = yield call(serverApi.addCommonFacility, params)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* editCommonFacility() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EDIT_COMMON_FACILITY)
    try {
      const res = yield call(serverApi.editCommonFacility, params)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* delCommonFacilities() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.DEL_COMMON_FACILITIES)
    try {
      const data = yield call(serverApi.delCommonFacilities, params)
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportCommonFacilities() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EXPORT_COMMON_FACILITIES)
    try {
      yield call(serverApi.exportCommonFacilities, params)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

function* correlateProject() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.CORRELATE_PROJECT)
    try {
      const data = yield call(serverApi.correlateProject, params)
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getCommonFacilitiesDetail() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_COMMON_FACILITY_DETAIL)
    try {
      const { data } = yield call(serverApi.getCommonFacilitiesDetail, params)
      yield put(actions.setCommonFacilitiesDetail(data))
      const { facilitiesTypeCode } = data
      const { data: subTypeList } = yield call(
        dictApi.getFacilitiesSubTypeCode,
        facilitiesTypeCode
      )
      yield put(actions.setFacilitiesSubTypeCode(subTypeList || []))
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getFacilitiesSubTypeCode() {
  while (true) {
    const {
      payload: [typeId]
    } = yield take(actions.GET_FACILITIES_SUB_TYPE_CODE)
    try {
      const { data } = yield call(dictApi.getFacilitiesSubTypeCode, typeId)
      yield put(actions.setFacilitiesSubTypeCode(data || []))
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

function* getCorrelateProject() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.GET_CORRELATE_PROJECT)
    try {
      // const obj = {
      //   data: {
      //     education: {
      //       label: `教育配套${data}`,
      //       code: 10001,
      //       children: [
      //         {
      //           label: '幼儿园',
      //           value: 3,
      //           code: 100011,
      //         },
      //         {
      //           label: '中学',
      //           value: 5,
      //           code: 100012,
      //         }
      //       ]
      //     },
      //     catering: {
      //       label: '饮食配套',
      //       code: 10002,
      //       children: [
      //         {
      //           label: '西餐',
      //           value: 4,
      //           code: 100021,
      //         },
      //         {
      //           label: '中餐',
      //           value: 4,
      //           code: 100022,
      //         }
      //       ]
      //     },
      //     ragTrade: {
      //       label: '划水业',
      //       code: 10003,
      //       children: [
      //         {
      //           label: '划水',
      //           value: null,
      //           code: 100031,
      //         },
      //       ]
      //     },
      //   }
      // }
      // cb(obj)
      const { data: res } = yield call(serverApi.getCorrelateProject, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'publicResource',
  sagas: function* publicResourceSaga() {
    yield fork(getFacilityType)
    yield fork(getCommonFacilities)
    yield fork(addCommonFacility)
    yield fork(editCommonFacility)
    yield fork(delCommonFacilities)
    yield fork(exportCommonFacilities)
    yield fork(correlateProject)
    yield fork(getCommonFacilitiesDetail)
    yield fork(getFacilitiesSubTypeCode)
    yield fork(updateVisitCities)
    yield fork(getCorrelateProject)
  }
})
