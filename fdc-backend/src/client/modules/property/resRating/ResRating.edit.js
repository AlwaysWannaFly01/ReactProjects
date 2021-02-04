import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'

import PropTypes from 'prop-types'
import { Form, Modal, Input, InputNumber, Message } from 'antd'

import moment from 'moment'
import Immutable from 'immutable'
// import { pagePermission } from 'client/utils'

import layout from 'client/utils/layout'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

const FormItem = Form.Item

class ResRatingHistoryEdit extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    modalVisible: PropTypes.bool.isRequired,
    editData: PropTypes.object.isRequired,
    weightDetail: PropTypes.object.isRequired,
    projectName: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    cityId: PropTypes.string.isRequired,
    modalCancel: PropTypes.func.isRequired,
    editRatingResult: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    /* eslint-disable */
    this.state = {}
  }

  componentDidMount() {
    // 设置默认估价月份
    this.setDefaultUserMonth()
  }

  setDefaultUserMonth = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    this.userMonth = moment(new Date(`${year}-${month}-01`))
  }

  grade = totalScroll => {
    // 计算楼盘等级
    let grade = ''
    if (totalScroll >= 8.5 && totalScroll <= 10) {
      grade = 'A'
    } else if (totalScroll >= 7.5 && totalScroll < 8.5) {
      grade = 'B'
    } else if (totalScroll >= 6 && totalScroll < 7.5) {
      grade = 'C'
    } else if (totalScroll > 0 && totalScroll < 6) {
      grade = 'D'
    } else {
      grade = ''
    }
    // this.setState({ grade })
    this.props.form.setFieldsValue({ grade })
  }

  // 区位得分
  locationChange = value => {
    const { weightDetail } = this.props

    const {
      deliveryDateStardardDetail: { deliveryDateWeight },
      locationStardardDetail: { locationWeight },
      priceStardardDetail: { priceWeight }
    } = weightDetail
    // 计算总得分
    const { priceScore, deliveryDateScore } = this.props.form.getFieldsValue()

    let totalScroll = ''
    if (!value || !priceScore || !deliveryDateScore) {
      totalScroll = ''
    } else {
      totalScroll = +(
        (value * locationWeight) / 100 +
        (priceScore * priceWeight) / 100 +
        (deliveryDateScore * deliveryDateWeight) / 100
      ).toFixed(2)
    }
    // 计算楼盘等级
    this.grade(totalScroll)
    this.props.form.setFieldsValue({ totalScore: totalScroll })
  }

  // 价格得分
  priceChange = value => {
    const { weightDetail } = this.props
    const {
      deliveryDateStardardDetail: { deliveryDateWeight },
      locationStardardDetail: { locationWeight },
      priceStardardDetail: { priceWeight }
    } = weightDetail
    // 计算总得分
    const {
      locationScore,
      deliveryDateScore
    } = this.props.form.getFieldsValue()

    let totalScroll = ''
    if (!locationScore || !value || !deliveryDateScore) {
      totalScroll = ''
    } else {
      totalScroll = +(
        (locationScore * locationWeight) / 100 +
        (value * priceWeight) / 100 +
        (deliveryDateScore * deliveryDateWeight) / 100
      ).toFixed(2)
    }
    // 计算楼盘等级
    this.grade(totalScroll)
    this.props.form.setFieldsValue({ totalScore: totalScroll })
  }

  // 竣工日期得分
  deliveryChange = value => {
    const { weightDetail } = this.props
    const {
      deliveryDateStardardDetail: { deliveryDateWeight },
      locationStardardDetail: { locationWeight },
      priceStardardDetail: { priceWeight }
    } = weightDetail
    // 计算总得分
    const { locationScore, priceScore } = this.props.form.getFieldsValue()

    let totalScroll = ''
    if (!locationScore || !priceScore || !value) {
      totalScroll = ''
    } else {
      totalScroll = +(
        (locationScore * locationWeight) / 100 +
        (priceScore * priceWeight) / 100 +
        (value * deliveryDateWeight) / 100
      ).toFixed(2)
    }
    // 计算楼盘等级
    this.grade(totalScroll)
    this.props.form.setFieldsValue({ totalScore: totalScroll })
  }

  handleCancelEdit = () => {
    this.props.modalCancel()
    this.props.form.resetFields()
  }

  handleOkEdit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { cityId, projectId, editData } = this.props
        const { useMonth } = editData
        values.cityId = cityId
        values.projectId = projectId
        values.id = editData.id
        values.useMonth = moment(useMonth).format('YYYY-MM-DD HH:mm:ss')
        this.props.editRatingResult(values, res => {
          const { code, message } = res
          if (+code === 200) {
            Message.success('修改成功')
            this.props.onSearch(null, 1)
            this.handleCancelEdit()
          } else {
            Message.error(message)
          }
        })
      }
    })
  }

  disabledDate = current => {
    // Can not select days before today and today
    return current > moment().endOf('month')
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { editData } = this.props
    return (
      <div>
        <Modal
          title="修改评级结果"
          maskClosable={false}
          visible={this.props.modalVisible}
          onOk={this.handleOkEdit}
          onCancel={this.handleCancelEdit}
        >
          <Form>
            <FormItem
              label="楼盘名称"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
            >
              {getFieldDecorator('projectId')(
                <span>{this.props.projectName}</span>
              )}
            </FormItem>
            <FormItem
              label="月份"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
            >
              {getFieldDecorator('useMonth', {
                rules: [
                  {
                    required: true,
                    message: '月份不能为空!'
                  }
                ],
                initialValue: this.userMonth
              })(
                <span>
                  {editData.useMonth
                    ? editData.useMonth.split('-', 2).join('-')
                    : ''}
                </span>
              )}
            </FormItem>

            <FormItem
              label="区位得分"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
            >
              {getFieldDecorator('locationScore', {
                rules: [
                  {
                    required: true,
                    message: '区位得分不能为空!'
                  }
                ],
                initialValue: editData.locationScore
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={10}
                  precision={0}
                  onChange={this.locationChange}
                  placeholder="请输入区位得分"
                />
              )}
            </FormItem>
            <FormItem
              label="价格得分"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
            >
              {getFieldDecorator('priceScore', {
                rules: [
                  {
                    required: true,
                    message: '价格得分不能为空!'
                  }
                ],
                initialValue: editData.priceScore
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={10}
                  precision={0}
                  onChange={this.priceChange}
                  placeholder="请输入区位得分"
                />
              )}
            </FormItem>
            <FormItem
              label="竣工日期得分"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
            >
              {getFieldDecorator('deliveryDateScore', {
                rules: [
                  {
                    required: true,
                    message: '竣工日期得分不能为空!'
                  }
                ],
                initialValue: editData.deliveryDateScore
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={10}
                  precision={0}
                  onChange={this.deliveryChange}
                  placeholder="请输入区位得分"
                />
              )}
            </FormItem>
            <FormItem
              label="总得分"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
            >
              {getFieldDecorator('totalScore', {
                initialValue: editData.totalScore
              })(<Input precision={2} disabled placeholder="请输入总得分" />)}
            </FormItem>
            <FormItem
              label="楼盘等级"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
            >
              {getFieldDecorator('grade', {
                initialValue: editData.grade
              })(<Input disabled placeholder="请输入楼盘等级" />)}
            </FormItem>
          </Form>
        </Modal>
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
)(ResRatingHistoryEdit)
