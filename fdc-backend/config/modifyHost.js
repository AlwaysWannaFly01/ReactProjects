import sockjs from 'sockjs-client'
import { PORT } from '../src/client/config'
// 修改sockjs端口
const origReceiveInfo = sockjs.prototype._receiveInfo
sockjs.prototype._receiveInfo = function _receiveInfo() {
  this.url = this.url.replace(PORT.server, PORT.webpackServer)
  origReceiveInfo.apply(this, arguments)
}

const origOpen = XMLHttpRequest.prototype.open
XMLHttpRequest.prototype.open = function (method, url, async) {
  // console.log('request started!')
  url = url.replace(PORT.server, PORT.webpackServer)
  // console.log(url)
  // this.addEventListener('load', () => {
  //   // console.log('request completed!')
  // })
  origOpen.apply(this, [method, url, async])
}
