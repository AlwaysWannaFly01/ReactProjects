import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as DCbuildApi from 'client/api/DCbuild.api'
import * as serverApi from 'client/api/common.api'
import * as auditApi from 'client/api/audit.api'
import actions from './actions'

function* getHouseList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_HOUSE_LIST)
    try {
      const { data } = yield call(
        DCbuildApi.getHouseList,
        params,
        actions.GET_HOUSE_LIST
      )
      yield put(actions.setHouseList(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getHouseDetail() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_HOUSE_DETAIL)
    try {
      const { data } = yield call(
        DCbuildApi.getHouseDetail,
        params,
        actions.GET_HOUSE_DETAIL
      )
      yield put(actions.setHouseDetail(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getfdcHouseList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_FDC_HOUSE_LIST)
    try {
      const { data } = yield call(
        DCbuildApi.fdcHouseList,
        params,
        actions.GET_FDC_HOUSE_LIST
      )
      yield put(actions.setfdcHouseList(data))
    } catch (err) {
      handleErr(err)
    }
  }
}
// // 确定房号关联列表
// function* getpreMatchList() {
//   while (true) {
//     const {
//       payload: [params]
//     } = yield take(actions.GET_PRE_MATCH_LIST)
//     try {
//       const { data } = yield call(
//         DCbuildApi.preMatchList,
//         params,
//         actions.GET_PRE_MATCH_LIST
//       )
//       yield put(actions.setpreMatchList(data))
//     } catch (err) {
//       handleErr(err)
//     }
//   }
// }
// 确定房号关联列表 换成回调函数
function* getPreMatchList() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_PRE_MATCH_LIST)
    try {
      const { data } = yield call(
        DCbuildApi.getPreMatchList,
        params,
        actions.GET_PRE_MATCH_LIST
      )
      yield put(actions.setPreMatchList(data))
      cb(data)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* fdcRoomCheckCB() {
  while (true) {
    const {
      payload: [url, params, cb]
    } = yield take(actions.FDC_ROOM_CHECK_CB)
    try {
      const { code, message } = yield call(DCbuildApi.fdcRoomCheckCB, {
        url,
        params
      })
      cb(code, message)
    } catch (err) {
      handleErr(err)
    }
  }
}

// 确定按钮
function* sureButton() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.SURE_BUTTON)
    try {
      const { data, message: msg, code } = yield call(
        DCbuildApi.sureButton,
        params,
        actions.SURE_BUTTON
      )
      cb(data, msg, code)
    } catch (err) {
      handleErr(err)
    }
  }
}

// 房号关联情况
function* getConditionList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_CONDITION_LIST)
    try {
      const { data } = yield call(
        DCbuildApi.getConditionList,
        params,
        actions.GET_CONDITION_LIST
      )

      yield put(actions.setConditionList(data))
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
  namespace: 'roomNO',
  sagas: function* roomNOSaga() {
    yield fork(getHouseList)
    yield fork(getHouseDetail)
    yield fork(getfdcHouseList)
    yield fork(getPreMatchList)
    yield fork(fdcRoomCheckCB)
    yield fork(sureButton)
    yield fork(getConditionList)
    yield fork(updateVisitCities)
    yield fork(getAuthority)
  }
})
