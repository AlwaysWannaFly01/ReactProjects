import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Modal, Form, Select, Message, Row, Col, InputNumber } from 'antd'
import PropTypes from 'prop-types'
import Immutable from 'immutable'

import layout from 'client/utils/layout'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import { facilityTypeList } from './constant'

const FormItem = Form.Item
const { Option } = Select

const formItemLayout = {
  labelCol: {
    xs: { span: 6 },
    sm: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 6 },
    sm: { span: 16 }
  }
}

/**
 * 附属房屋新增
 * author: WY
 */
class HouseAttachedAdd extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    addModalVisible: PropTypes.bool.isRequired,
    addAttachedHouse: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    onSearch: PropTypes.func.isRequired,
    onCloseModal: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      yuanShow: false,
      percentShow: false,
      tempPrice: {
        9108001: null,
        9108002: null
      },
    }
  }

  componentDidMount() {
    this.cityId = sessionStorage.getItem('FDC_CITY')
  }

  onSelectArithmetic = value => {
    let tempValue = this.props.form.getFieldValue('attachedPrice')
    let tempPrice = this.state.tempPrice
    if (tempValue) {
      let oldValue = value === '9108001' ? '9108002' : '9108001'
      tempPrice[oldValue] = tempValue
      this.setState({ tempPriceValue: tempPrice })
    }
    switch (value) {
      case '9108001':
        this.setState({ yuanShow: true, percentShow: false })
        break
      case '9108002':
        this.setState({ yuanShow: false, percentShow: true })
        break
      default:
        this.setState({ yuanShow: false, percentShow: false })
        break
    }
    if (tempPrice[value]) {
      this.props.form.setFieldsValue({ attachedPrice: tempPrice[value] })
    } else {
      this.props.form.resetFields(['attachedPrice'])
    }
  }

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          submitBtnLoading: true
        })
        // values.projectId = values.projectItem.projectId
        // delete values.projectItem

        values.arithmeticType = values.calcuMethod
        values.arithmeticValue = values.attachedPrice
        values.cityId = this.cityId
        values.isOnProperty = values.sureBear
        values.projectId = this.props.projectId
        values.subHouseType = values.attachedHouse
        const params = {
          arithmeticType: values.arithmeticType,
          arithmeticValue: values.arithmeticValue,
          cityId: values.cityId,
          isOnProperty: values.isOnProperty,
          projectId: values.projectId,
          subHouseType: values.subHouseType
        }

        this.props.addAttachedHouse(params, res => {
          setTimeout(() => {
            const { code, message } = res || {}
            switch (code) {
              case '200':
                this.handleCloseModal()
                Message.success('新增成功')
                this.props.onSearch(null, 1)
                break
              case '400':
                Message.error(message)
                break
              default:
                break
            }
            this.setState({
              submitBtnLoading: false
            })
          }, 300)
        })
      }
    })
  }

  handleCloseModal = () => {
    this.props.onCloseModal()
    // this.projectSelectRef.resetProjectSelect()
    this.props.form.resetFields()
    this.setState({ yuanShow: false, percentShow: false })
  }

  regExpPercent = (rule, value, callback) => {
    if (value === undefined || value === '' || value === null) {
      callback('请填写值')
    } else if (value <= 0 || value > 300) {
      callback('请输入正确的折扣百分数：0~300%')
    } else {
      callback()
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { subHouseTypeList, subArithmeticList } = this.props.model
    const { yuanShow, percentShow } = this.state
    return (
      <Modal
        title="新增附属房屋价格计算方法"
        visible={this.props.addModalVisible}
        onOk={this.handleSubmit}
        onCancel={this.handleCloseModal}
        confirmLoading={this.state.submitBtnLoading}
        maskClosable={false}
      >
        <Form>
          <Row>
            <Col span={20}>
              <FormItem label="附属房屋类型" {...formItemLayout}>
                {getFieldDecorator('attachedHouse', {
                  rules: [
                    {
                      required: true,
                      message: '请选择附属房屋类型'
                    }
                  ]
                })(
                  <Select placeholder="请选择附属房屋类型" allowClear>
                    {subHouseTypeList.map(item => (
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
            <Col span={20}>
              <FormItem label="是否证载" {...formItemLayout}>
                {getFieldDecorator('sureBear', {
                  rules: [
                    {
                      required: true,
                      message: '请选择是否证载'
                    }
                  ]
                })(
                  <Select placeholder="请选择" allowClear>
                    {facilityTypeList.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={20}>
              <FormItem label="计算方法" {...formItemLayout}>
                {getFieldDecorator('calcuMethod', {
                  rules: [
                    {
                      required: true,
                      message: '请选择计算方法'
                    }
                  ]
                })(
                  <Select
                    placeholder="请选择"
                    allowClear
                    onChange={this.onSelectArithmetic}
                  >
                    {subArithmeticList.map(item => (
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
            <Col span={20}>
              <FormItem
                label="值"
                labelCol={layout(6, 8)}
                wrapperCol={layout(6, 15)}
              >
                {percentShow ? (
                  <div>
                    {getFieldDecorator('attachedPrice', {
                      rules: [
                        {
                          required: true,
                          validator: this.regExpPercent
                        }
                      ]
                    })(<InputNumber placeholder="" />)}
                  </div>
                ) : (
                  <div>
                    {getFieldDecorator('attachedPrice', {
                      rules: [
                        {
                          required: true,
                          message: '请填写值'
                        },
                        {
                          pattern: new RegExp(
                            /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/,
                            'g'
                          ),
                          message: '请输入大于0的数字'
                        }
                      ]
                    })(<InputNumber placeholder="" />)}
                  </div>
                )}
              </FormItem>
            </Col>
            <Col
              span={2}
              style={{
                lineHeight: '40px',
                position: 'absolute',
                left: '230px'
              }}
            >
              {yuanShow ? <span>元</span> : ''}
              {percentShow ? <span>%</span> : ''}
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    modelSelector,
    containerActions
  )
)(HouseAttachedAdd)
