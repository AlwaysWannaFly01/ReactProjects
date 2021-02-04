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
class ProAddressAdd extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    editModalVisible: PropTypes.bool.isRequired,
    onCloseModal: PropTypes.func.isRequired,
    addAccountRole: PropTypes.func.isRequired,
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
    if (value && value.length > 50) {
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

        this.props.addAccountRole(values, () => {
          message.success('新增成功!')
          this.props.onSearch(null, 1)
          this.handleCloseModal()
          this.props.form.resetFields()
        })
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <Modal
        title="新增账号"
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
              rules: [
                {
                  required: true,
                  message: '账号不能为空!'
                },
                {
                  pattern: /^[A-Za-z0-9_]{3,30}$/,
                  message: '账号只能是数字,英文字母和下划线组成且长度是3到30'
                }
              ]
            })(<Input placeholder="请输入账号" />)}
          </FormItem>
          <FormItem
            label="密码"
            labelCol={layout(6, 6)}
            wrapperCol={layout(18, 16)}
          >
            {getFieldDecorator('password', {
              rules: [
                {
                  required: true,
                  message: '密码不能为空!'
                },
                {
                  pattern: new RegExp(
                    /^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![\W_]+$)\S{6,20}$/,
                    'g'
                  ),
                  message:
                    '密码必须含有小写字母、大写字母、数字、特殊符号的两种及以上的且长度是6-20'
                }
              ]
            })(<Input type="password" placeholder="请输入密码" />)}
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
              ]
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
              ]
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
                    // /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/,
                    /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/,
                    'g'
                  ),
                  message: '请输入正确的邮箱地址'
                }
              ]
            })(<Input maxLength={120} placeholder="请输入邮箱" />)}
          </FormItem>
          <FormItem
            label="手机"
            labelCol={layout(6, 6)}
            wrapperCol={layout(18, 16)}
          >
            {getFieldDecorator('phone', {
              rules: [
                {
                  pattern: new RegExp(/^[1][3,4,5,7,8,9][0-9]{9}$/, 'g'),
                  message: '请输入正确的手机号'
                }
              ]
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
)(ProAddressAdd)
