import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import moment from 'moment'
import Immutable from 'immutable'
import {
  Form,
  Row,
  Col,
  Checkbox,
  DatePicker,
  Input,
  Button,
  Tabs,
  Breadcrumb,
  Icon,
  Spin,
  Modal,
  message, Message, Alert
} from 'antd'
import { Link } from 'react-router-dom'
import { parse } from 'qs'
import { pagePermission } from 'client/utils'
import router from 'client/router'
import layout from 'client/utils/layout'
import shallowEqual from 'client/utils/shallowEqual'

import ProjectAvgCompare from './ProjectAvg.compare'
import ProjectAvgBase from './ProjectAvg.base'
import ProjectAvgCase from './ProjectAvg.case'
import EstimateCase from './Estimate.case'
import EstimateBase from './Estimate.base'
import StandardPrice from './Standard.price'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ProjectAvg.less'

const FormItem = Form.Item
const TabPane = Tabs.TabPane
const CheckboxGroup = Checkbox.Group
const { MonthPicker } = DatePicker
const confirm = Modal.confirm

/*
 * 楼盘均价 模块
 * author: YJF 2018-08-01
 */
class ProjectAvg extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    fetchAreaDict: PropTypes.func.isRequired,
    fetchCompareData: PropTypes.func.isRequired,
    fetchBaseData: PropTypes.func.isRequired,
    fetchCaseData: PropTypes.func.isRequired,
    estimateCaseData: PropTypes.func.isRequired,
    estimateBaseData: PropTypes.func.isRequired,
    standardHousePrice: PropTypes.func.isRequired,
    exportHouseCaseAvg: PropTypes.func.isRequired,
    earlyWarningCount: PropTypes.func.isRequired,
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)

    /* eslint-disable */
    const {
      areaIds = '',
      activeTabs = '1',
      keyword,
      pageNum = 1,
      cityId,
      cityName
    } = parse(props.location.search.substr(1))

    this.state = {
      // 选中的行政区范围 id数组
      checkedRegionList: areaIds ? areaIds.split(',') : [],
      checkedAllRegion: false,
      indeterminateRegion: true,
      warningKey:'',
      // 激活的tab
      activeTabs,

      keyword,
      pageNum,
      cityId,
      cityName
    }
    // 传递给列表使用，用于查询基准房价详情
    this.useMonth = null
  }

  componentDidMount() {
    const { cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
      this.cityName =sessionStorage.getItem('FDC_CITY_INFO') ? JSON.parse(sessionStorage.getItem('FDC_CITY_INFO')).cityName:  cityName
      let searchParam = this.UrlSearch()
      if (this.cityId) {
        if(searchParam.outLink){
          const params = {
            cityId: searchParam.cityId?searchParam.cityId:(searchParam.cityName?null:this.cityId),
            cityName:searchParam.cityName?decodeURI(searchParam.cityName):null
          }
          this.props.updateVisitCities2(params, res => {
            if (res) {
              const { code = 200, message = '' } = res
              if (res.data&&res.data.code === 400) {
                Message.warn(res.data.message)
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
                if(searchParam.keyWord){
                  this.state.keyword = decodeURI(searchParam.keyWord)
                  if(baseInfoSearch.length>1){
                    baseInfoSearch += `&keyword=${decodeURI(searchParam.keyWord)}`
                  }else {
                    baseInfoSearch += `&keyword=${decodeURI(searchParam.keyWord)}`
                  }
                }
                if(searchParam.userMonth){
                  baseInfoSearch += `&userMonth=${searchParam.userMonth}`
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
              clearInterval(this.cityIdInterval)
              // 获取行政区列表
              this.props.fetchAreaDict(this.cityId,()=>{})
              // 设置默认估价月份
              this.setDefaultUserMonth()
              // 默认查询看对比Tab
              this.handleSearch(null, this.state.pageNum)
              this.props.earlyWarningCount({cityId: this.cityId})
            }
          })
        }else {
          clearInterval(this.cityIdInterval)
          // 获取行政区列表
          this.props.fetchAreaDict(this.cityId,()=>{})
          // 设置默认估价月份
          this.setDefaultUserMonth()
          // 默认查询看对比Tab
          if(searchParam.earlyWarningField){
            let areaId = []
            let userMonth = null
            if(searchParam.areaId){
              areaId = [searchParam.areaId]
            }
            if(searchParam.userMonth){
              userMonth =  moment(moment(searchParam.userMonth).utcOffset(8),'YYYY-MM-DD')
            
              // userMonth = '2020-07-01'
              // 借口时间++++++
              // this.props.form.setFieldsValue({ userMonth: userMonth })
              this.userMonth = userMonth
            }
            this.setState({
              warningKey: searchParam.earlyWarningField,
              checkedRegionList: areaId,
              userMonth:  userMonth
            },()=>{
              this.handleSearch(null, this.state.pageNum)
              this.props.earlyWarningCount({cityId: this.cityId,areaIds: areaId.join(','),userMonth:moment(searchParam.userMonth).utcOffset(8).format('YYYY-MM-DD HH:mm:ss')})
            })
            return
          }
          this.handleSearch(null, this.state.pageNum)
          this.props.earlyWarningCount({cityId: this.cityId})
        }
      }
    }, 100)
  }

  componentWillReceiveProps(nextProps) {
    // 点击菜单栏，初始化查询条件
    if (
      nextProps.location.search === '' &&
      !shallowEqual(this.props.location, nextProps.location)
    ) {
      this.setState(
        {
          checkedRegionList: [],
          keyword: '',
          activeTabs: '1'
        },
        () => {
          const params = {
            cityId: this.cityId,
            pageNum: 1,
            pageSize: 20,
            userMonth: this.userMonth ? this.userMonth.format('YYYY-MM-DD HH:mm:ss') : ''
          }
          this.props.form.setFieldsValue({
            userMonth: this.userMonth,
            keyword: ''
          })
          this.props.fetchCompareData(params)
        }
      )
    }
  }
  
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

  setDefaultUserMonth = () => {
    let searchParam = this.UrlSearch()
    if(searchParam.userMonth&&searchParam.outLink){
      this.useMonth = `${searchParam.userMonth}-01`
      this.props.form.setFieldsValue({
        "userMonth": moment(this.useMonth, 'YYYY-MM-DD')
      })
    }else {
      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      this.userMonth = moment(new Date(`${year}-${month}-01`))
      this.useMonth = `${year}-${month}-01`
    }
  }

  disabledDate = current => {
    // Can not select days before today and today
    return current > moment().endOf('month')
  }

  // 导出
  exportData = () => {
    const { userMonth, keyword } = this.props.form.getFieldsValue([
      'userMonth',
      'keyword'
    ])
    const params = {
      cityId: this.cityId,
      areaIds: this.state.checkedRegionList.join(','),
      userMonth: moment(userMonth).format('YYYY-MM-DD HH:mm:ss'),
      keyWord: keyword ? keyword.trim() : '',
      earlyWarningField: this.state.warningKey
    }
    // console.log(params)
    const that = this
    this.props.exportHouseCaseAvg(params, () => {
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

  // Tab切换事件
  handleChangeTabs = key => {
    this.setState(
      {
        activeTabs: key
      },
      () => {
        this.handleSearch(null, 1)
      }
    )
  }

  // table查询
  handleSearch = (e, pageNum) => {
    let searchParam = this.UrlSearch()
    if (e) {
      e.preventDefault()
    }
    const { checkedRegionList, activeTabs } = this.state
    const { userMonth, keyword = '' } = this.props.form.getFieldsValue([
      'userMonth',
      'keyword'
    ])
    const params = {
      cityId: this.cityId,
      areaIds: checkedRegionList.join(','),
      pageNum,
      pageSize: 20,
      userMonth: moment(userMonth).format('YYYY-MM-DD HH:mm:ss'),
      keyWord: keyword ? keyword.trim() : '',
      earlyWarningField: this.state.warningKey
    }
    this.useMonth = moment(userMonth).format('YYYY-MM-DD')
    this.props.earlyWarningCount({
      cityId: this.cityId,
      keyWord: keyword ? keyword.trim() : null,
      userMonth:moment(userMonth).format('YYYY-MM-DD HH:mm:ss'),
      earlyWarningField: this.state.warningKey,
      areaIds:checkedRegionList.join(',')
    })
    switch (activeTabs) {
      case '1':
        this.props.fetchCompareData(params,res=>{
          // if(this.useMonth||keyword||this.cityId||this.state.warningKey){
          //   this.props.earlyWarningCount({
          //     cityId: this.cityId,
          //     keyWord: keyword ? keyword.trim() : null,
          //     userMonth:moment(userMonth).format('YYYY-MM-DD HH:mm:ss'),
          //     earlyWarningField: this.state.warningKey,
          //     areaIds:checkedRegionList.join(',')
          //   })
          // }
          if(res.data.records&&res.data.records.length===1&&searchParam.outLink){
            const search = `projectId=${
              res.data.records[0].projectId}&weightId=${
              res.data.records[0].weightId||''
            }&tag=${(res.data.records[0].tag||res.data.records[0].tag===0)?String(res.data.records[0].tag):'1'}&useMonth=${this.useMonth
            }&entry=1&cityId=${this.cityId}&cityName=${
              this.cityName}&areaIds=${
              res.data.records[0].areaIds||''}&keyword=${
              keyword||''}&compare=3`
            this.props.history.push({
              pathname: router.RES_PRO_HOUSE_PRICE_DETAIL,
              search: search,
              listSearch:this.props.location.search
            })
            
          }
        })
        return
      case '2':
        this.props.fetchCaseData(params)
        break
      case '3':
        this.props.fetchBaseData(params)
        break
      case '4':
        this.props.estimateCaseData(params)
        break
      case '5':
        this.props.estimateBaseData(params)
        break
      case '6':
        this.props.standardHousePrice(params)
        break
      default:
        break
    }
    // 保存查询条件
    // 行政区&关键字&激活的tab
    
    const areaIds = checkedRegionList.join(',')
    let baseInfoSearch = `areaIds=${areaIds}&keyword=${keyword}&activeTabs=${activeTabs}&pageNum=${pageNum}`
    if(searchParam.cityId){
      baseInfoSearch+=  `&cityId=${searchParam.cityId}`
    }
    if(searchParam.cityName){
      baseInfoSearch+=  `&cityName=${decodeURI(searchParam.cityName)}`
    }
    if(searchParam.userMonth){
      baseInfoSearch += `&userMonth=${searchParam.userMonth}`
    }
    if(searchParam.outLink){
      baseInfoSearch += `&outLink=${searchParam.outLink}`
    }
    this.context.router.history.push({
      pathname: this.props.location.pathname,
      search: baseInfoSearch
    })
  }
  
  changeKey = (key) =>{
    this.setState({warningKey:key},()=>{
      this.handleSearch()
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
        path: '',
        name: '楼盘价格'
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
      checkedRegionList,
      checkedAllRegion,
      indeterminateRegion,
      keyword
    } = this.state

    // 行政区列表
    const areaList = this.props.model.get('areaList').toJS()

    return (
      <Form>
        <Row>
          <FormItem
            label="行政区"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
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
          <Col span={6}>
            <FormItem
              label="估价月份"
              labelCol={layout(6, 8)}
              wrapperCol={layout(6, 16)}
            >
              {getFieldDecorator('userMonth', {
                initialValue: this.userMonth
              })(
                <MonthPicker
                  monthCellContentRender={date => (
                    <span>{date.format('MM')}</span>
                  )}
                  disabledDate={this.disabledDate}
                  allowClear={false}
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label="关键字"
              labelCol={layout(6, 6)}
              wrapperCol={layout(6, 18)}
            >
              {getFieldDecorator('keyword', {
                initialValue: keyword
              })(<Input placeholder="请输入关键字" maxLength={100} />)}
            </FormItem>
          </Col>
          <Col span={2}>
            <Button
              style={{ marginLeft: 16, marginTop: 4 }}
              type="primary"
              onClick={e => { this.setState({warningKey: ''},()=>this.handleSearch(e, 1)) }}
              icon="search"
            >
              查询
            </Button>
          </Col>
        </Row>
        <Row style={{ marginBottom: 16 }}>
          <Link
            to={{
              pathname: router.RES_PROAVG_IMPORT,
              search: `importType=${1212107}&cityId=${this.cityId}&cityName=${
                this.cityName
              }`
            }}
          >
            {pagePermission('fdc:hd:residence:average:import') ? (
              <Button
                type="primary"
                onClick={this.toImport}
                icon="upload"
                style={{ marginRight: 16 }}
              >
                导入
              </Button>
            ) : (
              ''
            )}
          </Link>
          {pagePermission('fdc:hd:residence:average:export') ? (
            <Button
              onClick={this.exportData}
              type="primary"
              icon="download"
              style={{ marginRight: 16 }}
            >
              导出
            </Button>
          ) : (
            ''
          )}
          <Link
            to={{
              pathname: router.RES_PRO_PRICE_RATE,
              search: `cityId=${this.cityId}&cityName=${this.cityName}`
            }}
          >
            {pagePermission('fdc:hd:residence:average:checkPriceRate') ? (
              <Button style={{ marginRight: 16 }}>价格比值</Button>
            ) : (
              ''
            )}
          </Link>
          <Link
            to={{
              pathname: router.RES_PROAVG_IMPORT,
              search: `importType=${1212133}&cityId=${this.cityId}&cityName=${
                this.cityName
              }`
            }}
          >
            {/* 1.8测试 */}
            {/*<Button style={{ marginRight: 16 }}>网络参考价</Button>*/}
            {pagePermission('fdc:hd:residence:average:avgReference') ? (
             <Button style={{ marginRight: 16 }}>网络参考价</Button>
            ) : (
              ''
            )}
          </Link>
          <Link
              to={{
                pathname: router.RES_PRO_PRICE_MAP_VALUATION,
                search: `cityId=${this.cityId}&cityName=${this.cityName}`
              }}
          >
            {/* 1.8测试 */}
            {/*<Button style={{ marginRight: 16 }}>网络参考价</Button>*/}
            {pagePermission('fdc:hd:residence:average:mapCheckPrice') ? (
                <Button style={{ marginRight: 16 }}>地图核价</Button>
            ) : (
                ''
            )}
          </Link>
        </Row>
      </Form>
    )
  }
  
  renderProjectInfo() {
    const list = this.props.model.get('earlyWarningCountList')?this.props.model.get('earlyWarningCountList').toJS():{}
    return (
      <div style={{ marginTop: 16, padding: '15px 0'}}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <div>
              <div style={{display: 'inline-block'}}>
                <span>价格预警(对比挂牌案例均价)</span>
                <span style={{marginLeft: 10}}>
                  <span style={{color:'#FF9900', fontWeight: 'bold', cursor: 'pointer'}} onClick={()=>this.changeKey('yellowAvg')}>{list.earlyWarningAYellow}</span>
                  &nbsp;| <span style={{color:'#FF0000', fontWeight: 'bold', cursor: 'pointer'}} onClick={()=>this.changeKey('redAvg')}>{list.earlyWarningARed}</span></span>
              </div>
              <div style={{display: 'inline-block', marginLeft:35}}>
                <span>价格预警(对比评估案例均价)</span>
                <span style={{marginLeft: 10}}>
                  <span style={{color:'#FF9900', fontWeight: 'bold', cursor: 'pointer'}} onClick={()=>this.changeKey('yellowEstimateAvg')}>{list.earlyWarningBYellow}</span>
                  &nbsp;| <span style={{color:'#FF0000', fontWeight: 'bold', cursor: 'pointer'}} onClick={()=>this.changeKey('redEstimateAvg')}>{list.earlyWarningBRed}</span></span>
              </div>
              <div style={{display: 'inline-block', marginLeft:35}}>
                <span>价格预警(对比网络参考价)</span>
                <span style={{marginLeft: 10}}>
                  <span style={{color:'#FF9900', fontWeight: 'bold', cursor: 'pointer'}} onClick={()=>this.changeKey('yellowAvgReference')}>{list.earlyWarningCYellow}</span>
                  &nbsp;| <span style={{color:'#FF0000', fontWeight: 'bold', cursor: 'pointer'}} onClick={()=>this.changeKey('redAvgReference')}>{list.earlyWarningCRed}</span></span>
              </div>
            </div>
          }
          type="info"
          showIcon
        />
      </div>
    )
  }
  
  
  renderTabs() {
    const { activeTabs,cityId } = this.state
    const areaIds = this.state.checkedRegionList.join(',')
    const { keyword = '' } = this.props.form.getFieldsValue(['keyword'])
    return (
      <Spin spinning={this.context.loading.includes(actions.GET_DATA_LIST)}>
        <Tabs activeKey={activeTabs} onChange={this.handleChangeTabs}>
          <TabPane tab="看对比" key="1">
            {/* <ProjectAvgCompare
              onSearch={this.handleSearch}
              useMonth={this.useMonth}
            /> */}
          </TabPane>

          <TabPane tab="只看挂牌案例均价" key="2" />
          <TabPane tab="只看挂牌基准价" key="3" />
          <TabPane tab="只看评估案例均价" key="4" />
          <TabPane tab="只看评估基准价" key="5" />
          <TabPane tab="只看标准房价格" key="6" />
        </Tabs>
        {
          <div>
            {
              {
                '1': (
                  <ProjectAvgCompare
                    warningKey={this.state.warningKey}
                    onSearch={this.handleSearch}
                    useMonth={this.useMonth}
                    cityId={this.cityId}
                    cityName={this.cityName}
                  />
                ),

                '2': (
                  <ProjectAvgCase
                    onSearch={this.handleSearch}
                    useMonth={this.useMonth}
                    cityId={this.cityId}
                    cityName={this.cityName}
                    areaIds={areaIds}
                    keyword={keyword}
                  />
                ),
                '3': (
                  <ProjectAvgBase
                    onSearch={this.handleSearch}
                    useMonth={this.useMonth}
                    cityId={this.cityId}
                    cityName={this.cityName}
                    areaIds={areaIds}
                    keyword={keyword}
                  />
                ),
                '4': (
                  <EstimateCase
                    onSearch={this.handleSearch}
                    useMonth={this.useMonth}
                    cityId={this.cityId}
                    cityName={this.cityName}
                    areaIds={areaIds}
                    keyword={keyword}
                  />
                ),
                '5': (
                  <EstimateBase
                    onSearch={this.handleSearch}
                    useMonth={this.useMonth}
                    cityId={this.cityId}
                    cityName={this.cityName}
                    areaIds={areaIds}
                    keyword={keyword}
                  />
                ),
                '6': (
                  <StandardPrice
                    onSearch={this.handleSearch}
                    useMonth={this.useMonth}
                    cityId={this.cityId}
                    cityName={this.cityName}
                    areaIds={areaIds}
                    keyword={keyword}
                  />
                )
              }[activeTabs]
            }
          </div>
        }
      </Spin>
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderProjectInfo()}
          {this.renderTabs()}
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
)(ProjectAvg)
