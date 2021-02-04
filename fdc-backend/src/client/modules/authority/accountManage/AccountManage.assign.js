import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Modal, Form, Checkbox, message } from 'antd'
import PropTypes from 'prop-types'
import Immutable from 'immutable'
import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

const CheckboxGroup = Checkbox.Group

/**
 * 分配角色
 * author: WY
 */
class ProAddressAdd extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    assignModalVisible: PropTypes.bool.isRequired,
    onCloseModal: PropTypes.func.isRequired,
    accountRole: PropTypes.array.isRequired,
    editData: PropTypes.object.isRequired,
    dataList: PropTypes.array.isRequired,
    roleDistribute: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      dataList: props.dataList
      // 选中的角色范围 id数组
      // checkedRegionList: []
    }
  }

  componentDidMount() {
    this.cityId = sessionStorage.getItem('FDC_CITY')
  }

  componentWillReceiveProps = nextProps => {
    this.setState({
      dataList: nextProps.dataList
    })
  }

  onChangeRole = checkedList => {
    this.setState({
      dataList: checkedList
    })
  }

  handleCloseModal = () => {
    this.props.onCloseModal()
    this.props.form.resetFields()
  }

  handleSubmit = () => {
    const {
      editData: { authId }
    } = this.props
    const params = {
      authId,
      roleIds: this.state.dataList
    }
    if (this.state.dataList.length > 0) {
      this.props.roleDistribute(params, () => {
        this.handleCloseModal()
      })
      message.success('分配成功')
    } else {
      message.error('请选择角色')
    }
  }

  render() {
    const { accountRole } = this.props
    const roles = accountRole.map(i => ({
      label: i.roleName,
      value: i.id
    }))
    return (
      <Modal
        title="分配角色"
        visible={this.props.assignModalVisible}
        onOk={this.handleSubmit}
        onCancel={this.handleCloseModal}
        confirmLoading={this.state.submitBtnLoading}
        maskClosable={false}
      >
        <CheckboxGroup
          options={roles}
          defaultValue={this.state.dataList}
          value={this.state.dataList}
          onChange={this.onChangeRole}
        />
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
