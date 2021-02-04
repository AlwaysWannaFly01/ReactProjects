import Router from 'koa-router'
import middleware from './middleware'
import { PORT } from 'client/config'
import printError from './template/printError'

module.exports = app => {
  app.use(async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      console.log('server.dev: ', err, ctx.status, 111)
      ctx.status = err.status || 500
      if (ctx.status === 404) {
        ctx.body = 404
      } else if (ctx.status === 500) {
        ctx.body = printError(err, ctx)
      }
      ctx.app.emit('error', err, ctx)
      //throw错误能被error事件捕获，但是try…catch中的错会在catch中处理，必须调用
      //ctx.app.emit(‘error’, err, ctx);才能触发error事件。
    }
  })

  middleware(app)
  // app.use(middleware)
  app.listen(PORT.server)
}
