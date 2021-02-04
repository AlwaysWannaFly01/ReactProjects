import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Modal, Form, Row, Input, Checkbox, Message } from 'antd'

import layout from 'client/utils/layout'

import { containerActions } from './actions'
import './sagas'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group

class FloorEdit extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    floorEditVisible: PropTypes.bool.isRequired,
    onCloseFloorEdit: PropTypes.func.isRequired,
    floorEditParam: PropTypes.object.isRequired,
    buildId: PropTypes.string.isRequired,
    batchUpdateFloor: PropTypes.func.isRequired,
    onRefreshPage: PropTypes.func.isRequired
  }

  constructor() {
    super()

    this.state = {
      updateBtnLoading: false
    }
  }

  handleUpdateFloor = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          updateBtnLoading: true
        })

        const cityId = sessionStorage.getItem('FDC_CITY')
        const { floorNo } = this.props.floorEditParam
        // 是否同步房号名称
        let isSynHouseName = 0
        // 是否同步其他楼层
        let isSynOtherFloor = 0
        const { isSyncFloor } = values
        if (isSyncFloor && isSyncFloor.length === 2) {
          isSynOtherFloor = isSyncFloor[0] ? 1 : 0
          isSynHouseName = isSyncFloor[1] ? 1 : 0
        }
        if (isSyncFloor && isSyncFloor.length === 1) {
          isSynOtherFloor = isSyncFloor[0] === 1 ? 1 : 0
          isSynHouseName = isSyncFloor[0] === 2 ? 1 : 0
        }
        // console.log(values, isSynOtherFloor, isSynHouseName)

        const data = {
          cityId,
          buildingId: this.props.buildId,
          floorNo,
          actualFloor: values.actualFloor.trim(),
          isSynHouseName,
          isSynOtherFloor
        }
        this.props.batchUpdateFloor(data, res => {
          const { code, message } = res
          if (+code === 200) {
            Message.success('修改成功')
            this.props.onRefreshPage()
            this.handleCloseModal()
          } else {
            Message.error(message)
          }
          this.setState({
            updateBtnLoading: false
          })
        })
      }
    })
  }

  handleCloseModal = () => {
    this.props.form.resetFields()
    this.props.onCloseFloorEdit()
  }

  render() {
    const {
      form: { getFieldDecorator },
      floorEditParam
    } = this.props

    const checkOptions = [
      {
        label: '同步其他楼层',
        value: 1
      },
      {
        label: '同步房号名称',
        value: 2
      }
    ]

    return (
      <Modal
        title="修改实际层"
        okText="保存"
        visible={this.props.floorEditVisible}
        onCancel={this.handleCloseModal}
        onOk={this.handleUpdateFloor}
        confirmLoading={this.state.updateBtnLoading}
        maskClosable={false}
      >
        <Row>
          <FormItem
            label="实际层"
            labelCol={layout(6, 6)}
            wrapperCol={layout(18, 14)}
          >
            {getFieldDecorator('actualFloor', {
              rules: [
                {
                  required: true,
                  message: '请输入实际层'
                },
                {
                  whitespace: true,
                  message: '请输入实际层'
                }
              ],
              initialValue: floorEditParam.actualFloor
            })(<Input placeholder="请输入实际层" maxLength={20} />)}
          </FormItem>
        </Row>
        <Row>
          <FormItem
            label=" "
            colon={false}
            labelCol={layout(6, 6)}
            wrapperCol={layout(18, 14)}
          >
            {getFieldDecorator('isSyncFloor', {
              onChange: this.handleSyncFloorChange
            })(<CheckboxGroup options={checkOptions} />)}
          </FormItem>
        </Row>
      </Modal>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    null,
    containerActions
  )
)(FloorEdit)
