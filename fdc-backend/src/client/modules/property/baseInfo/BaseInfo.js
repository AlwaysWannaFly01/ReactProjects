import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import showTotal from 'client/utils/showTotal'
import {
  Table,
  Form,
  Row,
  Col,
  Input,
  Button,
  Checkbox,
  Message,
  Alert,
  Icon,
  Breadcrumb,
  Popover,
  Modal, message
} from 'antd'
import { parse } from 'qs'

import router from 'client/router'
import layout from 'client/utils/layout'
import shallowEqual from 'client/utils/shallowEqual'
// import wrapAuthButton from 'client/utils/auth/authButton'
import moment from 'moment'
import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './BaseInfo.less'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const confirm = Modal.confirm

const projectOptions = [
  {
    label: '正式楼盘',
    value: '1'
  },
  {
    label: '已删除楼盘',
    value: '0'
  }
]

/**
 * 住宅 楼盘列表
 * author: YJF
 */
class BaseInfo extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    getBaseInfoList: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    baseInfoList: PropTypes.array.isRequired,
    initialFetch: PropTypes.func.isRequired,
    delProjects: PropTypes.func.isRequired,
    restoreProjects: PropTypes.func.isRequired,
    getCityCount: PropTypes.func.isRequired,
    defaultCity: PropTypes.object.isRequired,
    getDefaultCity: PropTypes.func.isRequired,
    exportOnceCase: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired,
    addValidateProjectName: PropTypes.func.isRequired,
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  /* eslint-disable */
  constructor(props) {
    super(props)
    const { areaId = '', keyword = '', pageNum = 1, statuses } = parse(
      props.location.search.substr(1)
    )
    // console.log(areaId, keyword, pageNum, statuses, 11)
    let initialStatuses = []
    if (statuses) {
      initialStatuses = statuses.split(',')
    }

    this.state = {
      // 行政区id
      areaId,
      // 选中的筛选范围 id数组
      checkedProjectList: statuses !== undefined ? initialStatuses : ['1'],
      // 是否全部选中
      checkedAllProject: false,
      indeterminateProject: true,

      // 选中的行政区范围 id数组
      checkedRegionList: areaId ? areaId.split(',') : [],
      checkedAllRegion: false,
      indeterminateRegion: true,

      // 选中table数据
      selectedRowKeys: [],
      selectedRows: [],

      keyword,
      pageNum,

      restoreBtnLoading: false
    }
  }
  componentWillMount() {
  }
  
  componentDidMount() {
    setTimeout(() => {
      // this.props.getVisitCities(res=>{
      //   console.log(res)
      //   let provinceList = res.provinces
      //   const checkedProvince = provinceList.filter(
      //     item => item.get('id') === searchParam.cityId
      //   )
      //   console.log(checkedProvince)
      // })
      const { id } = this.props.defaultCity
      this.cityId = sessionStorage.getItem('FDC_CITY') || id
      this.proviceId =
        JSON.parse(sessionStorage.getItem('FDC_CITY_INFO')).provinceId || ''
      this.cityName =
        JSON.parse(sessionStorage.getItem('FDC_CITY_INFO')).cityName || '北京市'
      let searchParam = this.UrlSearch()
      if (this.cityId) {
        if(searchParam.outLink){
          const params = {
            cityId: searchParam.cityId?searchParam.cityId:(searchParam.cityName?null:this.cityId),
            cityName:searchParam.cityName?decodeURI(searchParam.cityName):null
          }
          this.props.updateVisitCities(params, res => {
            if (res) {
              if (!res.data&&res.code === '400') {
                Message.warn(res.message)
                return
              } else {
                sessionStorage.setItem('FDC_CITY',res.data.id)
                this.cityId = res.data.id
                let baseInfoSearch = '?'
                if(searchParam.cityId||searchParam.cityName){
                  if(searchParam.cityId){
                    sessionStorage.setItem('FDC_CITY',searchParam.cityId)
                    baseInfoSearch+=  `cityId=${searchParam.cityId}`
                  }
                  if(searchParam.cityName){
                    baseInfoSearch+=  `&cityName=${decodeURI(res.data.cityName)}`
            
                  }
                }
                if(searchParam.keyword){
                  this.state.keyword = decodeURI(searchParam.keyword)
                  if(baseInfoSearch.length>1){
                    baseInfoSearch += `&keyword=${decodeURI(searchParam.keyword)}`
                  }else {
                    baseInfoSearch += `keyword=${decodeURI(searchParam.keyword)}`
                  }
                }
                if(searchParam.outLink){
                  baseInfoSearch += `&outLink=${searchParam.outLink}`
                }
                sessionStorage.setItem('FDC_CITY_INFO',JSON.stringify({"id":res.data.id,"cityName":decodeURI(res.data.cityName),"provinceId":res.data.provinceId}))
                this.props.history.push({
                  pathname: this.props.location.pathname,
                  search: baseInfoSearch
                })
              }
              this.initialPage()
            }
          })
        }else {
          this.initialPage()
        }
      } else {
        // 手动获取一次城市权限
        this.props.getDefaultCity(cityId => {
          if (cityId) {
            this.cityId = cityId
            this.initialPage()
          } else {
            this.props.history.push({
              pathname: router.HOME
            })
          }
        })
      }
    }, 1000)
  }

  componentWillReceiveProps(nextProps) {
    // 点击左边的菜单栏, 回到默认查询条件
    if (
      !shallowEqual(this.props.location, nextProps.location) &&
      nextProps.location.search === ''
    ) {
      this.props.form.resetFields()
      this.setState(
        {
          areaId: '',
          checkedProjectList: ['1'],
          checkedAllProject: false,
          indeterminateProject: true,

          checkedRegionList: [],
          checkedAllRegion: false,
          indeterminateRegion: true,
          selectedRowKeys: [],
          selectedRows: [],
          keyword: '',
          pageNum: 1
        },
        () => {
          // 清除查询条件
          sessionStorage.removeItem('BASE_INFO_SEARCH')
          this.initialFetch()
        }
      )
    }
  }
  shouldComponentUpdate(newProps, newState) {
    return true
  }
  // componentWillUpdate(nextProps, nextState) {
  //   this.initialFetch()
  // }
  
  
  
  UrlSearch = () => {
    let name,value;
    let str=this.context.router.history.location.search; //取得整个地址栏
    let num=str.indexOf("?")
    str=str.substr(num+1); //取得所有参数   stringvar.substr(start [, length ]
    let arr=str.split("&"); //各个参数放到数组里
    let obj = {}
    for(var i=0;i < arr.length;i++){
      num=arr[i].indexOf("=");
      if(num>0){
        name=arr[i].substring(0,num);
        value=arr[i].substr(num+1);
        obj[name]=value;
      }
    }
    return obj
  }
  
  initialPage = () => {
    // 获取列表数据
    this.initialFetch()
    this.props.getCityCount(this.cityId)
  }

  initialFetch = () => {
    let searchParam = this.UrlSearch()
    const { pageNum, checkedProjectList, areaId, keyword } = this.state
    // 初始化参数
    if (this.cityId) {
      const searchBaseInfo = {
        pageNum,
        pageSize: 20,
        cityId: this.cityId,
        keyword
      }
      if (checkedProjectList.length) {
        searchBaseInfo.statuses = checkedProjectList.join(',')
      }
      if (areaId) {
        searchBaseInfo.areaIds = areaId
      }
      const searchAreaList = {
        cityId: this.cityId
      }
      this.props.initialFetch(searchBaseInfo, searchAreaList,res=>{
        if(res.records&&res.records.length===1&&searchParam.outLink){
          const search = `projectId=${res.records[0].id}&status=${res.records[0].status}&cityId=${
                    this.cityId
                  }&cityName=${this.cityName}&proviceId=${this.proviceId}&outLink=${searchParam.outLink}`
          this.props.history.push({
            pathname: router.RES_BASEINFO_ADD,
            search: search,
            listSearch:this.props.location.search
          })
        }
      })
    }
  }

  onCheckAllProjectChange = e => {
    const projectOptionsValue = []
    projectOptions.forEach(item => {
      projectOptionsValue.push(item.value)
    })
    this.setState({
      checkedProjectList: e.target.checked ? projectOptionsValue : [],
      indeterminateProject: false,
      checkedAllProject: e.target.checked
    })
  }

  onCheckProjectChange = checkedList => {
    this.setState({
      checkedProjectList: checkedList,
      indeterminateProject:
        !!checkedList.length && checkedList.length < projectOptions.length,
      checkedAllProject: checkedList.length === projectOptions.length
    })
  }

  onCheckAllRegionChange = e => {
    const regionOptions = this.props.model.get('areaList').toJS()
    const regionOptionsValue = []
    regionOptions.forEach(item => {
      regionOptionsValue.push(item.value)
    })
    this.setState({
      checkedRegionList: e.target.checked ? regionOptionsValue : [],
      indeterminateRegion: false,
      checkedAllRegion: e.target.checked
    })
  }

  onCheckRegionChange = checkedList => {
    const regionOptions = this.props.model.get('areaList').toJS()
    this.setState({
      checkedRegionList: checkedList,
      indeterminateRegion:
        !!checkedList.length && checkedList.length < regionOptions.length,
      checkedAllRegion: checkedList.length === regionOptions.length
    })
  }

  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    this.setState({
      selectedRowKeys: []
    })
    const { checkedRegionList, checkedProjectList } = this.state
    const keyword = this.props.form.getFieldValue('keyword')
    // console.log(checkedRegionList, 222)
    const searchBaseInfo = {
      pageNum,
      pageSize: 20,
      cityId: this.cityId,
      keyword: keyword ? keyword.trim() : ''
    }
    if (!searchBaseInfo.keyword || searchBaseInfo.keyword === undefined) {
      searchBaseInfo.keyword = ''
    }
    if (checkedRegionList.length) {
      searchBaseInfo.areaIds = checkedRegionList.join(',')
    }
    if (checkedProjectList.length) {
      searchBaseInfo.statuses = checkedProjectList.join(',')
    }

    this.props.getBaseInfoList(searchBaseInfo,res=>{
      if(res.code==='400'){
        Message.error(res.message)
      }
    })

    const { keyword: searchKeyword, areaIds, statuses } = searchBaseInfo
    const baseInfoSearch = `statuses=${statuses || ''}&areaId=${areaIds ||
      ''}&keyword=${searchKeyword || ''}&pageNum=${pageNum}`
    // 将楼盘列表查询条件设置到 sessionStorage
    sessionStorage.setItem('BASE_INFO_SEARCH', baseInfoSearch)
    this.context.router.history.push({
      pathname: this.props.location.pathname,
      search: baseInfoSearch
    })
  }

  handleConfirmDelete = () => {
    const that = this
    confirm({
      title: '您是否确定删除?',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        that.handleDelete()
      }
    })
  }

  handleDelete = () => {
    // 删除操作前端过滤选中的已删除楼盘
    const idsArr = []
    this.state.selectedRows.forEach(item => {
      if (item.status === 1) {
        idsArr.push(item.id)
      }
    })
    if (idsArr.length > 0) {
      const ids = idsArr.join(',')
      const cityId = this.cityId
      this.props.delProjects(ids, cityId, () => {
        Message.success('删除成功')
        this.handleSearch(null, 1)
      })
    } else {
      Message.info('未选中正式楼盘')
    }
  }

  handleRestore = () => {
    const that = this
    this.setState({
      restoreBtnLoading: true
    })
    const cityId = this.cityId
    // 还原操作前端过滤选中的正式楼盘
    const idsArr = []
    let projectName = null
    let areaId = null
    this.state.selectedRows.forEach((item,index) => {
      let time = moment(item.modTime).format('YYYYMMDDHHmmss')
      if (item.status === 0) {
        idsArr.push(item.id)
        if(index===0){
          projectName = item.projectName.replace(time,'')
          areaId = item.areaId
        }
      }
    })
    const ids = idsArr.join(',')
      if (idsArr.length > 0) {
        if(idsArr.length > 1){
          this.props.restoreProjects(ids, cityId, res => {
            const { code, message } = res
            if (+code === 400) {
              Message.error(message)
            } else {
              Message.success(res || '还原成功')
              this.handleSearch(null, 1)
            }
            this.setState({
              restoreBtnLoading: false
            })
          })
        }else {
          const data = {
            cityId: this.cityId,
            areaId,
            projectName: projectName.trim(),
            isIgnoreDeleteProject:1
          }
          this.props.addValidateProjectName(data, (res,code,msg ) => {
            if (res.result === 3) {
              this.setState({
                restoreBtnLoading: false
              })
            }
            if (res.result === 4) {
              that.setState({
                restoreBtnLoading: false
              })
              confirm({
                title: '温馨提示：',
                content:
                  '有重名的相关楼盘名称，是否删除该相关楼盘名称？',
                onOk() {
                  that.props.delProjectAlia({ids:res.projectAliasIds[0],cityId:that.cityId,isDeleteRelateProjectAlias:true}, () => {
                    Message.success({content: '删除该相关楼盘名称成功!', duration: 1 })
                    setTimeout(()=>{
                      that.props.restoreProjects(ids, cityId, res => {
                        const { code, message } = res
                        if (+code === 400) {
                          Message.error(message)
                        } else {
                          Message.success(res || '还原成功')
                          that.handleSearch(null, 1)
                        }
                      })
                    },1000)
                  })
                }
              })
              return
            }
            that.props.restoreProjects(ids, cityId, res => {
              that.setState({
                restoreBtnLoading: false
              })
              const { code, message } = res
              if (+code === 400) {
                Message.error(message)
              } else {
                Message.success(res || '还原成功')
                that.handleSearch(null, 1)
              }
              that.setState({
                restoreBtnLoading: false
              })
            })
          })
        }

      } else {
        that.setState({
          restoreBtnLoading: false
        })
        Message.info('未选中删除楼盘')
      }
  }
  
  onceExport = () => {
    const that = this
    const cityId = this.cityId
    this.props.exportOnceCase({cityId:cityId}, (res) => {
    
      confirm({
        title: '导出提示',
        content: (
            <div>
              <p>系统正在导出Excel,请耐心等待...</p>
              <p>
                <Icon type="info-circle" />
                <i style={{ marginLeft: 8 }} />
                可跳转导出任务页查看
              </p>
            </div>
        ),
        okText: '跳转',
        onOk() {
          that.goExportTask()
        },
        onCancel() {}
      })
    })
  }
  goExportTask = () => {
    if (pagePermission('fdc:hd:export:check')) {
      this.props.history.push({
        pathname: router.RES_EXPORT_TASK,
        search: 'type=1'
      })
    } else {
      message.warning('没有导出任务页权限，请联系管理员')
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
        path: '',
        name: '住宅基础数据',
        icon: ''
      }
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

  renderForm() {
    const { getFieldDecorator } = this.props.form

    const {
      checkedAllProject,
      indeterminateProject,
      checkedProjectList,

      checkedRegionList,
      checkedAllRegion,
      indeterminateRegion,

      selectedRowKeys,

      keyword,

      restoreBtnLoading
    } = this.state
    // 行政区列表
    const areaList = this.props.model.get('areaList').toJS()
    // 查询 AuthButton
    // const AutoButtonSearch = wrapAuthButton(
    //   <Button
    //     style={{ marginLeft: 16, marginTop: 4 }}
    //     type="primary"
    //     onClick={e => this.handleSearch(e, 1)}
    //     icon="search"
    //   >
    //     查询
    //   </Button>
    // )

    return (
      <Form>
        <Row style={{ marginBottom: 0 }}>
          <FormItem
            label="筛选范围"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
            style={{ marginBottom: 0 }}
          >
            <Checkbox
              indeterminate={indeterminateProject}
              checked={checkedAllProject}
              onChange={this.onCheckAllProjectChange}
            >
              全部
            </Checkbox>
            <CheckboxGroup
              options={projectOptions}
              value={checkedProjectList}
              onChange={this.onCheckProjectChange}
            />
          </FormItem>
        </Row>
        <Row style={{ marginBottom: 8 }}>
          <FormItem
            label="行政区"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
            style={{ marginBottom: 0 }}
          >
            <Checkbox
              indeterminate={indeterminateRegion}
              checked={checkedAllRegion}
              onChange={this.onCheckAllRegionChange}
            >
              全部
            </Checkbox>
            <CheckboxGroup
              options={areaList}
              value={checkedRegionList}
              onChange={this.onCheckRegionChange}
            />
          </FormItem>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label="关键字"
              labelCol={layout(6, 6)}
              wrapperCol={layout(6, 18)}
            >
              {getFieldDecorator('keyword', {
                initialValue: keyword,
              })(<Input placeholder="请输入关键字" maxLength={100} />)}
            </FormItem>
          </Col>
          <Col span={2}>
            {pagePermission('fdc:hd:residence:base:dataSale:check') ? (
              <Button
                style={{ marginLeft: 16, marginTop: 4 }}
                type="primary"
                onClick={e => this.handleSearch(e, 1)}
                icon="search"
              >
                查询
              </Button>
            ) : (
              ''
            )}
          </Col>

          {/* <Col span={2}>
            <AutoButtonSearch resourceCode="535355" />
          </Col> */}
        </Row>
        {this.cityId&&<Row>
          <Link
            to={{
              pathname: router.RES_BASEINFO_ADD,
              search: `cityId=${this.cityId}&cityName=${this.cityName}`
            }}
          >
            {pagePermission('fdc:hd:residence:base:dataSale:add') && (
              <Button
                style={{ marginRight: 16, marginBottom: 20 }}
                type="primary"
                icon="plus"
              >
                新增
              </Button>
            )}
          </Link>
  
          {pagePermission('fdc:hd:residence:base:dataSale:delete') ? (
            <Button
              type="danger"
              icon="delete"
              style={{ marginRight: 16, marginBottom: 20 }}
              disabled={selectedRowKeys.length === 0}
              onClick={this.handleConfirmDelete}
            >
              删除
            </Button>
          ) : (
            ''
          )}
          {pagePermission('fdc:hd:residence:base:dataSale:return') ? (
            <Button
              style={{ marginRight: 16, marginBottom: 20 }}
              disabled={selectedRowKeys.length === 0}
              onClick={this.handleRestore}
              icon="reload"
              loading={restoreBtnLoading}
            >
              还原
            </Button>
          ) : (
            ''
          )}
  
          <Link
            to={{
              pathname: router.RES_BASEINFO_IMPORT,
              search: `importType=${1212004}&cityId=${this.cityId}&cityName=${
                this.cityName
              }`
            }}
          >
            {pagePermission('fdc:hd:residence:base:import') ? (
              <Button
                style={{ marginRight: 16, marginBottom: 20 }}
                icon="upload"
                type="primary"
              >
                导入
              </Button>
            ) : (
              ''
            )}
          </Link>
  
          <Link
            to={{
              pathname: router.RES_PRO_EXPORT,
              search: `exportType=${2}&cityId=${this.cityId}&cityName=${
                this.cityName
              }`
            }}
          >
            {pagePermission('fdc:hd:residence:base:dataSale:check') ? (
              <Button
                style={{ marginRight: 16, marginBottom: 20 }}
                icon="download"
                type="primary"
              >
                导出
              </Button>
            ) : (
              ''
            )}
          </Link>
  
          {pagePermission('fdc:hd:residence:base:facilities') ? (
            <Button type="primary" icon="download" onClick={this.onceExport} style={{ marginRight: 16, marginBottom: 20 }}>
              一键导出楼盘配套
            </Button>
          ) : (
            ''
          )}
  
          <Link
            to={{
              pathname: router.RES_HOUSE_STAND,
              search: `cityId=${this.cityId}&cityName=${this.cityName}`
            }}
          >
            {pagePermission('fdc:hd:residence:base:ratio:check') ? (
              <Button style={{ marginRight: 16, marginBottom: 20 }}>
                城市标准差
              </Button>
            ) : (
              ''
            )}
          </Link>
  
          <Link
            to={{
              pathname: router.RES_HOUSE_STAND_THREE,
              search: `cityId=${this.cityId}&cityName=${this.cityName}`
            }}
          >
            {pagePermission('fdc:hd:residence:base:ratioThree:check') ? (
              <Button style={{ marginRight: 16, marginBottom: 20 }}>
                城市标准差V3.0
              </Button>
            ) : (
              ''
            )}
          </Link>
  
          <Link
            to={{
              pathname: router.RENT_HOUSE_STAND_THREE,
              search: `cityId=${this.cityId}&cityName=${this.cityName}`
            }}
          >
            {pagePermission('fdc:hd:residence:base:rentRatioThree:check') ? (
              <Button style={{ marginRight: 16 }}>租金城市标准差V3.0</Button>
            ) : (
              ''
            )}
          </Link>
  
          <Link
            to={{
              pathname: router.RES_RATING,
              search: `cityId=${this.cityId}&cityName=${this.cityName}`
            }}
          >
            {pagePermission('fdc:hd:residence:base:ratingResult') ? (
              <Button style={{ marginRight: 16 }}>楼盘评级</Button>
            ) : (
              ''
            )}
          </Link>
  
          <Link
            to={{
              pathname: router.RES_PROJECT_SET,
              search: `cityId=${this.cityId}&cityName=${this.cityName}`
            }}
          >
            {/* fdc:hd:residence:base:buildRatio:check */}
            {pagePermission('fdc:hd:residence:base:projectSet:check') ? (
              <Button style={{ marginRight: 16, marginBottom: 20 }}>
                楼盘集合
              </Button>
            ) : (
              ''
            )}
          </Link>
  
          <Link
            to={{
              pathname: router.RES_BUILD_RATIO,
              search: `cityId=${this.cityId}&cityName=${this.cityName}`
            }}
          >
            {pagePermission('fdc:hd:residence:base:buildRatio:check') ? (
              <Button style={{ marginRight: 16, marginBottom: 20 }}>
                建筑物类型比值
              </Button>
            ) : (
              ''
            )}
          </Link>
  
          <Link
            to={{
              pathname: router.RES_AREA_DRAW,
              search: `cityId=${this.cityId}&cityName=${this.cityName}`
            }}
          >
            {/* fdc:hd:residence:base:buildRatio:check */}
            {pagePermission('fdc:hd:residence:base:areaDraw:check') ? (
              <Button style={{ marginRight: 16, marginBottom: 20 }}>
                片区绘制
              </Button>
            ) : (
              ''
            )}
          </Link>
        </Row>}
      
      </Form>
    )
  }

  renderProjectInfo() {
    const { projectNumber, houseNumber, buildingNumber, totalProjectNumber, totalBuildingNumber, totalHouseNumber} = this.props.model.get(
      'cityCount'
    )
    const { cityName } = this.props.defaultCity

    return (
      <div style={{ marginTop: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              当前城市
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {cityName}
              </span>
              ：
              楼盘
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {projectNumber || 0}
              </span>
              个，楼栋
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {buildingNumber || 0}
              </span>
              个，房号
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {houseNumber || 0}
              </span>
              个；
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                全国所有城市
              </span>
              ：
              楼盘
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {totalProjectNumber || 0}
              </span>个，
              楼栋
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {totalBuildingNumber || 0}
              </span>个，
              房号
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {totalHouseNumber || 0}
              </span>个。
            </p>
          }
          type="info"
          showIcon
        />
      </div>
    )
  }

  renderTable() {
    const columns = [
      {
        title: '行政区',
        width: 100,
        // dataIndex: 'areaName'
        render: ({ areaName }) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{areaName}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitAreaName}>{areaName}</div>
          </Popover>
        )
      },
      {
        title: '楼盘名称',
        width: 212,
        render: ({ projectName, status, id }) => (
          <span>
            <Popover
              content={<div style={{ maxWidth: '200px' }}>{projectName}</div>}
              title={false}
              placement="topLeft"
            >
              <Link
                to={{
                  pathname: router.RES_BASEINFO_ADD,
                  search: `projectId=${id}&status=${status}&cityId=${
                    this.cityId
                  }&cityName=${this.cityName}&proviceId=${this.proviceId}`,
                  listSearch: this.props.location.search
                }}
                className={status ? null : `${styles.delProject}`}
              >
                <div className={styles.limitProjectName}>{projectName}</div>
              </Link>
            </Popover>
          </span>
        )
      },
      {
        title: '楼盘别名',
        width: 132,
        render: ({ projectAlias, id }) => (
          <div>
            <Fragment>
              {pagePermission('fdc:hd:residence:saleName:check') ? (
                <Fragment>
                  {projectAlias ? (
                    <Popover
                      // content={
                      //   <Fragment>
                      //     {projectAlias.split('').length > 300 ? (
                      //       <div style={{ maxWidth: '400px' }}>
                      //         {projectAlias}
                      //       </div>
                      //     ) : (
                      //       <div style={{ maxWidth: '200px' }}>
                      //         {projectAlias}
                      //       </div>
                      //     )}
                      //   </Fragment>
                      // }
                      content={
                        <div style={{ maxWidth: '200px',maxHeight: 200,overflow: 'auto' }}>{projectAlias}</div>
                      }
                      title={false}
                      placement="topLeft"
                    >
                      <Link
                        to={{
                          pathname: router.RES_PRO_NAME,
                          search: `projectId=${id}&cityId=${
                            this.cityId
                          }&cityName=${this.cityName}&proviceId=${
                            this.proviceId
                          }`
                        }}
                      >
                        <div className={styles.limitProjectAlias}>
                          {projectAlias}
                        </div>
                      </Link>
                    </Popover>
                  ) : (
                    <Link
                      to={{
                        pathname: router.RES_PRO_NAME,
                        search: `projectId=${id}&cityId=${
                          this.cityId
                        }&cityName=${this.cityName}&proviceId=${this.proviceId}`
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          width: '100%',
                          height: '100%'
                        }}
                      />
                    </Link>
                  )}
                </Fragment>
              ) : (
                <Fragment>
                  {projectAlias ? (
                    <Popover
                      content={
                        <div style={{ maxWidth: '200px' }}>{projectAlias}</div>
                      }
                      title={false}
                      placement="topLeft"
                    >
                      <a>
                        <div className={styles.limitProjectAlias}>
                          {projectAlias}
                        </div>
                      </a>
                    </Popover>
                  ) : (
                    <a>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '100%',
                          height: '100%'
                        }}
                      />
                    </a>
                  )}
                </Fragment>
              )}
            </Fragment>
          </div>
        )
      },
      {
        title: '楼盘地址',
        width: 212,
        render: ({ address, id }) => (
          <div>
            {pagePermission('fdc:hd:residence:saleAddress:check') ? (
              <Fragment>
                {address ? (
                  <Popover
                    content={<div style={{ maxWidth: '200px',maxHeight: 200,overflow: 'auto' }}>{address}</div>}
                    title={false}
                    placement="topLeft"
                  >
                    <Link
                      to={{
                        pathname: router.RES_PRO_ADDR,
                        search: `projectId=${id}&cityId=${
                          this.cityId
                        }&cityName=${this.cityName}&proviceId=${this.proviceId}`
                      }}
                    >
                      <div className={styles.limitAddress}>{address}</div>
                    </Link>
                  </Popover>
                ) : (
                  <Link
                    to={{
                      pathname: router.RES_PRO_ADDR,
                      search: `projectId=${id}&cityId=${this.cityId}&cityName=${
                        this.cityName
                      }&proviceId=${this.proviceId}`
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                  </Link>
                )}
              </Fragment>
            ) : (
              <Fragment>
                {address ? (
                  <Popover
                    content={<div style={{ maxWidth: '200px' }}>{address}</div>}
                    title={false}
                    placement="topLeft"
                  >
                    <a>
                      <div className={styles.limitAddress}>{address}</div>
                    </a>
                  </Popover>
                ) : (
                  <a>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                  </a>
                )}
              </Fragment>
            )}
          </div>
        )
      },
      {
        title: '栋户',
        width: 100,
        /* eslint-disable */
        render: ({ totalHouseNum, totalBuildingNum, id, status }) => (
          <div>
            {pagePermission('fdc:hd:residence:base:building:check') ? (
              <Link
                to={{
                  pathname: router.RES_BUILD_INFO,
                  search: `projectId=${id}&prjStatus=${status}&cityId=${
                    this.cityId
                  }&cityName=${this.cityName}&proviceId=${this.proviceId}`
                }}
              >
                {totalBuildingNum}/{totalHouseNum}
              </Link>
            ) : (
              <a>
                {totalBuildingNum}/{totalHouseNum}
              </a>
            )}
          </div>
        )
      },
      {
        title: '其他',
        width: 120,
        render: ({ totalPictureNum, id }) => (
          <div>
            {pagePermission('fdc:hd:residence:base:salePicture:check') ? (
              <Link
                style={{ marginRight: 8 }}
                to={{
                  pathname: router.RES_PRO_IMAGE,
                  search: `projectId=${id}&cityId=${this.cityId}&cityName=${
                    this.cityName
                  }&proviceId=${this.proviceId}`
                }}
              >
                图片(
                {totalPictureNum || 0})
              </Link>
            ) : (
              <a>
                图片(
                {totalPictureNum || 0})
              </a>
            )}

            {/* <Link
              style={{ marginRight: 8 }}
              to={{
                pathname: router.RES_HOUSE_STAND,
                search: `projectId=${id}`
              }}
            >
              系数差
            </Link> */}
            {pagePermission('fdc:hd:residence:base:realMatch:check') ? (
              <Link
                to={{
                  pathname: router.RES_PROJECT_RESOURCE,
                  search: `projectId=${id}&cityId=${this.cityId}&cityName=${
                    this.cityName
                  }&proviceId=${this.proviceId}`
                }}
              >
                配套
              </Link>
            ) : (
              <a>配套</a>
            )}
          </div>
        )
      },
      {
        title: '是否锁定',
        width: 80,
        render: ({ isLocked }) => (
          // <Switch
          //   checkedChildren={<Icon type="lock" />}
          //   unCheckedChildren={<Icon type="unlock" />}
          //   checked={+isLocked === 1}
          // />
          <span>{isLocked ? '是' : '否'}</span>
        )
        // ({ 1: <Icon type="lock" />, 0: <Icon type="unlock" /> }[isLocked])
      },
      {
        title: '数据权属',
        // dataIndex: 'ownership',
        width: 150,
        render: ({ ownership }) => (
          <div>
            <Popover
              content={<div style={{ maxWidth: '200px' }}>{ownership}</div>}
              title={false}
              placement="topLeft"
            >
              <div className={styles.limitOwership}>{ownership}</div>
            </Popover>
          </div>
        )
      }
    ]

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectedRows
        })
      }
    }

    const { pageNum, pageSize, total } = this.props.model.get('pagination')
    const pagination = {
      current: pageNum,
      pageSize,
      total,
      showTotal,
      showQuickJumper: true,
      onChange: pageNum => {
        this.handleSearch(null, pageNum)
      }
    }

    return (
      <Table
        style={{ marginTop: 16 }}
        columns={columns}
        dataSource={this.props.baseInfoList}
        rowSelection={rowSelection}
        pagination={pagination}
        loading={this.context.loading.includes(actions.GET_BASE_INFO_LIST)}
        scroll={{ x: '1310px', y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderProjectInfo()}
          {this.renderTable()}
        </div>
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
)(BaseInfo)
