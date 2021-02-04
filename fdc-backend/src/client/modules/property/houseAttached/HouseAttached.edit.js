import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import {
  Modal,
  Form,
  Select,
  Message,
  Row,
  Col,
  InputNumber,
  Button
} from 'antd'
import PropTypes from 'prop-types'
import Immutable from 'immutable'

import layout from 'client/utils/layout'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

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
 * 附属房屋编辑
 * author: WY
 */
class HouseAttachedEdit extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    editModalVisible: PropTypes.bool.isRequired,
    editAttachedHouse: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    subHouseTypeName: PropTypes.string.isRequired,
    isOnPropertyName: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    arithmeticTypeName: PropTypes.string.isRequired,
    sysStatus: PropTypes.number.isRequired,
    // subHouseList: PropTypes.array.isRequired,
    arithmeticValue: PropTypes.string.isRequired,
    onCloseModal: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      yuanShow: false,
      percentShow: false,
      initialShow: true,
      tempPrice: {
        9108001: null,
        9108002: null
      },
    }
  }

  componentDidMount() {
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      clearInterval(this.cityIdInterval)
      this.setState({
        yuanShow: this.props.arithmeticTypeName === '一口价',
        percentShow: this.props.arithmeticTypeName === '折扣值'
      })
    }, 0)
  }

  onSelectArithmetic = value => {
    let tempValue = this.props.form.getFieldValue('arithmeticValue')
    console.log(tempValue)
    let tempPrice = this.state.tempPrice
    if (tempValue) {
      let oldValue = value === '9108001' ? '9108002' : '9108001'
      tempPrice[oldValue] = tempValue
      this.setState({ tempPriceValue: tempPrice })
    }
    switch (value) {
      case '9108001':
        this.setState({
          yuanShow: true,
          percentShow: false,
          initialShow: false
        })
        break
      case '9108002':
        this.setState({
          yuanShow: false,
          percentShow: true,
          initialShow: false
        })
        break
      default:
        this.setState({
          yuanShow: false,
          percentShow: false,
          initialShow: false
        })
        break
    }
    if (tempPrice[value]) {
      this.props.form.setFieldsValue({ arithmeticValue: tempPrice[value] })
    } else {
      this.props.form.resetFields(['arithmeticValue'])
    }
  }

  handleSubmit = () => {
    const { id } = this.props
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          submitBtnLoading: true
        })
        values.arithmeticType = values.calcuMethod
        values.arithmeticValue = values.arithmeticValue
        values.cityId = this.cityId
        values.id = id
        values.projectId = this.props.projectId

        const params = {
          arithmeticType: values.arithmeticType,
          arithmeticValue: values.arithmeticValue,
          cityId: values.cityId,
          id: values.id,
          projectId: values.projectId
        }

        this.props.editAttachedHouse(params, res => {
          setTimeout(() => {
            const { code, message } = res || {}
            switch (code) {
              case '200':
                this.handleCloseModal()
                Message.success('编辑成功')
                this.props.onSearch(null, 1)
                break
              case '400':
                Message.error(message)
                break
              default:
                break
            }
            this.setState({
              submitBtnLoading: false,
              initialShow: true
            })
          }, 300)
        })
      }
    })
  }

  handleCloseModal = () => {
    this.props.onCloseModal()
    this.props.form.resetFields()
    this.setState({ yuanShow: false, percentShow: false, initialShow: true })
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
    const {
      subHouseTypeName,
      isOnPropertyName,
      arithmeticTypeName,
      arithmeticValue
    } = this.props
    const { subArithmeticList } = this.props.model
    // eslint-disable-next-line
    const { yuanShow, percentShow, initialShow } = this.state
    // console.log(arithmeticTypeName)
    const isEditModal = this.props.sysStatus === 1
    const footerBtns = [
      <Button key="cancel" onClick={this.handleCloseModal}>
        取消
      </Button>,
      <Button key="save" type="primary" onClick={this.handleSubmit}>
        确定
      </Button>
    ]
    return (
      <Modal
        title="编辑附属房屋价格计算方法"
        visible={this.props.editModalVisible}
        onOk={this.handleSubmit}
        onCancel={this.handleCloseModal}
        confirmLoading={this.state.submitBtnLoading}
        maskClosable={false}
        footer={isEditModal ? footerBtns : null}
      >
        <Form>
          <Row>
            <Col span={20}>
              <FormItem label="附属房屋类型" {...formItemLayout}>
                <div>{subHouseTypeName}</div>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={20}>
              <FormItem label="是否证载" {...formItemLayout}>
                <div>{isOnPropertyName}</div>
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
                  ],
                  initialValue:
                    arithmeticTypeName === '一口价' ? '9108001' : '9108002'
                })(
                  <Select
                    placeholder="请选择"
                    allowClear
                    onChange={this.onSelectArithmetic}
                    disabled={!isEditModal}
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
                    {getFieldDecorator('arithmeticValue', {
                      rules: [
                        {
                          required: true,
                          validator: this.regExpPercent
                        }
                      ],
                      initialValue: initialShow ? arithmeticValue : ''
                    })(<InputNumber disabled={!isEditModal} placeholder="" />)}
                  </div>
                ) : (
                  <div>
                    {getFieldDecorator('arithmeticValue', {
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
                      ],
                      initialValue: initialShow ? arithmeticValue : ''
                    })(<InputNumber disabled={!isEditModal} placeholder="" />)}
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
)(HouseAttachedEdit)
