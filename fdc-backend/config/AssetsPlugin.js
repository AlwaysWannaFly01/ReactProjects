const fs = require('fs')
const { dependency } = require('html-webpack-plugin/lib/chunksorter')

function AssetsPlugin(pathname) {
  this.pathname = pathname
}

AssetsPlugin.prototype.apply = function(compiler) {
  const pathname = this.pathname
  compiler.plugin('emit', function (compilation, callback) {
    var allChunks = compilation.getStats().toJson().chunks
    var ret = {
      js: [],
      css: []
    }
    allChunks = dependency(allChunks)
    allChunks.forEach(chunk => {
      chunk.files.forEach(filepath => {
        if (/\.js$/.test(filepath)) {
          ret.js.push(`/${filepath}`)
        } else if (/\.css$/.test(filepath)) {
          ret.css.push(`/${filepath}`)
        }
      })
    })
    fs.writeFile(`${pathname}/assets.json`, JSON.stringify(ret, null, 4), err => {
      if (err) {
        console.log(err)
        process.exit()
      }
      callback()
    })
  })
}

module.exports = AssetsPlugin
