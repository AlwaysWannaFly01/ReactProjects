import {
  createStore,
  applyMiddleware,
  compose,
  combineReducers,
  bindActionCreators
} from 'redux'
import thunk from 'redux-thunk'
import createSagaMiddleware from 'redux-saga'
import Immutable from 'immutable'

// const devToolsExtension = typeof devToolsExtension === 'function' ? devToolsExtension : f => f
const sagaMiddleware = createSagaMiddleware()
const asyncReducers = {}
const asyncSagas = {}
let store = null
/**
 * 创建root ruducer
 */
function createReducer(reducers) {
  return combineReducers({
    ...reducers
  })
}

function runSaga() {
  const allPromise = []
  Object.keys(asyncSagas).forEach(saga => {
    allPromise.push(sagaMiddleware.run(asyncSagas[saga]).done)
  })
  return allPromise
}

export function initStore(initialState = {}) {
  const enhanceMiddleware = []
  if (process.env.NODE_ENV === 'development') {
    /* eslint-disable no-undef */
    if (typeof __REDUX_DEVTOOLS_EXTENSION__ === 'function') {
      enhanceMiddleware.push(__REDUX_DEVTOOLS_EXTENSION__())
    } else {
      enhanceMiddleware.push(f => f)
    }
  }
  const middleware = compose(
    applyMiddleware(sagaMiddleware, thunk),
    ...enhanceMiddleware
  )
  const reducers = createReducer(asyncReducers)
  store = createStore(reducers, initialState, middleware)
  store.runSaga = runSaga
  // Object.keys(asyncSagas).forEach(saga => {
  //   store.saga = sagaMiddleware.run(asyncSagas[saga])
  // })
  return store
}

function injectAsyncReducer(name, reducer) {
  if (asyncReducers[name]) {
    return
  }
  asyncReducers[name] = reducer
  if (store) {
    store.replaceReducer(createReducer(asyncReducers))
  }
}

/**
 * 动态添加reducer
 */
export function injectReducer({ namespace, initialState, actionHandlers }) {
  initialState.isLoaded = false
  actionHandlers[`${namespace}/SET_STORE`] = (state, { payload: [data] }) =>
    state.merge(data)

  const finallyState = Immutable.fromJS(initialState)
  const finallyReducer = (state = finallyState, action) => {
    if (action.type === `${namespace}/RESET`) {
      // 重置redux
      return finallyState
    }
    const reduceFn = actionHandlers[action.type]
    if (!reduceFn) {
      return state
    }
    return reduceFn(state, action).set('isLoaded', true)
  }
  injectAsyncReducer(namespace, finallyReducer)
}

/**
 * 动态添加saga
 */
export function injectSaga({ namespace, sagas }) {
  if (asyncSagas[namespace]) {
    return
  }
  asyncSagas[namespace] = sagas
  if (store) {
    sagaMiddleware.run(sagas)
  }
}

// 快捷创建actions，与此方法关联的还有injectReducer
/**
 * createActions({
 *   namespace: 'myAction',
 *   actions: {
 *     test: 'TEST'
 *   }
 * }) =>
 * const TEST = 'myAction/TEST'
 * const test = (...rest) => ({ type: TEST, payload: [...rest] })
 */
export function createActions({ namespace, actions, mergeMethods = {} }) {
  const actionConstant = {}
  const actionFunction = {}
  actions.setStore = 'SET_STORE'

  Object.keys(actions).forEach(item => {
    actionConstant[actions[item]] = `${namespace}/${actions[item]}`
    actionFunction[item] = (...rest) => ({
      type: actionConstant[actions[item]],
      payload: [...rest]
    })
  })

  Object.keys(mergeMethods).forEach(item => {
    actionFunction[item] = mergeMethods[item]
  })

  const containerActions = dispatch =>
    bindActionCreators(actionFunction, dispatch)
  return {
    actions: {
      ...actionConstant,
      ...actionFunction
    },
    containerActions
  }
}

/* eslint import/no-mutable-exports: 0 */
export default function getStore() {
  return store
}
