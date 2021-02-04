// const fs = require('fs')
const paths = require('./paths')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')
const eslintFormatter = require('react-dev-utils/eslintFormatter')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { PORT } = require('../src/client/config')

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: {
    index: [
      require.resolve('./modifyHost'),
      require.resolve('react-dev-utils/webpackHotDevClient'),
      paths.appClientIndexJs,
    ],
  },
  output: {
    path: paths.appBuild,
    pathinfo: true,
    filename: 'static/js/bundle.js',
    chunkFilename: 'static/js/[name].chunk.js',
    publicPath: `http://localhost:${PORT.webpackServer}/`,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      assets: `${paths.appSrc}/assets`,
      client: `${paths.appSrc}/client`,
      'redux-saga-call': `${paths.appSrc}/client/utils/call.js`,
    },
    plugins: [new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson])],
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: [/\.js$/, /\.jsx$/],
        enforce: 'pre',
        use: [
          {
            options: {
              formatter: eslintFormatter,
              eslintPath: require.resolve('eslint'),
            },
            loader: require.resolve('eslint-loader'),
          },
        ],
        include: paths.appSrc,
      },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          {
            test: [/\.js$/, /\.jsx$/],
            include: paths.appSrc,
            loader: require.resolve('babel-loader'),
            options: {
              plugins: [
                ['import', { libraryName: 'antd', style: true }],
                ['extensible-destructuring', { mode: 'optout', impl: 'immutable' }],
              ],
              cacheDirectory: true,
            },
          },
          {
            test: /\.less$/,
            include: paths.appSrc,
            use: [
              require.resolve('style-loader'),
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 1,
                  sourceMap: true,
                  modules: true,
                  localIdentName: '[name]__[local]___[hash:base64:5]',
                },
              },
              {
                loader: require.resolve('postcss-loader'),
                options: {
                  ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
                  plugins: () => [
                    require('postcss-flexbugs-fixes'),
                    autoprefixer({
                      browsers: [
                        '>1%',
                        'last 4 versions',
                        'Firefox ESR',
                        'not ie < 9', // React doesn't support IE8 anyway
                      ],
                      flexbox: 'no-2009',
                    }),
                  ],
                },
              },
              require.resolve('less-loader'),
            ],
          },
          {
            test: /\.less$/,
            include: paths.appNodeModules,
            use: [
              require.resolve('style-loader'),
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 1,
                  sourceMap: true,
                },
              },
              {
                loader: require.resolve('postcss-loader'),
                options: {
                  ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
                  plugins: () => [
                    require('postcss-flexbugs-fixes'),
                    autoprefixer({
                      browsers: [
                        '>1%',
                        'last 4 versions',
                        'Firefox ESR',
                        'not ie < 9', // React doesn't support IE8 anyway
                      ],
                      flexbox: 'no-2009',
                    }),
                  ],
                },
              },
              {
                loader: require.resolve('less-loader'),
                options: {
                  modifyVars: require('./theme'),
                },
              },
            ],
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
}
