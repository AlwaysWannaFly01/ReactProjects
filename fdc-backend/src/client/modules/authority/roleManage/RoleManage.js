import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { compose } from 'redux'
import Immutable from 'immutable'

import {
  Modal,
  Breadcrumb,
  Icon,
  Input,
  Row,
  Col,
  Button,
  Form,
  Table,
  Popconfirm,
  Divider,
  Message,
  Popover
} from 'antd'
import { pagePermission } from 'client/utils'
import router from 'client/router'
import layout from 'client/utils/layout'
import showTotal from 'client/utils/showTotal'
import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import { breadList, column } from './constant'
import styles from './RoleManage.less'

/**
 * @description 权限管理--角色管理
 * @author WY
 */
const FormItem = Form.Item
class RoleManage extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getAuthorityList: PropTypes.func.isRequired,
    authorityList: PropTypes.array.isRequired,
    delAuthority: PropTypes.func.isRequired,
    editProduct: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    props.getAuthorityList()
    this.state = {
      addModalvisible: false,
      editData: '',
      editRole: ''
    }
  }
  componentDidMount() {
    // this.props.getAuthorityList()
  }

  // 搜索列表
  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    this.props.form.validateFields(['keyword'], (err, values) => {
      if (!err) {
        const {
          pagination: { pageNum: propsPageNum, pageSize }
        } = this.props.model
        const params = {
          pageNum: pageNum || propsPageNum,
          pageSize,
          keyword: values.keyword
        }
        this.props.getAuthorityList(params, res => {
          console.log(res)
        })
      }
    })
  }

  // 新增/编辑弹框取消事件
  handleModalCancel = () => {
    this.setState({
      addModalvisible: false,
      editData: '',
      editRole: ''
    })
    this.props.form.resetFields(['roleName', 'description'])
  }

  // 新增/编辑事件
  handleEditProduct = record => {
    // console.log(record)
    const { id } = record
    this.setState({
      addModalvisible: true,
      editData: id,
      editRole: record
    })
  }
  // 新增/编辑事件
  handleAddProduct = () => {
    this.setState({
      addModalvisible: true,
      editData: '',
      editRole: ''
    })
  }

  handleDelete = id => {
    this.props.delAuthority(id, () => {
      this.handleSearch(null, 1)
      Message.success('删除成功')
    })
  }

  // 新增/编辑弹框确认事件
  handleModalOk = () => {
    const { editData } = this.state
    this.props.form.validateFields(
      ['roleName', 'description'],
      (err, values) => {
        if (!err) {
          const qry = {
            id: editData,
            roleName: values.roleName,
            description: values.description
          }
          this.props.editProduct(qry, () => {
            Message.success('保存成功！')
            this.handleSearch()
            this.handleModalCancel()
          })
        }
      }
    )
  }

  // regExpPercent = (rule, value, callback) => {
  //   if (value === undefined || value === '' || value === null) {
  //     callback('请填写值')
  //   } else if (value <= 0 || value > 300) {
  //     callback('请输入正确的折扣百分数：0~300%')
  //   } else {
  //     callback()
  //   }
  // }

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
              label="角色"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
            >
              {getFieldDecorator('keyword')(
                <Input placeholder="" maxLength={100} />
              )}
            </FormItem>
          </Col>
          <Col span={2}>
            <Button
              type="primary"
              icon="search"
              style={{ marginTop: 4 }}
              onClick={e => this.handleSearch(e, 1)}
            >
              查询
            </Button>
          </Col>
        </Row>
        <Row>
          {pagePermission('fdc:am:roleManagement:add') ? (
            <Button
              type="primary"
              icon="plus"
              style={{ marginRight: 16 }}
              onClick={this.handleAddProduct}
            >
              新增角色
            </Button>
          ) : (
            ''
          )}
        </Row>
      </Form>
    )
  }

  renderTable() {
    const columns = [
      {
        key: '1',
        title: '角色',
        dataIndex: 'roleName',
        width: 208,
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
            <div className={styles.limitName}>{text}</div>
          </Popover>
        )
      },
      {
        key: '2',
        title: '描述',
        dataIndex: 'description',
        width: 188,
        render: text => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{text}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitName}>{text}</div>
          </Popover>
        )
      },
      ...column,
      {
        key: '4',
        title: '操作',
        dataIndex: 'opration',
        width: 279,
        render: (_, record) => (
          <div>
            {pagePermission('fdc:am:roleManagement:setPermission') ? (
              <Link
                to={{
                  pathname: router.AUTHORITY_ROLE_MANAGE_SET,
                  search: `?id=${
                    record.id
                  }&dataPermType=${record.dataPermType || ''}`
                }}
              >
                设置权限
              </Link>
            ) : (
              <a>设置权限</a>
            )}

            <Divider type="vertical" />
            {pagePermission('fdc:am:roleManagement:edit') ? (
              <a onClick={() => this.handleEditProduct(record)}>编辑角色</a>
            ) : (
              <a>编辑角色</a>
            )}

            <Divider type="vertical" />
            {pagePermission('fdc:am:roleManagement:delete') ? (
              <Popconfirm
                title="确定删除?"
                onConfirm={() => this.handleDelete(record.id)}
              >
                <a>删除</a>
              </Popconfirm>
            ) : (
              <a>删除</a>
            )}
          </div>
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
        dataSource={this.props.authorityList}
        pagination={pagination}
        loading={this.context.loading.includes(actions.GET_AUTHORITY_LIST)}
        scroll={{ y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  renderModal() {
    const {
      form: { getFieldDecorator }
    } = this.props
    const { addModalvisible, editData, editRole } = this.state
    return (
      <Modal
        visible={addModalvisible}
        title={editData ? '编辑角色' : '新增角色'}
        okText="保存"
        cancelText="取消"
        onCancel={this.handleModalCancel}
        onOk={this.handleModalOk}
      >
        <Form>
          <Row>
            <Col span="20">
              <FormItem
                label="角色"
                labelCol={layout(6, 6)}
                wrapperCol={layout(16, 14)}
              >
                {getFieldDecorator('roleName', {
                  rules: [
                    {
                      required: true,
                      message: '请输入角色'
                    },
                    {
                      pattern: /^[a-zA-Z\u4e00-\u9fa5]+$/,
                      message: '只能输入汉字与字母'
                    }
                  ],
                  initialValue: editRole.roleName
                })(<Input maxlength="50" disabled={!!editData} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="20">
              <FormItem
                label="描述"
                labelCol={layout(6, 6)}
                wrapperCol={layout(16, 14)}
              >
                {getFieldDecorator('description', {
                  rules: [
                    {
                      pattern: /^[^\s]*$/,
                      message: '不能输入空格'
                    }
                  ],
                  initialValue: editRole.description
                })(<Input maxlength="100" />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderTable()}
          {this.renderModal()}
        </div>
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
)(RoleManage)
