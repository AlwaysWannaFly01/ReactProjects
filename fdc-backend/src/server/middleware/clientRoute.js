import React from 'react'
import { Provider } from 'react-redux'
import { END } from 'redux-saga'
import Immutable from 'immutable'
import { renderToStaticMarkup, renderToNodeStream } from 'react-dom/server'
import { StaticRouter, Route, Switch, matchPath } from 'react-router'
import Engine from 'client/engine'
import router from 'client/router'
import getEngineState from 'client/engine/reducer'
import { initStore } from 'client/utils/store'
// import dataShare from 'client/utils/dataShare'
import template from '../template/index'
import printError from '../template/printError'

export default async function clientRoute(ctx, next) {
  console.log('ctx.path', ctx.path)
  console.log('ctx.url', ctx.url)
  let match
  const pathname = ctx.path
  const context = {}
  // 与客户端路由匹配，判断当前是否合法请求
  // @TODO 最好把router变成Map，这样可以避免循环遍历
  Object.keys(router).some(route => {
    match = matchPath(pathname, {
      path: router[route],
      exact: true
    })
    if (match) {
      return true
    }
    return false
  })
  if (!match) {
    console.log('notmatch', pathname)
    ctx.throw(404)
    await next()
    return
  }

  // const sid = ctx.cookies.get('sid')
  // dataShare.initial({ sid })
  console.log('ctx.state.userinfo: ',ctx.state.userinfo)
  console.log('context: ',context)
  //getEngineState 即reducer中的getState方法
  const engineInitialState = Immutable.fromJS(
    getEngineState({
      userinfo: ctx.state.userinfo
    })
  )
  const store = initStore({ engine: engineInitialState })
  // const store = initStore({})
  const allPromise = store.runSaga()
  const rootComponent = (
    <Provider store={store}>
      <StaticRouter context={context} location={ctx.url}>
        <Switch>
          <Route path={router.INDEX} component={Engine} />
        </Switch>
      </StaticRouter>
    </Provider>
  )
  // 预渲染，执行相关组件的api请求
  renderToStaticMarkup(rootComponent)
  // 预渲染后可能会有重定向，可以通过context判断
  if (context.url) {
    ctx.status = 302
    ctx.redirect(context.url)
    console.log('clientRoute1: ', context.url)
    await next()
    return
  }
  store.dispatch(END)
  await new Promise(resolve => {
    ctx.status = 200
    ctx.response.type = 'text/html'
    // 预先输出header页面
    ctx.res.write(template.header)
    ctx.res.write('<div id="root">')
    const stream = renderToNodeStream(rootComponent)
    // 等待所有ajax请求完成
    Promise.all(allPromise)
      .then(() => {
        stream.pipe(ctx.res, { end: false })
      })
      .catch(err => {
        console.log('clientRoute2: ', err.origin)
        ctx.res.write(printError(err, ctx))
        ctx.res.end()
      })
    stream.on('end', () => {
      const state = store.getState()
      Object.keys(state).forEach(item => {
        state[item] = state[item].toJS()
      })
      ctx.res.write('</div>')
      ctx.res.write(`
        <script type="text/javascript">
          window.INITIAL_STATE = ${JSON.stringify(state)}
        </script>
      `)
      ctx.res.write(template.scripts)
      resolve()
    })
  })
  ctx.res.write(template.footer)
  ctx.res.end()
  await next()
}
