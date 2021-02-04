// import cluster from 'cluster'
import Koa from 'koa'
import Router from 'koa-router'
import serve from 'koa-static'
import compress from 'koa-compress'
import middleware from './middleware'
import { PORT } from 'client/config'

const app = new Koa()
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = err.message
    ctx.app.emit('error', err, ctx)
  }
})
app.use(compress())
app.use(serve('.'))
middleware(app)

// if (cluster.isMaster) {
//   const cpuCount = require('os').cpus().length
//   for (let i = 0; i < cpuCount; i += 1) {
//     cluster.fork()
//   }
//
//   cluster.on('exit', worker => {
//     console.log(`worker ${worker.process.pid} died`)
//     cluster.fork()
//   })
// } else {
app.listen(PORT.server)
// }
