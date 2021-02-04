import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as DCbuildApi from 'client/api/DCbuild.api'
import * as serverApi from 'client/api/common.api'
import * as auditApi from 'client/api/audit.api'
import actions from './actions'

function* getBuildList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_BUILD_LIST)
    try {
      const { data } = yield call(
        DCbuildApi.getBuildList,
        params,
        actions.GET_BUILD_LIST
      )
      yield put(actions.setBuildList(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getBuildDetail() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_BUILD_DETAIL)
    try {
      const { data } = yield call(
        DCbuildApi.getBuildDetail,
        params,
        actions.GET_BUILD_DETAIL
      )
      yield put(actions.setBuildDetail(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getfdcBuildList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_FDC_BUILD_LIST)
    try {
      const { data } = yield call(
        DCbuildApi.fdcBuildList,
        params,
        actions.GET_FDC_BUILD_LIST
      )
      yield put(actions.setfdcBuildList(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* fdcBuildCheckCB() {
  while (true) {
    const {
      payload: [url, params, cb]
    } = yield take(actions.FDC_BUILD_CHECK_CB)
    try {
      const { code, message } = yield call(DCbuildApi.fdcBuildCheckCB, {
        url,
        params
      })
      cb(code, message)
    } catch (err) {
      handleErr(err)
    }
  }
}
// 切换城市
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
  namespace: 'building',
  sagas: function* buildingSaga() {
    yield fork(getBuildList)
    yield fork(getBuildDetail)
    yield fork(getfdcBuildList)
    yield fork(fdcBuildCheckCB)
    yield fork(updateVisitCities)
    yield fork(getAuthority)
  }
})
