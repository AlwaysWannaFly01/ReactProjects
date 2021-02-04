/* eslint-disable */
let FDC_API = ''
let SERVER_URL = ''
let IMAGE_URL = ''
const SESSION_TIMEOUT = 30 * 1000 * 60
const PORT = {
  server: '',
  webpackServer: 8001
}

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

if (isDev) {
  // 本地监听端口
  PORT.server = 8021
  // 测试接口api地址 192.168.0.67
  FDC_API = 'http://192.168.2.108:8060/'
  // FDC_API = 'http://192.168.2.108:8077/'
  // FDC_API = 'http://192.168.2.108:8070/' // 1.9楼盘租金
  // FDC_API = 'http://192.168.2.108:8070/' // 1.9楼盘租金
  // FDC_API = 'http://192.168.1.49:8060/'
  // FDC_API = 'http://192.168.0.90:8060/'
  // FDC_API = 'http://192.168.0.67:8060/' // cxq
  // FDC_API = 'http://192.168.0.90:8060' // fcy
  IMAGE_URL = 'http://imgtest.yungujia.com/'
  // 开发本地api地址
  // FDC_API = 'http://192.168.0.96:8060/'
  // 开发者IP
  // FDC_API = 'http://192.168.0.78:8060/'
}
if (isProd) {
  PORT.server = 8021
  FDC_API = 'http://192.168.2.96:8080'
  IMAGE_URL = 'http://img.yungujia.com/'
}

export { FDC_API, SERVER_URL, PORT, SESSION_TIMEOUT, IMAGE_URL }
