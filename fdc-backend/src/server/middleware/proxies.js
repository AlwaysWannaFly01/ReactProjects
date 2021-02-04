import proxy from 'koa-proxies'
import cookie from 'cookie'
import axios from 'axios'
import dataShared from 'client/utils/dataShare'
import * as config from 'client/config'

// 拦截Node产生的所有ajax请求，删除/fdc前缀，并添加主机HOST
axios.interceptors.request.use(postData => {
    console.log(postData)
  if (/^\/fdc/.test(postData.url)) {
    postData.url = config.FDC_API + postData.url.replace(/^\/fdc/, '')
    postData.headers.Cookie = cookie.serialize(
      'sid',
      dataShared.getContext().sid
    )
    // console.log(dataShared.__context, 1111)
    // console.log('request cookie: ', postData.headers.Cookie)
  }
  return postData
})

export default async function proxies(app) {
  app.use(async (ctx, next) => {
      // console.log('ctx: ',ctx)
      // console.log('ctx.cookies :', ctx.cookies)
    const sid = ctx.cookies.get('sid')
      // console.log('sid: ',sid)
    dataShared.initial({
      sid
    })
    await next()
  })

  app.use(
    proxy([/^\/fdc/, '/callback'], {
      target: config.FDC_API,
      changeOrigin: true,
      rewrite: path => path.replace(/^\/fdc/, '')
      // logs: true
    })
  )

  // 图片地址
  app.use(
    proxy(['/image'], {
      target: config.IMAGE_URL,
      changeOrigin: true,
      rewrite: path => path.replace(/^\/image/, '')
    })
  )

  app.use(
    proxy([/swagger/, /^\/webjars/, /^\/v2\/api-docs/], {
      target: config.FDC_API,
      changeOrigin: true,
      // rewrite: path => `/${path}`,
      logs: true
    })
  )
}
