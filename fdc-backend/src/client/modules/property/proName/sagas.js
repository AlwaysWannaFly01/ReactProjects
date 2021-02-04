import { take, fork, put, all } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/proName.api'
import * as commonApi from 'client/api/common.api'
import actions from './actions'

function* initialFetch() {
  while (true) {
    const {
      payload: [searchProjectAlia]
    } = yield take(actions.INITIAL_FETCH)
    try {
      const [{ data: projectAliaList }, { data: aliaTypeList }] = yield all([
        call(
          serverApi.getProjectAliaList,
          { searchProjectAlia },
          actions.GET_PROJECT_ALIA_LIST
        ),
        call(serverApi.getAliaType)
      ])
      if (projectAliaList.records) {
        projectAliaList.records.map(item => {
          item.key = item.id
          return item
        })
      }
      yield all([
        put(actions.setProjectAliaList(projectAliaList)),
        put(actions.setAliaType(aliaTypeList))
      ])
    } catch (err) {
      handleErr(err)
    }
  }
}

function* initialAddFetch() {
  while (true) {
    const {
      payload: [searchAreaList]
    } = yield take(actions.INITIAL_ADD_FETCH)
    try {
      const [{ data: areaList }] = yield all([
        call(serverApi.getDistrictAreas, { searchAreaList })
      ])
      yield all([put(actions.setDistrictAreas(areaList))])
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getProjectAliaList() {
  while (true) {
    const {
      payload: [searchProjectAlia,cb]
    } = yield take(actions.GET_PROJECT_ALIA_LIST)
    try {
      const { data: projectAliaList } = yield call(
        serverApi.getProjectAliaList,
        { searchProjectAlia },
        actions.GET_PROJECT_ALIA_LIST
      )
      cb(projectAliaList)
      if (projectAliaList.records) {
        projectAliaList.records.map(item => {
          item.key = item.id
          return item
        })
      }
      yield put(actions.setProjectAliaList(projectAliaList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* addProjectAlia() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.ADD_PROJECT_ALIA)
    try {
      const res = yield call(serverApi.addProjectAlia, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* editProjectAlia() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.EDIT_PROJECT_ALIA)
    try {
      const res = yield call(serverApi.editProjectAlia, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
    cb()
  }
}

function* delProjectAlia() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.DEL_PROJECT_ALIA)
    try {
      yield call(serverApi.delProjectAlia, data)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportProjectName() {
  while (true) {
    const {
      payload: [exportQry, cb]
    } = yield take(actions.EXPORT_PROJECT_NAME)
    try {
      yield call(serverApi.exportProjectName, exportQry)
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

injectSaga({
  namespace: 'proName',
  sagas: function* proNameSaga() {
    yield fork(initialFetch)
    yield fork(initialAddFetch)
    yield fork(getProjectAliaList)
    yield fork(addProjectAlia)
    yield fork(editProjectAlia)
    yield fork(delProjectAlia)
    yield fork(exportProjectName)
    yield fork(getProjectDetail)
    yield fork(updateVisitCities)
  }
})
