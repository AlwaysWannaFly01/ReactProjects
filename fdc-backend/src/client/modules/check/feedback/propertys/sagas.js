import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as feedbackApi from 'client/api/feedback.api'
import * as dictApi from 'client/api/dict.api'
import actions from './actions'

function* getPropertysList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_PROPERTYS_LIST)
    try {
      const { data } = yield call(
        feedbackApi.getPropertysList,
        params,
        actions.GET_PROPERTYS_LIST
      )
      yield put(actions.setPropertysList(data))
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

function* replyResponse() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.REPLY_RESPONSE)
    try {
      const { data, message: msg, code } = yield call(
        feedbackApi.replyResponse,
        params,
        actions.REPLY_RESPONSE
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
        feedbackApi.getAnswerList,
        params,
        actions.GET_ANSWER_LIST
      )
      yield put(actions.setAnswerList(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'propertys',
  sagas: function* propertysSaga() {
    yield fork(getPropertysList)
    yield fork(getSourceProduct)
    yield fork(replyResponse)
    yield fork(getAnswerList)
  }
})
