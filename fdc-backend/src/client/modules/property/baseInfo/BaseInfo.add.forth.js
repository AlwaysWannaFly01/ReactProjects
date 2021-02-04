import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Form, Row, Col, Input, Select, InputNumber } from 'antd'
import Immutable from 'immutable'

import formatString from 'client/utils/formatString'

import { containerActions } from './actions'
import './sagas'
import './reducer'
import { modelSelector } from './selector'

import styles from './BaseInfo.less'

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
* 楼盘新增 土地信息
*/
class BaseInfoAddForth extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    onAddForthRef: PropTypes.func.isRequired,
    initialAddFetchForth: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    projectDetail: PropTypes.instanceOf(Immutable.Map).isRequired,
    projectStatus: PropTypes.string.isRequired,
    projectId: PropTypes.string
  }

  constructor(props) {
    super(props)

    props.initialAddFetchForth()
    props.onAddForthRef(this)
  }

  handleLimitLandplanUsage = (value, rule, callback) => {
    const { landPlanUsage } = this.props.form.getFieldsValue(['landPlanUsage'])
    if (landPlanUsage.length > 6) {
      callback('土地规划用途选取个数限制6个')
    }
    callback()
  }

  handleValidateTotalBuildingNum = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('总栋数应大于0')
    }
    callback()
  }

  handleValidateTotalHouseNum = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('总套数应大于0')
    }
    callback()
  }

  handleValidateLandArea = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('占地面积应大于0')
    }
    callback()
  }

  handleValidateBuildingArea = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('建筑面积应大于0')
    }
    callback()
  }

  handleValidateOfficeArea = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('办公面积应大于0')
    }
    callback()
  }

  handleValidateBusinessArea = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('商业面积应大于0')
    }
    callback()
  }

  handleValidateLandUsageDuration = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('土地使用年限应大于0')
    }
    callback()
  }

  submitForth = () =>
    new Promise((resolve, reject) => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          values.landPlanUsage = values.landPlanUsage
            ? values.landPlanUsage.join(',')
            : ''
          resolve(values)
        } else {
          /* eslint-disable */
          reject('4')
        }
      })
    })

  render() {
    const {
      form: { getFieldDecorator },
      projectDetail,
      projectStatus,
      projectId
    } = this.props

    const landPlanUsageList = this.props.model.get('landPlanUsageList')
    // 土地级别
    const landLevelList = this.props.model.get('landLevelList')

    return (
      <form>
        <Row>
          <Col span={8}>
            <FormItem label="是否已拆迁" {...formItemLayout}>
              {getFieldDecorator('isPulledDown', {
                initialValue: projectId
                  ? formatString(projectDetail.get('isPulledDown'))
                  : undefined
              })(
                <Select
                  placeholder="请选择"
                  disabled={projectStatus === '0'}
                  allowClear
                >
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="总栋数" {...formItemLayout}>
              {getFieldDecorator('totalBuildingNum', {
                rules: [
                  {
                    validator: this.handleValidateTotalBuildingNum
                  }
                ],
                initialValue: projectDetail.get('totalBuildingNum')
              })(
                <InputNumber
                  disabled={projectStatus === '0'}
                  placeholder="请输入"
                  // min={0}
                  style={{ width: '100%' }}
                  precision={0}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="总套数" {...formItemLayout}>
              {getFieldDecorator('totalHouseNum', {
                rules: [
                  {
                    validator: this.handleValidateTotalHouseNum
                  }
                ],
                initialValue: projectDetail.get('totalHouseNum')
              })(
                <InputNumber
                  disabled={projectStatus === '0'}
                  placeholder="请输入"
                  // min={0}
                  style={{ width: '100%' }}
                  precision={0}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="占地面积" {...formItemLayout}>
              {getFieldDecorator('landArea', {
                rules: [
                  {
                    validator: this.handleValidateLandArea
                  }
                ],
                initialValue: projectDetail.get('landArea')
              })(
                <InputNumber
                  disabled={projectStatus === '0'}
                  placeholder="请输入"
                  // min={0}
                  style={{ width: '100%' }}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="建筑面积" {...formItemLayout}>
              {getFieldDecorator('buildingArea', {
                rules: [
                  {
                    validator: this.handleValidateBuildingArea
                  }
                ],
                initialValue: projectDetail.get('buildingArea')
              })(
                <InputNumber
                  disabled={projectStatus === '0'}
                  placeholder="请输入"
                  // min={0}
                  style={{ width: '100%' }}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="办公面积" {...formItemLayout}>
              {getFieldDecorator('officeArea', {
                rules: [
                  {
                    validator: this.handleValidateOfficeArea
                  }
                ],
                initialValue: projectDetail.get('officeArea')
              })(
                <InputNumber
                  disabled={projectStatus === '0'}
                  placeholder="请输入"
                  // min={0}
                  style={{ width: '100%' }}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="商业面积" {...formItemLayout}>
              {getFieldDecorator('businessArea', {
                rules: [
                  {
                    validator: this.handleValidateBusinessArea
                  }
                ],
                initialValue: projectDetail.get('businessArea')
              })(
                <InputNumber
                  disabled={projectStatus === '0'}
                  placeholder="请输入"
                  // min={0}
                  style={{ width: '100%' }}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="地下室用途" {...formItemLayout}>
              {getFieldDecorator('basementPurpose', {
                rules: [
                  {
                    max: 200,
                    message: '最大长度为200'
                  }
                ],
                initialValue: projectDetail.get('basementPurpose')
              })(
                <TextArea
                  disabled={projectStatus === '0'}
                  placeholder="请输入"
                  autosize={{ maxRows: 4 }}
                  // maxLength="200"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="土地规划用途" {...formItemLayout}>
              {getFieldDecorator('landPlanUsage', {
                rules: [
                  {
                    validator: this.handleLimitLandplanUsage
                  }
                ],
                initialValue: projectDetail.get('landPlanUsage')
                  ? projectDetail.get('landPlanUsage').split(',')
                  : []
              })(
                <Select
                  placeholder="请选择土地规划用途"
                  mode="multiple"
                  disabled={projectStatus === '0'}
                  className={styles.usageSelect}
                >
                  {landPlanUsageList.map(item => (
                    <Option key={item.get('code')} value={item.get('code')}>
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
            <FormItem label="宗地号" {...formItemLayout}>
              {getFieldDecorator('landNo', {
                rules: [
                  {
                    max: 100,
                    message: '最大长度为100'
                  }
                ],
                initialValue: projectDetail.get('landNo')
              })(
                <TextArea
                  disabled={projectStatus === '0'}
                  placeholder="请输入"
                  autosize={{ maxRows: 4 }}
                  // maxLength="100"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="土地级别" {...formItemLayout}>
              {getFieldDecorator('landLevelCode', {
                initialValue: projectDetail.get('landLevelCode') || undefined
              })(
                <Select
                  placeholder="请选择土地级别"
                  disabled={projectStatus === '0'}
                  allowClear
                >
                  {landLevelList.map(item => (
                    <Option key={item.get('code')} value={+item.get('code')}>
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
            <FormItem label="土地使用年限" {...formItemLayout}>
              {getFieldDecorator('landUsageDuration', {
                rules: [
                  {
                    validator: this.handleValidateLandUsageDuration
                  }
                ],
                initialValue: projectDetail.get('landUsageDuration')
              })(
                <InputNumber
                  disabled={projectStatus === '0'}
                  placeholder="请输入"
                  max={127}
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
      </form>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    modelSelector,
    containerActions
  )
)(BaseInfoAddForth)
