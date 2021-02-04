import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Input } from 'antd'

const FormItem = Form.Item

/**
 * 住宅 片区绘制 / 片区经纬度到导入
 * 导入任务名
 * author: WY
 */
class LngLatName extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    taskNameModalVisible: PropTypes.bool.isRequired,
    onStartUpload: PropTypes.func.isRequired,
    onCloseModal: PropTypes.func.isRequired
  }

  handleInputTaskName = () => {
    this.props.form.validateFields((err, value) => {
      if (!err) {
        const { taskName } = value
        this.handleCloseModal()
        this.props.onStartUpload(taskName)
      }
    })
  }

  handleCloseModal = () => {
    this.props.form.resetFields()
    this.props.onCloseModal()
  }

  render() {
    const { getFieldDecorator } = this.props.form

    const formItemLayout = {
      labelCol: {
        xs: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 12 }
      }
    }

    return (
      <Modal
        title="导入任务名"
        visible={this.props.taskNameModalVisible}
        onOk={this.handleInputTaskName}
        onCancel={this.handleCloseModal}
        maskClosable={false}
      >
        <Form>
          <FormItem label="任务名" {...formItemLayout}>
            {getFieldDecorator('taskName', {
              rules: [
                {
                  required: true,
                  message: '请输入任务名'
                },
                {
                  whitespace: true,
                  message: '请输入任务名'
                }
              ]
            })(<Input placeholder="请输入任务名" maxLength="100" />)}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(LngLatName)
