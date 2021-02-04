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
  Message
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
 * 租金案例编辑/新增
 */
class CaseInfoRentEdit extends Component {
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
    updateVisitCities: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    const { caseId = '', cityId, cityName } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      // 案例ID
      caseId,

      loading: false,

      // 校验所在楼层状态
      validateFloorNoStatus: '',
      validateTotalFloorStatus: '',
      cityId,
      cityName
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

        // 如果有caseId,则为编辑,去查询案例详情
        if (this.state.caseId) {
          this.props.getCaseDetail(this.state.caseId, cityId)
        }
      }
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  componentWillUnmount() {
    this.props.clearCaseDetail()
  }

  onProjectSelectRef = ref => {
    this.projectSelectRef = ref
  }

  // 建筑面积/案例单价 变更 计算总价
  handleHouseAreaBlur = () => {
    const { unitprice, houseArea } = this.props.form.getFieldsValue([
      'unitprice',
      'houseArea'
    ])
    if (unitprice > 0 && houseArea > 0) {
      let total = unitprice * houseArea
      total = Number.isNaN(total) ? 0 : total
      const totalPrice = total.toFixed(2)
      this.props.form.setFieldsValue({ totalPrice })
    } else {
      this.props.form.setFieldsValue({ totalPrice: undefined })
    }
  }

  // 楼层数不能大于总楼层数
  isUnderTotal = (rule, value, callback) => {
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
    } else {
      callback('所在楼层不能为0')
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

  handleValidateStandardPrice = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('反调差标准价应大于0')
    }
    callback()
  }

  handleValidateAvgPrice = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('反调差均价应大于0')
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

        const { projectId } = values.projectItem
        delete values.projectItem
        values.caseHappenDate =
          values.caseHappenDate && values.caseHappenDate.format('YYYY-MM-DD')
        values.projectId = projectId
        values.cityId = cityId
        if (caseId) {
          values.id = caseId
          this.props.editCase(values, res => {
            const { code, message } = res
            if (+code === 200) {
              this.projectSelectRef.resetProjectSelect()
              this.props.clearCaseDetail()
              Message.success('编辑成功')
              // this.props.history.goBack()
              // 列表查询条件
              const caseInfoSearch = sessionStorage.getItem(
                'CASE_INFO_RENT_SEARCH'
              )
              this.props.history.push({
                pathname: router.RES_RENT_CASEINFO,
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
              this.projectSelectRef.resetProjectSelect()
              // this.props.history.goBack() change wy
              Message.success('新增成功')
              const caseInfoSearch = sessionStorage.getItem(
                'CASE_INFO_RENT_SEARCH'
              )
              this.props.history.push({
                pathname: router.RES_RENT_CASEINFO,
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
        name: '租金案例数据'
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
      validateFloorNoStatus,
      validateTotalFloorStatus,
      cityId
    } = this.state

    const { getFieldDecorator } = this.props.form

    /* eslint-disable */
    const {
      caseTypeList,
      houseUsageList,
      orientTypeList,
      buildTypeList,
      houseTypeList,
      structTypeList,
      currencyTypeList,
      payTypeCodeList,
      rentTypeCodeList,

      caseDetail
    } = this.props.model

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
            <FormItem {...formItemLayout} label="楼盘名称">
              {getFieldDecorator('projectItem', {
                rules: [{ required: true, message: '请输入楼盘名称' }]
              })(
                <ProjectSelect
                  projectItem={projectItem}
                  cityId={cityId}
                  onProjectSelectRef={this.onProjectSelectRef}
                />
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
            <FormItem {...formItemLayout} label="案例日期">
              {getFieldDecorator('caseHappenDate', {
                rules: [{ required: true, message: '请选择案例日期' }],
                initialValue: caseId ? caseHappenDate : undefined
              })(<DatePicker style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="建筑面积">
              {getFieldDecorator('houseArea', {
                rules: [
                  { required: true, message: '请输入建筑面积' },
                  {
                    validator: this.handleValidateHouseArea
                  }
                ],
                initialValue: caseId ? caseDetail.get('houseArea') : undefined
              })(
                <InputNumber
                  max={100000}
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
            <FormItem {...formItemLayout} label="案例用途">
              {getFieldDecorator('usageCode', {
                rules: [{ required: true, message: '请选择用途' }],
                initialValue: caseId
                  ? this.formatString(caseDetail.get('usageCode'))
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
            <FormItem {...formItemLayout} label="房号名称">
              {getFieldDecorator('houseName', {
                rules: [
                  {
                    max: 100,
                    message: '最大长度100'
                  }
                ],
                initialValue: caseId ? caseDetail.get('houseName') : undefined
              })(
                <Input
                  // maxLength={100}
                  style={{ width: '100%' }}
                  placeholder="请输入房号名称"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem
              {...formItemLayout}
              label="所在楼层"
              validateStatus={validateFloorNoStatus}
            >
              {getFieldDecorator('floorNo', {
                rules: [
                  {
                    validator: this.isUnderTotal
                  }
                ],
                initialValue: caseId ? caseDetail.get('floorNo') : undefined
              })(
                <InputNumber
                  precision={0}
                  max={2147483647}
                  style={{ width: '100%' }}
                  placeholder="请输入楼层"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
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
                  max={2147483647}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="案例单价">
              {getFieldDecorator('unitprice', {
                rules: [
                  { required: true, message: '请输入单价' },
                  {
                    validator: this.handleValidateUnitprice
                  }
                ],
                initialValue: caseId ? caseDetail.get('unitprice') : undefined
              })(
                <InputNumber
                  max={1000000000}
                  // max={2147483647}
                  // min={0}
                  style={{ width: '100%' }}
                  precision={2}
                  placeholder="请输入"
                  onBlur={this.handleHouseAreaBlur}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="案例总价">
              {getFieldDecorator('totalPrice', {
                rules: [{ required: true, message: '请输入总价' }],
                initialValue: caseId ? caseDetail.get('totalPrice') : undefined
              })(
                <InputNumber
                  disabled
                  style={{ width: '100%' }}
                  precision={2}
                  max={2147483647}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="反调差标准价">
              {getFieldDecorator('inverseDiffStandardPrice', {
                rules: [
                  {
                    validator: this.handleValidateStandardPrice
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('inverseDiffStandardPrice')
                  : undefined
              })(
                <InputNumber
                  max={1000000000}
                  // max={2147483647}
                  // min={0}
                  style={{ width: '100%' }}
                  precision={2}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="反调差均价">
              {getFieldDecorator('inverseDiffAvgPrice', {
                rules: [
                  {
                    validator: this.handleValidateAvgPrice
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('inverseDiffAvgPrice')
                  : undefined
              })(
                <InputNumber
                  max={1000000000}
                  // max={2147483647}
                  // min={0}
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
            <FormItem {...formItemLayout} label="案例类型">
              {getFieldDecorator('caseTypeCode', {
                rules: [{ required: true, message: '请选择案例类型' }],
                initialValue: caseId
                  ? this.formatString(caseDetail.get('caseTypeCode'))
                  : undefined
              })(
                <Select style={{ width: '100%' }} placeholder="请选择">
                  {caseTypeList.map(option => (
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
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="出租方式">
              {getFieldDecorator('rentTypeCode', {
                initialValue: caseId
                  ? this.formatString(caseDetail.get('rentTypeCode'))
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {rentTypeCodeList.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="押付方式">
              {getFieldDecorator('payTypeCode', {
                rules: [
                  {
                    max: 20,
                    message: '最大长度20'
                  }
                ],
                initialValue: caseId
                  ? this.formatString(caseDetail.get('payTypeCode'))
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {payTypeCodeList.map(option => (
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
          <Col span={8}>
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
                    message: '最大长度20'
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
            <FormItem {...formItemLayout} label="剩余年限">
              {getFieldDecorator('remainTime', {
                initialValue: caseId ? caseDetail.get('remainTime') : undefined
              })(
                <InputNumber
                  min={0}
                  max={2147483647}
                  style={{ width: '100%' }}
                  precision={0}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="装修">
              {getFieldDecorator('decoration', {
                rules: [
                  {
                    max: 20,
                    message: '最大长度20'
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
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="使用面积">
              {getFieldDecorator('usableArea', {
                initialValue: caseId ? caseDetail.get('usableArea') : undefined
              })(
                <InputNumber
                  max={1000000000000000}
                  min={0}
                  style={{ width: '100%' }}
                  precision={2}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="成新率">
              {getFieldDecorator('decorationRate', {
                initialValue: caseId
                  ? caseDetail.get('decorationRate')
                  : undefined
              })(
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  precision={1}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="币种">
              {getFieldDecorator('currencyCode', {
                initialValue: caseId
                  ? this.formatString(caseDetail.get('currencyCode'))
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {currencyTypeList.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
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
        </Row>
        <Row>
          <Col span={10}>
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
          <Col span={8}>
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
        </Row>
        <Row>
          <Col span={10}>
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
          <Col span={8}>
            <FormItem {...formItemLayout} label="来源电话">
              {getFieldDecorator('sourcePhone', {
                rules: [
                  {
                    max: 50,
                    message: '最大长度50'
                  }
                ],
                initialValue: caseId ? caseDetail.get('sourcePhone') : undefined
              })(
                <Input
                  // maxLength={50}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
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
          {caseId ? (
            <Col span={8}>
              <FormItem {...formItemLayout} label="录入人">
                {getFieldDecorator('creator', {
                  rules: [
                    {
                      max: 50,
                      message: '最大长度50'
                    }
                  ],
                  initialValue: caseId ? caseDetail.get('creator') : undefined
                })(<Input disabled style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
          ) : null}
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
)(CaseInfoRentEdit)
