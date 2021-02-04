/* eslint-disable */
import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import {
  Table,
  Form,
  Icon,
  Breadcrumb,
  Drawer,
  Button,
  Modal,
  Select,
  Popover
} from 'antd'

import router from 'client/router'
import { parse } from 'qs'
import actions, { containerActions } from './actions'

import { modelSelector } from './selector'
import './sagas'
import './reducer'
import styles from './BaseInfo.less'
const confirm = Modal.confirm
const Option = Select.Option
/**
 * 住宅 片区绘制
 * author: wy
 */
class AreaDraw extends Component {
  static propTypes = {
    // form: PropTypes.object.isRequired,
    // history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    getAreaDraw: PropTypes.func.isRequired,
    officialEstate: PropTypes.func.isRequired,
    getAloneArea: PropTypes.func.isRequired,
    newChangeDraw: PropTypes.func.isRequired,
    deleteAreaDraw: PropTypes.func.isRequired,
    getProjectDetail: PropTypes.func.isRequired,
    projectDetail: PropTypes.object.isRequired,
    relationSubArea: PropTypes.object.isRequired,
    updateVisitCities: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    const { cityId = '', cityName = '' } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      cityId,
      cityName,
      visible: true,
      displayOpen: 'none',
      displayClose: 'block',
      // filteredInfo: {},
      lngLat: [], // 绘制多边形，经纬度数组
      newDrawSubAreaId: null, //新增要素的id
      editSubArea: null, //正在编辑的片区
      aloneArea: [],
      areaDrawList: [],
      visiblePop: false, // 显示楼盘的弹窗
      relateSubArea: {
        areaId: -1,
        oldSubAreaId: -1,
        subAreaId: -1,
        subAreaName: '请选择',
        areaName: '',
        projectName: '',
        projectId: -1,
        selectOptions: null
      },
      subAreaObjKeyValue: [],
      projectBuildingObjKeyValue: [],
      labelTips: null,
      mapvLayerSolid: null,
      mapvLayerHollow: null,
      overSolidPoint: null,
      overHollowPoint: null,
      SolidPoint: null,
      HollowPoint: null,
      testDefault: '请选择'
    }
  }

  componentDidMount() {
    const { cityId, cityName } = this.state

    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }

    this.props.getAloneArea(cityId, aloneArea => {
      this.setState(
        {
          aloneArea
        },
        () => {
          this.drawMap()

          this.handleSearchPolygon()
          this.projectEstate()
          // this.authority()
        }
      )
    })
  }

  projectEstate = () => {
    const { cityId, aloneArea } = this.state
    // 1. 获取当前城市或片区下所有有经纬度的正式楼盘
    const projectParams = {
      cityId
      // subAreaIds: aloneArea.map(i => i.key).join(',')
    }
    // console.log(projectParams)
    this.props.officialEstate(projectParams, res => {
      if (res.data) {
        if (document.createElement('canvas').getContext) {
          // const self = this
          // const BMap = window.BMap
          // // 实心marker
          // const solidMarkerIcon = new BMap.Symbol(BMap_Symbol_SHAPE_CIRCLE, {
          //   strokeColor: '#FF4F4F',//填充颜色
          //   strokeWeight: 2,
          //   fillColor: '#FF4F4F',
          //   fillOpacity: 1,//填充透明度
          //   scale: 6
          // })
          // // 空心marker
          // const hollowMarkerIcon = new BMap.Symbol(BMap_Symbol_SHAPE_CIRCLE, {
          //   strokeColor: '#FF4F4F',//填充颜色
          //   strokeWeight: 2,
          //   fillColor: '#FF4F4F',
          //   fillOpacity: 0,//填充透明度
          //   scale: 6
          // })
          // for (var i = 0; i < res.data.length; i++) {
          //   const item = res.data[i]
          //   const point = new BMap.Point(item.longitude, item.latitude)
          //   let marker = new BMap.Marker(point, {
          //     icon: item.subAreaId ? solidMarkerIcon : hollowMarkerIcon
          //   })
          //   marker.attribute = item
          //   this.map.addOverlay(marker)
          //   this.markerMouseover(marker)
          //   this.markerMouseout(marker)
          //   this.markerClick(marker)
          //   this.state.projectBuildingObjKeyValue[item.projectId] = marker
          // }
          this.mapvMarker(res.data)
        } else {
          alert('请在chrome、safari、IE8+以上浏览器查看本示例')
        }
      }
    })
  }
  mapvMarker = datas => {
    let that = this
    let solid = [] //实心
    let hollow = [] //空心
    for (var i = 0; i < datas.length; i++) {
      const item = datas[i]
      let point = {
        geometry: {
          type: 'Point',
          coordinates: [Number(item.longitude), Number(item.latitude)]
        },
        size: 5,
        attribute: item
      }
      if (item.subAreaId) {
        solid.push(point)
      } else {
        hollow.push(point)
      }
    }
    const mapv = window.mapv
    var dataSetSolid = new mapv.DataSet(solid)
    var dataSetHollow = new mapv.DataSet(hollow)
    var optionsSolid = {
      mixBlendMode: 'normal',
      zIndex: 1000,
      fillStyle: 'rgba(255, 0, 0, 1)',
      strokeStyle: 'rgba(255, 0, 0, 1)',
      lineWidth: 2,
      methods: {
        // 一些事件回调函数
        click: function(item, event) {
          // 点击事件，返回对应点击元素的对象值
          that.state.SolidPoint = item
          if (!item) {
            return
          }
          that.mapvPointClick(item, event.point)
        },
        mousemove: function(item, event) {
          that.state.SolidPoint = item
          if (!item) {
            if (that.state.overSolidPoint) {
              that.state.overSolidPoint.size = 5
              that.state.mapvLayerSolid.dataSet.update()
              that.state.overSolidPoint = null
            }
            return
          } else {
            if (that.state.overSolidPoint) {
              that.state.overSolidPoint.size = 5
            }
            item.size = 7
            that.state.mapvLayerSolid.dataSet.update()
            that.state.overSolidPoint = item
          }
        }
        // mouseover: function (item) { // 鼠标移动事件，对应鼠标经过的元素对象值
        //   console.log('哈哈');
        // }
      }
    }
    var optionsHollow = {
      fillStyle: 'rgba(255, 0, 0, 0)',
      strokeStyle: 'rgba(255, 0, 0, 1)',
      lineWidth: 2,
      methods: {
        // 一些事件回调函数
        click: function(item, event) {
          // 点击事件，返回对应点击元素的对象值
          that.state.HollowPoint = item
          if (!item) {
            return
          }
          that.mapvPointClick(item, event.point)
        },
        mousemove: function(item, event) {
          that.state.HollowPoint = item
          if (!item) {
            if (that.state.overHollowPoint) {
              that.state.overHollowPoint.size = 5
              that.state.mapvLayerHollow.dataSet.update()
              that.state.overHollowPoint = null
            }
            return
          } else {
            if (that.state.overHollowPoint) {
              that.state.overHollowPoint.size = 5
            }
            item.size = 7
            that.state.mapvLayerHollow.dataSet.update()
            that.state.overHollowPoint = item
          }
        }
      }
    }
    this.state.mapvLayerSolid = new mapv.baiduMapLayer(
      this.map,
      dataSetSolid,
      optionsSolid
    )
    this.state.mapvLayerHollow = new mapv.baiduMapLayer(
      this.map,
      dataSetHollow,
      optionsHollow
    )
  }
  mapvPointClick = (markerPoint, point) => {
    let that = this
    let obj = that.state.editSubArea
    if (obj !== null && obj.getEditing() === true) {
      return null
    }
    if (that.drawingManager && that.drawingManager._isOpen === true) {
      return null
    }
    const attribute = markerPoint.attribute
    const { cityId } = that.state
    that.props.getProjectDetail(attribute.projectId, cityId, data => {
      let showHideRelate = ''
      {
        pagePermission('fdc:hd:residence:base:areaDraw:relateArea')
          ? (showHideRelate = 'inline-block')
          : (showHideRelate = 'none')
      }
      that.setState({
        relateSubArea: {
          areaId: data.areaId,
          oldSubAreaId: data.subAreaId,
          subAreaId: data.subAreaId ? data.subAreaId : 0,
          subAreaName: data.subAreaName,
          areaName: data.areaName,
          projectName: data.projectName,
          projectId: data.id
        }
      })
      let subAreaName = data.subAreaName === null ? ' ' : data.subAreaName
      let content =
        '<div>' +
        '<div style="margin-bottom: 10px;"><span>类型：</span><span>' +
        '楼盘' +
        '</span></div>' +
        '<div style="margin-bottom: 10px;"><span>名称：</span>' +
        '<span style="text-overflow: ellipsis;width: 248px;overflow: hidden;white-space: nowrap;display: inline-block;vertical-align: bottom;" title=' +
        data.projectName +
        '>' +
        data.projectName +
        '</span></div>' +
        '<div style="margin-bottom: 10px;"><span>行政区：</span><span>' +
        data.areaName +
        '</span></div>' +
        '<div style="margin-bottom: 10px;"><span>片区：</span><span id="popSubArea">' +
        subAreaName +
        '</span></div>' +
        '<div style="border-bottom: 1px solid #E4E4E4;margin-bottom: 10px;"></div>' +
        '<div id="relatedAreaBtn" style="float: right;width: 30px;height: 20px;display: ' +
        showHideRelate +
        '"><span style="cursor: pointer;"><img src="http://img.yungujia.com//upload/25/MCAS/2019/11/28/9b50d257036a42e0b13d.png" style="width:16px"/></span></div>' +
        '</div>'
      var opts = {
        width: 300, // 信息窗口宽度
        height: 162, // 信息窗口高度
        enableMessage: true, // 设置允许信息窗发送短息
        enableCloseOnClick: false
      }
      var infoWindow = new BMap.InfoWindow(content, opts) // 创建信息窗口对象
      infoWindow.addEventListener('open', function() {
        document
          .getElementById('relatedAreaBtn')
          .addEventListener('click', function() {
            const areaSubareaArray = that.state.areaDrawList.filter(
              item => item.areaId === data.areaId
            )
            const options = areaSubareaArray.map(item => (
              <Option
                key={item.subAreaId + '_' + item.subAreaName}
                value={item.subAreaId + '_' + item.subAreaName}
              >
                {item.subAreaName}
              </Option>
            ))
            options.unshift(
              <Option key={0 + '_' + '请选择'} value={0 + '_' + '请选择'}>
                {'请选择'}
              </Option>
            )
            that.state.relateSubArea.selectOptions = options

            that.showModal()
          })
      })
      that.map.openInfoWindow(infoWindow, point) //开启信息窗口
    })
  }
  // markerClick = marker => {
  //   let that = this
  //   marker.addEventListener('click', function(e) {
  //     const markerObj = e.target
  //     const point = new BMap.Point(
  //       markerObj.getPosition().lng,
  //       markerObj.getPosition().lat
  //     )
  //     const attribute = markerObj.attribute
  //     const { cityId } = that.state
  //     that.props.getProjectDetail(attribute.projectId, cityId, data => {
  //       let showHideRelate = ''
  //       {
  //         pagePermission('fdc:hd:residence:base:areaDraw:relateArea')
  //           ? (showHideRelate = 'inline-block')
  //           : (showHideRelate = 'none')
  //       }

  //       let subAreaName = data.subAreaName === null ? ' ' : data.subAreaName
  //       let content =
  //         '<div>' +
  //         '<div className={drapType}><span>类型：</span><span>' +
  //         '楼盘' +
  //         '</span></div>' +
  //         '<div className={drapType}><span>名称：</span><span>' +
  //         data.projectName +
  //         '</span></div>' +
  //         '<div className={drapType}><span>行政区：</span><span>' +
  //         data.areaName +
  //         '</span></div>' +
  //         '<div className={drapType}><span>片区：</span><span id="popSubArea">' +
  //         subAreaName +
  //         '</span></div>' +
  //         '<hr>' +
  //         '<div id="relatedAreaBtn" style="float: right;width: 30px;height: 20px;"><span style="cursor: pointer;display: ' +
  //         showHideRelate +
  //         '"><img src="http://img.yungujia.com//upload/25/MCAS/2019/11/28/9b50d257036a42e0b13d.png" style="width:16px"/></span></div>' +
  //         '</div>'
  //       var opts = {
  //         width: 250, // 信息窗口宽度
  //         height: 120, // 信息窗口高度
  //         enableMessage: true // 设置允许信息窗发送短息
  //       }
  //       var infoWindow = new BMap.InfoWindow(content, opts) // 创建信息窗口对象
  //       infoWindow.addEventListener('open', function() {
  //         document
  //           .getElementById('relatedAreaBtn')
  //           .addEventListener('click', function() {
  //             that.setState({
  //               relateSubArea: {
  //                 areaId: data.areaId,
  //                 subAreaId: data.subAreaId ? data.subAreaId : 0,
  //                 subAreaName: data.subAreaName,
  //                 areaName: data.areaName,
  //                 projectName: data.projectName,
  //                 projectId: data.id
  //               }
  //             })
  //             const areaSubareaArray = that.state.areaDrawList.filter(
  //               item => item.areaId === data.areaId
  //             )
  //             const options = areaSubareaArray.map(item => (
  //               <Option
  //                 key={item.subAreaId + '_' + item.subAreaName}
  //                 value={item.subAreaId + '_' + item.subAreaName}
  //               >
  //                 {item.subAreaName}
  //               </Option>
  //             ))
  //             options.unshift(
  //               <Option key={0 + '_' + '请选择'} value={0 + '_' + '请选择'}>
  //                 {'请选择'}
  //               </Option>
  //             )
  //             that.state.relateSubArea.selectOptions = options
  //             that.showModal()
  //           })
  //       })
  //       that.map.openInfoWindow(infoWindow, point) //开启信息窗口
  //     })
  //   })
  // }
  markerMouseover = marker => {
    marker.addEventListener('mouseover', function(e) {
      let marker = e.target
      let attribute = marker.attribute
      const markerIcon = new BMap.Symbol(BMap_Symbol_SHAPE_CIRCLE, {
        strokeColor: '#FF4F4F', //填充颜色
        strokeWeight: 3.5,
        fillColor: '#FF4F4F',
        fillOpacity: attribute.subAreaId ? 1 : 0, //填充透明度
        scale: 6
      })
      marker.setIcon(markerIcon)
    })
  }
  markerMouseout = marker => {
    marker.addEventListener('mouseout', function(e) {
      let marker = e.target
      let attribute = marker.attribute
      const markerIcon = new BMap.Symbol(BMap_Symbol_SHAPE_CIRCLE, {
        strokeColor: '#FF4F4F', //填充颜色
        strokeWeight: 2,
        fillColor: '#FF4F4F',
        fillOpacity: attribute.subAreaId ? 1 : 0, //填充透明度
        scale: 6
      })
      marker.setIcon(markerIcon)
    })
  }
  handleSearchPolygon = () => {
    const { cityId, aloneArea } = this.state
    const drawAreaInfo = {
      areaIds: aloneArea.map(i => i.key).join(','),
      cityId
      // pointStatus: 1 // 绘制状态，1：已绘制，0：未绘制
    }
    this.props.getAreaDraw(drawAreaInfo, areaDrawList => {
      this.setState({ areaDrawList }, () => {
        // console.log(this.state.areaDrawList)
        let self = this
        const areaDrawLists = this.state.areaDrawList
        self.createPolygon(areaDrawLists)
      })
    })
  }
  handleSearch = () => {
    const { cityId, aloneArea } = this.state
    const drawAreaInfo = {
      areaIds: aloneArea.map(i => i.key).join(','),
      cityId
      // pointStatus: 1 // 绘制状态，1：已绘制，0：未绘制
    }
    this.props.getAreaDraw(drawAreaInfo, areaDrawList => {
      this.setState({ areaDrawList }, () => {
        // console.log(this.state.areaDrawList)
        let self = this
        const areaDrawLists = this.state.areaDrawList
      })
    })
  }
  createPolygon = polygonDatas => {
    let self = this
    // this.subAreaObjKeyValue = [] // 保存覆盖物列表
    const polygonStyle = {
      strokeColor: '#06ccb4',
      strokeWeight: 2,
      strokeOpacity: 1,
      fillOpacity: 0.2,
      fillColor: '#80DED5'
    }
    polygonDatas.forEach(item => {
      if (item.mapPoints) {
        const pointStrArray = item.mapPoints.split(';')
        let points = []
        pointStrArray.map(pointStr => {
          const [a, b] = pointStr.split(',')
          points.push(new BMap.Point(a, b))
        })
        let polygon = new BMap.Polygon(points, polygonStyle)
        polygon.attribute = item
        self.map.addOverlay(polygon)
        // this.subAreaObjKeyValue.push(polygon)
        self.state.subAreaObjKeyValue[item.subAreaId] = polygon
        self.polygonClick(polygon)
        self.polygonMouseover(polygon)
        self.polygonMouseout(polygon)
      }
    })
  }

  polygonClick = polygon => {
    let that = this
    polygon.addEventListener('click', function(e) {
      let editSubArea = that.state.editSubArea
      if (editSubArea !== null && editSubArea.getEditing() === true) {
        return null
      }
      if (that.drawingManager && that.drawingManager._isOpen === true) {
        return null
      }
      that.clearDraw()
      const obj = e.target
      if (obj.getEditing() === true) {
        return null
      }
      const attribute = obj.attribute
      let showHideEdit = ''
      let showHideDel = ''
      {
        pagePermission('fdc:hd:residence:base:areaDraw:changeDraw')
          ? (showHideEdit = 'inline-block')
          : (showHideEdit = 'none')
      }

      {
        pagePermission('fdc:hd:residence:base:areaDraw:delDraw')
          ? (showHideDel = 'inline-block')
          : (showHideDel = 'none')
      }

      let content =
        '<div>' +
        '<div style="margin-bottom: 10px;"><span>类型：</span><span>' +
        '片区' +
        '</span></div>' +
        '<div style="margin-bottom: 10px;"><span>名称：</span>' +
        '<span style="text-overflow: ellipsis;width: 248px;overflow: hidden;white-space: nowrap;display: inline-block;vertical-align: bottom;" title=' +
        attribute.subAreaName +
        '>' +
        attribute.subAreaName +
        '</span></div>' +
        '<div style="border-bottom: 1px solid #E4E4E4;margin-bottom: 10px;"></div>' +
        '<div style="float: right;width: 50px;height: 100px;"><span id="editPolygon" style="margin-right: 10px;cursor: pointer;display: ' +
        showHideEdit +
        '"><img src="http://img.yungujia.com//upload/25/MCAS/2019/12/06/ca55c85b3ba547f48a7d.png" style="width:16px"/></span><span id="deletePolygon"  style="cursor: pointer;display: ' +
        showHideDel +
        '"><img src="http://img.yungujia.com//upload/25/MCAS/2019/12/06/4a6a9d0a51e349f1bf43.png" style="width:16px"/></span></div>' +
        '</div>'
      var opts = {
        width: 300, // 信息窗口宽度
        height: 100, // 信息窗口高度
        enableMessage: false, // 设置允许信息窗发送短息
        enableCloseOnClick: false
      }
      var infoWindow = new BMap.InfoWindow(content, opts)
      infoWindow.addEventListener('open', function() {
        document
          .getElementById('editPolygon')
          .addEventListener('click', function() {
            that.map.closeInfoWindow()
            that.clearDraw()
            obj.enableEditing()
            that.setState({ editSubArea: obj })
          })
        document
          .getElementById('deletePolygon')
          .addEventListener('click', function() {
            that.clearDraw()
            that.map.closeInfoWindow()
            const attribute = obj.attribute
            const subAreaId = attribute.subAreaId
            const { cityId } = that.state
            const ids = subAreaId
            confirm({
              title: '您是否确定删除?',
              okText: '确定',
              // okType: 'danger',
              cancelText: '取消',
              onOk() {
                that.props.deleteAreaDraw(ids, cityId, data => {
                  if (data && data.code === '200') {
                    if (that.state.subAreaObjKeyValue[subAreaId]) {
                      that.map.removeOverlay(
                        that.state.subAreaObjKeyValue[subAreaId]
                      )
                      delete that.state.subAreaObjKeyValue[subAreaId]
                      that.setState({ editSubArea: null })
                      let areaDrawList = that.state.areaDrawList
                      let items = areaDrawList.filter(
                        item => item.subAreaId === subAreaId
                      )
                      if (items.length > 0) {
                        items[0].mapPoints = null
                        items[0].pointStatus = 0
                        that.setState({ areaDrawList })
                      }
                    } else {
                    }
                    that.handleSearch()
                  }
                })
              }
            })
          })
      })
      infoWindow.addEventListener('close', function() {
        // obj.disableEditing()
      })
      let cursorPoint = e.point
        ? new BMap.Point(e.point.lng, e.point.lat)
        : obj.getBounds().getCenter()
      if (!e.point) {
        this.map.setCenter(obj.getBounds().getCenter())
      }
      // this.map.openInfoWindow(infoWindow, cursorPoint) // 开启信息窗口
      setTimeout(() => {
        if (that.state.SolidPoint === null && that.state.HollowPoint === null) {
          that.map.openInfoWindow(infoWindow, cursorPoint) // 开启信息窗口
        }
      }, 100)
    })
    polygon.addEventListener('rightclick', function(e) {
      const obj = e.target
      if (obj.getEditing() === false) {
        return
      }
      let points = e.target.getPath()
      let attribute = e.target.attribute
      let paramLngLatArray = []
      points.forEach(point => {
        paramLngLatArray.push(
          point.lng.toFixed(14) + ',' + point.lat.toFixed(14)
        )
      })
      let params = {
        mapPoints: paramLngLatArray.join(';'),
        subAreaId: attribute.subAreaId
      }
      that.props.newChangeDraw(params, () => {
        obj.disableEditing()
        that.setState({ editSubArea: null })
        obj.attribute.mapPoints = params.mapPoints
      })
    })
  }
  polygonMouseover = polygon => {
    polygon.addEventListener('mouseover', function(e) {
      let obj = e.target
      obj.setFillOpacity(0.8)
    })
  }
  polygonMouseout = polygon => {
    polygon.addEventListener('mouseout', function(e) {
      let obj = e.target
      obj.setFillOpacity(0.2)
    })
  }
  onClose = () => {
    this.setState({
      visible: false,
      displayOpen: 'block',
      displayClose: 'none'
    })
  }

  showDrawer = () => {
    this.setState({
      visible: true,
      displayOpen: 'none',
      displayClose: 'block'
    })
  }

  // S 显示楼盘的弹窗
  showModal = () => {
    this.setState({
      visiblePop: true
    })
  }

  handleOkPop = e => {
    let that = this
    this.setState({
      visiblePop: false
    })
    const { cityId } = this.state
    const { relateSubArea } = this.state
    // if (relateSubArea.subAreaId === -1) {
    //   alert('请选择片区')
    //   return
    // }
    let param = {
      areaId: relateSubArea.areaId,
      cityId: cityId,
      projectId: relateSubArea.projectId,
      subAreaId: relateSubArea.subAreaId
    }
    this.props.relationSubArea(param, data => {
      const { relateSubArea } = that.state
      this.handleCancelPop()
      if (data.code === '200') {
        document.getElementById('popSubArea').innerHTML =
          relateSubArea.subAreaName
        // let marker = this.state.projectBuildingObjKeyValue[relateSubArea.projectId]
        // if (marker) {
        //   let fillOpacity = relateSubArea.subAreaId === null ? 0 : 1//填充透明度
        //   let hollowMarkerIcon = new BMap.Symbol(BMap_Symbol_SHAPE_CIRCLE, {
        //     strokeColor: '#FF4F4F',//填充颜色
        //     strokeWeight: 2,
        //     fillColor: '#FF4F4F',
        //     fillOpacity: fillOpacity,
        //     scale: 6
        //   })
        //   marker.setIcon(hollowMarkerIcon)
        //   marker.attribute.subAreaId = relateSubArea.subAreaId
        // }

        if (relateSubArea.oldSubAreaId !== null) {
          let solidDataSet = this.state.mapvLayerSolid.dataSet
          var solidDatas = solidDataSet.get({
            filter: function(item) {
              if (item.attribute.projectId === relateSubArea.projectId) {
                return item
              } else {
                return null
              }
            }
          })
          if (solidDatas.length > 0) {
            let s = solidDatas[0]
            if (relateSubArea.subAreaId === null) {
              let index = that.state.mapvLayerSolid.dataSet.get().indexOf(s)
              if (index > -1) {
                that.state.mapvLayerSolid.dataSet.get().splice(index, 1)
              }
              s.attribute.subAreaId = 0
              that.state.mapvLayerHollow.dataSet.get().push(s)
              that.state.mapvLayerSolid.dataSet.update()
              that.state.mapvLayerHollow.dataSet.update()
            } else {
              let index = that.state.mapvLayerSolid.dataSet.get().indexOf(s)
              if (index > -1) {
                that.state.mapvLayerSolid.dataSet.get().splice(index, 1)
              }
              s.attribute.subAreaId = relateSubArea.subAreaId
              that.state.mapvLayerSolid.dataSet.get().push(s)
              that.state.mapvLayerSolid.dataSet.update()
            }
          }
        } else {
          let hollowDataSet = this.state.mapvLayerHollow.dataSet
          var hollowDatas = hollowDataSet.get({
            filter: function(item) {
              if (item.attribute.projectId === relateSubArea.projectId) {
                return item
              } else {
                return null
              }
            }
          })
          if (hollowDatas.length > 0) {
            let h = hollowDatas[0]
            if (relateSubArea.subAreaId !== null) {
              let index = that.state.mapvLayerHollow.dataSet.get().indexOf(h)
              if (index > -1) {
                that.state.mapvLayerHollow.dataSet.get().splice(index, 1)
              }
              h.attribute.subAreaId = relateSubArea.subAreaId
              that.state.mapvLayerSolid.dataSet.get().push(h)
              that.state.mapvLayerSolid.dataSet.update()
              that.state.mapvLayerHollow.dataSet.update()
            }
          }
        }
        that.state.relateSubArea.oldSubAreaId = param.subAreaId
        relateSubArea.subAreaId = -1
      }
    })
  }

  handleCancelPop = e => {
    this.setState({
      visiblePop: false
    })
  }

  // E 显示楼盘的弹窗

  // 地图函数
  drawMap = () => {
    const { cityName } = this.state
    const BMap = window.BMap
    // 百度地图API功能
    this.map = new BMap.Map('drawmap', { enableMapClick: false }) // 创建Map实例
    const map = this.map
    map.centerAndZoom(cityName, 11) // 初始化地图,设置中心点坐标和地图级别
    map.enableScrollWheelZoom(true) // 开启鼠标滚轮缩放

    var top_right_navigation = new BMap.NavigationControl({
      anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
      type: BMAP_NAVIGATION_CONTROL_ZOOM
    }) // 右上角，仅包含平移和缩放按钮
    map.addControl(top_right_navigation)

    // const styleOptions = {
    //   strokeColor: '#33CABB', // 边线颜色。
    //   fillColor: '#33CABB', // 填充颜色。当参数为空时，圆形将没有填充效果。
    //   strokeWeight: 3, // 边线的宽度，以像素为单位。
    //   strokeOpacity: 0.8, // 边线透明度，取值范围0 - 1。
    //   fillOpacity: 0.6, // 填充的透明度，取值范围0 - 1。
    //   strokeStyle: 'solid', // 边线的样式，solid或dashed。
    //   strokeZindex: 9999999
    // }
    const styleOptionsed = {
      strokeColor: 'blue',
      strokeWeight: 2,
      strokeOpacity: 0.5
    }
    const { BMapLib } = window
    // 实例化鼠标绘制工具
    this.drawingManager = new BMapLib.DrawingManager(map, {
      isOpen: false, // 是否开启绘制模式
      // enableDrawingTool: true, // 是否显示工具栏
      drawingToolOptions: {
        anchor: BMAP_ANCHOR_BOTTOM_RIGHT, // 位置
        offset: new BMap.Size(5, 5) // 偏离值
      },
      circleOptions: styleOptionsed, // 圆的样式
      polylineOptions: styleOptionsed, // 线的样式
      polygonOptions: styleOptionsed, // 多边形的样式
      rectangleOptions: styleOptionsed // 矩形的样式
    })
    let that = this
    this.drawingManager.addEventListener('overlaycomplete', function(e) {
      that.overlaycomplete(e)
    })
    this.drawingManager.setDrawingMode(BMAP_DRAWING_POLYGON)
    this.mapOnkeydown()
  }
  mapOnkeydown = () => {
    let that = this
    document.onkeydown = function(e) {
      if (e.keyCode === 27) {
        that.clearDraw()
        // that.map.removeEventListener('mousemove', that.mousemoveHandler)
        // if (that.state.labelTips !== null) {
        //   that.map.removeOverlay(that.state.labelTips)
        //   that.state.labelTips = null
        // }
        // if (that.drawingManager && that.drawingManager._isOpen === true) {
        //   that.drawingManager.close()
        //   let overlays = that.map.getOverlays();
        //   if (overlays.length > 0) {
        //     let overlay = overlays[overlays.length - 1]
        //     if (overlay.getStrokeColor() === 'blue') {
        //       that.map.removeOverlay(overlay)
        //     }
        //   }
        // }
        // let obj = that.state.editSubArea
        // if (obj !== null && obj.getEditing() === true) {
        //   obj.disableEditing()
        //   let attribute = obj.attribute
        //   const pointStrArray = attribute.mapPoints.split(';')
        //   let points = []
        //   pointStrArray.map(pointStr => {
        //     const [a, b] = pointStr.split(',')
        //     points.push(new BMap.Point(a, b))
        //   })
        //   obj.setPath(points)
        //   that.setState({ editSubArea: null })
        // }
      }
    }
  }
  overlaycomplete = e => {
    let that = this
    let lngLatAll = []
    var overlayPoints = e.overlay.getPath()

    that.map.removeEventListener('mousemove', that.mousemoveHandler)
    if (that.state.labelTips !== null) {
      that.map.removeOverlay(that.state.labelTips)
      that.state.labelTips = null
    }
    for (var j = 0; j < overlayPoints.length; j++) {
      var grid = overlayPoints[j]
      lngLatAll.push(grid.lng.toFixed(14) + ',' + grid.lat.toFixed(14))
    }
    lngLatAll = that.uniqueArray(lngLatAll)
    // this.setState({ lngLat: lngLatAll })
    if (lngLatAll.length > 0) {
      lngLatAll.push(lngLatAll[0])
    }
    const params = {
      mapPoints: lngLatAll.join(';'), // this.state.lngLat.join(';'),
      subAreaId: that.state.newDrawSubAreaId
    }
    that.props.newChangeDraw(params, data => {
      if (data && data.code && data.code === '200') {
        const { areaDrawList } = that.state
        let items = areaDrawList.filter(
          item => item.subAreaId === that.state.newDrawSubAreaId
        )
        if (items.length > 0) {
          items[0].mapPoints = params.mapPoints
          items[0].pointStatus = 1
          that.setState({ areaDrawList })
          that.createPolygon([items[0]])
          that.drawingManager.close()
          that.map.removeOverlay(e.overlay)
        }
      } else {
        that.drawingManager.close()
        that.map.removeOverlay(e.overlay)
      }
      that.handleSearch()
    })
  }
  uniqueArray = arr => {
    const res = new Map()
    return arr.filter(a => !res.has(a) && res.set(a, 1))
  }
  clearDraw = () => {
    const that = this
    that.map.removeEventListener('mousemove', that.mousemoveHandler)
    if (that.state.labelTips !== null) {
      that.map.removeOverlay(that.state.labelTips)
      that.state.labelTips = null
    }
    if (that.drawingManager && that.drawingManager._isOpen === true) {
      that.drawingManager.close()
      let overlays = that.map.getOverlays()
      overlays.forEach(o => {
        if (typeof o.getStrokeColor === 'function') {
          if (o.getStrokeColor() === 'blue') {
            that.map.removeOverlay(o)
          }
        }
      })
      // if (overlays.length > 0) {
      //   let overlay = overlays[overlays.length - 1]
      //   if (overlay.getStrokeColor() === 'blue') {
      //     that.map.removeOverlay(overlay)
      //   }
      // }
    }
    let obj = that.state.editSubArea
    if (obj !== null && obj.getEditing() === true) {
      obj.disableEditing()
      let attribute = obj.attribute
      const pointStrArray = attribute.mapPoints.split(';')
      let points = []
      pointStrArray.map(pointStr => {
        const [a, b] = pointStr.split(',')
        points.push(new BMap.Point(a, b))
      })
      obj.setPath(points)
      that.setState({ editSubArea: null })
    }
  }
  newDrawing = record => {
    this.clearDraw()
    let that = this
    that.map.closeInfoWindow()
    this.setState({ newDrawSubAreaId: record.subAreaId })
    this.drawingManager.open()
    this.map.addEventListener('mousemove', this.mousemoveHandler)
  }
  mousemoveHandler = e => {
    let that = this
    if (that.state.labelTips === null) {
      that.state.labelTips = new BMap.Label(
        '双击鼠标左键完成绘制，键盘Esc退出绘制',
        { offset: new BMap.Size(5, -30) }
      )
      that.map.addOverlay(that.state.labelTips)
    }
    that.state.labelTips.setPosition(e.point)
  }
  changeEditing = record => {
    this.clearDraw()
    this.map.closeInfoWindow()
    // 点击修改绘制之后，按钮变为保存修改
    const { areaDrawList } = this.state

    // areaDrawList.forEach((i, index) => {
    //   if (i.subAreaId === record.subAreaId) {
    //     i.pointStatus = 2

    //     this.subAreaObjKeyValue[index].enableEditing()
    //   }
    // })
    if (this.state.subAreaObjKeyValue[record.subAreaId]) {
      let obj = this.state.subAreaObjKeyValue[record.subAreaId]
      this.map.setCenter(obj.getBounds().getCenter())
      this.state.subAreaObjKeyValue[record.subAreaId].enableEditing()
      this.setState({
        editSubArea: this.state.subAreaObjKeyValue[record.subAreaId]
      })
    }
    this.setState({ areaDrawList })
  }

  saveEditing = record => {
    const { areaDrawList } = this.state

    // areaDrawList.forEach((i, index) => {
    //   if (i.subAreaId === record.subAreaId) {
    //     i.pointStatus = 1
    //     console.log(111)
    //     var overlay = this.subAreaObjKeyValue[index].getPath()
    //     console.log(overlay)

    //     const paramLngLat = []
    //     overlay.forEach(i => {
    //       paramLngLat.push(i.lng.toFixed(14) + ',' + i.lat.toFixed(14))
    //     })
    //     console.log(paramLngLat)

    //     const params = {}
    //     // 获取到修改后的经纬度数组

    //     params.mapPoints = paramLngLat.join(';')
    //     params.subAreaId = record.subAreaId
    //     console.log(params)
    //     this.props.newChangeDraw(params, () => {
    //       this.subAreaObjKeyValue[index].disableEditing()
    //     })
    //   }
    // })
    if (this.state.subAreaObjKeyValue[record.subAreaId]) {
      var overlay = this.state.subAreaObjKeyValue[record.subAreaId].getPath()
      const paramLngLat = []
      overlay.forEach(i => {
        paramLngLat.push(i.lng.toFixed(14) + ',' + i.lat.toFixed(14))
      })
      // console.log(paramLngLat)

      const params = {}
      // 获取到修改后的经纬度数组

      params.mapPoints = paramLngLat.join(';')
      params.subAreaId = record.subAreaId
      this.props.newChangeDraw(params, () => {
        this.state.subAreaObjKeyValue[record.subAreaId].disableEditing()
      })
    }
    this.setState({ areaDrawList })
  }

  handleChange = (pagination, filters, sorter) => {
    // console.log('Various parameters', pagination, filters, sorter)

    console.log('params', pagination, filters, sorter)
    // this.setState({
    //   filteredInfo: filters
    // })
    // console.log(this.state.filteredInfo)
  }
  handleChangeSubArea = value => {
    const { relateSubArea } = this.state
    relateSubArea.subAreaId =
      value.split('_')[0] === '0' ? null : value.split('_')[0]
    relateSubArea.subAreaName =
      value.split('_')[0] === '0' ? '' : value.split('_')[1]

    this.setState({
      testDefault: value
    })
  }
  renderBreads() {
    const breadList = [
      {
        key: 1,
        path: '',
        name: '住宅',
        icon: 'home'
      },
      {
        key: 2,
        path: router.RES_BASEINFO,
        name: '住宅基础数据'
      },
      {
        key: 3,
        path: '',
        name: '片区绘制'
      }
    ]
    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.path ? (
              <Link
                to={{
                  pathname: item.path,
                  search: item.search
                }}
              >
                {item.name}
              </Link>
            ) : (
              item.name
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )
  }

  renderForm() {
    // console.log(this.props.estateProject)
    // let { filteredInfo } = this.state
    // filteredInfo = filteredInfo || {}
    const { aloneArea } = this.state
    // const aloneAreaTest = {
    //   text: '全选',
    //   value: '全选'
    // }

    const aloneAreaFliter = []
    aloneArea.map(i => {
      aloneAreaFliter.push({
        text: i.label,
        value: i.label
      })
    })

    const columns = [
      {
        title: '行政区',
        width: 140,
        dataIndex: 'areaName',
        key: 'areaName',
        filters: aloneAreaFliter,
        onFilter: (value, record) => record.areaName.includes(value),
        render: areaName => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{areaName}</div>}
          >
            <div className={styles.limitCityName}>{areaName}</div>
          </Popover>
        )
      },
      {
        title: '片区',
        width: 110,
        dataIndex: 'subAreaName',
        key: 'subAreaName',
        render: subAreaName => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{subAreaName}</div>}
          >
            <div className={styles.limitCityName}>{subAreaName}</div>
          </Popover>
        )
      },
      {
        title: '状态',
        width: 90,
        dataIndex: 'pointStatus',
        key: 'pointStatus',
        render: pointStatus => (
          <Fragment>
            <div>{pointStatus === 1 ? '已绘制' : '未绘制'}</div>
          </Fragment>
        ),
        filters: [
          { text: '已绘制', value: '已绘制' },
          { text: '未绘制', value: '未绘制' }
        ],
        onFilter: (value, record) =>
          (record.pointStatus === 1 ? '已绘制' : '未绘制').includes(value)
      },
      {
        title: '操作',
        dataIndex: 'operater',
        key: 'operater',
        render: (_, record) => (
          <Fragment>
            {record.pointStatus === 0 ? (
              <Button
                type="primary"
                size="small"
                disabled={
                  pagePermission('fdc:hd:residence:base:areaDraw:newDraw')
                    ? false
                    : true
                }
                onClick={() => this.newDrawing(record, record.type)}
              >
                新建绘制
              </Button>
            ) : (
              ''
            )}
            {record.pointStatus === 1 ? (
              <Button
                type="primary"
                size="small"
                disabled={
                  pagePermission('fdc:hd:residence:base:areaDraw:changeDraw')
                    ? false
                    : true
                }
                onClick={() => this.changeEditing(record)}
              >
                修改绘制
              </Button>
            ) : (
              ''
            )}
            {/* {record.pointStatus === 2 ? (
              <Button type="primary" onClick={() => this.saveEditing(record)}>
                保存绘制
              </Button>
            ) : (
              ''
            )} */}
          </Fragment>
        )
      }
    ]

    return (
      <div>
        <div
          id="drawmap"
          style={{
            position: 'absolute',
            top: '40px',
            left: 0,
            right: 0,
            bottom: 0
          }}
        />
        <div>
          {/* 导入片区经纬度 */}

          <Link
            to={{
              pathname: router.RES_AREA_DRAW_LNGLAT,
              search: `cityId=${this.state.cityId}&cityName=${
                this.state.cityName
              }`
            }}
          >
            {pagePermission('fdc:hd:residence:base:areaDraw:importLngLat') ? (
              <Button type="primary" className={styles.importBtn}>
                导入片区经纬度
              </Button>
            ) : (
              ''
            )}
          </Link>

          {/* 收进按钮 */}
          <div
            className={styles.doubleRight}
            style={{ display: this.state.displayOpen }}
            onClick={this.showDrawer}
          >
            <Icon type="double-right" />
          </div>

          <Drawer
            placement="left"
            closable={false}
            onClose={this.onClose}
            visible={this.state.visible}
            mask={false}
            getContainer={false}
            style={{ marginTop: '60px', width: '500px' }}
            className={styles.drawDrawer}
          >
            <Table
              rowKey="subAreaId"
              columns={columns}
              dataSource={this.state.areaDrawList}
              // dataSource={dataSource}
              // rowSelection={rowSelection}
              pagination={false}
              loading={this.context.loading.includes(actions.GET_AREA_DRAW)}
              scroll={{ y: 400 }}
              onChange={this.handleChange}
              className={styles.drawTable}
              onRow={record => {
                return {
                  onClick: event => {
                    const subAreaId = record.subAreaId
                    let polygon = this.state.subAreaObjKeyValue[subAreaId]
                    if (polygon) {
                      this.state.SolidPoint = null
                      this.state.HollowPoint = null
                      polygon.dispatchEvent('click')
                    }
                  }, // 点击行
                  onMouseEnter: event => {
                    const subAreaId = record.subAreaId
                    let polygon = this.state.subAreaObjKeyValue[subAreaId]
                    if (polygon) {
                      polygon.dispatchEvent('mouseover')
                    }
                  }, // 鼠标移入行
                  onMouseLeave: event => {
                    const subAreaId = record.subAreaId
                    let polygon = this.state.subAreaObjKeyValue[subAreaId]
                    if (polygon) {
                      polygon.dispatchEvent('mouseout')
                    }
                  }
                }
              }}
            />
            <div
              className={styles.doubleLeft}
              style={{ display: this.state.displayClose }}
              onClick={this.onClose}
            >
              <Icon type="double-left" />
            </div>
          </Drawer>
        </div>
      </div>
    )
  }

  renderRelateSubArea() {
    // const { areaDrawList } = this.state
    const { subAreaId, subAreaName } = this.state.relateSubArea
    const options = this.state.areaDrawList.map(item => (
      <Select.Option
        key={item.subAreaId}
        value={item.subAreaId + '_' + item.subAreaName}
      >
        {item.subAreaName}
      </Select.Option>
    ))
    options.unshift(
      <Select.Option key={0} value={0 + '_' + '请选择'}>
        {'请选择'}
      </Select.Option>
    )

    let testSubAreaName = ''
    if (!subAreaName) {
      testSubAreaName = '请选择'
    } else {
      testSubAreaName = subAreaName
    }

    return (
      <div>
        <Modal
          maskClosable={true}
          title="关联片区"
          visible={this.state.visiblePop}
          onOk={this.handleOkPop}
          onCancel={this.handleCancelPop}
          width={400}
        >
          <div className={styles.popupTitle}>
            <span>楼盘名称：</span>
            <span>{this.state.relateSubArea.projectName}</span>
          </div>
          <div className={styles.popupTitle}>
            <span>行政区：</span>
            <span>{this.state.relateSubArea.areaName}</span>
          </div>
          <div className={styles.popupTitle}>
            <span>片区：</span>
            <span>
              <Select
                filterOption={false}
                // labelInValue
                showSearch={false}
                style={{ width: 150 }}
                value={testSubAreaName}
                defaultValue={testSubAreaName}
                onChange={this.handleChangeSubArea}
              >
                {this.state.relateSubArea.selectOptions}
                {/* {options} */}
                {/* {this.state.relateSubArea.selectOptions.map(item => (
                  <Option key={item.subAreaId} value={item.subAreaId + '_' + item.subAreaName}>
                    {item.subAreaName}
                  </Option>
                ))} */}
              </Select>
            </span>
          </div>
        </Modal>
      </div>
    )
  }
  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.drawContainer}>{this.renderForm()}</div>

        {/* 弹窗 */}
        {/* <div>
          <Modal
            maskClosable={true}
            title="关联片区"
            visible={this.state.visiblePop}
            onOk={this.handleOkPop}
            onCancel={this.handleCancelPop}
          >
            <div className={styles.popupTitle}>
              <span>楼盘名称：</span>
              <span>11</span>
            </div>
            <div className={styles.popupTitle}>
              <span>行政区：</span>
              <span>22</span>
            </div>
            <div className={styles.popupTitle}>
              <span>片区：</span>
              <span>
                <Select>
                  options
                </Select>
              </span>
            </div>
          </Modal>
        </div> */}
        {this.renderRelateSubArea()}
      </div>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    modelSelector,
    containerActions
  )
)(AreaDraw)
