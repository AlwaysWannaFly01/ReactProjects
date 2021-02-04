import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, Switch } from 'react-router-dom'
import { fromJS } from 'immutable'
import { initStore } from 'client/utils/store'
import history from 'client/utils/history'
import 'client/components/iconfont/font'
import Engine from './engine'
import router from './router'
import './index.less'

const initialState = window.INITIAL_STATE
Object.keys(initialState).forEach(item => {
  initialState[item] = fromJS(initialState[item])
})
const store = initStore(initialState)
store.runSaga()

if (navigator.platform.indexOf('Win') > -1) {
  document.querySelector('html').classList.add('Windows')
}

function hydrate() {
  ReactDOM.hydrate(
    <Provider store={store}>
      <Router history={history}>
        <Switch>
          <Route path={router.INDEX} component={Engine} />
        </Switch>
      </Router>
    </Provider>,
    document.getElementById('root')
  )
}

if (process.env.NODE_ENV === 'development') {
  setTimeout(hydrate, 10)
} else {
  const ds = Date.now() - window.TIME_START
  let time = 0
  if (ds < 1500) {
    time = 1500 - ds
  }
  setTimeout(() => {
    hydrate()
    const loadingEl = document.querySelector('.initial-loading')
    loadingEl.classList.add('initial-loading-hide')
    loadingEl.addEventListener('transitionend', () => {
      loadingEl.remove()
    })
  }, time)
}
