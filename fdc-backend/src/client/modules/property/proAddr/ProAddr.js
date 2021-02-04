import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import {
  Table,
  Form,
  Row,
  Col,
  Input,
  Select,
  Button,
  Message,
  Alert,
  Breadcrumb,
  Icon,
  Popover,
  Modal,
  message
} from 'antd'
import Immutable from 'immutable'
import { parse } from 'qs'
import { pagePermission } from 'client/utils'
import router from 'client/router'
import layout from 'client/utils/layout'
import showTotal from 'client/utils/showTotal'

import ProAddressAdd from './ProAddress.add'
import ProAddressEdit from './ProAddress.edit'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ProAddr.less'
import ProNameEdit from '../proName/ProName.edit'

const FormItem = Form.Item
const { Option } = Select
const confirm = Modal.confirm

/**
 * 相关楼盘地址
 * author: YJF
 * 入口: 1.菜单点击 - 不带ProjectId; 2.楼盘列表中别名点击 - 带ProjectId
 */

class ProAddr extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    initialFetch: PropTypes.func.isRequired,
    projectAddrList: PropTypes.array.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    delProjectAddr: PropTypes.func.isRequired,
    getProjectAddrList: PropTypes.func.isRequired,
    exportProjectAddr: PropTypes.func.isRequired,
    getProjectDetail: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired,
    IsMatchBatchProject:PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)

    const { projectId = '', cityId = '', cityName = '' } = parse(
      props.location.search.substr(1)
    )
    // 楼盘id
    this.projectId = projectId

    this.state = {
      // 新增楼盘名称Modal
      addModalVisible: false,
      editModalVisible: false,
      // 选中table数据
      selectedRowKeys: [],
      editData: {},
      cityId,
      cityName,
      pageNum:1
    }
  }

  componentDidMount() {
    const { cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
      this.cityName =
        JSON.parse(sessionStorage.getItem('FDC_CITY_INFO')).cityName || cityName
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
        this.initialFetch()
        if (this.projectId) {
          this.props.getProjectDetail(this.projectId, this.cityId)
        }
      }
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location !== nextProps.location) {
      // 清空form
      this.props.form.resetFields()
      // URL参数变更 刷新页面
      const { projectId = '' } = parse(nextProps.location.search.substr(1))
      this.projectId = projectId
      this.initialFetch()
      if (this.projectId) {
        this.props.getProjectDetail(this.projectId, this.cityId)
      }
    }
  }

  initialFetch = () => {
    // 初始化参数
    const searchProjectAddr = {
      pageNum: 1,
      pageSize: 20,
      cityId: this.cityId,
      projectId: this.projectId
    }
    this.props.initialFetch(searchProjectAddr)
  }

  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    this.setState({
      pageNum: pageNum
    })
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log(values, pageNum, pageSize)
        this.setState({
          selectedRowKeys: []
        })

        const { keyword, addressType } = values
        const searchProjectAddr = {
          pageNum,
          pageSize: 20,
          cityId: this.cityId,
          projectId: this.projectId
        }
        if (addressType) {
          searchProjectAddr.addressType = addressType
        }
        if (keyword) {
          searchProjectAddr.keyword = keyword.trim()
        }
        this.props.getProjectAddrList(searchProjectAddr,res=>{
          if(res.records.length<1&&pageNum!==1){
            searchProjectAddr.pageNum = pageNum - 1
            setTimeout(()=>{
              this.handleSearch(null,pageNum - 1)
            },100)
          }
        })
      }
    })
  }

  handleConfirmDelete = () => {
    const that = this
    const data = {
      ids: this.state.selectedRowKeys.join(','),
      cityId:this.cityId
    }
    this.props.IsMatchBatchProject(data,res=>{
      let title = '您是否确定删除?'
      if(res===true){
        title = '要被删除的相关楼盘地址，也会将所关联楼盘的楼盘地址里，名称完全相同的地址删掉！'
      }
      confirm({
        title: title,
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          that.handleDelete()
        }
      })
    })
  }

  handleDelete = () => {
    const data = {
      ids: this.state.selectedRowKeys.join(',')
    }
    this.props.delProjectAddr(data, () => {
      Message.success('删除成功')
      const { pageNum } = this.props.model.get('pagination')
      this.handleSearch(null, pageNum)
    })
  }

  /* 新增 1.带 projectId; 2. 不带 projectId */
  handleAddProAddr = (editData = {}) => {
    if (this.projectId) {
      editData.projectId = this.projectId
    }
    this.setState({
      editData,
      addModalVisible: true
    })
  }

  /* 编辑/查看 功能 */
  handleEditProAddr = editData => {
    this.setState({
      editData,
      editModalVisible: true
    })
  }

  handleCloseModal = () => {
    this.setState({
      addModalVisible: false,
      editModalVisible: false,
      editData: {}
    })
  }

  handleExportData = () => {
    const { addressType, keyword } = this.props.form.getFieldsValue([
      'addressType',
      'keyword'
    ])
    const { selectedRowKeys } = this.state
    const exportQry = {
      cityId: this.cityId,
      addressType,
      keyword: keyword ? keyword.trim() : keyword,
      projectId: this.projectId,
      ids: selectedRowKeys.join(',')
    }
    // 修改楼盘地址点击过来后，导出的时候，没有带propjectId
    // if (this.propjectId) {
    //   exportQry.projectId = this.projectId
    // }
    const that = this
    this.props.exportProjectAddr(exportQry, () => {
      confirm({
        title: '导出提示',
        content: (
          <div>
            <p>系统正在导出Excel,请耐心等待...</p>
            <p>
              <Icon type="info-circle" />
              <i style={{ marginLeft: 8 }} />
              可跳转导出任务页查看
            </p>
          </div>
        ),
        okText: '跳转',
        onOk() {
          that.goExportTask()
        },
        onCancel() {}
      })
    })
  }

  goExportTask = () => {
    if (pagePermission('fdc:hd:export:check')) {
      this.props.history.push({
        pathname: router.RES_EXPORT_TASK,
        search: 'type=1'
      })
    } else {
      message.warning('没有导出任务页权限，请联系管理员')
    }
  }

  renderBreads() {
    const breadList = [
      {
        key: 1,
        path: '',
        name: '住宅',
        icon: 'home'
      },
      {
        key: 2,
        path: '',
        name: '相关楼盘地址'
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

    const addrTypeList = this.props.model.get('addrTypeList')

    let proAddrStatue = 1
    if (this.projectId) {
      const { sysStatus = 1 } = this.props.model.get('projectDetail')
      proAddrStatue = sysStatus
    }

    return (
      <Form>
        <Row>
          <Col {...layout(12, 12, 8, 8)}>
            <FormItem
              label="地址类型"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
            >
              {getFieldDecorator('addressType')(
                <Select placeholder="请选择地址">
                  <Option value="">全部</Option>
                  {addrTypeList.map(item => (
                    <Option key={item.get('code')}>{item.get('name')}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...layout(12, 12, 8, 8)}>
            <FormItem
              label="关键字"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
            >
              {getFieldDecorator('keyword')(
                <Input placeholder="请输入关键字" maxLength={100} />
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
        <span>
          {proAddrStatue === 1 ? (
            <Row>
              {pagePermission('fdc:hd:residence:saleAddress:add') ? (
                <Button
                  type="primary"
                  icon="plus"
                  style={{ marginRight: 16 }}
                  onClick={this.handleAddProAddr}
                >
                  新增
                </Button>
              ) : (
                ''
              )}

              {pagePermission('fdc:hd:residence:saleAddress:delete') ? (
                <Button
                  type="danger"
                  icon="delete"
                  style={{ marginRight: 16 }}
                  disabled={this.state.selectedRowKeys.length === 0}
                  onClick={this.handleConfirmDelete}
                >
                  删除
                </Button>
              ) : (
                ''
              )}

              <Link
                to={{
                  pathname: router.RES_PROADDR_IMPORT,
                  // search: 'importType=1212108'
                  search: `importType=${1212108}&cityId=${
                    this.cityId
                  }&cityName=${this.cityName}`
                }}
              >
                {pagePermission('fdc:hd:residence:saleAddress:import') ? (
                  <Button
                    style={{ marginRight: 16 }}
                    type="primary"
                    icon="upload"
                  >
                    导入
                  </Button>
                ) : (
                  ''
                )}
              </Link>
              {pagePermission('fdc:hd:residence:saleAddress:export') ? (
                <Button
                  type="primary"
                  icon="download"
                  onClick={this.handleExportData}
                >
                  导出
                </Button>
              ) : (
                ''
              )}
            </Row>
          ) : null}
        </span>
      </Form>
    )
  }

  renderProjectInfo() {
    const { projectDetail } = this.props.model
    const { areaName = '暂无', projectName, sysStatus = 1 } = projectDetail

    return (
      <div style={{ marginTop: 16 }}>
        {this.projectId ? (
          <Alert
            style={{ minHeight: 40, paddingBottom: 0 }}
            message={
              <p>
                当前楼盘名称&nbsp;
                <span
                  style={{
                    fontWeight: 600,
                    color: sysStatus === 1 ? '#33CABB' : '#FF0000'
                  }}
                >
                  {areaName}
                  {areaName ? ' | ' : null}
                  {projectName}
                </span>
              </p>
            }
            type="info"
            showIcon
          />
        ) : null}
      </div>
    )
  }

  renderTable() {
    const columns = [
      {
        title: '正式楼盘',
        width: 272,
        render: record => {
          // 只显示没有删除的相关楼盘地址即楼盘地址状态为1的数据 - 库晶晶
          // 楼盘状态 - prjStatus
          const { prjStatus, areaName, projectName } = record

          let text = ''
          if (areaName) {
            text = `${areaName} | ${projectName}`
          } else {
            text = projectName
          }

          return (
            <Popover
              content={<div style={{ maxWidth: '200px' }}>{text}</div>}
              title={false}
              placement="topLeft"
            >
              {pagePermission('fdc:hd:residence:saleAddress:change') ? (
                <a onClick={() => this.handleEditProAddr(record)}>
                  <div
                    className={prjStatus === 1 ? null : `${styles.delProAddr}`}
                  >
                    <div className={styles.limitProjectName}>{text}</div>
                  </div>
                </a>
              ) : (
                <div
                  className={prjStatus === 1 ? null : `${styles.delProAddr}`}
                >
                  <a className={styles.limitProjectName}>{text}</a>
                </div>
              )}
            </Popover>
          )
        }
      },
      {
        title: '地址类型',
        dataIndex: 'projectType',
        width: 150
      },
      {
        title: '相关楼盘地址',
        // dataIndex: 'projectAddress',
        width: 272,
        render: ({ projectAddress }) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{projectAddress}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitProjectName}>{projectAddress}</div>
          </Popover>
        )
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: 200
      }
    ]

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      // Column configuration not to be checked
      getCheckboxProps: record => ({
        disabled: record.prjStatus === 0
      }),
      onChange: selectedRowKeys => {
        this.setState({
          selectedRowKeys
        })
      }
    }

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
        style={{ marginTop: 24 }}
        columns={columns}
        dataSource={this.props.projectAddrList}
        rowSelection={rowSelection}
        pagination={pagination}
        loading={this.context.loading.includes(actions.GET_PROJECT_ADDR_LIST)}
        scroll={{ y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  render() {
    const { cityId } = this.state
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderProjectInfo()}
          {this.renderTable()}
        </div>
        <ProAddressEdit
          editModalVisible={this.state.editModalVisible}
          onCloseModal={this.handleCloseModal}
          editData={this.state.editData}
          onSearch={this.handleSearch}
          cityId={cityId}
          pageNum={this.state.pageNum}
        />
        <ProAddressAdd
          addModalVisible={this.state.addModalVisible}
          onCloseModal={this.handleCloseModal}
          editData={this.state.editData}
          onSearch={this.handleSearch}
          cityId={cityId}
        />
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
)(ProAddr)
