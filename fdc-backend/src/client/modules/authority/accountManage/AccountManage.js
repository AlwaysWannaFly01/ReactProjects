import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import Immutable from 'immutable'

import {
  Breadcrumb,
  Icon,
  Input,
  Row,
  Col,
  Button,
  Popconfirm,
  Form,
  Table,
  message,
  Divider,
  Popover, Select
} from 'antd'
import layout from 'client/utils/layout'
import showTotal from 'client/utils/showTotal'
import { pagePermission } from 'client/utils'
import AccountManageAdd from './AccountManage.add'
import AccountManageEdit from './AccountManage.edit'
import AccountManageAssign from './AccountManage.assign'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import { breadList, column } from './constant'
import styles from './AccountManage.less'

/**
 * @description 权限管理--角色管理
 * @author WY
 */
const FormItem = Form.Item
const Option = Select.Option
class AccountManage extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getAccountList: PropTypes.func.isRequired,
    accountList: PropTypes.array.isRequired,
    getRoleList: PropTypes.func.isRequired,
    changeStatus: PropTypes.func.isRequired,
    resetPwd: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      addModalVisible: false,
      editModalVisible: false,
      assignModalVisible: false,
      editData: {},
      accountRole: [],
      dataList: []
    }
    this.props.getAccountList({
      pageSize: 20,
      pageNum: 1
    })
  }
  componentDidMount() {}

  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    const { account, name, sysStatus } = this.props.form.getFieldsValue()
    console.log(sysStatus)
    const params = {
      statuses: sysStatus,
      loginName: account,
      pageNum,
      pageSize: 20,
      userName: name
    }
    console.log(params)
    this.props.getAccountList(params)
  }

  /* 新增账号 */
  handleAddAccountManage = () => {
    this.setState({
      addModalVisible: true
    })
  }

  /* 分配角色 */
  handleAssignRole = record => {
    const { authId } = record
    this.props.getRoleList(authId, data => {
      const { list, roleIds } = data
      this.setState({
        editData: record,
        assignModalVisible: true,
        accountRole: list,
        dataList: roleIds
      })
    })
  }

  /* 编辑账号 */
  handleEditAccount = (editData = {}) => {
    this.setState({
      editData,
      editModalVisible: true
    })
  }

  handleCloseModal = () => {
    this.setState({
      addModalVisible: false,
      editModalVisible: false,
      assignModalVisible: false,
      editData: {},
      dataList: []
    })
  }

  // 注销/激活账号
  handleAccountStatus = record => {
    const params = {
      loginNames: record.principal,
      valid: record.sysStatus === 1 ? 0 : 1
    }
    this.props.changeStatus(params, () => {
      message.success(`${record.sysStatus === 1 ? '注销' : '激活'}账号成功`)
      this.handleSearch()
    })
  }

  // 重置密码
  resetPwd = record => {
    const { id } = record
    this.props.resetPwd(id, () => {
      message.success('重置密码成功')
    })
  }

  renderBreads() {
    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.name}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form
    return (
      <Form>
        <Row>
          <Col span={6}>
            <FormItem
              label="账号"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
              style={{
                marginBottom: 12
              }}
            >
              {getFieldDecorator('account')(
                <Input placeholder="" maxLength={100} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem
              label="姓名"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
              style={{
                marginBottom: 12
              }}
            >
              {getFieldDecorator('name')(
                <Input placeholder="" maxLength={100} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem
              label="状态"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
              style={{
                marginBottom: 12
              }}
            >
              {getFieldDecorator('sysStatus')(
                <Select placeholder="请选择">
                  <Option  value={''}>
                    全部
                  </Option>
                  <Option  value={'1'}>
                    已激活
                  </Option>
                  <Option  value={'0'}>
                    已注销
                  </Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={2}>
            <Button
              type="primary"
              icon="search"
              onClick={e => this.handleSearch(e, 1)}
            >
              查询
            </Button>
          </Col>
          <Col span={2}>
            {pagePermission('fdc:am:accountManagement:add') ? (
              <Button
                type="primary"
                icon="plus"
                style={{ marginLeft: 16 }}
                onClick={this.handleAddAccountManage}
              >
                新增账号
              </Button>
            ) : (
              ''
            )}
          </Col>
        </Row>
      </Form>
    )
  }

  renderTable() {
    const columns = [
      {
        title: '账号',
        dataIndex: 'principal',
        width: 195,
        render: text => (
          <Popover
            content={
              <div style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                {text}
              </div>
            }
            title={false}
            placement="topLeft"
          >
            <div className={styles.principal}>{text}</div>
          </Popover>
        )
      },
      {
        title: '姓名',
        dataIndex: 'userName',
        width: 180,
        render: text => (
          <Popover
            content={
              <div style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                {text}
              </div>
            }
            title={false}
            placement="topLeft"
          >
            <div className={styles.userName}>{text}</div>
          </Popover>
        )
      },
      ...column,
      {
        title: '操作',
        dataIndex: 'opration',
        width: 274,
        render: (_, record) => (
          <Fragment>
            <Fragment>
              {record.orgSuperAdmin ? null : (
                <Fragment>
                  {pagePermission('fdc:am:accountManagement:distribution') ? (
                    <a onClick={() => this.handleAssignRole(record)}>
                      分配角色
                    </a>
                  ) : (
                    <a>分配角色</a>
                  )}
                  <Divider type="vertical" />
                </Fragment>
              )}
            </Fragment>
            <Fragment>
              {pagePermission('fdc:am:accountManagement:edit') ? (
                <a onClick={() => this.handleEditAccount(record)}>编辑账号</a>
              ) : (
                <a>编辑账号</a>
              )}

              <Divider type="vertical" />
            </Fragment>
            <Fragment>
              {pagePermission('fdc:am:accountManagement:resetPassword') ? (
                <Popconfirm
                  title="确定重置密码吗？"
                  placement="topRight"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => this.resetPwd(record)}
                >
                  <a>重置密码</a>
                </Popconfirm>
              ) : (
                <a>重置密码</a>
              )}

              <Divider type="vertical" />
            </Fragment>
            <Fragment>
              {pagePermission('fdc:am:accountManagement:cancelActive') ? (
                <Popconfirm
                  title={`确定${record.sysStatus === 1 ? '注销' : '激活'}吗？`}
                  placement="topRight"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => this.handleAccountStatus(record)}
                >
                  <a>{record.sysStatus === 1 ? '注销' : '激活'}</a>
                </Popconfirm>
              ) : (
                <a>{record.sysStatus === 1 ? '注销' : '激活'}</a>
              )}
            </Fragment>
          </Fragment>
        )
      }
    ]

    const { pageNum, pageSize, total } = this.props.model.get('pagination')
    const pagination = {
      current: pageNum,
      pageSize,
      total,
      showTotal,
      showQuickJumper: true,
      onChange: pageNum => {
        this.handleSearch(null, pageNum)
      }
    }

    return (
      <Table
        rowKey="id"
        style={{ marginTop: 24 }}
        columns={columns}
        dataSource={this.props.accountList}
        pagination={pagination}
        loading={this.context.loading.includes(actions.GET_ACCOUNT_LIST)}
        scroll={{ y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  render() {
    const { accountRole, dataList, editData } = this.state
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderTable()}
        </div>
        <AccountManageAdd
          editModalVisible={this.state.addModalVisible}
          onCloseModal={this.handleCloseModal}
          editData={this.state.editData}
          onSearch={this.handleSearch}
        />
        <AccountManageEdit
          editModalVisible={this.state.editModalVisible}
          onCloseModal={this.handleCloseModal}
          editData={this.state.editData}
          onSearch={this.handleSearch}
        />
        {dataList ? (
          <AccountManageAssign
            assignModalVisible={this.state.assignModalVisible}
            onCloseModal={this.handleCloseModal}
            editData={editData}
            onSearch={this.handleSearch}
            accountRole={accountRole}
            dataList={dataList}
          />
        ) : (
          ''
        )}
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
)(AccountManage)
