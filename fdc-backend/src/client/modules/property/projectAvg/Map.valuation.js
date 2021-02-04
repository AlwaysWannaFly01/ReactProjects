/* eslint-disable */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import {Form, Row, Input, Icon, InputNumber, Breadcrumb, Spin, Radio, Modal, Message} from 'antd'
import { Link } from 'react-router-dom'
import Immutable from 'immutable'
import router from 'client/router'
import actions, { containerActions } from './actions'
import './sagas'
import './reducer'
import { modelSelector } from './selector'

import styles from './ProjectAvg.less'
import moment from "moment"
import qs, {parse} from 'qs'

/*
 * 地图核价
 */
class MapValuation extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    fetchProjectPriceList:PropTypes.func.isRequired,
    getMapCheckPrice:PropTypes.func.isRequired,
    updataMapCheckPrice: PropTypes.func.isRequired,
    GetMapCheckPriceDetail: PropTypes.func.isRequired,
    getMapCheckPriceConfig: PropTypes.func.isRequired,
    mapCheckPriceConfig: PropTypes.object.isRequired,
    fetchAreaDict: PropTypes.func.isRequired,
    getProvinceCityList: PropTypes.func.isRequired
  }
  
  constructor(props) {
    super(props)
    const {CITYID,CITYNAME,KEYWORD} = parse(
        props.location.search.toUpperCase().substr(1)
    )
    
    this.state = {
      keyword:KEYWORD,
      cityId:CITYID,
      cityName: CITYNAME,
      markerList : [],
      newMarker: null,
      LastLabel: null,
      searchValue: '',
      radioType: 'FDC',
      loading: false,
      dataList: [],
      visible: false,
      projectId: "", //楼盘id
      priceDtail: {
        projectName: '',
        useMonth: '',
        projectAvgPrice: ''
      },
      AvgPriceTop: 0, //上涨比
      AvgPriceTopColor: '', //上涨比字体颜色,
      projectAvgPrice: ''//默认值
    }
  }
  
  componentDidUpdate(prevProps, prevState, snapshot) {
  }
  
  componentWillMount() {
    //this.props.fetchAreaDict(this.state.cityId)
  }
  
  componentDidMount() {
    let vm = this
    setTimeout (function(){
      console.log("延时1秒")
    },1000)
    const BMap = window.BMap
    const map = new BMap.Map('map')
    const BMapLib = window.BMapLib
    this.map = map
    this.BMap = BMap
    this.BMapLib = BMapLib
    map.disableDoubleClickZoom()
    let cityNameD = ''
  
    // vm.initBMap(map,BMap)
    // vm.drawAreaDict()
      vm.props.getProvinceCityList({returnArea : 1},res=>{
        let provinceCityList = res.data
        //let provinceCityList = this.props.model.get('provinceCityList').toJS() || []
        console.log("provinceCityList",provinceCityList)
        const {cityId,cityName} = vm.state
        if(cityId && !cityName){
          if(provinceCityList){
            provinceCityList.forEach(item=>{
              if(item.cities){
                item.cities.forEach(item2 =>{
                  if(Number(cityId) === item2.id){
                    vm.props.fetchAreaDict(cityId,res=>{
                      let a = vm.initBMap(map,BMap,item2.cityName,cityId)
                      cityNameD = item2.cityName
                      if(a){
                        vm.drawAreaDict()
                      }
                      if(vm.state.keyword){
                        map.centerAndZoom(cityNameD, 16)
                        vm.setState({searchValue: vm.state.keyword})
                        setTimeout(()=>{
                          let even ={
                            keyCode : 13
                          }
                          //vm.mapSearchEnter(even,2)
                          document.getElementById("searchIcon").click()
                        },2000)
                      }
                    })
                    sessionStorage.setItem('FDC_CITY_INFO',JSON.stringify({"id":cityId,"cityName":decodeURI(item2.cityName),"provinceId":item.id}))
                    sessionStorage.setItem('FDC_CITY',cityId)
                    return false
                  }
                })
              }
            })
          }
        }
        if(!cityId && cityName){
          debugger
          let cityName2 = cityName
          if(cityName2.indexOf('市') == -1){
            cityName2 = cityName + '市'
          }
          if(provinceCityList){
            provinceCityList.forEach(item=>{
              if(item.cities){
                item.cities.forEach(item2 =>{
                  if(cityName2.toString() === item2.cityName.toString()){
                    vm.props.fetchAreaDict(item2.id,res=>{
                      let a = vm.initBMap(map,BMap,cityName2,item2.id)
                      cityNameD = cityName2
                      if(a){
                        vm.drawAreaDict()
                      }
                      if(vm.state.keyword){
                        map.centerAndZoom(cityNameD, 16)
                        vm.setState({searchValue: vm.state.keyword})
                        setTimeout(()=>{
                          let even ={
                            keyCode : 13
                          }
                          //vm.mapSearchEnter(even,2)
                          document.getElementById("searchIcon").click()
                        },2000)
                      }
                    })
                    sessionStorage.setItem('FDC_CITY_INFO',JSON.stringify({"id":item2.id,"cityName":decodeURI(cityName2),"provinceId":item.id}))
                    sessionStorage.setItem('FDC_CITY',cityId)
                    return false
                  }
                })
              }
            })
          }
        }
        if(cityId && cityName){
          if(provinceCityList){
            provinceCityList.forEach(item=>{
              if(item.cities){
                item.cities.forEach(item2 =>{
                  if(Number(cityId) === Number(item2.id)){
                    vm.props.fetchAreaDict(cityId,res=>{
                      console.log("城市id都有")
                      let a = vm.initBMap(map,BMap,item2.cityName,cityId)
                      cityNameD = item2.cityName
                      if(a){
                        vm.drawAreaDict()
                      }
                      if(vm.state.keyword){
                        //map.centerAndZoom(cityNameD, 16)
                        vm.setState({searchValue: vm.state.keyword})
                        setTimeout(()=>{
                          let even ={
                            keyCode : 13
                          }
                          //vm.mapSearchEnter(even,2)
                          document.getElementById("searchIcon").click()
                        },2000)
                      }
                    })
                    sessionStorage.setItem('FDC_CITY_INFO',JSON.stringify({"id":cityId,"cityName":decodeURI(item2.cityName),"provinceId":item.id}))
                    sessionStorage.setItem('FDC_CITY',cityId)
                    return false
                  }
                })
              }
            })
          }
        }
        console.log("检索到",vm.state.cityId,vm.state.cityName)
      })

      //map.addControl(new BMap.NavigationControl3D())
  
    //map.addControl(new BMap.NavigationControl3D())
    map.addEventListener('ondragend', function(){
      var ZoomNum = map.getZoom()
      if(ZoomNum>=16){
        const {SW_LNG,SW_LAT,NE_LNG,NE_LAT} = vm.getMapPostions()
        vm.initData(vm.state.cityId,vm.state.radioType,SW_LNG,SW_LAT,NE_LNG,NE_LAT)
      }
    })
    map.addEventListener('mouseup', function(){
    
    })
    map.addEventListener("zoomend", function(e){
      var ZoomNum = map.getZoom()
      console.log("地图层级",ZoomNum)
      if(ZoomNum>=16){
        const {SW_LNG,SW_LAT,NE_LNG,NE_LAT} = vm.getMapPostions()
        vm.initData(vm.state.cityId,vm.state.radioType,SW_LNG,SW_LAT,NE_LNG,NE_LAT)
      }else{
        vm.map.clearOverlays()
        vm.drawAreaDict()
      }
    })
    
  }
  
  // componentDidMount() {
  //   // vm.props.getProvinceCityList({returnArea : 1},res=>{
  //   //   let provinceCityList = res.data
  //   //   //let provinceCityList = this.props.model.get('provinceCityList').toJS() || []
  //   //   console.log("provinceCityList",provinceCityList)
  //   //
  //   //   const {cityId,cityName} = vm.state
  //   //   if(cityId && !cityName){
  //   //     if(provinceCityList){
  //   //       provinceCityList.forEach(item=>{
  //   //         if(item.cities){
  //   //           item.cities.forEach(item2 =>{
  //   //             if(Number(cityId) === item2.id){
  //   //               vm.props.fetchAreaDict(cityId)
  //   //               vm.initBMap(map,BMap,item2.cityName,cityId)
  //   //               return false
  //   //             }
  //   //           })
  //   //         }
  //   //       })
  //   //     }
  //   //   }
  //   //   if(!cityId && cityName){
  //   //     let cityName2 = cityName
  //   //     if(cityName2.indexOf('市') == -1){
  //   //       cityName2 = cityName + '市'
  //   //     }
  //   //     if(provinceCityList){
  //   //       provinceCityList.forEach(item=>{
  //   //         if(item.cities){
  //   //           item.cities.forEach(item2 =>{
  //   //             if(cityName2.toString() === item2.cityName.toString()){
  //   //               vm.props.fetchAreaDict(item2.id)
  //   //               vm.initBMap(map,BMap,cityName2,item2.id)
  //   //               return false
  //   //             }
  //   //           })
  //   //         }
  //   //       })
  //   //     }
  //   //   }
  //   //   if(cityId && cityName){
  //   //     if(provinceCityList){
  //   //       provinceCityList.forEach(item=>{
  //   //         if(item.cities){
  //   //           item.cities.forEach(item2 =>{
  //   //             if(Number(cityId) === Number(item2.id)){
  //   //               vm.props.fetchAreaDict(cityId,res=>{
  //   //                 let a = vm.initBMap(map,BMap,item2.cityName,cityId)
  //   //                 if(a){
  //   //                   vm.drawAreaDict()
  //   //                 }
  //   //               })
  //   //               return false
  //   //             }
  //   //           })
  //   //         }
  //   //       })
  //   //     }
  //   //   }
  //   //   console.log("检索到",vm.state.cityId,vm.state.cityName)
  //   // })
  //
  //   //map.addControl(new BMap.NavigationControl3D())
  //
  //   if(vm.state.keyword){
  //     map.centerAndZoom(cityName, 16)
  //     setTimeout(()=>{
  //       let even ={
  //         keyCode : 13
  //       }
  //       document.getElementById("searchIcon").click()
  //       //vm.mapSearchEnter(even,2)
  //     },1000)
  //   }
  // }
  
  // 获取当前地图区域范围内的左下角到右上角的坐标
  getMapPostions = () =>{
    let vm = this
    let SW_LNG = vm.map.getBounds().getSouthWest().lng
    let SW_LAT = vm.map.getBounds().getSouthWest().lat
    let NE_LNG = vm.map.getBounds().getNorthEast().lng
    let NE_LAT = vm.map.getBounds().getNorthEast().lat
    let postions = {
      SW_LNG,
      SW_LAT,
      NE_LNG,
      NE_LAT
    }
    console.log("左下角",vm.map.getBounds().getSouthWest().lng, vm.map.getBounds().getSouthWest().lat)
    console.log("右上角",vm.map.getBounds().getNorthEast().lng, vm.map.getBounds().getNorthEast().lat)
    return postions
  }
  
  initData = (cityId, val,SW_LNG,SW_LAT,NE_LNG,NE_LAT) =>{
    const parm = {
      cityId: cityId,
      sourceSite: val,
      maxLatitude:NE_LAT,
      maxLongitude:NE_LNG,
      minLatitude: SW_LAT,
      minLongitude:SW_LNG
  }
    this.setState({loading:true})
    this.props.getMapCheckPriceConfig({cityId}, res=>{})
    this.props.fetchProjectPriceList(parm, res =>{
      if(res.code === '200'){
        this.setState({dataList:res.data})
        this.setState({loading:false})
        this.markMap(res.data)
        console.log("projectPriceList", this.props.model.get('projectPriceList').toJS())
      }
    })
  }
  
  drawAreaDict = () =>{
    let vm = this
    const regionOptions = this.props.model.get('areaList').toJS()
    console.log("regionOptions",regionOptions)
    // 创建文本标注对象
    /* eslint-disable */
    regionOptions.map(item =>{
      var html = `<div id="myArea" class="myRmHover" style="color: #FFFFFF;padding: 16px;border-radius: 100px; cursor: pointer; border: 2px solid #33ab9e;text-align: center; white-space:nowrap; background: #33ab9e;color: #FFFFFF;box-shadow: 3px 3px 4px rgba(0,0,0,0.3)">
               ${item.label}
            </div>`
      var point = new vm.BMap.Point(item.longitude, item.latitude);
      var myArea= new vm.BMapLib.RichMarker(html, point,{"anchor" : new vm.BMap.Size(-64, -40),"enableDragging" : true});
      myArea.disableDragging();//设置Marker不能拖拽 否则是enableDragging();
      myArea.addEventListener("onclick", function() {     //点击事件
       vm.map.centerAndZoom(point, 16)
        const {SW_LNG,SW_LAT,NE_LNG,NE_LAT} = vm.getMapPostions()
        vm.initData(vm.state.cityId,vm.state.radioType,SW_LNG,SW_LAT,NE_LNG,NE_LAT)
      })
      vm.map.addOverlay(myArea);
    })
    let list = document.getElementsByClassName('myRmHover');
    for (var i = 0; i < list.length; i++) {
      list[i].parentNode.setAttribute("class", "myRmHoverM");
    }
  }

  // 初始化地图
  initBMap = (map,BMap,cityName,cityId) => {
    const that = this
    // 添加带有定位的导航控件
    that.setState({cityName,cityId})
    console.log("初始化地图",that.state.cityId,that.state.cityName)
    map.centerAndZoom(cityName, 11)
  
    const navigationControl = new BMap.NavigationControl({
      // 靠左上角位置
      anchor: 'BMAP_ANCHOR_TOP_LEFT',
      // LARGE类型
      type: 'BMAP_NAVIGATION_CONTROL_LARGE',
      // 启用显示定位
      enableGeolocation: false
    })
    map.addControl(navigationControl)

    // 添加定位控件
    const geolocationControl = new BMap.GeolocationControl()
    map.addControl(geolocationControl)

    // 添加地图类型控件
    /* eslint-disable */
    const mapTypeControl = new BMap.MapTypeControl({
      mapTypes: [
        BMAP_NORMAL_MAP,
        BMAP_PERSPECTIVE_MAP,
        BMAP_SATELLITE_MAP,
        BMAP_HYBRID_MAP
      ]
    })
    map.addControl(mapTypeControl)
    // 开启鼠标滚轮缩放
    map.enableScrollWheelZoom(true)
    map.addEventListener('click', e => {
      // 如是已删除的楼盘
      that.setState({
        searchStyle: false,
        searchValue: '',
      })
    })
    // S 搜索
    // 百度地图API功能
    function G(id) {
      return document.getElementById(id)
    }
    
    return true
  }
  
  /*解析弹出模板的需要参数*/
  formatTemplate = (str) => {
    var srcReg = /"(.*?)"/g;
    var arr =  str.match(srcReg);
    var src = arr[0].replace(/\"/g, "");
    console.log(src);
    return src
  }
  
  
  onCancelLable =()=>{
    debugger
  }
  
  // 动态完成各个网站数据详情字符串拼接
  dynamicStr = data =>{
    let that = this;
    let ajk_url = '';
    let ajk_url_blank = true;
    let lj_url = '';
    let lj_url_blank = true;
    let bk_url = '';
    let bk_url_blank = true;
    let wb_url = '';
    let wb_url_blank = true;
    let fjw_url = '';
    let fjw_url_blank = true;
    let ftx_url = '';
    let ftx_url_blank = true;
    let qfw_url = '';
    let qfw_url_blank = true;
    let ajkAvgPriceColor = "color" + data.ajkAvgPriceColor;
    let bkAvgPriceColor = "color" + data.bkAvgPriceColor;
    let fjwAvgPriceColor = "color" + data.fjwAvgPriceColor;
    let ftxAvgPriceColor = "color" + data.ftxAvgPriceColor;
    let ljAvgPriceColor = "color" + data.ljAvgPriceColor;
    let qfwAvgPriceColor = "color" + data.qfwAvgPriceColor;
    let vagueAvgPriceColor = "color" + data.vagueAvgPriceColor;
    let wbAvgPriceColor = "color" + data.wbAvgPriceColor;
    if(that.props.mapCheckPriceConfig.ajkDomainUrl){
      ajk_url = `${that.props.mapCheckPriceConfig.ajkDomainUrl}/sale/?kw=${data.projectName}`
    }else{
      ajk_url = "javascript:void(0);"
      ajk_url_blank = false;
    }
    if(that.props.mapCheckPriceConfig.ljDomainUrl){
      lj_url = `${that.props.mapCheckPriceConfig.ljDomainUrl}/ershoufang/c2411049480522/?sug=${data.projectName}`
    }else{
      lj_url = "javascript:void(0);"
      lj_url_blank = false;
    }
    if(that.props.mapCheckPriceConfig.bkDomainUrl){
      bk_url = `${that.props.mapCheckPriceConfig.bkDomainUrl}/ershoufang/c2411049480522/?sug=${data.projectName}`
    }else{
      bk_url = "javascript:void(0);"
      bk_url_blank = false;
    }
    if(that.props.mapCheckPriceConfig.wbDomainUrl){
      wb_url = `${that.props.mapCheckPriceConfig.wbDomainUrl}/ershoufang/?key=${data.projectName}`
    }else{
      wb_url = "javascript:void(0);"
      wb_url_blank = false;
    }
    if(that.props.mapCheckPriceConfig.fjwDomainUrl){
      fjw_url = `${that.props.mapCheckPriceConfig.fjwDomainUrl}/zoushi?cityName=${data.cityName}&__s=1&region=&keyword=${data.projectName}`
    }else{
      fjw_url = "javascript:void(0);"
      fjw_url_blank = false;
    }
    if(that.props.mapCheckPriceConfig.ftxDomainUrl){
      ftx_url = `${that.props.mapCheckPriceConfig.ftxDomainUrl}house/kw${data.projectName}/`
    }else{
      ftx_url = "javascript:void(0);"
      ftx_url_blank = false;
    }
    if(that.props.mapCheckPriceConfig.qfwDomainUrl){
      qfw_url = `${that.props.mapCheckPriceConfig.qfwDomainUrl}/sale?keyword=${data.projectName}`
    }else{
      qfw_url = "javascript:void(0);"
      qfw_url_blank = false;
    }
    var htmlMode = `<div class="htmlMode" style="font-weight: normal;white-space: nowrap;display: flex;flex-direction: column;color: #363636;padding: 0px;border-radius: 4px;width: 200px">
            <div style="margin-bottom: 0; padding: 2px 10px;height: 50px;line-height:48px;border-bottom: 1px solid #e0d8d8;"><span style="float: left">各类价格</span><span id="CancelLable" style="float: right">X</span></div>
            <div style="height: 26px;font-size: 14px;margin-bottom: 0; padding: 0px 10px;"><a style="color: #333333">行政区均价: <span class="color" >${data.areaAvgPrice || '-'}</span></a> </div>
            <div style="height: 26px;font-size: 14px;margin-bottom: 0; padding: 0px 10px;"><a style="color: #333333">片区均价: <span class="color" >${data.subAreaAvgPrice || '-'}</span></a> </div>
            <div style="height: 26px;font-size: 14px;margin-bottom: 0; padding: 0px 10px;"><a style="color: #333333">挂牌基准价: <span class="color" >${data.projectAvgPrice || '-'}</span></a> </div>
            <div style="height: 26px;font-size: 14px;margin-bottom: 0; padding: 0px 10px;"><a style="color: #333333">挂牌案例均价: <span class="color" >${data.fdcAvgPrice || '-'}(${data.fdcCaseCount || '-'})</span></a> </div>
            
<!--            <div style="height: 26px;font-size: 14px;margin-bottom: 0; padding: 2px 2px;"><a style="color: #333333">FDC: <span class="color" >${data.fdcAvgPrice || '-'}(${data.fdcCaseCount || '-'})</span></a> </div>-->
            <div style="height: 26px;font-size: 14px;margin-bottom: 0; padding: 0px 10px;"><a style="color: #333333">模糊估价: <span class="${vagueAvgPriceColor}"  >${data.vagueAvgPrice || '-'}</span></a> </div>
            <p style="margin-bottom: 0; padding: 0px 10px;"><a style="color: #333333" href="${ajk_url}" ${ajk_url_blank ? 'target="_blank"' : ''}>安居客:<span class="${ajkAvgPriceColor}" >${data.ajkAvgPrice || '-'}(${data.ajkCaseCount || '-'})</span></a></p>
            <p style="margin-bottom: 0; padding: 0px 10px;"><a style="color: #333333" href="${lj_url}" ${lj_url_blank ? 'target="_blank"' : ''}>链家:<span class="${ljAvgPriceColor}">${data.ljAvgPrice || '-'}(${data.ljCaseCount || '-'})</span> </a> </p>
            <p style="margin-bottom: 0; padding: 0px 10px;"><a style="color: #333333" href="${bk_url}" ${bk_url_blank ? 'target="_blank"' : ''}>贝壳:<span class="${bkAvgPriceColor}">${data.bkAvgPrice || '-'}(${data.bkCaseCount || '-'})</span></a> </p>
            <p style="margin-bottom: 0; padding: 0px 10px;"><a style="color: #333333" href="${wb_url}" ${wb_url_blank ? 'target="_blank"' : ''}>58:<span class="${wbAvgPriceColor}" >${data.wbAvgPrice || '-'}(${data.wbCaseCount || '-'})</span></a> </p>
            <p style="margin-bottom: 0; padding: 0px 10px;"><a style="color: #333333" href="${fjw_url}" ${fjw_url_blank ? 'target="_blank"' : ''}>房价网:<span class="${fjwAvgPriceColor}">${data.fjwAvgPrice || '-'}(${data.fjwCaseCount || '-'})</span></a> </p>
            <p style="margin-bottom: 0; padding: 0px 10px;"><a style="color: #333333" href="${ftx_url}" ${ftx_url_blank ? 'target="_blank"' : ''}>房天下:<span class="${ftxAvgPriceColor}" >${data.ftxAvgPrice || '-'}(${data.ftxCaseCount || '-'})</span></a> </p>
            <p style="margin-bottom: 0; padding: 0px 10px;"><a style="color: #333333" href="${qfw_url}" ${qfw_url_blank ? 'target="_blank"' : ''}>Q房网:<span class="${qfwAvgPriceColor}" >${data.qfwAvgPrice || '-'}(${data.qfwCaseCount || '-'})</span></a> </p>
            <div style="height:10px;margin-bottom: 0; padding: 0px 10px;"></div>
            </div>`
    return htmlMode;
  }
  
  markMap = projectDataList => {
    // const BMap = window.BMap;
    const vm = this;
    this.map.clearOverlays();
    var markers = [];
    var pt = null;
    var point = null;
    let countNum = 0;
  
    // 定义自定义覆盖物的构造函数
    function SquareOverlay(point, text) {
      this._point = point
      this._text = text
    }
  
    // 继承API的BMap.Overlay
    SquareOverlay.prototype = new BMap.Overlay()
  
    // 实现初始化方法
    SquareOverlay.prototype.initialize = function(map) {
      // 保存map对象实例
      this._map = map
      // 创建div元素，作为自定义覆盖物的容器
      var div = document.createElement('div')
      div.style.position = 'absolute'
      // 可以根据参数设置元素外观
      div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat)
      div.style.backgroundColor = '#EE5D5B'
      div.style.border = '1px solid #EE5D5B'
      div.style.color = 'white'
      div.style.padding = '3px 8px'
      div.style.whiteSpace = 'nowrap'
      div.style.MozUserSelect = 'none'
      div.style.fontSize = '14px'
      var span = (this._span = document.createElement('span'))
      div.appendChild(span)
      span.appendChild(document.createTextNode(this._text))
      // 将div添加到覆盖物容器中
      var arrow = (this._arrow = document.createElement('div'))
      arrow.style.background =
          'url(http://map.baidu.com/fwmap/upload/r/map/fwmap/static/house/images/label.png) no-repeat'
      arrow.style.position = 'absolute'
      arrow.style.width = '11px'
      arrow.style.height = '10px'
      arrow.style.top = '27px'
      arrow.style.left = '10px'
      arrow.style.overflow = 'hidden'
      div.appendChild(arrow)
      map.getPanes().labelPane.appendChild(div)
      // 保存div实例
      this._div = div
      // 需要将div元素作为方法的返回值，当调用该覆盖物的show、
      // hide方法，或者对覆盖物进行移除时，API都将操作此元素。
      return div
    }
    // 实现绘制方法
    SquareOverlay.prototype.draw = function() {
      // 根据地理坐标转换为像素坐标，并设置给容器
      var position = this._map.pointToOverlayPixel(this._point)
      this._div.style.left =
          position.x - parseInt(this._arrow.style.left) + 'px'
      this._div.style.top = position.y - 56 + 'px'
    }
    // 实现显示方法
    SquareOverlay.prototype.show = function(){
      if (this._div){
        this._div.style.display = "block";
      }
    }
    // 实现隐藏方法
    SquareOverlay.prototype.hide = function(){
      if (this._div){
        this._div.style.display = "none";
      }
    }
    // //4、自定义覆盖物添加事件方法
    // SquareOverlay.prototype.addEventListener = function(event,fun){
    //   this._div['on'+event] = fun;
    // }
    
    //var infoWindow = new BMap.InfoWindow(htmlMode);
    
    projectDataList.map(item=>{
      var html = `<div data-projectId="${item.projectId}" class="myRmHover" style="z-index: 1000000; cursor: pointer; border: 2px solid #33ab9e; white-space:nowrap; display: flex;flex-direction: row;background: #33ab9e;color: #FFFFFF;padding: 4px;border-radius: 4px;box-shadow: 3px 3px 4px rgba(0,0,0,0.3)">
            <span style="border-right: 2px solid #fafafa;padding: 0px 4px;">${item.projectName || '-'}</span>
            <span style="padding: 0px 4px;">${item.projectAvgPrice || '-'}</span>
            <span style="padding: 0px 4px;">(${item.caseCount || '-'})</span>
            <span style="padding: 0px 4px;background: #ffffff;color: #000000">${item.deliveryDate ? moment(item.deliveryDate).format('YYYY') : '-'}</span>
            <span class="sanjiaox" style="left: 56px;width: 0px;height: 0px;border-left: 9px solid transparent; border-right: 9px solid transparent;border-top: 9px solid #33ab9e;top: 32px;position: absolute;"></span>
            </div>`
      point = new vm.BMap.Point(item.longitude, item.latitude);
      //var myRM= new BMapLib.RichMarker(html, point,{"anchor" : new vm.BMap.Size(-72, -64),"enableDragging" : true});
      var myRM= new vm.BMapLib.RichMarker(html, point,{"anchor" : new vm.BMap.Size(-64, -40),"enableDragging" : true});

      //{"anchor" : {BMap.Size} Marker的的位置偏移值, "enableDragging" : {Boolean} 是否启用拖拽，默认为false}

      myRM.disableDragging();//设置Marker不能拖拽 否则是enableDragging();
      //ondblclick
  
      var basePoint =new vm.BMap.Point(item.longitude, item.latitude);
      //画圆
      var circle = new BMap.Circle(basePoint,this.props.mapCheckPriceConfig.aroundDistance*1000,{
        StrokeStyle: "dashed",
        strokeOpacity: 1, // 轮廓
        fillColor: "#ff6600",
        fillOpacity: 0.1, // 填充
        strokeColor: '#ff6600',
        strokeWeight: 2,
      });
  
      //var myRMode= new BMapLib.RichMarker(htmlMode, basePoint,{"anchor" : new vm.BMap.Size(-60, -320),"enableDragging" : true});
      //myRMode.disableDragging();//设置Marker不能拖拽 否则是enableDragging();
 
      //var myRMode = new SquareOverlay(new BMap.Point(item.longitude, item.latitude),"1111111111111111");
      var opts = {
        position:  new BMap.Point(item.longitude, item.latitude), // 指定文本标注所在的地理位置
        offset: new BMap.Size(-64, -406) // 设置文本偏移量
      };
  
      // marker添加点击事件
      //
      myRM.addEventListener("ondblclick", function(e) {
        // var mPoint = new vm.BMap.Point(e.target._position.lat,e.target._position.lng);
        // vm.map.centerAndZoom(mPoint,17);
        var projectId = vm.formatTemplate(e.target._content)
        vm.setState({projectId:projectId})
        let parms = {
          projectId,
          cityId: vm.state.cityId
        }
        vm.props.getMapCheckPrice(parms, res=>{
          //获取挂牌基准价详情
          if(res.code === '200'){
            vm.setState({
              visible: true,
            });
            vm.setState({priceDtail: res.data,AvgPriceTop:"",AvgPriceTopColor: ''})
            vm.props.form.setFieldsValue({
              projectAvgPrice: "",
            })
            console.log(res.data);
          }
        })
        //alert(e.type); //点击Marker时，派发事件的接口 --{"target : {BMap.Overlay} 触发事件的元素, "type：{String} 事件类型}
      });
      myRM.addEventListener("onclick", function(e) {     //点击事件
        // var markerInfo = new BMap.Marker(new BMap.Point(item.longitude, item.latitude));
        // vm.map.addOverlay(markerInfo);
        // markerInfo.openInfoWindow(infoWindow);
        //vm.map.removeOverlay(label);
        //vm.map.removeOverlay(myRMode);
        vm.map.removeOverlay(vm.state.LastLabel)
        var projectId = vm.formatTemplate(e.target._content)
        vm.setState({projectId:projectId})
        let parms = {
          projectId,
          cityId: vm.state.cityId
        }
        vm.props.GetMapCheckPriceDetail(parms, res=>{
          if(res.code === "200"){
            vm.setState({loading:false})
            //        创建文本标注对象
            var label = new BMap.Label(vm.dynamicStr(res.data), opts);
//        自定义文本标注样式
            label.setStyle({
              color: 'blue',
              borderRadius: '12px',
              borderColor: '#d2cdcd',
              padding: '0px',
              fontSize: '16px',
              lineHeight: '30px',
              fontFamily: '微软雅黑',
              backgroundColor:' #FFFFFF',
              opacity:'1',
              zIndex: '1000000000 !important',
              boxShadow: 'rgba(0, 0, 0, 0.5)1px 1px 7px 2px'
            });
            // setTimeout (function(){
            //
            // },3000)
            vm.map.addOverlay(label);
            vm.setState({LastLabel: label})
            vm.map.centerAndZoom(basePoint);
            console.log("label",label)
            document.getElementById('CancelLable').onclick = ()=>{
              vm.map.removeOverlay(label);
            }
            // label.addEventListener("onclick", function() {     //点击事件
            //   vm.map.removeOverlay(label);
            // })
          }
        })
      })
      
      myRM.addEventListener("onmouseout", function() {   // 鼠标移入事件
        vm.map.removeOverlay(circle);
        //vm.map.addOverlay(myRMode);
        //myRMode.hide()
        //鼠标移出Marker时，派发事件的接口target 、type、point、pixel
      });
     
      myRM.addEventListener("onmouseover", function() {    // 鼠标离开事件
        //vm.map.centerAndZoom(basePoint,15)
        vm.map.addOverlay(circle);
        
        // 绘制圆
        //鼠标移到Marker上时，派发事件的接口target 、type、point、pixel
      });
  
      // myRMode.addEventListener("click",function(){
      //   alert('click');
      //   myRMode.hide()
      // });
      this.map.addOverlay(myRM);// 设置显示覆盖物标志
      //map.removeOverlay(myRM);//map.removeOverlay方法移除覆盖物
      //markers.push(new vm.BMap.Marker(ppt))
    })
    let list = document.getElementsByClassName('myRmHover');
    for (var i = 0; i < list.length; i++) {
      list[i].parentNode.setAttribute("class", "myRmHoverP");
    }
    if(document.getElementsByClassName('myRmHover')[0]){
      document.getElementsByClassName('myRmHover')[0].parentNode.parentNode.setAttribute("class", "myRmHoverF");
    }
    //var markerClusterer = new BMapLib.MarkerClusterer(this.map, {markers:markers});
    //vm.map.addOverlay(markerClusterer)
  }
  
  //添加圆覆盖物
  addCircle = () => {
    circle = new this.BMap.Circle({
      center:new this.BMap.LngLat("22.813986","108.378062"),// 圆心位置
      radius:10000, //半径
      strokeColor: "#F33", //线颜色
      strokeOpacity: 1, //线透明度
      strokeWeight: 3, //线粗细度
      fillColor: "#ee2200", //填充颜色
      fillOpacity: 0.35//填充透明度
    });
    circle.setMap(mapObj);
  }
  
  projectOnClick= (val) =>{
  }
  
  // 循环清楚搜索出来的地理坐标
  removeOverlayMap = (markerList) =>{
    let that = this
    markerList.map(item =>{
      that.map.removeOverlay(item)
    })
  }
  
  //地图搜索回车事件
  mapSearchEnter = (e,type) =>{
    let that = this
    that.removeOverlayMap(this.state.markerList)   //清除上次搜索的结果
    that.map.removeOverlay(this.state.newMarker)
    const code = e.keyCode
    if(code===13||type){
      let countNum = 0
      var options = {
        onSearchComplete: function (results) {
          that.setState({
            searchStyle: true
          })
          //that.map.clearOverlays()
          // 判断状态是否正确
          if (local.getStatus() === BMAP_STATUS_SUCCESS) {
            let list = []
            // getCurrentNumPois()
            //results.getCurrentNumPois()
            for (var i = 0; i < results.getCurrentNumPois(); i++) {
              if(i===0&&(type!==2||code===13)){
                that.map.centerAndZoom(results.getPoi(i).point, 16)
              }
              // if(index===0&&(type!==2||code===13)){
              //   that.map.centerAndZoom(item.point, 16)
              // }
              var basePoint = new BMap.Point(
                  results.getPoi(i).point.lng,
                  results.getPoi(i).point.lat
                  // item.point.lng,
                  // item.point.lat
              )
              
              var myIcon = new BMap.Icon(
                'https://webmap0.bdimg.com/wolfman/static/common/images/markers_new2_7621a9c.png',
                new BMap.Size(21, 33),
                {
                  offset: new BMap.Size(countNum, 21), // 指定定位位置
                  imageOffset: new BMap.Size((0 - countNum) * 21, 0) // 设置图片偏移
                  // imageOffset: new BMap.Size((0 - countNum) * 21, -61) // 设置图片偏移
                }
              )
              var marker = new BMap.Marker(basePoint, { icon: myIcon })
              marker.disableMassClear()   // 不允许被清除
              if(type!==2||code===13){
                that.map.addOverlay(marker)
              }
              
              // S 点击标注显示信息窗口
              var openInfoWindow = function(marker, point, title, address) {
                // 定义自定义覆盖物的构造函数
                function SquareOverlay(point, text) {
                  this._point = point
                  this._text = text
                }
                // 继承API的BMap.Overlay
                SquareOverlay.prototype = new BMap.Overlay()
                
                // 实现初始化方法
                SquareOverlay.prototype.initialize = function(map) {
                  // 保存map对象实例
                  this._map = map
                  // 创建div元素，作为自定义覆盖物的容器
                  var div = document.createElement('div')
                  div.style.position = 'absolute'
                  // 可以根据参数设置元素外观
                  div.style.zIndex = '10000000000'
                  // div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat)
                  div.style.backgroundColor = '#EE5D5B'
                  div.style.border = '1px solid #EE5D5B'
                  div.style.color = 'white'
                  div.style.padding = '3px 8px'
                  div.style.whiteSpace = 'nowrap'
                  div.style.MozUserSelect = 'none'
                  div.style.fontSize = '14px'
                  var span = (this._span = document.createElement('span'))
                  div.appendChild(span)
                  span.appendChild(document.createTextNode(this._text))
                  // 将div添加到覆盖物容器中
                  var arrow = (this._arrow = document.createElement('div'))
                  arrow.style.background =
                    'url(http://map.baidu.com/fwmap/upload/r/map/fwmap/static/house/images/label.png) no-repeat'
                  arrow.style.position = 'absolute'
                  arrow.style.width = '11px'
                  arrow.style.height = '10px'
                  arrow.style.top = '27px'
                  arrow.style.left = '10px'
                  arrow.style.overflow = 'hidden'
                  div.appendChild(arrow)
                  map.getPanes().labelPane.appendChild(div)
                  // 保存div实例
                  this._div = div
                  // 需要将div元素作为方法的返回值，当调用该覆盖物的show、
                  // hide方法，或者对覆盖物进行移除时，API都将操作此元素。
                  return div
                }
                // 实现绘制方法
                SquareOverlay.prototype.draw = function() {
                  // 根据地理坐标转换为像素坐标，并设置给容器
                  var position = this._map.pointToOverlayPixel(this._point)
                  this._div.style.left =
                    position.x - parseInt(this._arrow.style.left) + 'px'
                  this._div.style.top = position.y - 56 + 'px'
                }
                var mySquare = new SquareOverlay(point, title)
                var circle = null
                setTimeout(()=>{
                   circle = new that.BMap.Circle(point,that.props.mapCheckPriceConfig.aroundDistance*1000,{
                    StrokeStyle: "dashed",
                    strokeOpacity: 1, // 轮廓
                    fillColor: "#ff6600",
                    fillOpacity: 0.1, // 填充
                    strokeColor: '#ff6600',
                    strokeWeight: 2,
                    zIndex: 1000
                  })
                },100)
                marker.addEventListener('mouseover', function() {
                  // 添加自定义覆盖物
                  //画圆
                  that.map.addOverlay(circle);
                  that.map.addOverlay(mySquare)
                
                })
                marker.addEventListener('mouseout', function() {
                  // 删除自定义覆盖物
                  that.map.removeOverlay(circle)
                  that.map.removeOverlay(mySquare)
                })
              }
              openInfoWindow(
                marker,
                basePoint,
                  results.getPoi(i).title,
                  results.getPoi(i).address
              )
              countNum++
              marker.getPoi =results.getPoi(i)
              console.log(marker.getPoi)
              list.push(marker)
              // s.push(results.getPoi(i).title + ", " + results.getPoi(i).address);
            }
            const {SW_LNG,SW_LAT,NE_LNG,NE_LAT} = that.getMapPostions()
            //that.initData(that.state.cityId,that.state.radioType,SW_LNG,SW_LAT,NE_LNG,NE_LAT)
            that.setState({
              markerList:list
            })
          }
        }
      }
      let local = new BMap.LocalSearch(that.map, options)
      local.search(document.getElementById('suggestId').value);
      if(document.getElementById('suggestId').value === ""){
        that.setState({
          searchStyle: false,
          searchValue: ''
        })
      }
    }
  }
  
  searchMouseover = (index) =>{
    let marker = this.state.markerList[index]
    let icon = new BMap.Icon(
      'https://webmap0.bdimg.com/wolfman/static/common/images/markers_new2_7621a9c.png',
      new BMap.Size(21, 33),
      {
        offset: new BMap.Size(index, 21), // 指定定位位置
        imageOffset: new BMap.Size((0 - index) * 21, -66) // 设置图片偏移
      }
    )
    marker.setIcon(icon)
  }
  
  searchMouseOut = (index) =>{
    let marker = this.state.markerList[index]
    var myIcon = new BMap.Icon(
      'https://webmap0.bdimg.com/wolfman/static/common/images/markers_new2_7621a9c.png',
      new BMap.Size(21, 33),
      {
        offset: new BMap.Size(index, 21), // 指定定位位置
        imageOffset: new BMap.Size((0 - index) * 21, 0) // 设置图片偏移
        // imageOffset: new BMap.Size((0 - countNum) * 21, -61) // 设置图片偏移
      }
    )
    marker.setIcon(myIcon)
  }
  
  searchClick = (index) =>{
    const that = this
    let marker = that.state.markerList[index]
    // let icon = new BMap.Icon(
    //     'https://webmap0.bdimg.com/wolfman/static/common/images/markers_new2_7621a9c.png',
    //     new BMap.Size(21, 33),
    //     {
    //       offset: new BMap.Size(index, 21), // 指定定位位置
    //       imageOffset: new BMap.Size((0 - index) * 21, -66) // 设置图片偏移
    //     }
    // )
    // marker.setIcon(icon)
   
    that.map.removeOverlay(this.state.newMarker)
    //this.map.clearOverlays()
    // this.map.panTo(new BMap.Point(marker.point.lng,marker.point.lat))
    this.map.centerAndZoom(new BMap.Point(marker.point.lng,marker.point.lat),17)
    var basePoint = new BMap.Point(
      marker.point.lng,
      marker.point.lat
    )
  
    var circle = new BMap.Circle(basePoint,this.props.mapCheckPriceConfig.aroundDistance*1000,{
      StrokeStyle: "solid",
      strokeOpacity: 1, // 轮廓
      fillColor: "#ff6600",
      fillOpacity: 0.1, // 填充
      strokeColor: '#ff6600',
      strokeWeight: 2,
    });
    
    let myIcon = new BMap.Icon(
        'https://webmap0.bdimg.com/wolfman/static/common/images/markers_new2_7621a9c.png',
        new BMap.Size(21, 33),
        {
          offset: new BMap.Size(index, 21), // 指定定位位置
          imageOffset: new BMap.Size((0 - index) * 21, -66) // 设置图片偏移
        }
    )
    let newMarker = new BMap.Marker(basePoint, { icon: myIcon })
    newMarker.disableMassClear()
    this.map.addOverlay(newMarker)
    
    //marker.setIcon(icon)
    
    var openInfoWindow = function(marker, point, title, address) {
      // 定义自定义覆盖物的构造函数
      function SquareOverlay(point, text) {
        this._point = point
        this._text = text
      }
      
      // 继承API的BMap.Overlay
      SquareOverlay.prototype = new BMap.Overlay()
      
      // 实现初始化方法
      SquareOverlay.prototype.initialize = function(map) {
        // 保存map对象实例
        this._map = map
        // 创建div元素，作为自定义覆盖物的容器
        var div = document.createElement('div')
        div.style.position = 'absolute'
        // 可以根据参数设置元素外观
        div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat)
        div.style.backgroundColor = '#EE5D5B'
        div.style.border = '1px solid #EE5D5B'
        div.style.color = 'white'
        div.style.padding = '3px 8px'
        div.style.whiteSpace = 'nowrap'
        div.style.MozUserSelect = 'none'
        div.style.fontSize = '14px'
        var span = (this._span = document.createElement('span'))
        div.appendChild(span)
        span.appendChild(document.createTextNode(this._text))
        // 将div添加到覆盖物容器中
        var arrow = (this._arrow = document.createElement('div'))
        arrow.style.background =
          'url(http://map.baidu.com/fwmap/upload/r/map/fwmap/static/house/images/label.png) no-repeat'
        arrow.style.position = 'absolute'
        arrow.style.width = '11px'
        arrow.style.height = '10px'
        arrow.style.top = '27px'
        arrow.style.left = '10px'
        arrow.style.overflow = 'hidden'
        div.appendChild(arrow)
        map.getPanes().labelPane.appendChild(div)
        // 保存div实例
        this._div = div
        // 需要将div元素作为方法的返回值，当调用该覆盖物的show、
        // hide方法，或者对覆盖物进行移除时，API都将操作此元素。
        return div
      }
      // 实现绘制方法
      SquareOverlay.prototype.draw = function() {
        // 根据地理坐标转换为像素坐标，并设置给容器
        var position = this._map.pointToOverlayPixel(this._point)
        this._div.style.left =
          position.x - parseInt(this._arrow.style.left) + 'px'
        this._div.style.top = position.y - 56 + 'px'
      }
      
      var mySquare = new SquareOverlay(point, title)
      
      //var circle = new BMap.Circle(new BMap.Point(Number(point.lat),Number(point.lng)),1000,{fillColor:"blue", strokeWeight: 1 ,fillOpacity: 0.3, strokeOpacity: 0.3,enableEditing:true});
  
      newMarker.addEventListener('mouseover', function() {
        // 添加自定义覆盖物
        that.map.addOverlay(mySquare)
        that.map.addOverlay(circle)
      })
      newMarker.addEventListener('mouseout', function() {
        // 删除自定义覆盖物
        that.map.removeOverlay(mySquare)
        that.map.removeOverlay(circle)
      })
    }
    openInfoWindow(
      newMarker,
      basePoint,
      marker.getPoi.title,
      marker.getPoi.address
    )
    // this.map.setZoom(18)
    this.setState({
      searchStyle: false,
      newMarker: newMarker,
      searchValue:marker.getPoi.province+marker.getPoi.city+marker.getPoi.title
    })
  }
  
  change(e){
    this.setState({
      searchValue:e.target.value
    })
  }


  
  mapSearchPanel = () =>{
    setPlace()
  }
  
  onChangeRadio= (e) =>{
    let vm = this
    let val = e.target.value
    this.setState({radioType : val})
    var ZoomNum = vm.map.getZoom()
    if(ZoomNum>=16){
      const {SW_LNG,SW_LAT,NE_LNG,NE_LAT} = vm.getMapPostions()
      vm.initData(vm.state.cityId,val,SW_LNG,SW_LAT,NE_LNG,NE_LAT)
    }else{
      vm.map.clearOverlays()
      vm.drawAreaDict()
    }
  }
  
  handleOk = e => {
    console.log(e);
    let vm = this;
    if (e) {
      e.preventDefault()
    }
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {projectAvgPrice } = vm.props.form.getFieldsValue(["projectAvgPrice"])
        let parms = {
          cityId: vm.state.cityId,
          projectAvgPrice,
          projectId: vm.state.projectId
        };
        this.setState({
          visible: false,
        })
        this.setState({loading:true})
        this.props.updataMapCheckPrice(parms,res =>{
          if(res.code === "200"){
            this.setState({loading:false})
            Message.warning('更新挂牌价成功')
            let dataList =  vm.state.dataList;
            dataList.map(item=>{
              if(item.projectId === vm.state.projectId){
                item.projectAvgPrice = projectAvgPrice
              }
            })
            vm.markMap(dataList)
          }else{
            Message.warning(res.message)
          }
        })
      }else{
        Message.warning("现价格不能为空")
      }
    })
    
  };
  
  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };
  
  // 楼层数不能大于总楼层数
  isHighter = (rule, value, callback) => {
    const projectAvgPrice = this.props.form.getFieldValue('projectAvgPrice')
    if (projectAvgPrice == '' || projectAvgPrice == null) {
      callback('不能为空')
    }
    callback()
  }
  
  /* 限制数字输入框只能输入整数 */
  limitNumber = value => {
    if (typeof value === 'string') {
      return !isNaN(Number(value)) ? value.replace(/^|[^\d]/g, '') : ''
    } else if (typeof value === 'number') {
      return !isNaN(value) ? String(value).replace(/^|[^\d]/g, '') : ''
    } else {
      return ''
    }
  }
  
  // 现价格改变事件
  onNowChange = (val) =>{
    let vm = this;
    if(val){
      console.log(vm.props.mapCheckPriceConfig);
      const {projectAvgPrice} = this.state.priceDtail;
      const {weightColorUp,weightColorDown} = this.props.mapCheckPriceConfig;
      if(projectAvgPrice){
        let AvgPriceTopNum = (val - projectAvgPrice) /projectAvgPrice * 100 ;
        let AvgPriceTop = Math.abs(AvgPriceTopNum);
    
        if(AvgPriceTop < weightColorDown){
          this.setState({AvgPriceTopColor:styles.colorGreen})
        }else if(AvgPriceTop >= weightColorUp){
          this.setState({AvgPriceTopColor:styles.colorRed})
        }else{
          this.setState({AvgPriceTopColor:styles.colorYellow})
        }
        this.setState({AvgPriceTop:AvgPriceTopNum.toFixed(2)})
      }else{
        this.setState({AvgPriceTop:0})
        this.setState({AvgPriceTopColor:styles.colorGreen})
      }
    }else{
      vm.setState({AvgPriceTop: null})
    }
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
        path: router.RES_PRO_PROJECT_AVG,
        name: '楼盘价格'
      },
      {
        key: 2,
        path: '',
        name: '地图核价'
      }
    ]
    return (
        <Breadcrumb className={styles.breadContainer} separator=">">
          {breadList.map(item => (
              <Breadcrumb.Item key={item.key}>
                {item.icon ? <Icon type={item.icon} /> : ''}
                {item.path ? <Link to={item.path}>{item.name}</Link> : item.name}
              </Breadcrumb.Item>
          ))}
        </Breadcrumb>
    )
  }
  
  renderMode(){
    const {
      form: { getFieldDecorator },
      cityId
    } = this.props
    const {projectName,useMonth,projectAvgPrice} = this.state.priceDtail;
    return (
        <Modal
            maskClosable={false}
            width={360}
            title="修改挂牌基准价"
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
        >
          <div>
            <Form>
            <div ><span  className={styles.modePrice}>楼盘名称:</span> {projectName}</div>
            <div ><span  className={styles.modePrice}>估价月份:</span> {moment(useMonth).format('YYYY-MM-DD')}</div>
            <div ><span  className={styles.modePrice}>原价格(元/m²) :</span> {projectAvgPrice}</div>
            <div ><span  className={styles.modePrice}>现价格(元/m²) :</span>
              {getFieldDecorator('projectAvgPrice', {
                rules: [
                  {
                    required: true,
                    message: '请输入现价格'
                  }
                ],
                // initialValue: this.state.projectAvgPrice
              })(
                  <InputNumber min={0} max={10000000000} formatter={this.limitNumber} parser={this.limitNumber} onChange={this.onNowChange} />
              )}
              {
                this.state.AvgPriceTop  ? (
                    <span className={this.state.AvgPriceTopColor} style={{marginLeft:"10px"}}>{this.state.AvgPriceTop}%</span>
                ):null
              }
            </div>
            </Form>
          </div>
        </Modal>
        //
    )
  }
  
  renderForm(){
    return (
        <div className={styles.mapForm}>
          <Row style={{height:'100%'}}>
            <div className={styles.mapRow}>
              <div className={styles.mapHeader}>
                <div className={styles.mapHeaderTop}>
                  <div id="r-result" className={styles.searchMap}>
                    <Input
                        type="text"
                        id="suggestId"
                        className={styles.searchInput}
                        //onKeyUp={e=>this.mapSearchEnter(e,2)}
                        autoComplete="off"
                        value={this.state.searchValue}
                        onChange={(event)=>{this.change(event)}}
                    />
                    <input type="text" style={{display:"none"}} />
                    <Icon type="search" className={styles.searchIcon} id={"searchIcon"}  onClick={e=>this.mapSearchEnter(e,1)}/>
                    {/* <div className={styles.blockS} onClick={this.searchBlock}>
                <Icon type="search" />
              </div> */}
                  </div>
                  <div id="r-tab" className={styles.searchMapTab}>
                      <Radio.Group onChange={this.onChangeRadio} value={this.state.radioType}>
                        <Radio value="FDC">FDC</Radio>
                        <Radio value="安居客">安居客</Radio>
                        <Radio value="链家">链家</Radio>
                        <Radio value="贝壳">贝壳</Radio>
                        <Radio value="58">58</Radio>
                        <Radio value="房价网">房价网</Radio>
                        <Radio value="房天下">房天下</Radio>
                        <Radio value="Q房网">Q房网</Radio>
                      </Radio.Group>
                  </div>
                </div>
                <Spin  spinning={this.state.loading} style={{ opacity: 0.2, background: '#000' ,width: "100%",zIndex: 2,lineHeight: '600px',position: 'absolute', height:'100%', textAlign:"center", minHeight: '600px'}}>
                </Spin>
                <div id="map" style={{ width: '100%', height: '100%', marginBottom: 24 }}/>
              </div>
              {/*<div id="searchResultPanel" className={styles.searchDownLi} />*/}
              {/*<Icon type="environment" theme="filled"  style={{marginRight:10,fontSize:'20px',color:'#F44336'}}/>*/}
              <div className={styles.mySearchList}  style={{display:this.state.searchStyle?'block':'none'}}>
                <ul>
                  {this.state.markerList ? this.state.markerList.map((item,index) => (
                      <li key={item.getPoi.uid} onMouseOver={()=>this.searchMouseover(index)} onMouseOut={()=>this.searchMouseOut(index)} onClick={()=>this.searchClick(index)}>
                        <span style={{marginRight:10,fontSize:'16px',color:'#F44336',width: '21px',display:'inline-block'}}>{index+1}</span><span style={{marginRight:10,fontSize:'14px',color:'#009688'}}>{item.getPoi.title}</span>
                        <p className={styles.address}>{item.getPoi.address}</p>
                        {/*{*/}
                        {/*  item.getPoi.phoneNumber ? (*/}
                        {/*      <p className={styles.phone}>电话:{item.getPoi.phoneNumber}</p>*/}
                        {/*  ):null*/}
                        {/*}*/}
                      </li>
                  )) : null}
                </ul>
              </div>
            </div>
          </Row>
          {/*<Row className={styles.searchMap}>*/}
          {/* <input
            style={{ border: '1px solid #D9D9D9' }}
            type="text"
            name=""
            id=""
          /> */}
      
          {/*</Row>*/}
        </div>
        )
  }
  
  render() {
    return (
        <div className={styles.mapContainer} style={{minHeight: '400px'}}>
          {this.renderBreads()}
          <div className={styles.map}>
              {this.renderForm()}
          </div>
          {this.renderMode()}
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
)(MapValuation)
