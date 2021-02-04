/* eslint-disable */
import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes, {string} from 'prop-types'
import {
  Breadcrumb,
  Icon,
  Form,
  Button,
  Input,
  DatePicker,
  Row,
  Col,
  Select,
  InputNumber,
  Message,
  Modal,
  Cascader,
  Collapse,
  Spin,
  Checkbox, Switch, Table, Popover
} from 'antd'
import Immutable from 'immutable'
import { parse } from 'qs'
import moment, {max} from 'moment'
import { pagePermission } from 'client/utils'
import router from 'client/router'
import ProjectSelect from 'client/components/project-select'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'
import BmapMode from './BmapMode'
import AboutProjectName from  './AboutProjectName2'
import AboutProjectAddress from  './AboutProjectAddress'

import styles from './DataQuick.less'
import {Link} from "react-router-dom"
import actions from "../caseLosure/actions"
const { Panel } = Collapse
const FormItem = Form.Item
const { TextArea } = Input
const Option = Select.Option

const formItemLayout = {
  labelCol: {
    xs: { span: 6 },
    sm: { span: 10 }
  },
  wrapperCol: {
    xs: { span: 6 },
    sm: { span: 14 }
  }
}

/*
 * 数据维护快捷页
 */
export class DataQuick extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    initialFetch: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    addCase: PropTypes.func.isRequired,
    editCase: PropTypes.func.isRequired,
    getCaseDetail: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired,
    fetchProjectsList: PropTypes.func.isRequired,
    fetchBuidingList: PropTypes.func.isRequired,
    getProvinceCityList: PropTypes.func.isRequired,
    getAreaList: PropTypes.func.isRequired,
    getProjectDetail: PropTypes.func.isRequired,
    getBuildingDetail: PropTypes.func.isRequired,
    fetchFloorList: PropTypes.func.isRequired,
    fetchUnitNoList: PropTypes.func.isRequired,
    fetchRoomNumList: PropTypes.func.isRequired,
    fetchValuation: PropTypes.func.isRequired,
    getHouseDetail: PropTypes.func.isRequired,
    saveQuickMaintainData: PropTypes.func.isRequired,
    fetchCompleteHouseData: PropTypes.func.isRequired,
    fetchValidateRegion: PropTypes.func.isRequired,
    fetchQuickDataDetail: PropTypes.func.isRequired,
  }
  comBtnType = false
  projectId = null
  buildingId = null
  houseId = null
  copyHouseList = []
  moreBtn = false
  flag = true
  constructor(props) {
    super(props)
    //toUpperCase()
    //
    const {PROJECTAVGPRICE,HOUSEUSAGENAME,HOUSEPRICERATE,HOUSEUSAGECODE,USAGECODE,USAGENAME,TOTALFLOORNUM,BUILDINGUSAGECODE,BUILDINGUSAGENAME,ISFLOORNUMCOMFIRMED,VILLAPRICE,FLOORNO,UNITNO,ROOMNUM,VQPRICERATE,CASEID,PROVINCENAME,PROVINCEID,CITYID,CITYNAME ,AREAID,AREANAME, PROJECTNAME,PROJECTID,BUILDINGNAME,BUILDINGID,HOUSENAME,HOUSEID,HOUSEAREA} = parse(
      props.location.search.toUpperCase().substr(1)
    )
    // const {caseId,provinceName,provinceId,cityId,cityName ,areaId,areaName, projectName,projectId,buildingName,buildingId,houseName,houseId,houseArea} = parse(
    //     props.location.search.toUpperCase().substr(1)
    // )
    console.log("路由参数:~~~",props.location.search.substr(1))
  
    let projectData = {
      projectName: PROJECTNAME,
      projectId: PROJECTID
    }
    let buildingData = {
      buildingName: BUILDINGNAME,
      buildingId: BUILDINGID
    }
    let houseData = {
      houseName: HOUSENAME,
      houseId: HOUSEID,
      houseArea: HOUSEAREA
    }

    this.state = {
      buildingDataSysStatus: false,
      valuation: '',
      projectNameAdd: false,
      buildingAdd: false,
      houseAdd: false,
      threeDisable: false,
      comBtnName: true,
      quickDataDetail: '', //快捷数据详情
      projectData,
      buildingData,
      houseData,
      defaultAreaIds: [],
      projectDisable: true,
      buildingDisable: true,
      houseDisable: true,
      usageCode: USAGECODE,
      usageName: USAGENAME,
      totalFloorNum: TOTALFLOORNUM,
      buildingUsageCode: BUILDINGUSAGECODE,
      buildingUsageName: BUILDINGUSAGENAME,
      isFloorNumComfirmed: ISFLOORNUMCOMFIRMED,
      villaPrice: parseInt(VILLAPRICE),
      floorNo: FLOORNO,
      unitNo: UNITNO,
      roomNum: ROOMNUM,
      vqPriceRate: VQPRICERATE,
      provinceName:PROVINCENAME,
      provinceId:PROVINCEID,
      cityId: CITYID,
      cityName: CITYNAME,
      areaId: AREAID,
      areaName: AREANAME,
      projectName: PROJECTNAME,
      projectId: PROJECTID,
      buildingName: BUILDINGNAME,
      buildingId: BUILDINGID,
      houseName: HOUSENAME,
      houseId: HOUSEID,
      houseArea: HOUSEAREA,
      houseUsageCode: HOUSEUSAGECODE,
      housePriceRate: HOUSEPRICERATE,
      houseUsageName: HOUSEUSAGENAME,
      projectAvgPrice: parseInt(PROJECTAVGPRICE),
      provinceCityList: [],
      BmapVisible: false, //坐标拾取弹出框,
      houseList: [],   //房号列表
      houseNameTitle: [], //房号标题,
      projectNameData: [], //相关楼盘数据
      projectAddressData: [], //相关地址数据
      // 案例ID
      caseId: CASEID,
      loading: false,
      loadingHouse:false,
      moreModel: false,
      // 校验所在楼层状态
      validateFloorNoStatus: '',
      validateTotalFloorStatus: '',
      validateAreaNameMsg: '',
      isMultyList: [
        {
          label: "是",
          value: '1'
        },
        {
          label: "否",
          value: '0'
        }
      ],
    }
  }
  
  // 获取相关楼盘名称
  getProjectNameCom (arr){
    this.setState({
      projectNameData: arr
    })
  }
  
  // 获取相关地址名称
  getProjectAddressCom (arr){
    this.setState({
      projectAddressData: arr
    })
  }
  
  // 设置房号相关数据显示隐藏
  setHouseDisable= val=>{
    this.setState({houseDisable:val})
  }
  
  // 设置楼栋相关数据显示隐藏
  setHuildingDisable= val=>{
    this.setState({buildingDisable:val})
  }
  
  // 设置楼盘相关数据显示隐藏
  setProjectDisable= val=>{
      this.setState({projectDisable:val})
  }
  
  componentWillMount() {
  }
  
  componentDidMount() {
    let self = this
    const {
      provinceName,
      provinceId,
      cityId,
      cityName,
      areaId,
      areaName,
      projectName,
      projectId,
      buildingName,
      buildingId,
      houseName,
      houseId,
      houseArea,
      usageCode,
      totalFloorNum,
      buildingUsageCode,
      isFloorNumComfirmed,
      villaPrice,
      floorNo,
      unitNo,
      roomNum,
      buildingUsageName,
      usageName,
      vqPriceRate,
      houseUsageCode,
      housePriceRate,
      houseUsageName,
      projectAvgPrice
    } = this.state
    
    if(provinceId && cityId && cityName) {
      const params = {
        cityId: cityId,
        cityName
      }
      this.props.updateVisitCities(params, res => {
        if (res) {
          const { code = 200, message = '' } = res
          if (code === 400) {
            Message.warn(message)
          } else {
            sessionStorage.setItem('FDC_CITY_INFO',JSON.stringify({"id":cityId,"cityName":decodeURI(cityName),"provinceId":provinceId}))
            sessionStorage.setItem('FDC_CITY', cityId)
          }
        }
      })
    }
    
    console.log("sessionStorage",sessionStorage)
    
    if(projectName){
      this.setState({projectDisable:false,buildingDisable:false})
    }
    if(buildingName){
      this.setState({buildingDisable:false,houseDisable:false})
    }
    if(houseName){
      this.setState({houseDisable:false})
    }
    this.setState({loading:true})
    
    this.props.initialFetch()
    setTimeout(() => {
      this.props.getProvinceCityList({returnArea : 1},res =>{
        console.log(res)
        if(res.data.length){
          res.data.forEach(item=>{
              item.value = item.id
              item.label = item.provinceName
              item.children = item.cities
              if(item.children.length){
                item.children.forEach(item2 =>{
                  item2.value = item2.id
                  item2.label = item2.cityName
                  item2.children = item2.areas
                  if(item2.children && item2.children.length){
                    item2.children.forEach(item3 =>{
                      item3.value = item3.id
                      item3.label = item3.areaName
                    })
                  }
                })
              }
            })
          this.setState({provinceCityList:res.data})
        }
      })
    }, 1000)
    setTimeout(() =>{
      let parm = {
        provinceName,
        provinceId,
        cityId,
        cityName,
        areaId,
        areaName,
        projectName,
        projectId,
        buildingName,
        buildingId,
        houseName,
        houseId,
        houseArea,
        usageCode,
        totalFloorNum,
        buildingUsageCode,
        isFloorNumComfirmed,
        villaPrice,
        floorNo,
        unitNo,
        roomNum,
        vqPriceRate,
        houseUsageCode,
        housePriceRate,
        houseUsageName,
        projectAvgPrice,
        isValidateCityPerm: 1
      }
      this.props.fetchQuickDataDetail(parm, res=>{
        this.setState({loading:false})
        if(res.code === '200'){
          if(res.data.result == 1){
            if(res.data.project){
              this.setState({projectData:res.data.project})
              this.projectId = res.data.project.projectId
            }else{
              res.data.project = {}
            }
            if(res.data.building){
              this.setState({buildingData:res.data.building})
				this.buildingId = res.data.building.buildingId
            }else{
              res.data.building = {}
            }
            if(res.data.house){
              this.setState({houseData:res.data.house})
				this.houseId = res.data.house.houseId
            }else{
              res.data.house = {}
            }
            if(res.data.project) {
              this.setProjectDisable(false)
              this.setHuildingDisable(false)
            }
            if(res.data.building){
              this.setProjectDisable(false)
              this.setHuildingDisable(false)
              this.setHouseDisable(false)
            }
            if(res.data.building){
              this.setHuildingDisable(false)
              this.setHouseDisable(false)
            }
            if(res.data.house){
              this.setHouseDisable(false)
            }
            
            if(res.data.provinceId && res.data.cityId && res.data.areaId){
              this.setState({
                defaultAreaIds : [parseInt(res.data.provinceId),parseInt(res.data.cityId),parseInt(res.data.areaId)]
              })
            }
			  
            if(buildingUsageName){
              const usageTypeList = this.props.model.get('usageTypeList').toJS()
              usageTypeList.map(item=>{
                if(item.name == buildingUsageName){
                  res.data.building.buildingUsageCode = Number(item.code)
                  this.setState({buildingData:res.data.building})
                }
              })
            }
            if(usageName){
              const usageTypeList = this.props.model.get('usageTypeList').toJS()
              usageTypeList.map(item=>{
                if(item.name == usageName){
                  res.data.project.usageCode = Number(item.code)
                  this.setState({projectData:res.data.project})
                }
              })
            }
            if(houseUsageName){
              const {
                houseUsageList
              } = this.props.model.toJS()
              //const usageTypeList = this.props.model.get('usageTypeList').toJS()
              houseUsageList.map(item=>{
                if(item.name == houseUsageName){
                  res.data.house.houseUsageCode = Number(item.code)
                  this.setState({houseData:res.data.house})
                }
              })
            }
            
            if(projectAvgPrice){
              this.props.form.setFieldsValue({projectAvgPrice})
              //res.data.project.projectAvgPrice = projectAvgPrice
              //this.setState({projectData:res.data.project})
            }
            if(projectName){
				res.data.project.projectName = projectName
				this.setState({projectData:res.data.project})
			}
            if(usageCode){
              res.data.project.usageCode = Number(usageCode)
              this.setState({projectData:res.data.project})
            }
            if(villaPrice){
              res.data.project.villaPrice = villaPrice
              this.setState({projectData:res.data.project})
            }
            if(buildingName){
              res.data.building.buildingName = buildingName
              this.setState({buildingData:res.data.building})
            }
            if(totalFloorNum){
              res.data.building.totalFloorNum = totalFloorNum
              this.setState({buildingData:res.data.building})
            }
            if(buildingUsageCode){
              res.data.building.buildingUsageCode = Number(buildingUsageCode)
              this.setState({buildingData:res.data.building})
            }
            if(isFloorNumComfirmed){
              res.data.building.isFloorNumComfirmed = isFloorNumComfirmed
              this.setState({buildingData:res.data.building})
            }
  
            if(houseUsageCode){
              res.data.house.houseUsageCode = Number(houseUsageCode)
              this.setState({houseData:res.data.house})
            }
            if(housePriceRate){
              res.data.house.housePriceRate = housePriceRate
              this.setState({houseData:res.data.house})
            }
            if(vqPriceRate){
              res.data.house.vqPriceRate = vqPriceRate
              this.setState({houseData:res.data.house})
            }
            if(floorNo){
              res.data.house.floorNo = floorNo
              this.setState({houseData:res.data.house})
            }
            if(unitNo){
              res.data.house.unitNo = unitNo
              this.setState({houseData:res.data.house})
            }
            if(roomNum){
              res.data.house.roomNum = roomNum
              this.setState({houseData:res.data.house})
            }
            if(houseName){
              res.data.house.houseName = houseName
              this.setState({houseData:res.data.house})
            }
            
            if(buildingName|| buildingId || buildingUsageName || totalFloorNum || buildingUsageCode || isFloorNumComfirmed){
              this.setState({buildingAdd: true})
            }
            if(projectName || provinceId || usageName || usageCode || villaPrice || projectAvgPrice){
              this.setState({projectNameAdd: true})
            }
            if(houseName|| houseId || floorNo || unitNo || roomNum || vqPriceRate || housePriceRate || houseUsageCode || houseUsageName){
              this.setState({threeDisable: true})
            }
	
			  if(res.data.building){
				  this.buildingId = res.data.building.buildingId
			  }
	
			  if(res.data.project){
				  this.projectId = res.data.project.projectId
			  }
	
			  if(res.data.house){
				  this.houseId = res.data.project.houseId
			  }
           
            
            console.log("省市区2",this.state.defaultAreaIds, res.data)
            console.log(this.state.projectData)
          }else{
            Modal.error({
              title: '快捷界面参数校验失败!',
              content: (
                  <div>
                    <p>{res.data.msg}</p>
                  </div>
              ),
              onOk() {self.onOkModal(false)},
            })
          }
        }else{
          Modal.error({
            title: res.message,
            content: (
                <div>
                  {/*<p>{res.message}</p>*/}
                </div>
            ),
            onOk() {self.onOkModal(true)},
          })
        }
      })
    },1000)
  }

  componentWillUnmount() {
  }
  
  onOkModal = val =>{
    console.log(val)
    if(val){
      this.props.history.push({
        pathname: router.HOME,
      })
    }
  }
  
  validateProjectName = () =>
      new Promise(resolve => {
        const { areaIds, projectName } = this.props.form.getFieldsValue([
          'areaIds',
          'projectName'
        ])
        if (areaIds) {
          if (projectName) {
            const data = {
              cityId: this.cityId,
              areaId: areaIds[areaIds.length-1],
              projectName: projectName.trim()
            }
            // 如果是编辑
            if (this.props.projectId) {
              data.id = this.props.projectId
            }
            // this.props.addValidateProjectName(data, (res,code,msg ) => {
            //   this.CheckRechecking(res,code,msg,this.props.projectId)
            // })
          } else {
            this.setState({
              validateProjectNameMsg: '请输入楼盘名称'
            })
          }
        } else {
          // this.setState({
          //   validateAreaNameMsg: '请先选择行政区'
          // })
        }
        resolve()
      })

  // 建筑面积/案例单价 变更 计算总价
  handleHouseAreaBlur = () => {
    const {houseArea, estimateUnitprice,totalPrice,estimateTotalPrice } = this.props.form.getFieldsValue([
      'totalPrice',                //法拍成交总价
      'estimateUnitprice',         //法拍评估单价
      'estimateTotalPrice',        //法拍评估总价
      'houseArea'
    ])
   
    if(houseArea > 0 && totalPrice > 0){
      let unitpriceN = totalPrice / houseArea
      unitpriceN = Number.isNaN(unitpriceN) ? 0 : unitpriceN
      // const unitprice = unitpriceN.toFixed(2)
      const unitprice = unitpriceN
      this.props.form.setFieldsValue({ unitprice })
    }else{
      this.props.form.setFieldsValue({ unitprice: undefined })
    }
    
    if (estimateTotalPrice > 0 && houseArea > 0) {
      let total = estimateTotalPrice / houseArea
      total = Number.isNaN(total) ? 0 : total
      // const estimateUnitprice = total.toFixed(2)
      const estimateUnitprice = total
      this.props.form.setFieldsValue({ estimateUnitprice })
    } else {
      this.props.form.setFieldsValue({ estimateUnitprice: undefined })
    }
  }

  // 楼层数不能大于总楼层数
  isFloorNo = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
        callback('所在楼层应大于0')
    }
    if (value !== 0) {
      const totalFloorNum = this.props.form.getFieldValue('totalFloorNum')
      if (totalFloorNum && value > totalFloorNum) {
        this.setState({
          validateFloorNoStatus: 'error'
        })
        callback('所在楼层不能大于总楼层')
      }
      if (totalFloorNum >= value) {
        this.setState({
          validateFloorNoStatus: 'success',
          validateTotalFloorStatus: 'success'
        })
        this.props.form.setFields({
          totalFloorNum: {
            value: totalFloorNum,
            errors: []
          }
        })
      }
    }
    callback()
  }

  // 楼层数不能大于总楼层数
  isHighter = (rule, value, callback) => {
    const floorNo = this.props.form.getFieldValue('floorNo')
    if (floorNo && value && value < floorNo) {
      this.setState({
        validateTotalFloorStatus: 'error'
      })
      callback('总楼层数不能小于所在楼层')
    }
    if (floorNo <= value || !value) {
      this.setState({
        validateTotalFloorStatus: 'success',
        validateFloorNoStatus: 'success'
      })
      this.props.form.setFields({
        floorNo: {
          value: floorNo,
          errors: []
        }
      })
    }

    callback()
  }

  handleValidateHouseArea = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('建筑面积应大于0')
    }
    callback()
  }

  handleValidateUnitprice = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('案例单价应大于0')
    }
    callback()
  }
  
  handleValidateFloor = (rule, value, callback) => {
    var regPos = /^\d+(\.\d+)?$/
    var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/
    var resf = /[\.]/
    if (value !== undefined && value !== null && value !== '' && value <= 0 ) {
      callback('只能输入大于0的整数')
    }
    if(regPos.test(value) || regNeg.test(value)){
      if(resf.test(value)){
        callback('只能输入大于0的整数')
      }
      callback()
    }
    callback()
  }
  

  // 将 select value值转为string供UI渲染
  formatString = value => {
    let valueString
    if (value) {
      valueString = `${value}`
    }
    if (value === 0) {
      valueString = `${value}`
    }
    return valueString
  }
  
  // 楼盘名称获取焦点回调
  focusProjectName = e =>{
    // const { areaId } = this.props.form.getFieldsValue([
    //   'areaId',
    // ])
    // if(!areaId){
    //   this.props.form.setFieldsValue({projectName: ''})
    //   Message.warning('请先选择行政区再填楼盘名称')
    // }
  }
  
  // 搜索楼盘
  searchProjectsList = e => {
    let self = this
    const { projectName } = self.props.form.getFieldsValue([
      'projectName',
    ])
    if(e && e != projectName){
      this.setState({
        projectData: {},
        buildingData: {},
        houseData: {},
      })
      setTimeout(()=>{
        self.child1.restComDataName([])
        self.child2.restComDataName([])
      },1000)
      this.setState({buildingDisable: false, projectNameAdd: true})
      self.projectId = null
      self.buildingId = null
    }else{
      this.setState({buildingDisable: true,houseDisable: true, projectNameAdd: false})
    }
    const { areaIds } = self.props.form.getFieldsValue([
      'areaIds',
    ])
    let parm = {
      cityId: areaIds[1],
      areaIds: areaIds[2],
      pageNum:1,
      pageSize: 100,
      keyword: e || '',
      statuses: 1
    }
    self.props.fetchProjectsList(parm)
  }
  
  getBuildingDtailOnBlur = value =>{
    let self =  this
    if(value){
      self.props.form.setFieldsValue({buildingUsageCode: '1001001'})
    }
    const { areaIds} = this.props.form.getFieldsValue([
      'areaIds'
    ])
    let parm = {
      areaId: areaIds[2],
      cityId: areaIds[1],
      projectId: self.projectId,
      buildingName : value
    }
    self.setState({loading:true})
    self.props.getBuildingDetail(parm,data =>{
      self.setState({loading:false})
      if(data.sysStatus == 0 || data.sysStatus == -1){
        console.log("楼栋已经被删除")
        self.setState({buildingDataSysStatus:true})
      }else{
        self.setState({buildingData: data,buildingDataSysStatus:false})
        self.buildingId = data.buildingId
      }
    })
  }
  
  // 搜索楼栋
  searchBuildingList = e => {
    let self = this
    self.flag = true
    //self.clearBuildingFrom()
    //self.clearHouseFrom()
    self.setState({
      buildingData: {},
      houseData: {},
    })
    if(e){
      self.setState({houseDisable: false, buildingAdd: true})
    }else{
      self.setState({houseDisable: true ,buildingAdd: false})
    }
    const { areaIds } = self.props.form.getFieldsValue([
      'areaIds',
    ])
    let parm = {
      cityId: areaIds[1],
      pageNum:1,
      pageSize: 100,
      keyword: e || '',
      projectId: self.projectId,
      scopes: 1
    }
    self.props.fetchBuidingList(parm)
  }
  
  // 搜索物理层
  searchFloorList= e => {
    let self = this
    self.moreBtn = false
    //self.clearHouseFrom()
    if(e){
      self.setState({houseAdd : true})
    }
    const { areaIds } = self.props.form.getFieldsValue([
      'areaIds',
    ])
    let parm = {
      cityId: areaIds[1],
      pageNum:1,
      pageSize: 100,
      fieldName: 'floorNo',
      buildingId : self.buildingId
    }
    self.props.fetchFloorList(parm)
  }
  
  // 搜索单元
  searchUnitNoList= e => {
    let self = this
    self.moreBtn = false
    if(e){
      self.setState({houseAdd : true})
    }
    //self.clearHouseFrom()
    const { areaIds } = self.props.form.getFieldsValue([
      'areaIds',
    ])
    self.creatHouseName()
    let parm = {
      cityId: areaIds[1],
      pageNum:1,
      pageSize: 100,
      // unitNo: e || 'undefined',
      fieldName: 'unitNo',
      buildingId : self.buildingId
    }
    self.props.fetchUnitNoList(parm)
  }
  
  // 搜索室号
  searchRoomNumList= e => {
    let self = this
    self.moreBtn = false
    if(e){
      self.setState({houseAdd : true})
    }
    //self.clearHouseFrom()
    const { areaIds } = self.props.form.getFieldsValue([
      'areaIds',
    ])
    self.creatHouseName()
    let parm = {
      cityId: areaIds[1],
      pageNum:1,
      pageSize: 100,
      // roomNum: e || 'undefined',
      fieldName: 'roomNum',
      buildingId : self.buildingId
    }
    self.props.fetchRoomNumList(parm)
  }
  
  // 判断 单元 楼层 室号 是否都有值  有则拼接房号名称切调取房号详情
  creatHouseName = e =>{
    let self = this
    if(e){
      self.setState({threeDisable:true})
    }
    const { unitNo,floorNo,roomNum,totalFloorNum,areaIds} = this.props.form.getFieldsValue([
      'unitNo',
      'floorNo',
      'roomNum',
      'totalFloorNum',
      'areaIds'
    ])
    if(!floorNo && !roomNum)
    {
      self.setState({threeDisable:false})
    }
    let houseName = ''
    if(floorNo && roomNum){
      if(self.moreBtn){
        houseName = this.props.form.getFieldsValue(['houseName']).houseName
      }else{
        houseName = unitNo+floorNo+roomNum
        self.props.form.setFieldsValue({ houseName: houseName})
      }
      let parm = {
        areaId:  areaIds[areaIds.length-1],
        buildingId: self.buildingId,
        cityId: areaIds[1],
        houseName: houseName,
        floorNo: floorNo,
        roomNum: roomNum,
        unitNo: unitNo
      }
      this.setState({loading:true})
      this.props.getHouseDetail(parm,data =>{
        this.setState({loading:false})
        if(data.houseId){
          self.setState({houseData: data})
        }
      })
      
      parm.totalFloorNum = totalFloorNum
      this.setState({loadingHouse:true})
      this.props.fetchCompleteHouseData(parm,res =>{
        this.setState({loadingHouse:false})
        let self = this
        if(res.code === '200'){
          let dataList = res.data.dataList || []
          console.log("补全房号列表前",dataList)
          dataList.map(item2 =>{
            if(item2.houseId){
              item2.isComplete = false
            }
          })
          
          self.setState({
            // moreModel: true,
            houseList: dataList,
            houseNameTitle: res.data.title
          })
          self.copyHouseList = dataList
          console.log("补全房号列表后",dataList)
        }else{
          Message.error(res.message)
        }
      })
    }
  }
  
  getProjectDetailOnBulr = value =>{
    let self =  this
    if(value){
      self.props.form.setFieldsValue({usageCode: 1001001})
    }
    //self.clearProjectFrom()
    const { areaIds} = this.props.form.getFieldsValue([
      'areaIds'
    ])
    let parm = {
      areaId: areaIds[2],
      cityId: areaIds[1],
      //projectId: value,
      projectName: value
    }
    self.setState({loading:true})
    self.props.getProjectDetail(parm, data =>{
      self.setState({loading:false})
      if(data){
        self.setState({projectData: data,buildingDisable:false})
        self.projectId = data.projectId
        setTimeout(()=>{
          if(self.child1 && self.child2){
            self.child1.restComDataName(data.projectAliasList)
            self.child2.restComDataName(data.projectAddressList)
          }
        },1500)
      }
      console.log("楼盘详情获取成功:",this.state.projectData)
    })
  }
  
  // 选择楼盘
  selectCustomorRole = (value, option) => {
    let self =  this
    //self.clearProjectFrom()
    const { areaIds} = this.props.form.getFieldsValue([
      'areaIds'
    ])
    self.props.form.setFieldsValue({ projectName: option.props.children})
    self.projectId = value
    let parm = {
      areaId: areaIds[2],
      cityId: areaIds[1],
      projectId: value,
      projectName: option.props.children
    }
    self.setState({loading:true})
    self.props.getProjectDetail(parm, data =>{
      self.setState({loading:false})
      if(data){
        self.setState({projectData: data})
        setTimeout(()=>{
          if(self.child1 && self.child2){
            self.child1.restComDataName(data.projectAliasList)
            self.child2.restComDataName(data.projectAddressList)
          }
        },1500)
      }
      console.log("楼盘详情获取成功:",this.state.projectData)
    })
  }
  
  // 选择楼栋
  selectBuildingRole = (value, option) => {
    let self =  this
    //self.clearBuildingFrom()
    const { areaIds} = this.props.form.getFieldsValue([
      'areaIds'
    ])
    self.props.form.setFieldsValue({ buildingName: option.props.children})
    self.buildingId = value
    let parm = {
      areaId: areaIds[2],
      cityId: areaIds[1],
      projectId: self.projectId,
      buildingName : option.props.children
    }
    self.setState({loading:true})
    self.props.getBuildingDetail(parm,data =>{
      self.setState({loading:false})
      if(data){
        self.setState({buildingData: data})
      }
    })
  }
  
  // 选择物理层
  selectFloorRole= (value, option) => {
    let self =  this
    //self.clearHouseFrom()
    self.props.form.setFieldsValue({ floorNo: option.props.children})
  }
  
  // 选择单元
  selectUnitNoRole= (value, option) => {
    let self =  this
    //self.clearHouseFrom()
    self.props.form.setFieldsValue({ unitNo: option.props.children})
  }
  
  // 选择室号
  selectRoomNumRole= (value, option) => {
    let self =  this
   // self.clearHouseFrom()
    self.props.form.setFieldsValue({ roomNum: option.props.children})
  }
  
  // 法拍成交总价改变
  totalPriceChange = () =>{
    const {houseArea, totalPrice } = this.props.form.getFieldsValue([
      'unitprice',
      'totalPrice',
      'houseArea'
    ])
    if(houseArea){
      let val = totalPrice / houseArea
      this.props.form.setFieldsValue({ unitprice: val})
    }else{
      this.props.form.setFieldsValue({ unitprice: ''})
    }
  }
  
  // 法拍预估总价改变
  estimateTotalPriceChange = () =>{
    const {houseArea, estimateTotalPrice } = this.props.form.getFieldsValue([
      'estimateTotalPrice',
      'houseArea'
    ])
    if(houseArea){
      let vall = estimateTotalPrice / houseArea
      this.props.form.setFieldsValue({ estimateUnitprice: vall})
    }else{
      this.props.form.setFieldsValue({ estimateUnitprice: ''})
    }
  }
  
  buildingOnclick = (projectId,buildingId,buildingName,cityId) =>{
    let self = this
    self.flag = true
    let cityName = ''
    this.state.provinceCityList.map(item=>{
      if(item.cities){
        /* eslint-disable */
        item.cities.map(item2 =>{
          if(item2.id == cityId){
            cityName = item2.cityName
          }
        })
      }
    })
    const params = {
      cityId: cityId,
      cityName
    }
    self.props.updateVisitCities(params, res => {
      if (res) {
        const { code = 200, message = '' } = res
        if (code === 400) {
          Message.warn(message)
        } else {
          if(self.flag){
            self.flag = false
            window.open(`${router.RES_HOUSE_NUM}?projectId=${projectId}&buildId=${buildingId}&buildingName=${buildingName}&cityId=${cityId}&cityName=${cityName}`)
          }
          // self.props.history.push({
          //   pathname: router.RES_HOUSE_NUM,
          //   search: `projectId=${projectId}&buildId=${buildingId}&buildingName=${buildingName}&cityId=${cityId}&cityName=${cityName}`
          // })
        }
      } else {
        Message.error("跳转出错")
      }
    })
  }
  
  gotoProjectAlias = () =>{
    let self = this
    const { areaIds,projectName } = self.props.form.getFieldsValue(['areaIds','projectName'])
    let cityName = ''
    this.state.provinceCityList.map(item=>{
      if(item.cities){
        /* eslint-disable */
        item.cities.map(item2 =>{
          if(item2.id == areaIds[1]){
            cityName = item2.cityName
          }
        })
      }
    })
    sessionStorage.setItem('FDC_CITY_INFO',JSON.stringify({"id":areaIds[1],"cityName":decodeURI(cityName),"provinceId":areaIds[0]}))
    sessionStorage.setItem('FDC_CITY', areaIds[1])
    self.props.history.push({
      pathname: router.RES_PRO_NAME,
      search: `cityId=${areaIds[1]}&cityName=${cityName}&projectName=${projectName}`
    })
  }

  // 保存数据
  handleSubmit = e => {
    if (e) {
      e.preventDefault()
    }
    let self = this
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { caseId, cityId, houseList = [] } = this.state
        // 删除录入人字段
        //delete values.creator
        let houseListSave = []
        houseList.map((item)=>{
          for(let key  in item){
            if(key == 'actualFloor' || key == 'floorNo'){
            }else{
              let houseEd = item[key].split(',')
              if(houseEd[0]){
                let houseObjec = {
                  actualFloor: item.actualFloor,
                  floorNo: item.floorNo,
                  houseId: houseEd[0],
                  houseName: houseEd[3],
                  roomNum: houseEd[2],
                  unitNo: houseEd[1]
                }
                houseListSave.push(houseObjec)
              }else{
                let houseObjec = {
                  actualFloor: item.actualFloor,
                  floorNo: item.floorNo,
                  // houseId: houseEd[0],
                  houseName: houseEd[3],
                  roomNum: houseEd[2],
                  unitNo: houseEd[1]
                }
                houseListSave.push(houseObjec)
              }
            }
          }
        })
        console.log("保存前打印补全的房号",houseListSave)
  
  
        let parm = {
          areaId: values.areaIds[2],
          building: {
            buildingAlias: values.buildingAlias,
            buildingId: self.buildingId,
            buildingName: values.buildingName,
            buildingPriceRate: values.buildingPriceRate,
            buildingUsageCode: values.buildingUsageCode,
            isFloorNumComfirmed: values.isFloorNumComfirmed,
            totalFloorNum: values.totalFloorNum,
          },
          cityId: values.areaIds[1],
          house: {
            actualFloor: values.actualFloor,
            floorNo: values.floorNo,
            houseArea: values.houseArea,
            houseId: self.houseId,
            houseList: houseListSave,
            houseName: values.houseName,
            housePriceRate: values.housePriceRate,
            vqPriceRate: values.vqPriceRate,
            houseUsageCode: values.houseUsageCode,
            roomNum: values.roomNum,
            unitNo: values.unitNo
          },
          project: {
            deliveryDate: values.deliveryDate,
            landEndDate: values.landEndDate,
            landStartDate: values.landStartDate,
            latitude:  values.latitude,
            longitude:  values.longitude,
            projectAddressList: self.child2 ? self.child2.state.originData : [],
            projectAliasList: self.child1 ? self.child1.state.originData : [],
            projectAvgPrice: values.projectAvgPrice,
            projectId: self.projectId,
            projectName: values.projectName,
            projectPriceTypeCode:  values.projectPriceTypeCode,
            usageCode:  values.usageCode,
            villaPrice:  values.villaPrice,
          }
        }
        
        if(!values.buildingName){
          delete parm.building
        }
        
        if(!values.houseName){
          delete parm.house
        }
        
        //console.log(" this.child.state.originData", self.child1.state.originData)
        //console.log(" this.child.state.originData", self.child2.state.originData)
        //values.caseHappenDate = values.caseHappenDate && values.caseHappenDate.format('YYYY-MM-DD HH:mm:ss')
        self.setState({loading:true})
        self.props.saveQuickMaintainData(parm, res => {
          self.setState({loading:false})
          const { code,data, message } = res
          if (code === '200') {
            Message.success(data)
            // this.props.history.push({
            //   pathname: router.RES_BASEINFO,
            //   // search: caseInfoSearch
            // })
            let cityName = ''
            this.state.provinceCityList.map(item=>{
              if(item.cities){
                /* eslint-disable */
                item.cities.map(item2 =>{
                  if(item2.id == values.areaIds[1]){
                    cityName = item2.cityName
                  }
                })
              }
            })
            const params = {
              cityId: values.areaIds[1],
              cityName
            }
            this.props.updateVisitCities(params, res => {
              if (res) {
                const { code = 200, message = '' } = res
                if (code === 400) {
                  Message.warn(message)
                } else {
                  // window.opener=null;
                  // window.open('','_self');
                  // window.close();
                  // window.open(`${router.RES_BASEINFO}?cityId=${values.areaIds[1]}&cityName=${cityName}`)
                  sessionStorage.setItem('FDC_CITY_INFO',JSON.stringify({"id":values.areaIds[1],"cityName":decodeURI(cityName),"provinceId":values.areaIds[0]}))
                  sessionStorage.setItem('FDC_CITY', values.areaIds[1])
                  self.props.history.push({
                    pathname: router.RES_BASEINFO,
                    search: `cityId=${values.areaIds[1]}&cityName=${cityName}`
                  })
                }
              }
            })
          } else {
            Message.error(message)
          }
        })
      }
    })
  }
  
  handleAdvancePayment = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('变卖预交款应大于0')
    }
    callback()
  }
  
  /*点击获取坐标按钮*/
  getCoordinate = ()=>{
    let self = this
    let point = {
      latitude : '',
      longitude: ''
    }
    this.setState({
      BmapVisible: true
    }, () =>{
      const {areaIds} = self.props.form.getFieldsValue([
        'areaIds',
      ])
      let areaId = areaIds[2]
      console.log("默认省市区",areaId)
      if(areaId){
        /* eslint-disable */
        this.state.provinceCityList.map(item=>{
          if(item.cities){
            /* eslint-disable */
            item.cities.map(item2 =>{
              if(item2.areas){
                /* eslint-disable */
                item2.areas.map(item3 =>{
                  if(item3.id == areaId){
                    point.latitude  = item3.latitude,
                    point.longitude = item3.longitude
                  }
                })
              }
            })
          }
        })
      }
      console.log("找到了对应的区域坐标",point)
      setTimeout(()=>{
        self.child.setPointAdress(point)
      },1000)
    })
  }
  
  /*确认获取坐标按钮*/
  EnterCoordinate = val =>{
    this.setState({
      BmapVisible: false
    })
    if(val){
      console.log(this.child)
      const { longitude, latitude } = this.child.props.form.getFieldsValue([
        'longitude',
        'latitude'
      ])
      this.props.form.setFieldsValue({
        longitude: longitude,
        latitude: latitude,
      })
      //获取子组件的经度纬度
    }
  }
  
  /*确认新增*/
  
  handleValidateLongtitude = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('经度应大于0小于180')
    }
    if (value !== undefined && value !== null && value > 180) {
      callback('经度应大于0小于180')
    }
    callback()
  }
  
  handleValidateLatitude = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('纬度应大于0小于90')
    }
    if (value !== undefined && value !== null && value > 90) {
      callback('纬度应大于0小于90')
    }
    callback()
  }
  
  // 检验总层数跟楼栋用途
  handleValidTotalUsageCode = (rule, value, callback) => {
    if (value) {
      const {
        totalFloorNum,
      } = this.props.form.getFieldsValue([
        'totalFloorNum',
      ])
      if (value === '1001001' || value === '1001002' || value=== '1001003') {
        if(totalFloorNum>80){
          callback('当地上总层数超过80层,楼栋用途不能为居住,居住(别墅),居住(洋房).')
        }else{
          callback()
        }
        // this.props.form.setFieldsValue({buildingUsageCode: ''})
        // Message.error("楼栋用途为居住,居住(别墅),居住(洋房)时,请先选择地上总层数")
      }else{
        callback()
      }
    }
    callback()
  }
  
  // 校验地上总层数
  handleValidTotalFloorNum = (rule, value, callback) => {
    if (value) {
      const {
        buildingUsageCode,
      } = this.props.form.getFieldsValue([
        'buildingUsageCode',
      ])
      if(buildingUsageCode === '1001001' || buildingUsageCode === '1001002' || buildingUsageCode=== '1001003'){
        if(value > 80){
          callback('楼栋用途为居住,居住(别墅),居住(洋房)时,地上总层数不能超过80层')
        }else{
          callback()
        }
      }else{
        callback()
      }
    }
    callback()
  }
  
  stripNum = num => {
    if (num !== null && num !== undefined) {
      return +parseFloat(num)
    }
  }
  
  /*获取自动估值*/
  getValuation = () => {
    const {floorNo,houseArea,totalFloorNum,areaIds} = this.props.form.getFieldsValue(['floorNo','houseArea','totalFloorNum','areaIds'])
    let parm = {
      totalFloorNum: totalFloorNum,
      buildingId: this.buildingId,
      cityId: areaIds[1],
      projectId: this.projectId,
      houseId: this.state.houseData.houseId ? this.state.houseData.houseId : '',
      floorNo: floorNo,
      houseArea: houseArea
    }
    this.props.fetchValuation(parm, res=>{
      if(res.code == 200 && res.data.isAbleEvaluated == 1){
        Message.success("房号可估")
        this.setState({valuation:res.data.unitprice})
      }else if(res.code == 200 && res.data.isAbleEvaluated == 0){
        Message.error("房号不可估")
      }
      else{
        Message.error(res.message)
      }
    })
  }
  
  /*点击弹出更多房号*/
  houseMoreModel= () => {
    let self = this
    self.moreBtn = true
    this.creatHouseName()
    self.setState({
      moreModel: true,
    })
  }
  
  /*省市区改变事件*/
  ProOnChange =val=>{
    let self = this
    let cityId = self.state.defaultAreaIds[1]
    if(val[1] != cityId){
      console.log('城市改变了')
      //self.clearAllFrom()
      self.setState({
        projectData: {},
        buildingData: {},
        houseData: {},
        projectDisable: true,
        buildingDisable: true,
        houseDisable: true
      })
      self.child1.restComDataName([])
      self.child2.restComDataName([])
    }
    if(val.length>0){
      self.setState({projectDisable: false})
    }else{
      self.props.form.resetFields()
      self.setState({projectDisable: true})
    }
  }
  
  // 清空所有表单数据
  clearAllFrom = () =>{
    let self = this
    self.props.form.setFieldsValue({
      buildingAlias: '',
      buildingId: '',
      buildingName: '',
      buildingPriceRate: '',
      buildingUsageCode: '',
      isFloorNumComfirmed: '',
      totalFloorNum: '',
      deliveryDate: '',
      landEndDate: '',
      landStartDate: '',
      latitude: '',
      longitude:  '',
      // projectAddressList: self.child2 ? self.child2.state.originData : [],
      // projectAliasList: self.child1 ? self.child1.state.originData : [],
      projectAvgPrice: '',
      projectId: '',
      projectName: '',
      projectPriceTypeCode:  '',
      usageCode:  '',
      villaPrice:  '',
      actualFloor: '',
      floorNo: '',
      houseArea: '',
      houseId: '',
      //houseList: self.state.houseList,
      houseName: '',
      housePriceRate: '',
      houseUsageCode: '',
      roomNum: '',
      unitNo: ''
    })
  }
  
  // 清空房栋表单
  clearBuildingFrom = () =>{
    let self = this
    self.props.form.setFieldsValue({
      buildingAlias: '',
      buildingId: '',
      buildingName: '',
      buildingPriceRate: '',
      buildingUsageCode: '',
      isFloorNumComfirmed: '',
      totalFloorNum: '',
    })
  }
  
  // 清空楼盘表单
  clearProjectFrom = () =>{
    let self = this
    self.props.form.setFieldsValue({
      deliveryDate: '',
      landEndDate: '',
      landStartDate: '',
      latitude: '',
      longitude:  '',
     // projectAddressList: self.child2 ? self.child2.state.originData : [],
     // projectAliasList: self.child1 ? self.child1.state.originData : [],
      projectAvgPrice: '',
      projectId: '',
      projectName: '',
      projectPriceTypeCode:  '',
      usageCode:  '',
      villaPrice:  '',
    })
  }
  
  // 清空房号表单
  clearHouseFrom = () =>{
    let self= this
    this.props.form.setFieldsValue({
      actualFloor: '',
      //floorNo: '',
      houseArea: '',
      houseId: '',
      //houseList: self.state.houseList,
      houseName: '',
      housePriceRate: '',
      houseUsageCode: '',
     // roomNum: '',
      //unitNo: ''
    })
  }
  
  handleValidDeliveryDate = (rule, value, callback) => {
    if (value) {
      const deliveryDate = value
      const { landStartDate, landEndDate } = this.props.form.getFieldsValue([
        'landStartDate',
        'landEndDate'
      ])
      if (landStartDate || landEndDate) {
        // if (
        //   landStartDate &&
        //   moment(landStartDate).isAfter(moment(deliveryDate), 'day')
        // ) {
        //   callback('土地起始日期不能大于竣工日期')
        // }
        
        if (
            landEndDate &&
            moment(deliveryDate).isAfter(moment(landEndDate), 'day')
        ) {
          callback('竣工日期不能大于土地终止日期')
        }
        this.props.form.setFieldsValue({
          landStartDate,
          landEndDate
        })
        callback()
      } else {
        callback()
      }
    }
    
    callback()
  }
  
  // 土地起始日期 <= 开盘日期、竣工日期 <= 土地终止日期
  handleValidLandStartDate = (rule, value, callback) => {
    if (value) {
      const landStartDate = value
      const {
        deliveryDate,
        landEndDate,
      } = this.props.form.getFieldsValue([
        'deliveryDate',
        'landEndDate',
      ])
      if (deliveryDate || landEndDate ) {
        if (
          deliveryDate &&
          moment(landStartDate).isAfter(moment(deliveryDate), 'day')
        ) {
          callback('土地起始日期不能大于竣工日期')
        }
        
        if (
            landEndDate &&
            moment(landStartDate).isAfter(moment(landEndDate), 'day')
        ) {
          callback('土地起始日期不能大于土地终止日期')
        }
        this.props.form.setFieldsValue({
          deliveryDate,
          landEndDate,
        })
        callback()
      } else {
        callback()
      }
    }
    callback()
  }
  
  handleValidLandEndDate = (rule, value, callback) => {
    if (value) {
      const landEndDate = value
      const {
        landStartDate,
        deliveryDate,
      } = this.props.form.getFieldsValue([
        'landStartDate',
        'openingDate',
        'deliveryDate',
        'expectedDeliveryDate'
      ])
      if (
          landStartDate ||
          deliveryDate
      ) {
        if (
            landStartDate &&
            moment(landStartDate).isAfter(moment(landEndDate), 'day')
        ) {
          callback('土地起始日期不能大于土地终止日期')
        }
        
        if (
            deliveryDate &&
            moment(deliveryDate).isAfter(moment(landEndDate), 'day')
        ) {
          callback('竣工日期不能大于土地终止日期')
        }
        
        this.props.form.setFieldsValue({
          landStartDate,
          deliveryDate,
        })
        callback()
      } else {
        callback()
      }
    }
    
    callback()
  }
  
  // 取消自动补全房号
  completeHouseBtn = val =>{
    let self = this
    const { houseList, comBtnName} = self.state
    let houseListData = houseList
    self.comBtnType = !self.comBtnType
    self.setState({comBtnName:val})
    if(comBtnName){
      houseListData.map(item =>{
        for(let key  in item){
          if(key == 'actualFloor' || key == 'floorNo'){
          }else{
            if(item[key].split(',')[0]){
            }else{
              delete item[key]
            }
          }
        }
        // if(!item3.isComplete){
        //   houseListData.push(item3)
        // }
      })
      self.setState({houseList:houseListData})
    }else{
      //self.setState({houseList:self.copyHouseList})
      self.creatHouseName()
    }
    console.log("houseListData :",self.state.houseList)
  }
  

  renderBreads() {
    const { caseId } = this.state
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
        name: '数据快捷维护页'
      },
      // {
      //   key: 3,
      //   path: '',
      //   name: caseId ? '案例编辑' : '案例新增'
      // }
    ]

    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.name}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )
  }
  
  renderTable() {
    const { houseNameTitle = []} = this.state
    //let houseList = this.state || []
    // houseList.map(name =>{
    //   console.log(name)
    // })
    console.log(houseNameTitle)
    
    /* eslint-disable */
    const columnsDefult = []
    let columnsEnd = []
    /* eslint-disable */
    houseNameTitle.map(item =>{
      let title = ''
      let dataIndex = item.replace(",","").toString()
      if(item == 'floorNo'){
        title = '物理层'
      }else if(item == 'actualFloor'){
        title = '实际层'
      }else{
        title = item.replace(",","").toString()
      }
      let parm = {
          title: title,
          render: (record) =>
              dataIndex == 'floorNo' || dataIndex == 'actualFloor' ?
                  (
                      <span >{record[dataIndex] ? record[dataIndex]: ''}</span>
                  )
                  :(
                      record[dataIndex] && record[dataIndex].split(',')[0] ? (
                          <span className={styles.dataIndexSpan}>{ record[dataIndex].split(',')[3]}</span>
                      ):(
                          <span >{record[dataIndex] ? record[dataIndex].split(',')[3] : ''}</span>
                      )
                  ),
          //dataIndex: item.replace(",","").toString(),
          width: 80
        }
      // let parm = {
      //   title: title,
      //   render: (record) => record.isComplete ? (
      //       <span >{record[dataIndex].split(',')[3] || ''}</span>
      //   ): (
      //       <span className={styles.dataIndexSpan}>{record[dataIndex].split(',')[3] || ''}</span>
      //   ),
      //   //dataIndex: item.replace(",","").toString(),
      //   width: 80
      // }
      // let parm = {
      //   title: title,
      //   render: (record) =>{
      //     for(let key  in record){
      //         if(key == 'actualFloor' || key == 'floorNo'){
      //         }else{
      //           debugger
      //           let row = record[key].split(',')
      //           if(row[0]){
      //             (
      //                 <span >{row[3]}</span>
      //             )
      //           }else{
      //             (
      //                 <span className={styles.dataIndexSpan}>{row[3]}</span>
      //             )
      //           }
      //         }
      //     }
      //   },
        //dataIndex: item.replace(",","").toString(),
      //   width: 80
      // }
      
      columnsDefult.push(parm)
    })
    
    const columns = []
    columnsEnd = [...columnsDefult,...columns]
    console.log("columnsEnd11",columnsEnd)
    
    return (
        <Table
            columns={columnsEnd}
            rowKey="id"
            dataSource={this.state.houseList}
            scroll={{ x: 400, y: 600 }}
            className={styles.defineTable}
            pagination={ false }
        />
    )
  }

  renderForm() {
    const {
      caseId,
      loading,
      cityId,
      houseArea
    } = this.state
    
    let projectData = this.state.projectData || {}
    let buildingData = this.state.buildingData || {}
    let houseData = this.state.houseData || {}

    const { getFieldDecorator } = this.props.form
    /* eslint-disable */
    const {
      areaList,
      priceSourceList,
      houseUsageList,
      ProjectsList,
      buildNameList,
      projectId,
      caseDetail,
      projectDetail,
      buildingDetail,
      // floorList,
      // unitNoList,
      // roomNumList
    } = this.props.model
    
    let  houseAreaDefult = ''
    if(houseArea){
      houseAreaDefult = houseArea
    }else{
      houseAreaDefult = houseData.houseArea
    }
  
    // 主用途列表
    const usageTypeList = this.props.model.get('usageTypeList')
    let houseDetail = this.props.model.get('houseDetail').toJS()
   // const houseList = this.props.model.get('floorList').toJS()
  
    let floorList = this.props.model.get('floorList').toJS() || []
    let unitNoList = this.props.model.get('unitNoList').toJS() || []
    let roomNumList =  this.props.model.get('roomNumList').toJS() || []
    // const areaList = this.props.model.get('areaList')

    let caseHappenDate
    if (caseDetail.get('caseHappenDate')) {
      caseHappenDate = moment(caseDetail.get('caseHappenDate'))
    }
    
    let openDate
    if (caseDetail.get('openDate')) {
      openDate = moment(caseDetail.get('openDate'))
    }
  
    console.log("详情AAA-----",projectData,buildingData,houseData)
    console.log("usageTypeList",usageTypeList.toJSON())

    return (
      <Form onSubmit={this.handleSubmit}>
        <Row>
          <span className={styles.rowTitle}>
            省市区
          </span>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
                label="省市区"
                style={{marginBottom:0}}
                {...formItemLayout}
            >
              {getFieldDecorator('areaIds', {
                rules: [
                  {
                    required: true,
                    message: '请选择省市区'
                  }
                ],
                initialValue: this.state.defaultAreaIds,
                    onChange:this.ProOnChange
              })(
                  <Cascader allowClear={false} options={this.state.provinceCityList}  placeholder="请选择省市区" />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <span className={styles.rowTitle}>
            楼盘相关数据
          </span>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem {...formItemLayout} label="楼盘名称">
              {getFieldDecorator('projectName', {
                rules: [
                  { max: 80, message: '最大长度80个字符' },
                  { required: true, message: '请输入或者选择楼盘名称' }
                  ],
                initialValue: projectData.projectName || ''
              })(
                  <Select
                      disabled={this.state.projectDisable}
                      placeholder="请输入或者选择楼盘名称"
                      mode="combobox"
                      notFoundContent=""
                      showArrow={false}
                      filterOption={false}
                      onBlur = {this.getProjectDetailOnBulr}
                      onFocus={this.searchProjectsList}
                      onChange={this.searchProjectsList}
                      onSelect={this.selectCustomorRole}
                      dropdownMatchSelectWidth={false}
                      dropdownStyle={{ width: 300 }}
                  >
                    {ProjectsList.map(item => (
                        <Option
                            key={item.get('id')}
                            value={item.get('id')}
                        >
                          {item.get('projectName')}
                        </Option>
                    ))}
                  </Select>
              )}
              {
                projectData.validateResult == 1 ? (<span className={styles.viSpan}>有正式楼盘</span>): null ||
                projectData.validateResult == 0 ? (<span className={styles.viSpan}>有已删除楼盘</span>):null ||
                projectData.validateResult == 3 ? (<span className={styles.viSpan}>有重名的楼盘别名 <a onClick={() =>this.gotoProjectAlias()} href="#">请前往处理</a> </span>):null ||
                projectData.validateResult == 4 ? (<span className={styles.viSpan}>有重名的相关楼盘名称</span>): null
              }
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="主用途" {...formItemLayout}>
              {getFieldDecorator('usageCode', {
                rules: [
                  {
                    required: this.state.projectNameAdd,
                    message: '请选择主用途'
                  }
                ],
               initialValue: projectData.usageCode || ''
              })(
                  <Select
                      placeholder="请选择主用途"
                      disabled={this.state.projectDisable}
                  >
                    {usageTypeList.map(item => (
                        <Option key={item.get('code')} value={+item.get('code')}>
                          {item.get('name')}
                        </Option>
                    ))}
                  </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="竣工日期" {...formItemLayout}>
              {getFieldDecorator('deliveryDate', {
                rules: [
                  {
                    validator: this.handleValidDeliveryDate
                  }
                ],
                initialValue: projectData.deliveryDate ? moment(projectData.deliveryDate) : undefined
              })(
                  <DatePicker
                      disabled={this.state.projectDisable}
                      style={{ width: '100%' }}
                  />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="土地起始日期" {...formItemLayout}>
              {getFieldDecorator('landStartDate', {
                rules: [
                  {
                    validator: this.handleValidLandStartDate
                  }
                ],
                initialValue: projectData.landStartDate ? moment(projectData.landStartDate) : undefined
              })(
                  <DatePicker
                      disabled={this.state.projectDisable}
                      style={{ width: '100%' }}
                  />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="土地终止日期" {...formItemLayout}>
              {getFieldDecorator('landEndDate', {
                rules: [
                  {
                    validator: this.handleValidLandEndDate
                  }
                ],
                initialValue: projectData.landEndDate  ? moment( projectData.landEndDate)
                    : undefined
              })(
                  <DatePicker
                      disabled={this.state.projectDisable}
                      style={{ width: '100%' }}
                  />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="经度" {...formItemLayout}>
              {getFieldDecorator('longitude', {
                rules: [
                  {
                   validator: this.handleValidateLongtitude
                  }
                ],
                initialValue: projectData.longitude
                    ? this.stripNum(projectData.longitude)
                    : null
              })(
                  <InputNumber
                      style={{ width: '100%' }}
                      //precision={14}
                      placeholder="请输入经度"
                      min={0}
                      //onBlur={this.handleLngLatBlur}
                      disabled={this.state.projectDisable}
                  />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="纬度" {...formItemLayout}>
              {getFieldDecorator('latitude', {
                rules: [
                  {
                    validator: this.handleValidateLatitude
                  }
                ],
                initialValue: projectData.latitude
                    ? this.stripNum(projectData.latitude)
                    : null
              })(
                  <InputNumber
                      style={{ width: '100%' }}
                      // precision={14}
                      placeholder="请输入纬度"
                      // min={0}
                      // onBlur={this.handleLngLatBlur}
                      disabled={this.state.projectDisable}
                  />
              )}
            </FormItem>
          </Col>
          <Col span={2}>
            <FormItem {...formItemLayout}>
              {/*aboutAreaIds={this.state.defaultAreaIds}*/}
              <Button disabled={!this.props.form.getFieldsValue(['areaIds']).areaIds.length>0} style={{verticalAlign: 'sub',marginLeft:'10px'}} size={'small'}   onClick={this.getCoordinate}>
                坐标拾取
              </Button>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem {...formItemLayout} label="挂牌基准价(元/㎡)">
              {getFieldDecorator('projectAvgPrice', {
                // initialValue: projectData.projectAvgPrice || ''
              })(
                  <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="挂牌基准价"
                      style={{ width: '100%' }}
                      precision={0}
                      
                      disabled={this.state.projectDisable}
                      onChange={this.hanldeProjectAvgPriceBlur}
                  />
              )}
              {/*<span>{projectData.projectAvgPrice || '--'}</span>*/}
            </FormItem>
          </Col>
          <Col span={2}>
            <FormItem {...formItemLayout}>
              <span style={{verticalAlign: 'sub',marginLeft:'10px'}} >{projectData.projectAvgPrice || '--'}</span>
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem {...formItemLayout} label="价格来源">
              {getFieldDecorator('projectPriceTypeCode', {
                initialValue: projectData.projectPriceTypeCode
                    ?   this.formatString(projectData.projectPriceTypeCode)
                    : undefined
              })(
                  <Select
                      style={{ width: '100%' }}
                      placeholder="请选择"
                      allowClear
                      disabled={this.state.projectDisable}
                  >
                    {priceSourceList.map(option => (
                        <Option key={option.get('code')} value={option.get('code')}>
                          {option.get('name')}
                        </Option>
                    ))}
                  </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="别墅" {...formItemLayout}>
              {getFieldDecorator('villaPrice', {
                rules: [
                
                ],
                initialValue: projectData.villaPrice
              })(
                  <InputNumber
                      disabled={this.state.projectDisable}
                      style={{ width: '100%' }}
                      min={0}
                      max={100000000}
                      precision={0}
                      placeholder="请输入别墅价格"
                  />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Collapse  defaultActiveKey={['1']} className={styles.aboutProjectName}>
            <Panel header="相关楼盘名称:" key="1">
              <AboutProjectName onRef={(ref) => { this.child1 = ref; }} ref="projectNameCom" projectId={this.projectId} cityId={this.props.form.getFieldsValue(['areaIds'])} projectName= {this.props.form.getFieldsValue(['projectName'])} aboutName={ projectData.projectAliasList }></AboutProjectName>
            </Panel>
          </Collapse>
          {/*<span className={styles.aboutProjectName}>相关楼盘名称</span>*/}
        </Row>
        <Row>
          <Collapse  defaultActiveKey={['1']} className={styles.aboutProjectName}>
            <Panel header="相关楼盘地址:" key="1">
              <AboutProjectAddress onRef={(ref) => { this.child2 = ref; }} ref="projectAddressCom" projectId={this.projectId} cityId={this.props.form.getFieldsValue(['areaIds'])} aboutAdress={ projectData.projectAddressList }></AboutProjectAddress>
            </Panel>
          </Collapse>
          {/*<span className={styles.aboutProjectName}>相关楼盘名称</span>*/}
        </Row>
        <Row>
          <span className={styles.rowTitle}>
            楼栋相关数据
          </span>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem  {...formItemLayout} label="楼栋名称">
              {getFieldDecorator('buildingName', {
                rules: [
                  {
                    max: 150,
                    message: '最大长度150'
                  }
                 ],
                initialValue:  buildingData.buildingName || undefined
              })(
                  <Select
                      style={{width:'86%',paddingRight: '10px'}}
                      disabled={this.state.buildingDisable}
                      placeholder="请输入或者选择楼栋名称"
                      mode="combobox"
                      notFoundContent=""
                      showArrow={false}
                      filterOption={false}
                      onBlur = {this.getBuildingDtailOnBlur}
                      onChange={this.searchBuildingList}
                      onSelect={this.selectBuildingRole}
                      dropdownMatchSelectWidth={false}
                      dropdownStyle={{ width: 300 }}
                  >
                    {buildNameList.map(item => (
                        <Option
                            key={item.get('id')}
                            value={item.get('id')}
                        >
                          {item.get('buildingName')}
                        </Option>
                    ))}
                  </Select>
              )}
              { buildingData.buildingName && buildingData.buildingId ? (
                  <Button icon="paper-clip" style={{verticalAlign: 'sub'}} size={'small'}  onClick={() =>this.buildingOnclick(projectData.projectId,buildingData.buildingId,buildingData.buildingName,this.props.form.getFieldsValue(['areaIds']).areaIds[1])}>
                  </Button>
                 // <Icon onClick={} type="paper-clip" />
                  // <Link
                  //     className={styles.linkIcon}
                  //     to={{
                  //       pathname: router.RES_HOUSE_NUM,
                  //       search: `projectId=${projectData.projectId}&buildId=${buildingData.buildingId}&buildingName=${buildingData.buildingName}&cityId=${this.props.form.getFieldsValue(['areaIds']).areaIds[1]}`
                  //     }}
                  // >
                  //   <Icon type="paper-clip" />
                  // </Link>
              ):null}
            </FormItem>
            {
              this.state.buildingDataSysStatus ? (<span className={styles.buildSpan}>已删除楼栋</span>): null
            }
          </Col>
          <Col span={6}>
            <FormItem label="地上总层数" {...formItemLayout}>
              {getFieldDecorator('totalFloorNum', {
                rules: [
                  {
                    validator: this.handleValidTotalFloorNum
                  },
                  {
                    required: this.state.buildingAdd,
                    message: '请输入地上总层数'
                  }
                ],
                initialValue: this.stripNum(buildingData.totalFloorNum)
                    || undefined
              })(
                  <InputNumber
                      disabled={this.state.buildingDisable}
                      style={{ width: '100%' }}
                      min={1}
                      // max={totalFloorMaxNum}
                      placeholder="地上总层数"
                      //onBlur={this.handleTotalFloorBlur}
                  />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="是否确认总层数" {...formItemLayout}>
              {getFieldDecorator('isFloorNumComfirmed', {
                rules: [
                  {
                    required:this.state.buildingAdd,
                    message: '请选择是否确认总层数'
                  }
                ],
                initialValue: Number(buildingData.totalFloorNum)>0 ? "1" : this.formatString(buildingData.isFloorNumComfirmed)
              })(
                  <Select placeholder="请选择"
                  disabled={this.state.buildingDisable}
                  >
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="楼栋用途" {...formItemLayout}>
              {getFieldDecorator('buildingUsageCode', {
                rules: [
                  {
                    required: this.state.buildingAdd,
                    message: '请选择楼栋用途'
                  },
                  {
                    validator: this.handleValidTotalUsageCode
                  },
                ],
                initialValue: this.formatString(buildingData.buildingUsageCode)
                    || undefined
              })(
                  <Select
                      placeholder="请选择"
                      disabled={this.state.buildingDisable}
                      //onBlur={this.buildingUsageChange}
                  >
                    {usageTypeList.map(item => (
                        <Option value={item.get('code')} key={item.get('code')}>
                          {item.get('name')}
                        </Option>
                    ))}
                  </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="楼栋别名" {...formItemLayout}>
              {getFieldDecorator('buildingAlias', {
                rules: [
                  {
                    max: 50,
                    message: '最大长度50'
                  }
                ],
                initialValue: this.formatString(buildingData.buildingAlias)
                    || undefined
              })(
                  <Input
                      disabled={this.state.buildingDisable}
                      placeholder="请输入"
                      autosize={{ maxRows: 4 }}
                      // maxLength="50"
                  />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="楼栋系数" {...formItemLayout}>
              {getFieldDecorator('buildingPriceRate', {
                rules: [
                  // {
                  //   max: 50,
                  //   message: '最大长度50'
                  // }
                ],
                initialValue: this.formatString(buildingData.buildingPriceRate)
                    || undefined
              })(
                  <InputNumber
                      min={1}
                      maxLength={10}
                      disabled={this.state.buildingDisable}
                      style={{ width: '100%' }}
                      placeholder="请输入"
                      precision={4}
                  />
                  // <TextArea
                  //     disabled={this.state.buildingDisable}
                  //     placeholder="请输入"
                  //     autosize={{ maxRows: 4 }}
                  //     precision={4}
                  //     // maxLength="50"
                  // />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
           <span className={styles.rowTitle}>
            房号相关数据
          </span>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem {...formItemLayout} label="物理层">
              {getFieldDecorator('floorNo', {
                rules: [
                  {
                    required: this.state.threeDisable,
                    message: '请选择物理层'
                  },
                  {
                    validator: this.handleValidateFloor
                  }
                ],
                initialValue:  this.formatString(houseData.floorNo) || ''
              })(
                  <Select
                      disabled={this.state.houseDisable}
                      placeholder="请输入或者选择物理层"
                      mode="combobox"
                      notFoundContent=""
                      showArrow={false}
                      filterOption={false}
                      onBlur = {this.creatHouseName}
                      onFocus={this.searchFloorList}
                      onSelect={this.selectFloorRole}
                      dropdownMatchSelectWidth={false}
                      dropdownStyle={{ width: 300 }}
                  >
                    {floorList.map((item,index) => (
                        <Option
                            key={index.toString()}
                            value={index.toString()}
                        >
                          {item.toString()}
                        </Option>
                    ))}
                  </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...formItemLayout} label="单元">
              {getFieldDecorator('unitNo', {
                rules: [
                  {
                    max: 20,
                    message: '最长20个字符'
                  },
                  // {
                  //   required: this.state.threeDisable,
                  //   message: '请选择单元'
                  // }
                ],
                initialValue: this.formatString(houseData.unitNo) || ''
              })(
                  <Select
                      disabled={this.state.houseDisable}
                      placeholder="请输入或者选择单元"
                      mode="combobox"
                      notFoundContent=""
                      showArrow={false}
                      filterOption={false}
                      onBlur = {this.creatHouseName}
                      onFocus={this.searchUnitNoList}
                      onSelect={this.selectUnitNoRole}
                      dropdownMatchSelectWidth={false}
                      dropdownStyle={{ width: 300 }}
                  >
                    {unitNoList.map((item,index) => (
                        <Option
                            key={index.toString()}
                            value={index.toString()}
                        >
                          {item.toString()}
                        </Option>
                    ))}
                  </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem {...formItemLayout} label="室号">
              {getFieldDecorator('roomNum', {
                rules: [
                  {
                    max: 20,
                    message: '最长20个字符'
                  },
                  {
                    required: this.state.threeDisable,
                    message: '请选择室号'
                  }
                ],
                initialValue:  this.formatString(houseData.roomNum) || ''
              })(
                  <Select
                      disabled={this.state.houseDisable}
                      placeholder="请输入或者选择室号"
                      mode="combobox"
                      notFoundContent=""
                      showArrow={false}
                      filterOption={false}
                      onBlur = {this.creatHouseName}
                      onFocus={this.searchRoomNumList}
                      onSelect={this.selectRoomNumRole}
                      dropdownMatchSelectWidth={false}
                      dropdownStyle={{ width: 300 }}
                  >
                    {roomNumList.map((item,index) => (
                        <Option
                            key={index.toString()}
                            value={index.toString()}
                        >
                          {item.toString()}
                        </Option>
                    ))}
                  </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...formItemLayout} label="房号名称">
              {getFieldDecorator('houseName', {
                rules: [
                  {
                    whitespace: true,
                    message: '房号名称不能为空'
                  },
                  {
                    max: 30,
                    message: '最大长度30'
                  },
                  {
                   // required: this.props.form.getFieldsValue(['roomNum']) || this.props.form.getFieldsValue(['floorNo']) ? true : false,
                    message: '请选择楼栋用途'
                  }
                ],
                initialValue: houseData.houseName || ''
              })(
                  <Input
                      disabled={this.state.houseDisable}
                      maxLength={30}
                      placeholder="请输入房号名称"
                      onBlur={this.handleHouseNameInput}
                  />
              )}
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem {...formItemLayout}>
              <Button  onClick={this.houseMoreModel} style={{verticalAlign: 'sub',marginLeft:'10px'}}  size={'small'}>
                更多
              </Button>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem {...formItemLayout} label="房屋用途">
              {getFieldDecorator('houseUsageCode', {
                initialValue: this.formatString(houseData.houseUsageCode)
              })(
                  <Select
                      disabled={this.state.houseDisable}
                      placeholder="请选择"
                      style={{ width: '100%' }}
                      allowClear
                  >
                    {houseUsageList.map(option => (
                        <Option key={option.get('code')} value={option.get('code')}>
                          {option.get('name')}
                        </Option>
                    ))}
                  </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...formItemLayout} label="实际层">
              {getFieldDecorator('actualFloor', {
                rules: [
                  {
                    max: 20,
                    message: '最大长度20'
                  }
                ],
                initialValue:houseData.actualFloor || ''
              })(
                  <Input
                      disabled={this.state.houseDisable}
                      style={{ width: '100%' }}
                      maxLength={20}
                      placeholder="请输入"
                      onBlur={this.handleChangeName}
                  />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem {...formItemLayout} label="建筑面积">
              {getFieldDecorator('houseArea', {
                rules: [
                  {
                    validator: this.handleValidateHouseArea
                  }
                ],
                initialValue: houseAreaDefult
              })(
                  <InputNumber
                      max={100000}
                      //min={0}
                      disabled={this.state.houseDisable}
                      style={{ width: '100%' }}
                      placeholder="请输入建筑面积"
                      precision={2}
                      onBlur={this.handleHouseAreaBlur}
                  />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...formItemLayout} label="价格系数">
              {getFieldDecorator('housePriceRate', {
                initialValue: houseData.housePriceRate
              })(
                  <InputNumber
                      disabled={this.state.houseDisable}
                      min={0.5}
                      max={3}
                      style={{ width: '100%' }}
                      placeholder="请输入"
                      precision={4}
                  />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem {...formItemLayout} label="VQ价格系数">
              {getFieldDecorator('vqPriceRate', {
                initialValue: houseData.vqPriceRate
              })(
                  <InputNumber
                      disabled={this.state.houseDisable}
                      min={0.5}
                      max={3}
                      style={{ width: '100%' }}
                      placeholder="请输入"
                      precision={4}
                  />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...formItemLayout} label="自动估值单价">
              {getFieldDecorator('valuation', {
                rules: [
                  // {
                  //   max: 100,
                  //   message: '最大长度100'
                  // }
                ],
                initialValue: this.state.valuation || undefined
              })(
                  <Input placeholder="请输入自动估值单价" disabled={true} />
                  )}
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem {...formItemLayout}>
              <Button style={{verticalAlign: 'sub',marginLeft:'10px'}} size={'small'} onClick={this.getValuation}>
                获取估值
              </Button>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem {...formItemLayout} label=" " colon={false}>
              {(
                <Fragment>
                  {pagePermission('fdc:hd:residence:rental:add') ? (
                    <Button
                      type="primary"
                      loading={loading}
                      htmlType="submit"
                      icon="save"
                    >
                      保存
                    </Button>
                  ) : (
                    ''
                  )}
                </Fragment>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
  
  render() {
    return (
        <Spin style={{height:'100%'}} spinning={this.state.loading} delay={500}>
    
        <div className={styles.mapQuikly}>
          {this.renderBreads()}
          <div className={styles.container}>{this.renderForm()}</div>
          <Modal
              title="坐标拾取"
              centered
              visible={this.state.BmapVisible}
              onOk={() => this.EnterCoordinate(true)}
              onCancel={() => this.EnterCoordinate(false)}
              width={1000}
          >
            <BmapMode onRef={ref =>this.child = ref}></BmapMode>
          </Modal>
          <Modal
              title="房号列表"
              centered
              visible={this.state.moreModel}
              //onOk={() => this.setState({moreModel:false})}
              onCancel={() => this.setState({moreModel:false})}
              width={1000}
              footer={
                [] // 设置footer为空，去掉 取消 确定默认按钮
              }

          >
            <Spin spinning={this.state.loadingHouse} delay={500}>
              {this.renderTable()}
            </Spin>
            <div style={{paddingTop: '10px',width: '100%', textAlign: 'center'}}>
              <Button
                  type={this.state.comBtnName? '' : 'primary'}
                  className={this.state.comBtnName? styles.exitCom : ''}
                  onClick={() =>this.completeHouseBtn(this.comBtnType)}
              >
                {this.state.comBtnName? '取消自动补全房号': '自动补全房号'}
              </Button>
            </div>
          </Modal>
        </div>
        </Spin>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    modelSelector,
    containerActions
  )
)(DataQuick)
