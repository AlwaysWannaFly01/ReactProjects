require('babel-register')({
  presets: ['env', 'stage-2'],
  plugins: [
    ['babel-plugin-webpack-alias', { config: './config/webpack.config.dev.js' }]
  ]
})

const fs = require('fs')
const paths = require('../config/paths')
const config = require('../config/webpack.config.prod')

async function build() {
  await require('./build')(true, config[0])
  await require('./build')(false, config[1])
  fs.createReadStream(paths.appSrc + '/assets/favicon.ico')
    .pipe(fs.createWriteStream(paths.appBuild + '/favicon.ico'))
}

build()

// require('./build')(true, config[1])
