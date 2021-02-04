if (process.env.NODE_ENV === 'development') {
  module.exports = require('./template.dev.js')
} else {
  module.exports = require('./template.prod.js')
}
