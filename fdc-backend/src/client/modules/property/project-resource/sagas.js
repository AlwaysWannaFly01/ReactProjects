import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/projectResource.api'
import * as dictApi from 'client/api/dict.api'
import * as baseInfoApi from 'client/api/baseInfo.api'
import * as commonApi from 'client/api/common.api'
import actions from './actions'
import router from 'client/router'
function* getFacilityType() {
  while (true) {
    yield take(actions.GET_FACILITY_TYPE)
    try {
      const { data: typeList } = yield call(dictApi.getFacilityType)
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

function* getProjectFacilities() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.GET_PROJECT_FACILITIES)
    try {
      const { data,code,message } = yield call(
        serverApi.getProjectFacilities,
        params,
        actions.GET_PROJECT_FACILITIES
      )
      if (data) {
        yield put(actions.setProjectFacilities(data))
      }
      cb({code:code,message:message})
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getProjectDetail() {
  while (true) {
    const {
      payload: [projectId, cityId]
    } = yield take(actions.GET_PROJECT_DETAIL)
    try {
      const { data: projectDetail } = yield call(baseInfoApi.getProjectDetail, {
        projectId,
        cityId
      })
      yield put(actions.setProjectDetail(projectDetail))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* delProjectFacilities() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.DEL_PROJECT_FACILITIES)
    try {
      const data = yield call(serverApi.delProjectFacilities, params)
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportProjectFacilities() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EXPORT_PROJECT_FACILITIES)
    try {
      yield call(serverApi.exportProjectFacilities, params)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

function* addProjectFacility() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.ADD_PROJECT_FACILITY)
    try {
      const res = yield call(serverApi.addProjectFacility, params)
      cb(res)
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

function* getFacilityClassCode() {
  while (true) {
    yield take(actions.GET_FACILITY_CLASS_CODE)
    try {
      const { data } = yield call(dictApi.getFacilityClassCode)
      yield put(actions.setFacilityClassCode(data || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getProjectFacilityDetail() {
  while (true) {
    const {
      payload: [params,props,projectId,cityId,cityName]
    } = yield take(actions.GET_PROJECT_FACILITY_DETAIL)
    try {
      const { data,message } = yield call(serverApi.getProjectFacilityDetail, params)
      if(!data){
        alert(message)
        props.history.push({
          pathname: router.RES_PROJECT_RESOURCE,
          search: `projectId=${projectId}&cityId=${cityId}&cityName=${cityName}`
        })
        return
      }
      yield put(actions.setProjectFacilityDetail(data))
      const { facilitiesTypeCode } = data
      const { data: subTypeList } = yield call(
        dictApi.getFacilitiesSubTypeCode,
        facilitiesTypeCode
      )
      yield put(actions.setFacilitiesSubTypeCode(subTypeList || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* editProjectFacility() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EDIT_PROJECT_FACILITY)
    try {
      const res = yield call(serverApi.editProjectFacility, params)
      cb(res)
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
  namespace: 'projectResource',
  sagas: function* publicResourceSaga() {
    yield fork(getFacilityType)
    yield fork(getProjectFacilities)
    yield fork(getProjectDetail)
    yield fork(delProjectFacilities)
    yield fork(exportProjectFacilities)
    yield fork(addProjectFacility)
    yield fork(getFacilitiesSubTypeCode)
    yield fork(getFacilityClassCode)
    yield fork(getProjectFacilityDetail)
    yield fork(editProjectFacility)
    yield fork(updateVisitCities)
  }
})
