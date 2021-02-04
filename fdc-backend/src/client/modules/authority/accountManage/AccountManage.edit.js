import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Modal, Form, Input, DatePicker, message } from 'antd'
import PropTypes from 'prop-types'
import layout from 'client/utils/layout'
import moment from 'moment'
import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './AccountManage.less'

const FormItem = Form.Item

/**
 * 账号管理
 * 编辑
 * author: WY
 */
class ProAddressEdit extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    editModalVisible: PropTypes.bool.isRequired,
    onCloseModal: PropTypes.func.isRequired,
    editAccountRole: PropTypes.func.isRequired,
    editData: PropTypes.object.isRequired,
    onSearch: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      // submitBtnLoading: false
    }
  }

  componentDidMount() {
    this.cityId = sessionStorage.getItem('FDC_CITY')
  }

  onProjectSelectRef = ref => {
    this.projectSelectRef = ref
  }

  handleCloseModal = () => {
    this.props.onCloseModal()
    // this.projectSelectRef.resetProjectSelect()
    this.props.form.resetFields()
  }
  disabledDate = current => current < moment().startOf('day')
  regExpPercent = (rule, value, callback) => {
    if (value.length > 50) {
      callback('不超过50字符')
    } else {
      callback()
    }
  }
  // 新增/编辑保存
  handleModalOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.availableEndDate = values.availableEndDate.format(
          'YYYY-MM-DD HH:mm:ss'
        )
        values.userName = values.userName
          ? values.userName
          : values.principal.split('@')[0]
        values.loginName = values.principal
        values.phone = values.phone

        this.props.editAccountRole(values, (code, msg) => {
          if (code === '200') {
            message.success('编辑成功!')
            this.props.onSearch(null, 1)
            this.handleCloseModal()
            this.props.form.resetFields()
          } else {
            message.error(msg)
          }
        })
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { editData } = this.props
    let availableEndDate = null
    if (editData.availableEndDate) {
      availableEndDate = moment(editData.availableEndDate)
    }
    // const editType = Object.keys(editData).length
    return (
      <Modal
        title="编辑账号"
        visible={this.props.editModalVisible}
        onOk={this.handleModalOk}
        onCancel={this.handleCloseModal}
        confirmLoading={this.state.submitBtnLoading}
        maskClosable={false}
      >
        <Form>
          <FormItem
            label="账号"
            labelCol={layout(6, 6)}
            wrapperCol={layout(18, 16)}
          >
            {getFieldDecorator('principal', {
              initialValue: editData.principal
            })(<Input disabled placeholder="请输入账号" />)}
          </FormItem>
          <FormItem
            label="账号截止日期"
            labelCol={layout(6, 6)}
            wrapperCol={layout(18, 16)}
          >
            {getFieldDecorator('availableEndDate', {
              rules: [
                {
                  required: true,
                  message: '账号截止日期不能为空!'
                }
              ],
              initialValue: availableEndDate
            })(
              <DatePicker
                className={styles.dateWidth}
                disabledDate={this.disabledDate}
              />
            )}
          </FormItem>
          <FormItem
            label="姓名"
            labelCol={layout(6, 6)}
            wrapperCol={layout(18, 16)}
          >
            {getFieldDecorator('userName', {
              rules: [
                {
                  validator: this.regExpPercent
                }
              ],
              initialValue: editData.userName
            })(<Input placeholder="请输入姓名" />)}
          </FormItem>
          <FormItem
            label="邮箱"
            labelCol={layout(6, 6)}
            wrapperCol={layout(18, 16)}
          >
            {getFieldDecorator('email', {
              rules: [
                {
                  required: true,
                  message: '邮箱不能为空!'
                },
                {
                  pattern: new RegExp(
                    /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/,
                    'g'
                  ),
                  message: '请输入正确的邮箱地址'
                }
              ],
              initialValue: editData.email
            })(<Input placeholder="请输入邮箱" />)}
          </FormItem>
          <FormItem
            label="手机"
            labelCol={layout(6, 6)}
            wrapperCol={layout(18, 16)}
          >
            {getFieldDecorator('phone', {
              rules: [
                {
                  pattern: new RegExp(/^[1][3,4,5,7,8][0-9]{9}$/, 'g'),
                  message: '请输入正确的手机号'
                }
              ],
              initialValue: editData.phone
            })(<Input placeholder="请输入手机号" />)}
          </FormItem>
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
)(ProAddressEdit)
