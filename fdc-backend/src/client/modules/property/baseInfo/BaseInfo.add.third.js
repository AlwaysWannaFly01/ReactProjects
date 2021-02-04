import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Form, Row, Col, Input, Select, InputNumber } from 'antd'
import Immutable from 'immutable'

import MultipleDatePicker from 'client/components/multiple-date-picker'
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
 * 楼盘新增 小区详情
 */
class BaseInfoAddThird extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    onAddThirdRef: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    initialAddFetchThird: PropTypes.func.isRequired,
    projectDetail: PropTypes.instanceOf(Immutable.Map).isRequired,
    projectId: PropTypes.string.isRequired,
    projectStatus: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props)
    props.initialAddFetchThird()
    props.onAddThirdRef(this)
    this.state = {
      isCovid19Diagnosed: null,
      covid19DiagnosedNum: null,
      upDateFlag: false
    }
  }

  handleValidateCapacityRate = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('容积率应大于0')
    }
    callback()
  }

  handleValidateGreenRate = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 1) {
      callback('绿化率应大于1')
    }
    callback()
  }

  handleValidateProjectAvgPrice = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('项目均价应大于0')
    }
    callback()
  }

  handleValidateOpeningAvgPrice = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('开盘均价应大于0')
    }
    callback()
  }

  handleValidateCovid19DiagnosedNum = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('新冠肺炎确诊人数应大于0')
    }
    callback()
  }
  handleSelect = e => {
    if (e === '0' || !e) {
      this.setState({
        isCovid19Diagnosed: e
      })
      this.props.form.setFieldsValue({
        covid19DiagnosedNum: null
      })
    } else {
      this.setState({
        isCovid19Diagnosed: e
      })
    }
  }
  submitThird = () =>
    new Promise((resolve, reject) =>
      this.props.form.validateFields((err, values) => {
        if (!err) {
          values.objectTypeCode = values.objectTypeCode
            ? values.objectTypeCode.join(',')
            : ''
          values.actualUsageCode = values.actualUsageCode
            ? values.actualUsageCode.join(',')
            : ''
          values.onboardingDate = values.onboardingDate
            ? values.onboardingDate.join(',')
            : ''
          resolve(values)
        } else {
          /* eslint-disable */
          reject('3')
        }
      })
    )

  render() {
    const {
      form: { getFieldDecorator },
      projectDetail,
      projectId,
      projectStatus
    } = this.props
    if (!this.state.upDateFlag) {
      this.setState({
        upDateFlag: true,
        isCovid19Diagnosed: projectDetail.get('isCovid19Diagnosed'),
        covid19DiagnosedNum: projectDetail.get('covid19DiagnosedNum')
      })
    }
    const {
      buildingTypeList,
      ownershipTypeList,
      objectTypeList,
      actualUsageTypeList,
      schoolDistrictList
    } = this.props.model
    // 从数据库进来的日期，需要修改格式 WY
    let onboardingDate = []
    if (projectDetail.get('onboardingDate')) {
      const joinDate = projectDetail.get('onboardingDate').split(',')
      joinDate.forEach(function(e) {
        e = e.split('T' || ' ', 1)
        onboardingDate.push(...e)
      })
    }

    // if (projectDetail.get('onboardingDate')) {
    //   onboardingDate = projectDetail.get('onboardingDate').split(',')
    // }

    return (
      <form>
        <Row>
          <Col span={8}>
            <FormItem label="物业类型" {...formItemLayout}>
              {getFieldDecorator('objectTypeCode', {
                initialValue: projectDetail.get('objectTypeCode')
                  ? projectDetail.get('objectTypeCode').split(',')
                  : []
              })(
                <Select
                  placeholder="请选择物业类型"
                  mode="multiple"
                  disabled={projectStatus === '0'}
                >
                  {objectTypeList.map(item => (
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
            <FormItem label="建筑形式" {...formItemLayout}>
              {getFieldDecorator('actualUsageCode', {
                initialValue: projectDetail.get('actualUsageCode')
                  ? projectDetail.get('actualUsageCode').split(',')
                  : []
              })(
                <Select
                  placeholder="请选择建筑形式"
                  mode="multiple"
                  disabled={projectStatus === '0'}
                >
                  {actualUsageTypeList.map(item => (
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
            <FormItem label="入伙日期" {...formItemLayout}>
              {getFieldDecorator('onboardingDate', {
                initialValue: projectId ? onboardingDate : []
              })(
                <MultipleDatePicker
                  width="100%"
                  placeholder="请选择入伙日期"
                  pickerDisabled={projectStatus === '0'}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="是否学区房" {...formItemLayout}>
              {getFieldDecorator('isSchoolDistrictHouse', {
                initialValue: projectId
                  ? formatString(projectDetail.get('isSchoolDistrictHouse'))
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
          <Col span={8}>
            <FormItem label="学区属性" {...formItemLayout}>
              {getFieldDecorator('schoolDistrictProperty', {
                initialValue:
                  projectDetail.get('schoolDistrictProperty') || undefined
              })(
                <Select
                  placeholder="请选择"
                  disabled={projectStatus === '0'}
                  allowClear
                >
                  {schoolDistrictList.map(item => (
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
            <FormItem label="主建筑物类型" {...formItemLayout}>
              {getFieldDecorator('buildingTypeCode', {
                initialValue: projectDetail.get('buildingTypeCode') || undefined
              })(
                <Select
                  placeholder="请选择"
                  disabled={projectStatus === '0'}
                  allowClear
                >
                  {buildingTypeList.map(item => (
                    <Option key={item.get('code')} value={+item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="产权性质" {...formItemLayout}>
              {getFieldDecorator('ownershipTypeCode', {
                initialValue:
                  projectDetail.get('ownershipTypeCode') || undefined
              })(
                <Select
                  placeholder="请选择"
                  disabled={projectStatus === '0'}
                  allowClear
                >
                  {ownershipTypeList.map(item => (
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
            <FormItem label="是否可估" {...formItemLayout}>
              {getFieldDecorator('isAbleEvaluated', {
                initialValue: projectId
                  ? formatString(projectDetail.get('isAbleEvaluated'))
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
          <Col span={8}>
            <FormItem label="是否完成基础数据" {...formItemLayout}>
              {getFieldDecorator('isBasedataCompleted', {
                initialValue: projectId
                  ? formatString(projectDetail.get('isBasedataCompleted'))
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
            <FormItem label="容积率" {...formItemLayout}>
              {getFieldDecorator('capacityRate', {
                rules: [
                  {
                    validator: this.handleValidateCapacityRate
                  }
                ],
                initialValue: projectDetail.get('capacityRate')
              })(
                <InputNumber
                  disabled={projectStatus === '0'}
                  placeholder="请输入"
                  min={0}
                  max={10}
                  style={{ width: '100%' }}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="绿化率（%）" {...formItemLayout}>
              {getFieldDecorator('greenRate', {
                rules: [
                  {
                    validator: this.handleValidateGreenRate
                  }
                ],
                initialValue: projectDetail.get('greenRate')
              })(
                <InputNumber
                  disabled={projectStatus === '0'}
                  placeholder="请输入"
                  max={90}
                  style={{ width: '100%' }}
                  precision={0}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="项目均价" {...formItemLayout}>
              {getFieldDecorator('projectAvgPrice', {
                rules: [
                  {
                    validator: this.handleValidateProjectAvgPrice
                  }
                ],
                initialValue: projectDetail.get('projectAvgPrice')
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
            <FormItem label="开盘均价" {...formItemLayout}>
              {getFieldDecorator('openingAvgPrice', {
                rules: [
                  {
                    validator: this.handleValidateOpeningAvgPrice
                  }
                ],
                initialValue: projectDetail.get('openingAvgPrice')
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
            <FormItem label="是否新冠确诊小区" {...formItemLayout}>
              {getFieldDecorator('isCovid19Diagnosed', {
                initialValue: projectId
                  ? formatString(this.state.isCovid19Diagnosed)
                  : null
              })(
                <Select
                  placeholder="请选择"
                  disabled={projectStatus === '0'}
                  allowClear
                  onChange={this.handleSelect}
                >
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="确诊人数" {...formItemLayout}>
              {getFieldDecorator('covid19DiagnosedNum', {
                rules: [
                  {
                    validator: this.handleValidateCovid19DiagnosedNum
                  }
                ],
                initialValue: this.state.covid19DiagnosedNum
              })(
                <InputNumber
                  disabled={
                    !this.state.isCovid19Diagnosed ||
                    this.state.isCovid19Diagnosed === '0'
                  }
                  placeholder="请输入"
                  max={1000000000}
                  style={{ width: '100%' }}
                  precision={0}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="开发商" {...formItemLayout}>
              {getFieldDecorator('developerName', {
                rules: [
                  {
                    max: 200,
                    message: '最大长度200'
                  }
                ],
                initialValue: projectDetail.get('developerName')
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
            <FormItem label="物管公司" {...formItemLayout}>
              {getFieldDecorator('managementName', {
                rules: [
                  {
                    max: 200,
                    message: '最大长度200'
                  }
                ],
                initialValue: projectDetail.get('managementName')
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
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="物管费（元/平方米/月）" {...formItemLayout}>
              {getFieldDecorator('managementFee', {
                initialValue: projectDetail.get('managementFee')
              })(
                <InputNumber
                  disabled={projectStatus === '0'}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={2}
                  max={30}
                  min={0.1}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="物管电话" {...formItemLayout}>
              {getFieldDecorator('officePhone', {
                rules: [
                  {
                    max: 50,
                    message: '最大长度50'
                  }
                ],
                initialValue: projectDetail.get('officePhone')
              })(
                <TextArea
                  disabled={projectStatus === '0'}
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
            <FormItem label="数据来源" {...formItemLayout}>
              {getFieldDecorator('dataSource', {
                rules: [
                  {
                    max: 50,
                    message: '最大长度50'
                  }
                ],
                initialValue: projectDetail.get('dataSource')
              })(
                <TextArea
                  disabled={projectStatus === '0'}
                  placeholder="请输入"
                  autosize={{ maxRows: 4 }}
                  // maxLength="50"
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
  connect(modelSelector, containerActions)
)(BaseInfoAddThird)
