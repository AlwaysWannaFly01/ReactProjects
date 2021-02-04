import { take, fork, put, all } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/proAddr.api'
import * as commonApi from 'client/api/common.api'
import actions from './actions'

function* initialFetch() {
  while (true) {
    const {
      payload: [searchProjectAddr]
    } = yield take(actions.INITIAL_FETCH)
    try {
      const [{ data: projectAddrList }] = yield all([
        call(
          serverApi.getProjectAddrList,
          { searchProjectAddr },
          actions.GET_PROJECT_ADDR_LIST
        )
      ])
      if (projectAddrList) {
        projectAddrList.records.map(item => {
          item.key = item.id
          return item
        })
        yield all([put(actions.setProjectAddrList(projectAddrList))])
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* initialAddFetch() {
  while (true) {
    yield take(actions.INITIAL_ADD_FETCH)
    try {
      const [{ data: addrTypeList }] = yield all([call(serverApi.getAddrType)])
      yield all([put(actions.setAddrType(addrTypeList))])
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getProjectAddrList() {
  while (true) {
    const {
      payload: [searchProjectAddr,cb]
    } = yield take(actions.GET_PROJECT_ADDR_LIST)
    try {
      const { data: projectAddrList } = yield call(
        serverApi.getProjectAddrList,
        { searchProjectAddr },
        actions.GET_PROJECT_ADDR_LIST
      )
      cb(projectAddrList)
      if (projectAddrList.records) {
        projectAddrList.records.map(item => {
          item.key = item.id
          return item
        })
      }
      yield put(actions.setProjectAddrList(projectAddrList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* addProjectAddr() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.ADD_PROJECT_ADDR)
    try {
      const res = yield call(serverApi.addProjectAddr, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* editProjectAddr() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.EDIT_PROJECT_ADDR)
    try {
      const res = yield call(serverApi.editProjectAddr, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* delProjectAddr() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.DEL_PROJECT_ADDR)
    try {
      yield call(serverApi.delProjectAddr, data)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportProjectAddr() {
  while (true) {
    const {
      payload: [exportQry, cb]
    } = yield take(actions.EXPORT_PROJECT_ADDR)
    try {
      yield call(serverApi.exportProjectAddr, exportQry)
      cb()
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
      const { data: projectDetail } = yield call(serverApi.getProjectDetail, {
        projectId,
        cityId
      })
      yield put(actions.setProjectDetail(projectDetail))
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
function* IsMatchBatchProject() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.IS_MATCH_BATCH_PROJECT)
    try {
      const { data: res } = yield call(commonApi.IsMatchBatchProject, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'proAddr',
  sagas: function* proAddrSaga() {
    yield fork(initialFetch)
    yield fork(initialAddFetch)
    yield fork(getProjectAddrList)
    yield fork(addProjectAddr)
    yield fork(editProjectAddr)
    yield fork(delProjectAddr)
    yield fork(exportProjectAddr)
    yield fork(getProjectDetail)
    yield fork(updateVisitCities)
    yield fork(IsMatchBatchProject)
  }
})
