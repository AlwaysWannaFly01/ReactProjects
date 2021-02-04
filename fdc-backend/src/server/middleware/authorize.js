import * as api from 'client/api/common.api'
// import axios from 'axios'
import cookie from 'cookie'

/* eslint-disable */
export default async function authorize(ctx, next) {
  try {
    const sid = ctx.cookies.get('sid')
    // console.log('sid: ', sid)
    const { data } = await api.getUserInfo(sid)
    console.log('获取当前用户信息ctx: ', ctx, '当前用户信息data:', data)
    ctx.state.userinfo = data
  } catch (err) {
    // console.log('authorize:catch ', err)
    if (err.code === 401) {
      const responseCookie = err.origin.response.headers['set-cookie']
      if (responseCookie) {
        // 为什么获取最后一个Cookie？ 原因未知，有时候会返回2个Cookie
        const cookieInfo = cookie.parse(
          responseCookie[responseCookie.length - 1]
        )
        const setSid = cookieInfo.sid
        delete cookieInfo.sid
        ctx.cookies.set('sid', setSid, {
          ...cookieInfo,
          httpOnly: true // 是否只用于http请求中获取
        })
      }
      ctx.status = 302
      return ctx.redirect(err.origin.response.headers.location)
    }
    return ctx.throw(err.code, err.message)
  }
  await next()
}
