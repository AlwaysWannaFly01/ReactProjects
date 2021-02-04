import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/projectSet.api'
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

// 获取片区
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

function* fetchProjectSet() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.FETCH_PROJECT_SET)
    try {
      const { data } = yield call(
        serverApi.fetchProjectSet,
        params,
        actions.FETCH_PROJECT_SET
      )
      yield put(actions.setProjectSet(data || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 新增楼盘集合
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

// 4. 获取行政区集合配置列表
function* getUpArea() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_UP_AREA)
    try {
      const { data } = yield call(
        serverApi.getUpArea,
        params,
        actions.GET_UP_AREA
      )
      if (typeof cb === 'function') {
        cb(data)
      }
      yield put(actions.setUpArea(data || {}))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getSetDetail() {
  while (true) {
    const {
      payload: [setId]
    } = yield take(actions.GET_SET_DETAIL)
    try {
      const { data: setDetail } = yield call(serverApi.getSetDetail, {
        setId
      })
      yield put(actions.setSetDetail(setDetail))
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

function* getSetProjectList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_SET_PROJECT_LIST)
    try {
      const { data } = yield call(
        serverApi.getSetProjectList,
        params,
        actions.GET_SET_PROJECT_LIST
      )
      yield put(actions.setSetProjectList(data || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getSetPopList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_SET_POP_LIST)
    try {
      const { data } = yield call(
        serverApi.getSetPopList,
        params,
        actions.GET_SET_POP_LIST
      )
      yield put(actions.setSetPopList(data || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 修改集合 updateSet
function* updateSet() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.UPDATE_SET)
    try {
      const { code, message } = yield call(serverApi.updateSet, params)
      cb(code, message)
    } catch (err) {
      handleErr(err)
      cb({ code: 500 })
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
      payload: [params, cb]
    } = yield take(actions.DELETE_SAMPLES)
    try {
      const { code, message } = yield call(serverApi.deleteSamples, params)
      if (typeof cb === 'function') {
        cb(code, message)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// // 关联样本
// function* relateSample() {
//   while (true) {
//     const {
//       payload: [params, cb]
//     } = yield take(actions.RELATE_SAMPLE)
//     try {
//       const { code, message } = yield call(serverApi.relateSample, params)
//       if (typeof cb === 'function') {
//         cb(code, message)
//       }
//     } catch (err) {
//       handleErr(err)
//     }
//   }
// }

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

// // 一键自动关联
// function* autoRelated() {
//   while (true) {
//     const {
//       payload: [params, cb]
//     } = yield take(actions.AUTO_RELATED)
//     try {
//       const err = yield call(serverApi.autoRelated, params)
//       cb(err)
//     } catch (err) {
//       handleErr(err)
//     }
//   }
// }

// // 关联按钮状态（1：可点击，0：不可点击）
// function* autoRelatedStatus() {
//   while (true) {
//     const {
//       payload: [params, cb]
//     } = yield take(actions.AUTO_RELATED_STATUS)
//     try {
//       const err = yield call(serverApi.autoRelatedStatus, params)
//       cb(err)
//     } catch (err) {
//       handleErr(err)
//     }
//   }
// }

injectSaga({
  namespace: 'projectSet',
  sagas: function* caseHouseSaga() {
    yield fork(getAreaList)
    yield fork(fetchProjectSet)
    yield fork(getUpArea)
    yield fork(getSubAreas)
    yield fork(getSetDetail)
    yield fork(deleteCases)
    // yield fork(exportCase)
    yield fork(addCase)
    yield fork(getProjectList)
    yield fork(getProjectPop)
    // yield fork(isActiveProject)
    yield fork(getSetPopList)
    yield fork(getSetProjectList)
    yield fork(addSamples)
    yield fork(deleteSamples)
    yield fork(updateVisitCities)
    yield fork(updateSet) // 修改集合
  }
})
