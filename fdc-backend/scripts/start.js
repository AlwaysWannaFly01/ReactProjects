process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'
import rimraf from 'rimraf'
import mkdirp from 'mkdirp'
import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import chokidar from 'chokidar'
import webpack from 'webpack'
import sockjs from 'sockjs'
import Koa from 'koa'
import convert from 'koa-convert'
import { createCompiler, prepareUrls } from 'react-dev-utils/WebpackDevServerUtils'
import WebpackDevServer from 'webpack-dev-server'
import createDevServerConfig from '../config/webpackDevServer.config'
import devConfig from '../config/webpack.config.dev'
import paths from '../config/paths'
import { PORT } from '../src/client/config'

const app = new Koa()
const HOST = '0.0.0.0'
const urls = prepareUrls('http', HOST, PORT.server)
const compiler = createCompiler(webpack, devConfig, 'ssr', urls, false)
const serverConfig = createDevServerConfig()

compiler.plugin('emit', (compilation, callback) => {
  const assets = compilation.assets
  let file,
    data
  Object.keys(assets).forEach(key => {
    if (key.match(/.html$/)) {
      file = path.resolve(paths.appDevBuild, key)
      data = assets[key].source()
      fs.writeFileSync(file, data)
    }
  })
  callback()
})

const watcher = chokidar.watch([path.join(__dirname, '../src')], {
  usePolling: false,
})
watcher.on('ready', () => {
  watcher.on('all', (e, p) => {
    console.log('Clearing module cache')
    Object.keys(require.cache).forEach(id => {
      if (/[\/\\](server|client)[\/\\]/.test(id)) {
        delete require.cache[id]
      }
    })
  })
})

const devServer = new WebpackDevServer(compiler, serverConfig)
devServer.listen(PORT.webpackServer, HOST, err => {
  if (err) {
    return console.log(err)
  }
})

require('../src/server/server.dev')(app)
