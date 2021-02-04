import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  Form,
  Row,
  Col,
  Select,
  Input,
  Switch,
  Icon,
  InputNumber,
  DatePicker
} from 'antd'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import moment from 'moment'

import shallowEqual from 'client/utils/shallowEqual'
import formatString from 'client/utils/formatString'
import DataTrackComp from 'client/components/data-track2'

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
    sm: { span: 11 }
  },
  wrapperCol: {
    xs: { span: 6 },
    sm: { span: 13 }
  }
}

/*
 * 楼栋新增 / 编辑 楼栋系数
 */
class BuildInfoAddThird extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    onAddthirdRef: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    buildId: PropTypes.string.isRequired,
    initialAddFetchThird: PropTypes.func.isRequired,
    buildStatus: PropTypes.any.isRequired
  }

  constructor(props) {
    super(props)

    props.onAddthirdRef(this)

    this.state = {
      // 楼栋系数来源变量 1.直接填写，2.楼栋均价/项目均价 3.累加
      priceRateSoure: '3'
    }
  }

  componentDidMount() {
    this.cityId = sessionStorage.getItem('FDC_CITY')
    this.props.initialAddFetchThird()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.buildId) {
      // 当页面处于编辑时，且楼栋系数有值，设置计算优先级
      const { buildDetail: oldBuildDetail } = this.props.model
      const { buildDetail: newBuildDetail } = nextProps.model
      if (!shallowEqual(oldBuildDetail, newBuildDetail)) {
        const { priceRate } = newBuildDetail
        if (priceRate) {
          this.setState({
            priceRateSoure: '1'
          })
        }
      }
    }
  }

  submitThird = () =>
    new Promise((resolve, reject) => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          // 删除楼盘均价
          delete values.projectAvgPrice

          values.isLPriceRate = values.isLPriceRate ? 1 : 0
          // values.isWithYard = values.isWithYard ? 1 : 0
          values.isLBuildDate = values.isLBuildDate ? 1 : 0
          values.buildDate = values.buildDate
            ? values.buildDate.format('YYYY-MM-DD')
            : ''
          resolve(values)
        } else {
          /* eslint-disable */
          reject('3')
        }
      })
    })

  handleValidatePriceRate = (rule, value, callback) => {
    if (value !== null && value !== undefined && value <= 0) {
      callback('楼栋系数应大于0')
    }
    callback()
  }

  handlePriceRateBlur = e => {
    // 当楼栋系数没值的时候，降计算优先级
    const priceRate = e.target.value
    this.setState({
      priceRateSoure: priceRate ? '1' : '3'
    })
  }

  handleValidateDistance = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('楼间距应大于0')
    }
    callback()
  }

  handleValidateAvgPrice = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('楼栋均价应大于0')
    }
    callback()
  }

  handleAvgPriceBlur = e => {
    if (this.state.priceRateSoure !== '1') {
      const avgPrice = e.target.value
      const { projectDetail } = this.props.model
      const projectAvgPrice = projectDetail.get('projectAvgPrice')
      if (avgPrice > 0 && projectAvgPrice > 0) {
        const buildPriceRate = (avgPrice / projectAvgPrice).toFixed(4)
        // console.log(buildPriceRate, 111)
        // 当楼栋均价改变时，设置计算优先级
        this.setState({
          priceRateSoure: '2'
        })
        this.props.form.setFieldsValue({ priceRate: buildPriceRate })
      }
    }
  }

  // 计算楼栋系数
  // 3.累加
  handleChangePriceRate = () => {
    // 获取楼栋系数
    const { priceRateSoure } = this.state
    if (priceRateSoure === '3') {
      const {
        useageCorrectedRate = 0,
        buildingTypeCorrectedRate = 0,
        annualCorrectedRate = 0,
        structureCorrectedRate = 0,
        locationCorrectedRate = 0,
        sightCorrectedRate = 0,
        orientationCorrectedRate = 0,
        elevatorHouseholdRateCorrectedRate = 0,
        distanceCorrectedRate = 0,
        withYardRate = 0,
        houseAreaCorrectedRate = 0
      } = this.props.form.getFieldsValue([
        'useageCorrectedRate',
        'buildingTypeCorrectedRate',
        'annualCorrectedRate',
        'structureCorrectedRate',
        'locationCorrectedRate',
        'sightCorrectedRate',
        'orientationCorrectedRate',
        'elevatorHouseholdRateCorrectedRate',
        'distanceCorrectedRate',
        'withYardRate',
        'houseAreaCorrectedRate'
      ])

      let totalPriceRate =
        useageCorrectedRate +
        buildingTypeCorrectedRate +
        annualCorrectedRate +
        structureCorrectedRate +
        locationCorrectedRate +
        sightCorrectedRate +
        orientationCorrectedRate +
        elevatorHouseholdRateCorrectedRate +
        distanceCorrectedRate +
        withYardRate +
        houseAreaCorrectedRate
      totalPriceRate = (totalPriceRate / 100 + 1).toFixed(2)

      this.props.form.setFieldsValue({ priceRate: totalPriceRate })
    }
  }

  // 楼栋系数
  render() {
    const {
      form: { getFieldDecorator },
      buildId,
      buildStatus
    } = this.props

    const {
      orientTypeList,
      sightTypeList,
      buildStructureList,
      locationCodeList,
      houseAreaCodeList,

      projectDetail
    } = this.props.model

    const buildDetail = this.props.model.get('buildDetail')

    let buildDate = buildDetail.get('buildDate') || undefined
    if (buildDate) {
      buildDate = moment(buildDate)
    }

    return (
      <Form>
        <Row>
          <Col span={10}>
            <FormItem label="楼栋系数" {...formItemLayout}>
              {getFieldDecorator('priceRate', {
                rules: [
                  {
                    validator: this.handleValidatePriceRate
                  }
                ],
                initialValue: buildId ? buildDetail.get('priceRate') : undefined
              })(
                <InputNumber
                  disabled={!buildStatus}
                  precision={4}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  onBlur={this.handlePriceRateBlur}
                />
              )}
            </FormItem>
          </Col>
          <Col span={2} style={{ marginLeft: 16 }}>
            <FormItem>
              {getFieldDecorator('isLPriceRate', {
                valuePropName: 'checked',
                initialValue: buildId
                  ? buildDetail.get('isLPriceRate') === 1
                  : false
              })(
                <Switch
                  disabled={
                    !buildStatus ||
                    !pagePermission('fdc:hd:residence:base:building:lock')
                  }
                  checkedChildren={<Icon type="lock" />}
                  unCheckedChildren={<Icon type="unlock" />}
                />
              )}
            </FormItem>
          </Col>
          {buildId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="buildInfo"
                  field={1004}
                  qryId={buildId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={10}>
            <FormItem label="楼栋均价" {...formItemLayout}>
              {getFieldDecorator('avgPrice', {
                rules: [
                  {
                    validator: this.handleValidateAvgPrice
                  }
                ],
                initialValue: buildId ? buildDetail.get('avgPrice') : undefined
              })(
                <InputNumber
                  disabled={!buildStatus}
                  // formatter={value => value}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  onBlur={this.handleAvgPriceBlur}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem label="项目均价" {...formItemLayout}>
              {getFieldDecorator('projectAvgPrice', {
                initialValue: projectDetail.get('projectAvgPrice')
              })(<InputNumber disabled min={0} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem label="楼栋用途修正系数_%" {...formItemLayout}>
              {getFieldDecorator('useageCorrectedRate', {
                initialValue: buildId
                  ? buildDetail.get('useageCorrectedRate')
                  : undefined
              })(
                <InputNumber
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  disabled={!buildStatus}
                  onBlur={this.handleChangePriceRate}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem label="建筑类型修正系数_%" {...formItemLayout}>
              {getFieldDecorator('buildingTypeCorrectedRate', {
                initialValue: buildId
                  ? buildDetail.get('buildingTypeCorrectedRate')
                  : undefined
              })(
                <InputNumber
                  // min={-100}
                  // max={100}
                  precision={2}
                  placeholder="请输入"
                  disabled={!buildStatus}
                  style={{ width: '100%' }}
                  onBlur={this.handleChangePriceRate}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem label="建成年代" {...formItemLayout}>
              {getFieldDecorator('buildDate', {
                initialValue: buildId ? buildDate : undefined
              })(
                <DatePicker disabled={!buildStatus} style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col>
          <Col span={2} style={{ marginLeft: 16 }}>
            <FormItem>
              {getFieldDecorator('isLBuildDate', {
                valuePropName: 'checked',
                initialValue: buildId
                  ? buildDetail.get('isLBuildDate') === 1
                  : false
              })(
                <Switch
                  disabled={
                    !buildStatus ||
                    !pagePermission('fdc:hd:residence:base:building:lock')
                  }
                  checkedChildren={<Icon type="lock" />}
                  unCheckedChildren={<Icon type="unlock" />}
                />
              )}
            </FormItem>
          </Col>
          {buildId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="buildInfo"
                  field={1006}
                  qryId={buildId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={10}>
            <FormItem label="年期修正系数_%" {...formItemLayout}>
              {getFieldDecorator('annualCorrectedRate', {
                initialValue: buildId
                  ? buildDetail.get('annualCorrectedRate')
                  : undefined
              })(
                <InputNumber
                  // min={-100}
                  // max={100}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  disabled={!buildStatus}
                  onBlur={this.handleChangePriceRate}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem label="建筑结构" {...formItemLayout}>
              {getFieldDecorator('structureCode', {
                initialValue: buildId
                  ? formatString(buildDetail.get('structureCode'))
                  : undefined
              })(
                <Select
                  placeholder="建筑结构"
                  disabled={!buildStatus}
                  allowClear
                >
                  {buildStructureList.map(item => (
                    <Option key={item.get('code')} vallue={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem label="建筑结构修正系数_%" {...formItemLayout}>
              {getFieldDecorator('structureCorrectedRate', {
                initialValue: buildId
                  ? buildDetail.get('structureCorrectedRate')
                  : undefined
              })(
                <InputNumber
                  // min={-100}
                  // max={100}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  disabled={!buildStatus}
                  onBlur={this.handleChangePriceRate}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem label="楼栋位置" {...formItemLayout}>
              {getFieldDecorator('locationCode', {
                initialValue: buildId
                  ? formatString(buildDetail.get('locationCode'))
                  : undefined
              })(
                <Select
                  placeholder="楼栋位置"
                  disabled={!buildStatus}
                  allowClear
                >
                  {locationCodeList.map(item => (
                    <Option value={item.get('code')} key={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem label="楼栋位置修正系数_%" {...formItemLayout}>
              {getFieldDecorator('locationCorrectedRate', {
                initialValue: buildId
                  ? buildDetail.get('locationCorrectedRate')
                  : undefined
              })(
                <InputNumber
                  // min={-100}
                  // max={100}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  disabled={!buildStatus}
                  onBlur={this.handleChangePriceRate}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem label="楼栋景观" {...formItemLayout}>
              {getFieldDecorator('sightCode', {
                initialValue: buildId
                  ? formatString(buildDetail.get('sightCode'))
                  : undefined
              })(
                <Select
                  placeholder="楼栋景观"
                  disabled={!buildStatus}
                  allowClear
                >
                  {sightTypeList.map(item => (
                    <Option value={item.get('code')} key={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem label="楼栋景观修正系数_%" {...formItemLayout}>
              {getFieldDecorator('sightCorrectedRate', {
                initialValue: buildId
                  ? buildDetail.get('sightCorrectedRate')
                  : undefined
              })(
                <InputNumber
                  // min={-100}
                  // max={100}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  disabled={!buildStatus}
                  onBlur={this.handleChangePriceRate}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem label="楼栋朝向" {...formItemLayout}>
              {getFieldDecorator('orientationCode', {
                initialValue: buildId
                  ? formatString(buildDetail.get('orientationCode'))
                  : undefined
              })(
                <Select
                  placeholder="楼栋朝向"
                  disabled={!buildStatus}
                  allowClear
                >
                  {orientTypeList.map(item => (
                    <Option value={item.get('code')} key={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem label="楼栋朝向修正系数_%" {...formItemLayout}>
              {getFieldDecorator('orientationCorrectedRate', {
                initialValue: buildId
                  ? buildDetail.get('orientationCorrectedRate')
                  : undefined
              })(
                <InputNumber
                  // min={-100}
                  // max={100}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  disabled={!buildStatus}
                  onBlur={this.handleChangePriceRate}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem label="梯户比" {...formItemLayout}>
              {getFieldDecorator('elevatorHouseholdRate', {
                rules: [
                  {
                    max: 50,
                    message: '最大长度50'
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('elevatorHouseholdRate')
                  : undefined
              })(
                <TextArea
                  disabled={!buildStatus}
                  placeholder="梯户比"
                  autosize={{ maxRows: 2 }}
                  // maxLength="50"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem label="梯户比修正系数_%" {...formItemLayout}>
              {getFieldDecorator('elevatorHouseholdRateCorrectedRate', {
                initialValue: buildId
                  ? buildDetail.get('elevatorHouseholdRateCorrectedRate')
                  : undefined
              })(
                <InputNumber
                  // min={-100}
                  // max={100}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  disabled={!buildStatus}
                  onBlur={this.handleChangePriceRate}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem label="楼间距" {...formItemLayout}>
              {getFieldDecorator('distance', {
                rules: [
                  {
                    validator: this.handleValidateDistance
                  }
                ],
                initialValue: buildId ? buildDetail.get('distance') : undefined
              })(
                <InputNumber
                  placeholder="楼间距"
                  disabled={!buildStatus}
                  precision={0}
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem label="楼间距修正系数_%" {...formItemLayout}>
              {getFieldDecorator('distanceCorrectedRate', {
                initialValue: buildId
                  ? buildDetail.get('distanceCorrectedRate')
                  : undefined
              })(
                <InputNumber
                  // min={-100}
                  // max={100}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  disabled={!buildStatus}
                  onBlur={this.handleChangePriceRate}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem label="是否带院子" {...formItemLayout}>
              {getFieldDecorator('isWithYard', {
                initialValue: buildId
                  ? formatString(buildDetail.get('isWithYard'))
                  : undefined
              })(
                <Select placeholder="请选择" disabled={!buildStatus} allowClear>
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem label="带院子修正系数_%" {...formItemLayout}>
              {getFieldDecorator('withYardRate', {
                initialValue: buildId
                  ? buildDetail.get('withYardRate')
                  : undefined
              })(
                <InputNumber
                  // min={-100}
                  // max={100}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  disabled={!buildStatus}
                  onBlur={this.handleChangePriceRate}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem label="楼栋户型面积" {...formItemLayout}>
              {getFieldDecorator('houseAreaCode', {
                initialValue: buildId
                  ? formatString(buildDetail.get('houseAreaCode'))
                  : undefined
              })(
                <Select
                  placeholder="楼栋户型面积"
                  disabled={!buildStatus}
                  allowClear
                >
                  {houseAreaCodeList.map(item => (
                    <Option value={item.get('code')} key={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem label="楼栋户型面积修正系数_%" {...formItemLayout}>
              {getFieldDecorator('houseAreaCorrectedRate', {
                initialValue: buildId
                  ? buildDetail.get('houseAreaCorrectedRate')
                  : undefined
              })(
                <InputNumber
                  // min={-100}
                  // max={100}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  disabled={!buildStatus}
                  onBlur={this.handleChangePriceRate}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem label="价格系数说明" {...formItemLayout}>
              {getFieldDecorator('priceRateDesc', {
                rules: [
                  {
                    max: 512,
                    message: '最大长度512'
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('priceRateDesc') || undefined
                  : undefined
              })(
                <TextArea
                  disabled={!buildStatus}
                  placeholder="请输入"
                  autosize={{ maxRows: 4 }}
                  // maxLength="512"
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
)(BuildInfoAddThird)
