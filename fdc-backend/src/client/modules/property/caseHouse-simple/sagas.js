import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/caseHouseSample.api'
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

function* fetchCaseList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.FETCH_CASE_LIST)
    try {
      const { data } = yield call(
        serverApi.fetchCaseList,
        params,
        actions.FETCH_CASE_LIST
      )
      yield put(actions.setCaseList(data || []))
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
      const { code, message } = yield call(serverApi.addCase, caseDto)
      if (typeof cb === 'function') {
        cb(code, message)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 检索楼盘
function* getProjectList() {
  while (true) {
    const {
      payload: [caseDto, cb]
    } = yield take(actions.GET_PROJECT_LIST)
    try {
      const { data } = yield call(
        commonApi.getBaseInfoList,
        caseDto,
        actions.GET_PROJECT_LIST
      )
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 检索楼盘 wy
// function* getProjectPop() {
//   while (true) {
//     const {
//       payload: [caseDto, cb]
//     } = yield take(actions.GET_PROJECT_POP)
//     try {
//       const {
//         data: { records }
//       } = yield call(commonApi.getProjectPop, caseDto, actions.GET_PROJECT_POP)
//       if (typeof cb === 'function') {
//         cb(records)
//       }
//     } catch (err) {
//       handleErr(err)
//     }
//   }
// }
function* getProjectPop() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_PROJECT_POP)
    try {
      const { data } = yield call(
        commonApi.getProjectPop,
        params,
        actions.GET_PROJECT_POP
      )
      yield put(actions.setProjectPop(data || {}))
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

function* isActiveProject() {
  while (true) {
    const {
      payload: [id, cityId, cb]
    } = yield take(actions.IS_ACTIVE_PROJECT)
    try {
      const { data } = yield call(serverApi.isActiveProject, { id, cityId })
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getSampleListInBase() {
  while (true) {
    const {
      payload: [id, cityId]
    } = yield take(actions.GET_SAMPLE_LIST_INBASE)
    try {
      const { data } = yield call(
        serverApi.getSampleListInBase,
        { id, cityId },
        actions.GET_SAMPLE_LIST_INBASE
      )
      yield put(actions.setSampleListInBase(data || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getSampleList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_SAMPLE_LIST)
    try {
      const { data } = yield call(
        serverApi.getSampleList,
        params,
        actions.GET_SAMPLE_LIST
      )
      yield put(actions.setSampleList(data || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 新增样本
function* addSamples() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.ADD_SAMPLES)
    try {
      const { code, message } = yield call(serverApi.addSamples, params)
      if (typeof cb === 'function') {
        cb(code, message)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 删除样本
function* deleteSamples() {
  while (true) {
    const {
      payload: [ids, cityId, cb]
    } = yield take(actions.DELETE_SAMPLES)
    try {
      const { code, message } = yield call(serverApi.deleteSamples, {
        ids,
        cityId
      })
      if (typeof cb === 'function') {
        cb(code, message)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 关联样本
function* relateSample() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.RELATE_SAMPLE)
    try {
      const { code, message } = yield call(serverApi.relateSample, params)
      if (typeof cb === 'function') {
        cb(code, message)
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

// 一键自动关联
function* autoRelated() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.AUTO_RELATED)
    try {
      const err = yield call(serverApi.autoRelated, params)
      cb(err)
    } catch (err) {
      handleErr(err)
    }
  }
}

// 关联按钮状态（1：可点击，0：不可点击）
function* autoRelatedStatus() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.AUTO_RELATED_STATUS)
    try {
      const err = yield call(serverApi.autoRelatedStatus, params)
      cb(err)
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'caseHouseSample',
  sagas: function* caseHouseSaga() {
    yield fork(getAreaList)
    yield fork(fetchCaseList)
    yield fork(getCaseDetail)
    yield fork(deleteCases)
    yield fork(exportCase)
    yield fork(addCase)
    yield fork(getProjectList)
    yield fork(getProjectPop)
    yield fork(isActiveProject)
    yield fork(getSampleListInBase)
    yield fork(getSampleList)
    yield fork(addSamples)
    yield fork(deleteSamples)
    yield fork(relateSample)
    yield fork(updateVisitCities)
    yield fork(autoRelated)
    yield fork(autoRelatedStatus)
  }
})
