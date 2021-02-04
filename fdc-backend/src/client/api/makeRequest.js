import axios from 'axios'
import download from 'downloadjs'
import { parse } from 'qs'

/* eslint-disable prefer-promise-reject-errors */
export default function makeRequest({
  url,
  method = 'get',
  data = {},
  headers = {},
  ...rest
}) {
  const options = {
    method,
    data,
    url,
    headers: {
      is_ajax_request: true,
      ...headers
    },
    timeout: 1000 * 60 * 10
  }
  if (method === 'POST' || method === 'PUT') {
    options.data = data
  } else {
    options.params = data
    delete options.data
    // 格式化参数值为空 delete
    if (options.url.includes('?')) {
      const [url, params] = options.url.split('?')
      const parmArr = params.split('&').filter(i => !!i.split('=')[1])
      options.url = `${url}?${parmArr.join('&')}`
    } else if (`${options.params}`) {
      Object.keys(options.params).forEach(i => {
        if (!options.params[i]) {
          delete options.params[i]
        }
      })
    }
  }
  return new Promise((resolve, reject) => {
    axios({ ...options, ...rest })
      .then(response => {
        if (rest.responseType === 'arraybuffer') {
          let fileName = response.headers['content-disposition']
          fileName = parse(fileName)['attachment;filename']
          download(response.data, fileName)
          resolve()
        } else {
          const { code, message, data } = response.data
          // code 400为后端校验错误码
          if (+code === 200 || +code === 400) {
            resolve({
              data,
              code,
              message,
              origin: response
            })
          } else {
            reject({
              message,
              code: 500,
              briefErr: {
                url
              }
            })
          }
        }
      })
      .catch(e => {
        // console.log('e: ',e)
        if (e.response) {
          if (e.response.status === 401) {
            reject({
              message: '请登录',
              code: 401,
              briefErr: {
                url
              },
              origin: e
            })
          } else if (
            e.response.status === 400 &&
            rest.responseType === 'arraybuffer'
          ) {
            // 下载失败
            resolve({
              message: '文件不存在',
              code: 400
            })
          } else {
            reject({
              message: e.response.data.message || '⊙﹏⊙‖∣°服务器开小差',
              code: e.response.status,
              briefErr: {
                url
              },
              origin: e
            })
          }
        } else {
          reject({
            message: '网络异常，请稍后再试！',
            code: 500,
            briefErr: {
              url
            },
            origin: e
          })
          // 跳到统一登录页面
          // window.location.href = e.response.origin.response.headers.location
        }
        console.log(
          '\x1b[91m====================DEBUG/s======================\x1b[91m'
        )
        console.log(`request url: ${url}`)
        console.log(`request body: ${JSON.stringify(data)}`)
        console.log(`response status: ${e.response ? e.response.status : null}`)
        console.log(
          '\x1b[97m====================DEBUG/e======================\x1b[97m'
        )
        console.log('\x1b[37m\r')
      })
  })
}
