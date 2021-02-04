process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'
require('babel-register')({
  presets: ['env', 'stage-2'],
  plugins: [
    ['babel-plugin-webpack-alias', { config: './config/webpack.config.dev.js' }],
    ["extensible-destructuring", {"mode": "optout", "impl": "immutable"}]
  ]
})

require('css-modules-require-hook')({
  extensions: ['.less'],
  processorOpts: { parser: require('postcss-less').parse },
  camelCase: true,
  generateScopedName: '[name]__[local]___[hash:base64:5]'
})

require('./start')
