import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as auditApi from 'client/api/audit.api'
import * as serverApi from 'client/api/common.api'
import actions from './actions'

function* getAuditList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_AUDIT_LIST)
    try {
      const { data } = yield call(
        auditApi.getAuditList,
        params,
        actions.GET_AUDIT_LIST
      )
      yield put(actions.setAuditList(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getShowInformation() {
  while (true) {
    const {
      payload: [projectId]
    } = yield take(actions.GET_INFORMATION_LIST)
    try {
      const { data } = yield call(
        auditApi.getShowInformation,
        projectId,
        actions.GET_INFORMATION_LIST
      )
      yield put(actions.setInformationList(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getMatchList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_MATCH_LIST)
    try {
      const { data } = yield call(
        auditApi.getMatchList,
        params,
        actions.GET_MATCH_LIST
      )
      yield put(actions.setMatchList(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* projectDcCheckCB() {
  while (true) {
    const {
      payload: [url, params, cb]
    } = yield take(actions.PROJECT_DC_CHECK_CB)
    try {
      const { code, message } = yield call(auditApi.projectDcCheckCB, {
        url,
        params
      })
      cb(code, message)
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
      const { data: res } = yield call(serverApi.updateVisitCities, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getAuthority() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_AUTHORITY_LIST)
    try {
      const { data } = yield call(
        auditApi.getAuthority,
        params,
        actions.GET_AUTHORITY_LIST
      )
      yield put(actions.setAuthorityList([data]))
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'auditFloor',
  sagas: function* auditFloorSaga() {
    yield fork(getAuditList)
    yield fork(getShowInformation)
    yield fork(getMatchList)
    yield fork(projectDcCheckCB)
    yield fork(updateVisitCities)
    yield fork(getAuthority)
  }
})
