const autoprefixer = require('autoprefixer')
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const eslintFormatter = require('react-dev-utils/eslintFormatter')
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')
const paths = require('./paths')
const AssetsPlugin = require('./AssetsPlugin')
require('./env')

const client = {
  bail: true,
  devtool: false,
  // In production, we only want to load the polyfills and the app code.
  entry: {
    vendor: [
      'react',
      'react-dom',
      'react-router-dom',
      'classnames',
      'react-redux',
      'reselect',
      'redux',
      'redux-saga',
      'axios',
      'immutable',
      require.resolve('./polyfills')
    ],
    bundle: [paths.appClientIndexJs],
    antd: [
      // 'antd/lib/affix',
      // 'antd/lib/alert',
      // 'antd/lib/anchor',
      // 'antd/lib/auto-complete',
      'antd/lib/avatar',
      // 'antd/lib/back-top',
      // 'antd/lib/badge',
      'antd/lib/breadcrumb',
      'antd/lib/button',
      // 'antd/lib/calendar',
      // 'antd/lib/card',
      // 'antd/lib/carousel',
      'antd/lib/cascader',
      'antd/lib/checkbox',
      'antd/lib/col',
      // 'antd/lib/collapse',
      'antd/lib/date-picker',
      'antd/lib/dropdown',
      'antd/lib/form',
      // 'antd/lib/grid',
      'antd/lib/icon',
      'antd/lib/input',
      // 'antd/lib/input-number',
      // 'antd/lib/layout',
      // 'antd/lib/locale-provider',
      // 'antd/lib/mention',
      'antd/lib/menu',
      'antd/lib/message',
      'antd/lib/modal',
      'antd/lib/notification',
      'antd/lib/pagination',
      // 'antd/lib/popconfirm',
      // 'antd/lib/popover',
      // 'antd/lib/progress',
      'antd/lib/radio',
      // 'antd/lib/rate',
      'antd/lib/row',
      'antd/lib/select',
      // 'antd/lib/slider',
      'antd/lib/spin',
      // 'antd/lib/steps',
      // 'antd/lib/switch',
      'antd/lib/table',
      'antd/lib/tabs',
      'antd/lib/tag'
      // 'antd/lib/time-picker',
      // 'antd/lib/timeline',
      // 'antd/lib/tooltip',
      // 'antd/lib/transfer',
      // 'antd/lib/tree',
      // 'antd/lib/tree-select',
      // 'antd/lib/upload'
    ]
  },
  output: {
    // The build folder.
    path: paths.appBuild,
    // Generated JS file names (with nested folders).
    // There will be one main bundle, and one file per asynchronous chunk.
    // We don't currently advertise code splitting but Webpack supports it.
    filename: 'static/js/[name].[chunkhash:8].js',
    chunkFilename: 'static/js/bundle.[chunkhash:8].chunk.js',
    // We inferred the "public path" (such as / or /my-project) from homepage.
    publicPath: '/',
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path.relative(paths.appSrc, info.absoluteResourcePath).replace(/\\/g, '/')
  },
  resolve: {
    modules: ['node_modules', paths.appNodeModules].concat(
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    extensions: ['.js', '.json'],
    alias: {
      assets: `${paths.appSrc}/assets`,
      client: `${paths.appSrc}/client`,
      'redux-saga-call': `${paths.appSrc}/client/utils/call.js`
    },
    plugins: [
      // Prevents users from importing files from outside of src/ (or node_modules/).
      // This often causes confusion because we only process files within src/ with babel.
      // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
      // please link the files into your node_modules/ and let module-resolution kick in.
      // Make sure your source files are compiled, as they will not be processed in any way.
      new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson])
    ]
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
              eslintPath: require.resolve('eslint')
            },
            loader: require.resolve('eslint-loader')
          }
        ],
        include: paths.appSrc
      },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]'
            }
          },
          {
            test: [/\.js$/, /\.jsx$/],
            include: paths.appSrc,
            loader: require.resolve('babel-loader'),
            options: {
              plugins: [
                ['import', { libraryName: 'antd', style: true }],
                [
                  'extensible-destructuring',
                  { mode: 'optout', impl: 'immutable' }
                ]
              ],
              compact: true
            }
          },
          {
            test: /\.less$/,
            include: paths.appSrc,
            loader: ExtractTextPlugin.extract(
              Object.assign({
                fallback: require.resolve('style-loader'),
                use: [
                  {
                    loader: require.resolve('css-loader'),
                    options: {
                      importLoaders: 1,
                      minimize: true,
                      sourceMap: true,
                      modules: true,
                      localIdentName: '[hash:base64:8]'
                    }
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
                            'not ie < 9' // React doesn't support IE8 anyway
                          ],
                          flexbox: 'no-2009'
                        })
                      ]
                    }
                  },
                  {
                    loader: require.resolve('less-loader'),
                    options: {
                      modifyVars: require('./theme')
                    }
                  }
                ]
              })
            )
            // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
          },
          {
            test: /\.less$/,
            include: paths.appNodeModules,
            loader: ExtractTextPlugin.extract(
              Object.assign({
                fallback: require.resolve('style-loader'),
                use: [
                  {
                    loader: require.resolve('css-loader'),
                    options: {
                      importLoaders: 1,
                      minimize: true,
                      sourceMap: true
                    }
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
                            'not ie < 9' // React doesn't support IE8 anyway
                          ],
                          flexbox: 'no-2009'
                        })
                      ]
                    }
                  },
                  {
                    loader: require.resolve('less-loader'),
                    options: {
                      modifyVars: require('./theme')
                    }
                  }
                ]
              })
            )
            // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: 'head',
      template: paths.appHtml,
      filename: `${paths.appBuild}/views/index.html`,
      chunks: ['vendor', 'antd', 'bundle']
    }),
    new ExtractTextPlugin({
      filename: 'static/css/[name].[contenthash:8].css'
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new AssetsPlugin(paths.appBuild),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['antd', 'vendor'],
      // filename: '[name].js',
      minChunks: Infinity
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        comparisons: false
      },
      output: {
        comments: false,
        ascii_only: true
      },
      sourceMap: false
    })
  ],
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}

