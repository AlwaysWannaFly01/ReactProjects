const template = {}
template.header = `
  <!DOCTYPE html>
  <html lang="zh">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="theme-color" content="#000000">
    <link rel="stylesheet" href="http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css" />
    <link rel="stylesheet" href="http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.css" />
    <title>房讯通FDC</title>
  </head>
  <body>
`

template.footer = `
  </body>
  </html>
`

template.scripts = `
<script type="text/javascript" src="https://api.map.baidu.com/api?v=3.0&ak=kIKT1Bzuolww95EhZ8IbY2f6lFMTUqvu"></script>
<script type="text/javascript" src="https://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js"></script>
<script type="text/javascript" src="https://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.js"></script>
<script type="text/javascript" src="https://mapv.baidu.com/build/mapv.min.js"></script>
<script type="text/javascript" src="https://api.map.baidu.com/library/TextIconOverlay/1.2/src/TextIconOverlay_min.js"></script>
<script type="text/javascript" src="https://api.map.baidu.com/library/MarkerClusterer/1.2/src/MarkerClusterer_min.js"></script>
<script type="text/javascript" src="https://api.map.baidu.com/library/RichMarker/1.2/src/RichMarker_min.js"></script>
<script>var BMap = window.BMap; var BMapLib = window.BMapLib; var mapv = window.mapv; var BMapGL = window.BMapGL</script>
<script>var sessionStorage = window.sessionStorage</script>
<script src="http://127.0.0.1:8001/static/js/bundle.js"></script>
`

module.exports = template
