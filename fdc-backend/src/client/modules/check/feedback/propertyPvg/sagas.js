import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as feedbackPvgApi from 'client/api/feedbackPvg.api'
import * as dictApi from 'client/api/dict.api'
import actions from './actions'

function* getPropertyPvgList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_PROPERTY_PVG_LIST)
    try {
      const { data } = yield call(
        feedbackPvgApi.getPropertyPvgList,
        params,
        actions.GET_PROPERTY_PVG_LIST
      )
      yield put(actions.setPropertyPvgList(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getSourceProduct() {
  while (true) {
    yield take(actions.GET_SOURCE_PRODUCT)
    try {
      const { data } = yield call(
        dictApi.getSourceCompany,
        actions.GET_SOURCE_PRODUCT
      )
      data.forEach(item => {
        item.value = item.companyId
        item.label = item.companyName
      })
      yield put(actions.setSourceProduct(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* replyPvgResponse() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.REPLY_PVG_RESPONSE)
    try {
      const { data, message: msg, code } = yield call(
        feedbackPvgApi.replyPvgResponse,
        params,
        actions.REPLY_PVG_RESPONSE
      )
      cb(data, msg, code)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getAnswerList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_ANSWER_LIST)
    try {
      const { data } = yield call(
        feedbackPvgApi.getAnswerList,
        params,
        actions.GET_ANSWER_LIST
      )
      yield put(actions.setAnswerList(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getOneLine() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_ONE_LINE_LIST)
    try {
      const { data } = yield call(
        feedbackPvgApi.getOneLine,
        params,
        actions.GET_ONE_LINE_LIST
      )
      yield put(actions.setOneLineList([data]))
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
        feedbackPvgApi.getAuthority,
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
  namespace: 'propertyPvg',
  sagas: function* propertyPvgSaga() {
    yield fork(getPropertyPvgList)
    yield fork(getSourceProduct)
    yield fork(replyPvgResponse)
    yield fork(getAnswerList)
    yield fork(getOneLine)
    yield fork(getAuthority)
  }
})
