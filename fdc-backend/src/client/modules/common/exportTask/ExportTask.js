import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import {
  Form,
  Breadcrumb,
  Icon,
  Table,
  Row,
  Col,
  Select,
  Input,
  Button,
  Badge,
  Popover,
  Message,
  Modal
} from 'antd'
import Immutable from 'immutable'
import moment from 'moment'
import { parse } from 'qs'
import { pagePermission } from 'client/utils'
import showTotal from 'client/utils/showTotal'
import layout from 'client/utils/layout'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ExportTask.less'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

/**
 * @description 导入任务模块
 */
class ExportTask extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    getExportType: PropTypes.func.isRequired,
    getExportTaskList: PropTypes.func.isRequired,
    getExportTaskListCb: PropTypes.func.isRequired, // 写个回调函数，用于导入时无数据查看权限
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    exportTaskList: PropTypes.array.isRequired,
    downExportTaskExcel: PropTypes.func.isRequired,
    getDelExport: PropTypes.func.isRequired // 删除 WY
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)

    const { type = '1' } = parse(props.location.search.substr(1))
    // 获取导出模块 1.房产数据 2.数据统计
    this.state = {
      moduleType: type,
      selectedRowKeys: [],
      localeW: '暂无数据'
    }
  }

  componentDidMount() {
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      if (this.cityId) {
        clearInterval(this.cityIdInterval)

        this.props.getExportType(this.state.moduleType)
        this.getExportTaskList(1)

        // 修改 无数据查看权限时 wy change
        const {
          exportType,
          taskName,
          taskStatus
        } = this.props.form.getFieldsValue()
        const { moduleType } = this.state
        // 获取导出任务列表
        const params = {
          pageNum: 1,
          pageSize: 20,
          taskName,
          taskStatus,
          moduleType
        }
        if (exportType) {
          params.exportTypes = [exportType].join(',')
        }
        // 只有房产数据模块有城市id
        if (moduleType === '1') {
          params.cityId = this.cityId
        }
        this.props.getExportTaskListCb(params, err => {
          const { code } = err
          if (code === '200') {
            this.setState({
              localeW: '暂无数据'
            })
          } else {
            this.setState({
              localeW: '无数据查看权限'
            })
          }
        })
      }
    }, 100)
  }

  getExportTaskList = pageNum => {
    const {
      exportType,
      taskName,
      taskStatus
    } = this.props.form.getFieldsValue()
    const { moduleType } = this.state
    // 获取导出任务列表
    const params = {
      pageNum,
      pageSize: 20,
      taskName,
      taskStatus,
      moduleType
    }
    if (exportType) {
      params.exportTypes = [exportType].join(',')
    }
    // 只有房产数据模块有城市id
    if (moduleType === '1') {
      params.cityId = this.cityId
    }
    this.props.getExportTaskList(params)
  }

  handleSearch = e => {
    if (e) {
      e.preventDefault()
    }
    this.getExportTaskList(1)
    // 重新查询后，清空勾选的数  WY
    this.setState({
      selectedRowKeys: []
    })
  }
  // S删除
  handleConfirmDelete = () => {
    const that = this
    confirm({
      title: '您是否确定删除?',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        that.handleBatchDel()
      }
    })
  }

  handleBatchDel = () => {
    const ids = this.state.selectedRowKeys.join(',')
    this.props.getDelExport(ids, (code, message) => {
      if (+code === 200) {
        Message.success('删除成功')
        this.handleSearch(null, 1)
      } else {
        Message.error(message)
      }
    })
  }
  // E删除

  handleDownLoad = id => {
    this.props.downExportTaskExcel(id, res => {
      const { code, message } = res
      if (code === 400) {
        Message.error(message)
      }
    })
  }

  renderBreads() {
    const breadList = [
      {
        key: 1,
        path: '',
        name: '导出',
        icon: 'export'
      }
    ]

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

    const { exportTypeList } = this.props.model

    const taskStatusList = [
      {
        code: '-1',
        name: '失败'
      },
      {
        code: '0',
        name: '进行中'
      },
      {
        code: '1',
        name: '完成'
      }
    ]

    return (
      <Form onSubmit={e => this.handleSearch(e)} layout="horizontal">
        <Row>
          <Col span={6}>
            <FormItem
              label="导出类型"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
            >
              {getFieldDecorator('exportType')(
                <Select placeholder="请选择导出类型" allowClear>
                  {exportTypeList.map(item => (
                    <Option value={item.get('code')} key={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label="任务名称"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
            >
              {getFieldDecorator('taskName')(
                <Input placeholder="请输入任务名称" />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label="任务状态"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
            >
              {getFieldDecorator('taskStatus')(
                <Select placeholder="请选择任务状态" allowClear>
                  {taskStatusList.map(item => (
                    <Option value={item.code} key={item.code}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Button type="primary" style={{ marginTop: 4 }} htmlType="submit">
            查询
          </Button>
          <Button
            style={{ marginTop: 4, marginLeft: 16 }}
            onClick={() => this.props.history.goBack()}
          >
            返回
          </Button>
          {pagePermission('fdc:hd:export:delete') ? (
            <Button
              type="danger"
              icon="delete"
              style={{ marginLeft: 16 }}
              disabled={this.state.selectedRowKeys.length === 0}
              onClick={this.handleConfirmDelete}
            >
              删除
            </Button>
          ) : (
            ''
          )}
        </Row>
      </Form>
    )
  }

  renderTable() {
    const { exportTypeList } = this.props.model

    const columns = [
      {
        title: '任务名称',
        dataIndex: 'taskName',
        width: 261,
        render: taskName => (
          <Popover content={taskName} title={false} placement="topLeft">
            <div className={styles.limitTaskName}>{taskName}</div>
          </Popover>
        )
      },
      {
        title: '导出类型',
        width: 188,
        dataIndex: 'exportType',
        render: exportType => {
          if (exportType) {
            let exportTypeName = ''
            const exportTypeNameArr = exportTypeList.filter(
              item => +item.get('code') === exportType
            )
            if (exportTypeNameArr.size) {
              exportTypeName = exportTypeNameArr.get(0).get('name')
            }
            return exportTypeName
          }
          return null
        }
      },
      {
        title: '导出开始时间',
        width: 200,
        dataIndex: 'crtTime',
        render: crtTime => {
          if (crtTime) {
            return <span>{moment(crtTime).format('YYYY-MM-DD HH:mm:ss')}</span>
          }
          return null
        }
      },
      {
        title: '导出完成时间',
        width: 200,
        render: ({ taskStatus, modTime }) => {
          if (taskStatus === -1 || taskStatus === 1) {
            if (modTime) {
              return (
                <span>{moment(modTime).format('YYYY-MM-DD HH:mm:ss')}</span>
              )
            }
          } else {
            return '--'
          }
          return null
        }
      },
      {
        title: '任务状态',
        width: 129,
        render: ({ taskStatus, remark }) => (
          <span>
            {
              {
                '-1': (
                  <Popover
                    placement="topRight"
                    content={
                      <div
                        style={{ width: 200, maxHeight: 200, overflow: 'auto' }}
                      >
                        {remark}
                      </div>
                    }
                    title="错误信息"
                  >
                    <span>
                      <Badge status="error" text="失败" />
                    </span>
                  </Popover>
                ),
                1: <Badge status="success" text="成功" />,
                0: <Badge status="processing" text="正在进行" />
              }[taskStatus]
            }
          </span>
        )
      },
      {
        title: '操作',
        width: 107,
        render: ({ taskStatus, id }) =>
          ({
            1: (
              <Fragment>
                {pagePermission('fdc:hd:export:download') ? (
                  <a onClick={() => this.handleDownLoad(id)}>下载</a>
                ) : (
                  <span>下载</span>
                )}
              </Fragment>
            )
          }[taskStatus])
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
        this.getExportTaskList(pageNum)
      }
    }

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: selectedRowKeys => {
        this.setState({
          selectedRowKeys
        })
      }
    }

    return (
      <Table
        rowKey="id"
        pagination={pagination}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={this.props.exportTaskList}
        scroll={{ y: 540 }}
        locale={{
          emptyText: this.state.localeW
        }}
        className={styles.defineTable}
        loading={this.context.loading.includes(actions.GET_EXPORT_TASK_LIST)}
      />
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderTable()}
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
)(ExportTask)