const server = {
  context: path.resolve(__dirname, '..'),
  entry: {
    server: paths.appServerIndexJs
  },
  output: {
    path: paths.appBuild,
    filename: '[name].js',
    publicPath: '/'
  },
  resolve: {
    alias: {
      assets: `${paths.appSrc}/assets`,
      client: `${paths.appSrc}/client`,
      'redux-saga-call': `${paths.appSrc}/client/utils/call.js`
    }
  },
  module: {
    rules: [
      {
        test: [/\.js$/, /\.jsx$/],
        exclude: /node_modules/,
        loader: require.resolve('babel-loader'),
        options: {
          plugins: [
            ['import', { libraryName: 'antd', style: true }],
            ['extensible-destructuring', { mode: 'optout', impl: 'immutable' }]
          ]
        }
      },
      {
        oneOf: [
          {
            test: /.less$/,
            use: [
              {
                loader: require.resolve('css-loader/locals'),
                options: {
                  importLoaders: 1,
                  sourceMap: true,
                  modules: true,
                  localIdentName: '[hash:base64:8]'
                }
              },
              require.resolve('less-loader')
            ]
          }
        ]
      }
    ]
  },
  target: 'node',
  node: {
    __filename: true,
    __dirname: true
  },
  externals: fs
    .readdirSync(path.resolve(__dirname, '../node_modules'))
    .filter(filename => !filename.includes('.bin'))
    .reduce((externals, filename) => {
      externals[filename] = `commonjs ${filename}`
      return externals
    }, {}),
  plugins: [
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false,
    //     comparisons: false,
    //   },
    //   output: {
    //     comments: false,
    //     ascii_only: true,
    //   },
    //   sourceMap: false,
    // }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ]
}

// module.exports = client
// module.exports = [server]
module.exports = [client, server]
