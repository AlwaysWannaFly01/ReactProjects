// const assets = require(process.cwd() + '/build/assets.json')
const assets = require('../../../build/assets.json')
const loadingMask = require('./loadingMask')

const template = {}
const css = assets.css
  .map(item => `<link rel="stylesheet" type="text/css" href="${item}">`)
  .join('')
const js = assets.js.map(item => `<script src="${item}"></script>`).join('')

template.header = `
  <!DOCTYPE html>
  <html lang="zh">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="theme-color" content="#000000">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="renderer" content="webkit">
    <meta name="force-rendering" content="webkit">
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css" />
    <link rel="stylesheet" href="http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.css" />
    <title>房讯通FDC</title>
    ${css}
  </head>
  <body>
    <script>var TIME_START = Date.now()</script>
    ${loadingMask}
`
// kIKT1Bzuolww95EhZ8IbY2f6lFMTUqvu
// QXm0KSwel9TKIsnn3DTUeMi4
template.footer = `
  </body>
  <script type="text/javascript" src="https://api.map.baidu.com/api?v=3.0&ak=kIKT1Bzuolww95EhZ8IbY2f6lFMTUqvu"></script>
  <script type="text/javascript" src="https://mapv.baidu.com/build/mapv.min.js"></script>
  <script type="text/javascript" src="https://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js"></script>
  <script type="text/javascript" src="https://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.js"></script>
  <script type="text/javascript" src="https://api.map.baidu.com/library/TextIconOverlay/1.2/src/TextIconOverlay_min.js"></script>
  <script type="text/javascript" src="https://api.map.baidu.com/library/MarkerClusterer/1.2/src/MarkerClusterer_min.js"></script>
  <script type="text/javascript" src="https://api.map.baidu.com/library/RichMarker/1.2/src/RichMarker_min.js"></script>
  <script>var BMap = window.BMap; var BMapLib = window.BMapLib; var sessionStorage = window.sessionStorage; var mapv = window.mapv</script>
  </html>
`

template.scripts = js

module.exports = template
