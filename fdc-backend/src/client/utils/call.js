import { call, put } from 'redux-saga/effects'
import { message } from 'antd'
import Rx from 'rxjs'
import isNode from 'detect-node'
import { setLoading, deleteLoading } from 'client/engine/actions'
import * as api from 'client/api/common.api'
import * as config from 'client/config'

const limit = config.SESSION_TIMEOUT * 0.9

const sleepSubject = new Rx.Subject()
const queue = {}
// eslint-disable-next-line
const messageQueue = (function any() {
  if (isNode) {
    return function noop() {}
  }
  // eslint-disable-next-line
  return function msg({ code, msg, type, callback }) {
    if (queue[code]) {
      return
    }
    queue[code] = true
    message[type](msg, 1.5, () => {
      queue[code] = false
      if (callback) {
        callback()
      }
    })
  }
})()

function sleep() {
  return new Promise(resolve => {
    const f = sleepSubject.subscribe(() => {
      f.unsubscribe()
      resolve()
    })
  })
}

/**
 * wrap了redux-saga的call方法
 * 所有接口调用都会判断是否出现401
 * 仅支持以下写法
 * yield call(serverApi.xxx, postData, actions.FETCH)
 * yield call(serverApi.xxx, actions.FETCH)
 */
let lastAjaxTime = +new Date()
let isCheckUser = false
export default function* callee(fn, payload, loadingAction) {
  if (arguments.length > 3) {
    throw new Error('参数不正确')
  }
  if (
    arguments.length === 2 &&
    Object.prototype.toString.call(payload) === '[object String]'
  ) {
    loadingAction = payload
  }
  yield put(setLoading(loadingAction))
  const now = +new Date()
  try {
    if (now - lastAjaxTime > limit) {
      if (isCheckUser) {
        yield call(sleep)
      } else {
        isCheckUser = true
        yield call(api.getUserInfo)
        isCheckUser = false
        sleepSubject.next()
      }
    }
    // 真正发出ajax
    isCheckUser = false
    lastAjaxTime = +new Date()
    const response = yield call(fn, payload)
    yield put(deleteLoading(loadingAction))
    return response
  } catch (err) {
    const { code, message: msg } = err
    if (code === 401) {
      messageQueue({
        code,
        msg,
        type: 'warning',
        callback: () => {
          // 跳到统一登录页面

          window.location.href = err.origin.response.headers.location
        }
      })
    }
    if (code === 500) {
      messageQueue({
        code,
        msg,
        type: 'error'
      })
    }

    yield put(deleteLoading(loadingAction))
    throw err
    // if (isNode) {
    //   throw err
    // } else {
    //   if (process.env.NODE_ENV === 'development') {
    //     console.warn(err)
    //   }
    //   return {}
    // }
  }
}
