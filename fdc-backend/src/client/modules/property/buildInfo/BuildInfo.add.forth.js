import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Form, Row, Col, Select, Input, DatePicker, InputNumber } from 'antd'
import Immutable from 'immutable'
import moment from 'moment'

import formatString from 'client/utils/formatString'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

const FormItem = Form.Item
const { Option } = Select
const { TextArea } = Input

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
* 楼栋新增 / 编辑 楼栋规模
*/
class BuildInfoAddForth extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    onAddForthRef: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    buildId: PropTypes.string.isRequired,
    initialAddFetchForth: PropTypes.func.isRequired,
    buildStatus: PropTypes.any.isRequired
  }

  constructor(props) {
    super(props)

    props.onAddForthRef(this)
  }

  componentDidMount() {
    this.props.initialAddFetchForth()
  }

  handleValidateForSaleAvgPrice = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('销售均价应大于0')
    }
    callback()
  }

  handleValidateUnitNum = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('单元数应大于0')
    }
    callback()
  }

  handleValidateTotalHouseholdNum = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('总户数应大于0')
    }
    callback()
  }

  handleValidateSingleFloorHouseholdNum = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('单层户数应大于0')
    }
    callback()
  }

  handleValidateFloorHeight = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('层高应大于0')
    }
    callback()
  }

  handleValidateTotalBuildingArea = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('建筑面积应大于0')
    }
    callback()
  }

  handleValidateUndergroundFloorNum = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('地下室层数应大于0')
    }
    callback()
  }

  handleValidateUndergroundArea = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('地下室总面积应大于0')
    }
    callback()
  }

  handleValidateAvgPriceFloor = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('均价层应大于0')
    }
    callback()
  }

  handleValidateSubHouseAvgPrice = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('附属房屋均价应大于0')
    }
    callback()
  }

  handleValidateElevatorNum = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('电梯数量应大于0')
    }
    callback()
  }

  submitForth = () =>
    new Promise((resolve, reject) => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          // values.isAbleEvaluated = values.isAbleEvaluated ? 1 : 0
          // values.isVirtual = values.isVirtual ? 1 : 0
          values.onboardDate = values.onboardDate
            ? values.onboardDate.format('YYYY-MM-DD')
            : ''
          resolve(values)
        } else {
          /* eslint-disable */
          reject('4')
        }
      })
    })

  // 楼栋规模
  render() {
    const {
      form: { getFieldDecorator },
      buildId,
      buildStatus
    } = this.props

    const buildDetail = this.props.model.get('buildDetail')

    let onboardDate = buildDetail.get('onboardDate') || undefined
    if (onboardDate) {
      onboardDate = moment(onboardDate)
    }

    const {
      externalWallList,
      insideDecorateTypeList,
      wallTypeList,
      maintenanceCodeList,
      gasCodeList,
      warmCodeList
    } = this.props.model

    return (
      <Form>
        <Row>
          <Col span={8}>
            <FormItem label="销售均价" {...formItemLayout}>
              {getFieldDecorator('forSaleAvgPrice', {
                rules: [
                  {
                    validator: this.handleValidateForSaleAvgPrice
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('forSaleAvgPrice') || undefined
                  : undefined
              })(
                <InputNumber
                  disabled={!buildStatus}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="销售许可证" {...formItemLayout}>
              {getFieldDecorator('forSaleLicence', {
                rules: [
                  {
                    max: 50,
                    message: '最大长度50'
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('forSaleLicence') || undefined
                  : undefined
              })(
                <TextArea
                  disabled={!buildStatus}
                  placeholder="请输入"
                  autosize={{ maxRows: 4 }}
                  // maxLength="50"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="单元数" {...formItemLayout}>
              {getFieldDecorator('unitNum', {
                rules: [
                  {
                    validator: this.handleValidateUnitNum
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('unitNum') || undefined
                  : undefined
              })(
                <InputNumber
                  disabled={!buildStatus}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="总户数" {...formItemLayout}>
              {getFieldDecorator('totalHouseholdNum', {
                rules: [
                  {
                    validator: this.handleValidateTotalHouseholdNum
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('totalHouseholdNum') || undefined
                  : undefined
              })(
                <InputNumber
                  disabled={!buildStatus}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="单层户数" {...formItemLayout}>
              {getFieldDecorator('singleFloorHouseholdNum', {
                rules: [
                  {
                    validator: this.handleValidateSingleFloorHouseholdNum
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('singleFloorHouseholdNum') || undefined
                  : undefined
              })(
                <InputNumber
                  disabled={!buildStatus}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="层高" {...formItemLayout}>
              {getFieldDecorator('floorHeight', {
                rules: [
                  {
                    validator: this.handleValidateFloorHeight
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('floorHeight') || undefined
                  : undefined
              })(
                <InputNumber
                  disabled={!buildStatus}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="建筑面积" {...formItemLayout}>
              {getFieldDecorator('totalBuildingArea', {
                rules: [
                  {
                    validator: this.handleValidateTotalBuildingArea
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('totalBuildingArea') || undefined
                  : undefined
              })(
                <InputNumber
                  disabled={!buildStatus}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="入伙日期" {...formItemLayout}>
              {getFieldDecorator('onboardDate', {
                initialValue: buildId ? onboardDate : undefined
              })(
                <DatePicker disabled={!buildStatus} style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="楼层分布" {...formItemLayout}>
              {getFieldDecorator('floorDistribution', {
                rules: [
                  {
                    max: 200,
                    message: '最大长度200'
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('floorDistribution') || undefined
                  : undefined
              })(
                <TextArea
                  disabled={!buildStatus}
                  placeholder="请输入"
                  autosize={{ maxRows: 4 }}
                  // maxLength="200"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="地下室层数" {...formItemLayout}>
              {getFieldDecorator('undergroundFloorNum', {
                rules: [
                  {
                    validator: this.handleValidateUndergroundFloorNum
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('undergroundFloorNum') || undefined
                  : undefined
              })(
                <InputNumber
                  disabled={!buildStatus}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="地下室总面积" {...formItemLayout}>
              {getFieldDecorator('undergroundArea', {
                rules: [
                  {
                    validator: this.handleValidateUndergroundArea
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('undergroundArea') || undefined
                  : undefined
              })(
                <InputNumber
                  disabled={!buildStatus}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="地下室用途" {...formItemLayout}>
              {getFieldDecorator('undergroundUsage', {
                rules: [
                  {
                    max: 200,
                    message: '最大长度200'
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('undergroundUsage') || undefined
                  : undefined
              })(
                <TextArea
                  disabled={!buildStatus}
                  placeholder="请输入"
                  autosize={{ maxRows: 4 }}
                  // maxLength="200"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="均价层" {...formItemLayout}>
              {getFieldDecorator('avgPriceFloor', {
                rules: [
                  {
                    validator: this.handleValidateAvgPriceFloor
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('avgPriceFloor') || undefined
                  : undefined
              })(
                <InputNumber
                  disabled={!buildStatus}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="附属房屋均价" {...formItemLayout}>
              {getFieldDecorator('subHouseAvgPrice', {
                rules: [
                  {
                    validator: this.handleValidateSubHouseAvgPrice
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('subHouseAvgPrice') || undefined
                  : undefined
              })(
                <InputNumber
                  disabled={!buildStatus}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="外墙装修" {...formItemLayout}>
              {getFieldDecorator('externalWallDecorateCode', {
                initialValue: buildId
                  ? formatString(buildDetail.get('externalWallDecorateCode'))
                  : undefined
              })(
                <Select placeholder="请选择" disabled={!buildStatus} allowClear>
                  {externalWallList.map(item => (
                    <Option value={item.get('code')} key={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="内部装修" {...formItemLayout}>
              {getFieldDecorator('internalDecorateCode', {
                initialValue: buildId
                  ? formatString(buildDetail.get('internalDecorateCode'))
                  : undefined
              })(
                <Select placeholder="请选择" disabled={!buildStatus} allowClear>
                  {insideDecorateTypeList.map(item => (
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
          <Col span={8}>
            <FormItem label="墙体类型" {...formItemLayout}>
              {getFieldDecorator('wallTypeCode', {
                initialValue: buildId
                  ? formatString(buildDetail.get('wallTypeCode'))
                  : undefined
              })(
                <Select placeholder="请选择" disabled={!buildStatus} allowClear>
                  {wallTypeList.map(item => (
                    <Option value={item.get('code')} key={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="维护情况" {...formItemLayout}>
              {getFieldDecorator('maintenanceCode', {
                initialValue: buildId
                  ? formatString(buildDetail.get('maintenanceCode'))
                  : undefined
              })(
                <Select placeholder="请选择" disabled={!buildStatus} allowClear>
                  {maintenanceCodeList.map(item => (
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
          <Col span={8}>
            <FormItem label="管道燃气" {...formItemLayout}>
              {getFieldDecorator('gasCode', {
                initialValue: buildId
                  ? formatString(buildDetail.get('gasCode'))
                  : undefined
              })(
                <Select placeholder="请选择" disabled={!buildStatus} allowClear>
                  {gasCodeList.map(item => (
                    <Option value={item.get('code')} key={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="采暖方式" {...formItemLayout}>
              {getFieldDecorator('warmCode', {
                initialValue: buildId
                  ? formatString(buildDetail.get('warmCode'))
                  : undefined
              })(
                <Select placeholder="请选择" disabled={!buildStatus} allowClear>
                  {warmCodeList.map(item => (
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
          <Col span={8}>
            <FormItem label="电梯数量" {...formItemLayout}>
              {getFieldDecorator('elevatorNum', {
                rules: [
                  {
                    validator: this.handleValidateElevatorNum
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('elevatorNum')
                  : undefined
              })(
                <InputNumber
                  precision={0}
                  disabled={!buildStatus}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="电梯品牌" {...formItemLayout}>
              {getFieldDecorator('elevatorBrand', {
                rules: [
                  {
                    max: 50,
                    message: '最大长度50'
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('elevatorBrand')
                  : undefined
              })(
                <TextArea
                  disabled={!buildStatus}
                  placeholder="请输入"
                  autosize={{ maxRows: 4 }}
                  // maxLength="50"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="是否虚拟楼栋" {...formItemLayout}>
              {getFieldDecorator('isVirtual', {
                initialValue: buildId
                  ? formatString(buildDetail.get('isVirtual'))
                  : undefined
              })(
                <Select placeholder="请选择" disabled={!buildStatus}>
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="是否可估" {...formItemLayout}>
              {getFieldDecorator('isAbleEvaluated', {
                initialValue: buildId
                  ? formatString(buildDetail.get('isAbleEvaluated'))
                  : undefined
              })(
                <Select placeholder="请选择" disabled={!buildStatus}>
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="设备设施" {...formItemLayout}>
              {getFieldDecorator('facility', {
                rules: [
                  {
                    max: 200,
                    message: '最大长度为200'
                  }
                ],
                initialValue: buildId ? buildDetail.get('facility') : undefined
              })(
                <TextArea
                  disabled={!buildStatus}
                  placeholder="请输入"
                  autosize={{ maxRows: 4 }}
                  // maxLength="200"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="备注" {...formItemLayout}>
              {getFieldDecorator('remark', {
                rules: [
                  {
                    max: 500,
                    message: '最大长度500'
                  }
                ],
                initialValue: buildId ? buildDetail.get('remark') : undefined
              })(
                <TextArea
                  placeholder="请输入"
                  disabled={!buildStatus}
                  autosize={{ maxRows: 8 }}
                  // maxLength="500"
                />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    modelSelector,
    containerActions
  )
)(BuildInfoAddForth)
