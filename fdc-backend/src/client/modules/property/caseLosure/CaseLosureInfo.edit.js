import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
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
  Message, Checkbox
} from 'antd'
import Immutable from 'immutable'
import { parse } from 'qs'
import moment from 'moment'
import { pagePermission } from 'client/utils'
import router from 'client/router'
import ProjectSelect from 'client/components/project-select'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './CaseInfo.less'

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
 * 法拍案例编辑/新增
 */
export class CaseLosureInfoEdit extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    initialFetch: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    addCase: PropTypes.func.isRequired,
    editCase: PropTypes.func.isRequired,
    getCaseDetail: PropTypes.func.isRequired,
    clearCaseDetail: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired,
    fetchProjectsList: PropTypes.func.isRequired,
    getAreaList: PropTypes.func.isRequired,
  }
  
  projectId = null
  constructor(props) {
    super(props)

    const { caseId = '', cityId, cityName } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      // 案例ID
      isAreaId: true,
      caseId,
      loading: false,
      // 校验所在楼层状态
      validateFloorNoStatus: '',
      validateTotalFloorStatus: '',
      validateAreaNameMsg: '',
      cityId,
      cityName,
      isMultyList: [
        {
          label: "是",
          value: '1'
        },
        {
          label: "否",
          value: '0'
        }
      ]
    }
  }

  componentDidMount() {
    const { cityId, cityName } = this.state
    // console.log(cityId, cityName)
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
      // console.log(this.cityId)
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
        // 获取字典表数据
        this.props.initialFetch()
        this.props.getAreaList(this.cityId)

        // 如果有caseId,则为编辑,去查询案例详情
        if (this.state.caseId) {
          this.props.getCaseDetail(this.state.caseId, cityId)
        }
      }
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName },()=>{})
    }
  }

  componentWillUnmount() {
    this.props.clearCaseDetail()
  }
  
  handleAreaChange = areaId => {
    if(areaId){
      this.setState({isAreaId: false})
    }
    // 重置片区选项 & 获取片区列表
    this.props.form.setFieldsValue({ subAreaId: undefined })
    // 已选择行政区，清空行政区校验Msg && 校验楼盘名称
    this.setState({
      validateAreaNameMsg: ''
    })
    const projectName = this.props.form.getFieldValue('projectName')
    if (projectName) {
      setTimeout(() => {
        this.validateProjectName()
      }, 100)
    }
  }
  
  validateProjectName = () =>
      new Promise(resolve => {
        const { areaId, projectName } = this.props.form.getFieldsValue([
          'areaId',
          'projectName'
        ])
        if (areaId) {
          if (projectName) {
            const data = {
              cityId: this.cityId,
              areaId,
              projectName: projectName.trim()
            }
            // 如果是编辑
            if (this.props.projectId) {
              data.id = this.props.projectId
            }
            this.setState({
              projectAliasIds:[]
            })
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
    const { areaId } = this.props.form.getFieldsValue([
      'areaId',
    ])
    if(!areaId){
      this.props.form.setFieldsValue({projectName: ''})
      Message.warning('请先选择行政区再填楼盘名称')
    }
  }
  
  // 搜索楼盘
  searchProjectsList = e => {
    let self = this
    const { cityId } = self.state
    let parm = {
      cityId,
      pageNum:1,
      pageSize: 100,
      keyword: e,
      statuses: 1
    }
    const { areaId } = self.props.form.getFieldsValue([
      'areaId',
    ])
    if(areaId){
      parm.areaIds = areaId
    }else{
      Message.warning('请先选择行政区再填楼盘名称')
    }
    // this.props.form.setFieldsValue({
    //   productIdValue: '',
    //   productId: ''
    // })
    // if (e === '') {
    //   self.setState({ chooseDisable: true })
    //   this.props.form.setFieldsValue({
    //     tenantIdValue: '',
    //     tenantId: '',
    //     orgId: ''
    //   })
    // }
    // this.props.getCustomorList({ fullName: e })
    self.props.fetchProjectsList(parm)
  }
  
  // 选择楼盘
  selectCustomorRole = (value, option) => {
    this.setState({ chooseDisable: false })
    this.props.form.setFieldsValue({ projectName: option.props.children})
    this.projectId = value
    // this.props.form.setFieldsValue({ tenantIdValue: option.props.title })
    // this.props.getCustomorRoleList({ tenantId: option.props.title })
    // this.props.getRoleProductList({ tenantId: option.props.title })
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

  // 保存数据
  handleSubmit = e => {
    if (e) {
      e.preventDefault()
    }
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { caseId, cityId } = this.state
        // 删除录入人字段
        delete values.creator
        // 删除数据权属字段
        delete values.ownership

        // const { projectId } = values.projectItem
        delete values.projectItem
        values.caseHappenDate = values.caseHappenDate && values.caseHappenDate.format('YYYY-MM-DD HH:mm:ss')
        values.openDate = values.openDate && values.openDate.format('YYYY-MM-DD HH:mm:ss')
        // values.projectId = projectId
        values.cityId = cityId
        if(this.projectId){
          values.projectId = this.projectId
        }
        if (caseId) {
          values.id = caseId
          this.props.editCase(values, res => {
            const { code, message } = res
            if (+code === 200) {
              this.props.clearCaseDetail()
              Message.success('编辑成功')
              // this.props.history.goBack()
              // 列表查询条件
              const caseInfoSearch = sessionStorage.getItem(
                'CASE_HOUSING_RENT_SEARCH'
              )
              this.props.history.push({
                pathname: router.RES_CASE_LOSURE,
                search: caseInfoSearch
              })
            } else {
              Message.error(message)
            }
          })
        } else {
          this.props.addCase(values, res => {
            const { code, message } = res
            if (+code === 200) {
              // this.props.history.goBack() change wy
              Message.success('新增成功')
              const caseInfoSearch = sessionStorage.getItem(
                'CASE_HOUSING_RENT_SEARCH'
              )
              this.props.history.push({
                pathname: router.RES_CASE_LOSURE,
                search: caseInfoSearch
              })
            } else {
              Message.error(message)
            }
          })
        }
      }
    })
  }
  
  handleUnitprice = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('法拍成交总价应大于0')
    }
    callback()
  }
  
  handleEstimateUnitprice = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('法拍评估总价应大于0')
    }
    callback()
  }
  
  handleApplyNum = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('报名人数应大于0')
    }
    callback()
  }
  
  handleSettingRemindNum = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('设置提醒人数应大于0')
    }
    callback()
  }
  
  handleOnlookerNum = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('围观次数应大于0')
    }
    callback()
  }
  
  handleStartingPrice = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('起拍价应大于0')
    }
    callback()
  }
  
  handleBidIncrement = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('加价幅度应大于0')
    }
    callback()
  }
  
  handleSecurityFund = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('保证金应大于0')
    }
    callback()
  }
  
  handleAdvancePayment = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('变卖预交款应大于0')
    }
    callback()
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
        path: '',
        name: '法拍案例数据'
      },
      {
        key: 3,
        path: '',
        name: caseId ? '案例编辑' : '案例新增'
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
    const {
      caseId,
      loading,
      isAreaId,
      validateFloorNoStatus,
      validateTotalFloorStatus,
      cityId,
      validateAreaNameMsg
    } = this.state

    const { getFieldDecorator } = this.props.form
    

    /* eslint-disable */
    const {
      areaList,
      houseUsageList,
      closureCaseTypeList,
      endReasonCode,
      orientTypeList,
      buildTypeList,
      houseTypeList,
      structTypeList,
      ProjectsList,
      projectId,
      caseDetail
    } = this.props.model
    // const areaList = this.props.model.get('areaList')
    
    const isMultyList = this.state.isMultyList

    const projectItem = {
      areaId: caseDetail.get('areaId'),
      areaName: caseDetail.get('areaName'),
      projectId: caseDetail.get('projectId'),
      projectName: caseDetail.get('projectName')
    }

    let caseHappenDate
    if (caseDetail.get('caseHappenDate')) {
      caseHappenDate = moment(caseDetail.get('caseHappenDate'))
    }
    
    let openDate
    if (caseDetail.get('openDate')) {
      openDate = moment(caseDetail.get('openDate'))
    }
    

    return (
      <Form onSubmit={this.handleSubmit}>
        {caseId ? (
          <Row>
            <Col span={10}>
              <FormItem label="数据权属" {...formItemLayout}>
                {getFieldDecorator('ownership', {
                  initialValue: caseDetail.get('ownership')
                })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
        ) : null}
        <Row>
          <Col span={10}>
            <FormItem
                label="行政区"
                style={{marginBottom:0}}
                {...formItemLayout}
                // extra={
                //   <span style={{ color: '#FF0000' }}>{validateAreaNameMsg}</span>
                // }
            >
              {getFieldDecorator('areaId', {
                rules: [
                  {
                    required: true,
                    message: '请选择行政区'
                  }
                ],
                initialValue: caseId
                    ? this.formatString(caseDetail.get('areaId'))
                    : undefined,
                onChange: this.handleAreaChange
              })(
                  <Select
                      placeholder="请选择行政区"
                  >
                    {areaList.map(item => (
                        <Option key={item.get('key')} value={item.get('value')}>
                          {item.get('label')}
                        </Option>
                    ))}
                  </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="标的名称">
              {getFieldDecorator('targetName', {
                rules: [
                  {
                    max: 255,
                    message: '最大长度255'
                  }
                ],
                initialValue: caseId
                    ? caseDetail.get('targetName')
                    : undefined
              })(<Input placeholder="请输入标的名称" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="楼盘名称">
              {getFieldDecorator('projectName', {
                rules: [{ required: true, message: '请输入或者选择楼盘名称' }],
                initialValue: caseId
                    ? this.formatString(caseDetail.get('projectName'))
                    : undefined
              })(
                  <Select
                      disabled={isAreaId}
                      placeholder="请输入或者选择楼盘名称"
                      mode="combobox"
                      notFoundContent=""
                      showArrow={false}
                      filterOption={false}
                      onBlur = {this.focusProjectName}
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
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="楼栋名称">
              {getFieldDecorator('buildingName', {
                rules: [
                  {
                    max: 100,
                    message: '最大长度100'
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('buildingName')
                  : undefined
              })(<Input placeholder="请输入楼栋名称" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="房号名称">
              {getFieldDecorator('houseName', {
                rules: [
                  {
                    max: 100,
                    message: '最大长度100'
                  }
                ],
                initialValue: caseId
                    ? caseDetail.get('houseName')
                    : undefined
              })(<Input placeholder="请输入楼栋名称" />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="案例日期">
              {getFieldDecorator('caseHappenDate', {
                rules: [{ required: true, message: '请选择案例日期' }],
                initialValue: caseId ? caseHappenDate : undefined
              })(<DatePicker  format="YYYY-MM-DD" style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="案例类型">
              {getFieldDecorator('caseTypeCode', {
                rules: [{ required: true, message: '请选择案例类型' }],
                initialValue: caseId
                    ? this.formatString(caseDetail.get('caseTypeCode'))
                    : undefined
              })(
                  <Select style={{ width: '100%' }} placeholder="请选择">
                    {closureCaseTypeList.map(option => (
                        <Option
                            key={option.get('value')}
                            value={option.get('value')}
                        >
                          {option.get('label')}
                        </Option>
                    ))}
                  </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="售卖状态">
              {getFieldDecorator('endReasonCode', {
                rules: [{ required: true, message: '请选择售卖状态' }],
                initialValue: caseId
                    ? this.formatString(caseDetail.get('endReasonCode'))
                    : undefined
              })(
                  <Select style={{ width: '100%' }} placeholder="请选择">
                    {endReasonCode.map(option => (
                        <Option key={option.get('value')} value={option.get('value')}>
                          {option.get('label')}
                        </Option>
                    ))}
                  </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="案例用途">
              {getFieldDecorator('usageCode', {
                rules: [{ required: true, message: '请选择用途' }],
                initialValue: caseId
                    ? `${caseDetail.get('usageCode')}`
                    : undefined
              })(
                  <Select style={{ width: '100%' }} placeholder="请选择">
                    {houseUsageList.map(option => (
                        <Option key={option.get('code')} value={option.get('code')}>
                          {option.get('name')}
                        </Option>
                    ))}
                  </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="建筑面积">
              {getFieldDecorator('houseArea', {
                rules: [
                  {
                    validator: this.handleValidateHouseArea
                  }
                ],
                initialValue: caseId ? caseDetail.get('houseArea') : undefined
              })(
                  <InputNumber
                      max={1000000000}
                      // min={0}
                      style={{ width: '100%' }}
                      placeholder="请输入建筑面积"
                      precision={2}
                      onBlur={this.handleHouseAreaBlur}
                  />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="法拍成交单价">
              {getFieldDecorator('unitprice', {
                rules: [
                ],
                initialValue: caseId
                    ? caseDetail.get('unitprice')
                    : undefined
              })(<InputNumber
                  max={1000000000000000}
                  min={0}
                  style={{ width: '100%' }}
                  precision={0}
                  disabled
                  placeholder="请输入法拍成交单价"
                  />
               )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="法拍成交总价">
              {getFieldDecorator('totalPrice', {
                rules: [
                  {
                    validator: this.handleUnitprice
                  }
                ],
                initialValue: caseId
                    ? caseDetail.get('totalPrice')
                    : undefined
              })(<InputNumber
                  max={1000000000000000}
                  min={0}
                  style={{ width: '100%' }}
                  precision={0}
                  placeholder="请输入法拍成交总价"
                  onBlur={this.totalPriceChange}
                  />
                )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="法拍评估单价">
              {getFieldDecorator('estimateUnitprice', {
                rules: [
                
                ],
                initialValue: caseId
                    ? caseDetail.get('estimateUnitprice')
                    : undefined
              })(<InputNumber
                  max={1000000000000000}
                  min={0}
                  style={{ width: '100%' }}
                  precision={0}
                  disabled
                  placeholder="请输入法拍成交单价"
              />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="法拍评估总价">
              {getFieldDecorator('estimateTotalPrice', {
                rules: [
                  { required: true, message: '请输入法拍评估总价' },
                  {
                    validator: this.handleEstimateUnitprice
                  }
                ],
                initialValue: caseId
                    ? caseDetail.get('estimateTotalPrice')
                    : undefined
              })(<InputNumber
                  max={1000000000000000}
                  min={0}
                  style={{ width: '100%' }}
                  precision={0}
                  placeholder="请输入法拍评估总价"
                  onBlur={this.estimateTotalPriceChange}/>
                )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem
                {...formItemLayout}
                label="楼栋地上总楼层"
                validateStatus={validateTotalFloorStatus}
            >
              {getFieldDecorator('totalFloorNum', {
                rules: [
                  {
                    validator: this.isHighter
                  }
                ],
                initialValue: caseId
                    ? caseDetail.get('totalFloorNum')
                    : undefined
              })(
                  <InputNumber
                      style={{ width: '100%' }}
                      precision={0}
                      placeholder="请输入总楼层"
                      min={1}
                  />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
                {...formItemLayout}
                label="所在楼层"
                // validateStatus={validateFloorNoStatus}
            >
              {getFieldDecorator('floorNo', {
                rules: [
                  {
                    validator: this.isFloorNo
                  }
                ],
                initialValue: caseId ? caseDetail.get('floorNo') : undefined
              })(
                  <InputNumber
                      precision={0}
                      style={{ width: '100%' }}
                      placeholder="请输入楼层"
                  />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="开拍时间">
              {getFieldDecorator('openDate', {
                rules: [],
                initialValue: caseId ? openDate : undefined
              })(<DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
                {...formItemLayout}
                label="报名人数"
            >
              {getFieldDecorator('applyNum', {
                rules: [
                  {
                    validator: this.handleApplyNum
                  }
                ],
                initialValue: caseId ? caseDetail.get('applyNum') : undefined
              })(
                  <InputNumber
                      precision={0}
                      style={{ width: '100%' }}
                      placeholder="请输入报名人数"
                  />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem
                {...formItemLayout}
                label="设置提醒人数"
            >
              {getFieldDecorator('settingRemindNum', {
                rules: [
                  {
                    validator: this.handleSettingRemindNum
                  }
                ],
                initialValue: caseId ? caseDetail.get('settingRemindNum') : undefined
              })(
                  <InputNumber
                      precision={0}
                      style={{ width: '100%' }}
                      placeholder="请输入设置提醒人数"
                  />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="围观次数" >
              {getFieldDecorator('onlookerNum', {
                rules: [
                  {
                    validator: this.handleOnlookerNum
                  }
                ],
                initialValue: caseId ? caseDetail.get('onlookerNum') : undefined
              })(
                  <InputNumber
                      precision={0}
                      style={{ width: '100%' }}
                      placeholder="请输入围观次数"
                  />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="起拍价" >
              {getFieldDecorator('startingPrice', {
                rules: [
                  {
                    validator: this.handleStartingPrice
                  }
                ],
                initialValue: caseId ? caseDetail.get('startingPrice') : undefined
              })(
                  <InputNumber
                      precision={0}
                      style={{ width: '100%' }}
                      placeholder="请输入起拍价"
                  />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="加价幅度" >
              {getFieldDecorator('bidIncrement', {
                rules: [
                  {
                    validator: this.handleBidIncrement
                  }
                ],
                initialValue: caseId ? caseDetail.get('bidIncrement') : undefined
              })(
                  <InputNumber
                      precision={0}
                      style={{ width: '100%' }}
                      placeholder="请输入加价幅度"
                  />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="保证金" >
              {getFieldDecorator('securityFund', {
                rules: [
                  {
                    validator: this.handleSecurityFund
                  }
                ],
                initialValue: caseId ? caseDetail.get('securityFund') : undefined
              })(
                  <InputNumber
                      precision={0}
                      style={{ width: '100%' }}
                      placeholder="请输入保证金"
                  />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="变卖预交款" >
              {getFieldDecorator('advancePayment', {
                rules: [
                  {
                    validator: this.handleAdvancePayment
                  }
                ],
                initialValue: caseId ? caseDetail.get('advancePayment') : undefined
              })(
                  <InputNumber
                      precision={0}
                      style={{ width: '100%' }}
                      placeholder="请输入变卖预交款"
                  />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="朝向">
              {getFieldDecorator('orientationCode', {
                initialValue: caseId
                    ? this.formatString(caseDetail.get('orientationCode'))
                    : undefined
              })(
                  <Select
                      style={{ width: '100%' }}
                      placeholder="请选择"
                      allowClear
                  >
                    {orientTypeList.map(option => (
                        <Option key={option.get('code')} value={option.get('code')}>
                          {option.get('name')}
                        </Option>
                    ))}
                  </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="建筑类型">
              {getFieldDecorator('buildingTypeCode', {
                initialValue: caseId
                    ? this.formatString(caseDetail.get('buildingTypeCode'))
                    : undefined
              })(
                  <Select
                      style={{ width: '100%' }}
                      placeholder="请选择"
                      allowClear
                  >
                    {buildTypeList.map(option => (
                        <Option key={option.get('code')} value={option.get('code')}>
                          {option.get('name')}
                        </Option>
                    ))}
                  </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="户型">
              {getFieldDecorator('houseTypeCode', {
                initialValue: caseId
                    ? this.formatString(caseDetail.get('houseTypeCode'))
                    : undefined
              })(
                  <Select
                      style={{ width: '100%' }}
                      placeholder="请选择"
                      allowClear
                  >
                    {houseTypeList.map(option => (
                        <Option key={option.get('code')} value={option.get('code')}>
                          {option.get('name')}
                        </Option>
                    ))}
                  </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="是否多套">
              {getFieldDecorator('isMulty', {
                initialValue: caseId
                    ? this.formatString(caseDetail.get('isMulty'))
                    : undefined
              })(
                  <Select
                      style={{ width: '100%' }}
                      placeholder="请选择"
                      allowClear
                  >
                    {isMultyList.map(option => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                    ))}
                  </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="户型结构">
              {getFieldDecorator('houseStructureCode', {
                initialValue: caseId
                    ? this.formatString(caseDetail.get('houseStructureCode'))
                    : undefined
              })(
                  <Select
                      style={{ width: '100%' }}
                      placeholder="请选择"
                      allowClear
                  >
                    {structTypeList.map(option => (
                        <Option key={option.get('code')} value={option.get('code')}>
                          {option.get('name')}
                        </Option>
                    ))}
                  </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="建筑年代">
              {getFieldDecorator('buildDate', {
                rules: [
                  {
                    max: 20,
                    message: '最大长度20个字符'
                  }
                ],
                initialValue: caseId ? caseDetail.get('buildDate') : undefined
              })(
                  <Input
                      // maxLength={20}
                      style={{ width: '100%' }}
                      placeholder="请输入"
                  />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="装修">
              {getFieldDecorator('decoration', {
                rules: [
                  {
                    max: 20,
                    message: '最大长度20个字符'
                  }
                ],
                initialValue: caseId ? caseDetail.get('decoration') : undefined
              })(
                  <Input
                      // maxLength={20}
                      style={{ width: '100%' }}
                      placeholder="请输入"
                  />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="使用面积">
              {getFieldDecorator('usableArea', {
                initialValue: caseId ? caseDetail.get('usableArea') : undefined
              })(
                  <InputNumber
                      max={1000000000000000}
                      min={0.01}
                      style={{ width: '100%' }}
                      precision={2}
                      placeholder="请输入"
                  />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="附属房屋">
              {getFieldDecorator('subProperty', {
                rules: [
                  {
                    max: 50,
                    message: '最大长度50'
                  }
                ],
                initialValue: caseId ? caseDetail.get('subProperty') : undefined
              })(
                  <Input
                      // maxLength={50}
                      style={{ width: '100%' }}
                      placeholder="请输入"
                  />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="配套">
              {getFieldDecorator('supportingFacilities', {
                rules: [
                  {
                    max: 100,
                    message: '最大长度100'
                  }
                ],
                initialValue: caseId
                    ? caseDetail.get('supportingFacilities')
                    : undefined
              })(
                  <Input
                      // maxLength={100}
                      style={{ width: '100%' }}
                      placeholder="请输入"
                  />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="案例来源">
              {getFieldDecorator('dataSource', {
                rules: [
                  {
                    max: 100,
                    message: '最大长度100'
                  }
                ],
                initialValue: caseId ? caseDetail.get('dataSource') : undefined
              })(
                  <Input
                      // maxLength={100}
                      style={{ width: '100%' }}
                      placeholder="请输入"
                  />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="来源链接">
              {getFieldDecorator('sourceLink', {
                rules: [
                  {
                    max: 200,
                    message: '最大长度200'
                  }
                ],
                initialValue: caseId ? caseDetail.get('sourceLink') : undefined
              })(
                  <Input
                      // maxLength={200}
                      style={{ width: '100%' }}
                      placeholder="请输入"
                  />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="备注">
              {getFieldDecorator('remark', {
                rules: [
                  {
                    max: 255,
                    message: '最大长度255'
                  }
                ],
                initialValue: caseId ? caseDetail.get('remark') : undefined
              })(
                  <TextArea
                      // maxLength={255}
                      autosize={{ maxRows: 4 }}
                      placeholder="请输入"
                  />
              )}
            </FormItem>
          </Col>
          {/*{caseId ? (*/}
          {/*    <Col span={8}>*/}
          {/*      <FormItem {...formItemLayout} label="录入人">*/}
          {/*        {getFieldDecorator('creator', {*/}
          {/*          rules: [*/}
          {/*            {*/}
          {/*              max: 50,*/}
          {/*              message: '最大长度50'*/}
          {/*            }*/}
          {/*          ],*/}
          {/*          initialValue: caseId ? caseDetail.get('creator') : undefined*/}
          {/*        })(<Input disabled style={{ width: '100%' }} />)}*/}
          {/*      </FormItem>*/}
          {/*    </Col>*/}
          {/*) : null}*/}
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label=" " colon={false}>
              {caseId ? (
                <Fragment>
                  {pagePermission('fdc:hd:residence:rental:change') ? (
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
              ) : (
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
      <div>
        {this.renderBreads()}
        <div className={styles.container}>{this.renderForm()}</div>
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
)(CaseLosureInfoEdit)
