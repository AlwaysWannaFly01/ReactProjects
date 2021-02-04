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

import ProNameAdd from './ProName.add'
import ProNameEdit from './ProName.edit'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ProName.less'
import moment from "moment"

const FormItem = Form.Item
const { Option } = Select
const confirm = Modal.confirm

/**
 * 相关楼盘别名
 * author: YJF
 * 入口: 1.菜单点击 - 不带ProjectId; 2.楼盘列表中别名点击 - 带ProjectId
 * 页面状态: 1.菜单点击 - 全部功能； 2. 楼盘列表中别名点击 - 楼盘状态 1/0 全部功能/查询
 * 列表数据状态: 1.楼盘状态 1/0 查看和编辑/查看
 *             2.菜单点击 - 全部《正式》相关楼盘名称列表数据；别名点击 - 带ProjectId的相关楼盘名称列表
 */

class ProName extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    initialFetch: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    projectAliaList: PropTypes.array.isRequired,
    getProjectAliaList: PropTypes.func.isRequired,
    delProjectAlia: PropTypes.func.isRequired,
    exportProjectName: PropTypes.func.isRequired,
    getProjectDetail: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)

    const { projectId,projectName, cityId = '', cityName = '' } = parse(
      props.location.search.substr(1)
    )
    // 楼盘id
    this.projectId = projectId
    this.projectName = projectName

    this.state = {
      // 新增楼盘名称Modal
      addModalVisible: false,
      editModalVisible: false,
      // 选中table数据
      selectedRowKeys: [],
      aliaTypeList: [],
      // 编辑内容
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
    const searchProjectAlia = {
      pageNum: 1,
      pageSize: 20,
      cityId: this.cityId,
      projectId: this.projectId
    }
    this.props.initialFetch(searchProjectAlia)
  }

  handleSearch = (e, pageNum) => {
    this.setState({
      pageNum: pageNum
    })
    if (e) {
      e.preventDefault()
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          selectedRowKeys: []
        })

        const { typeCode, keyword } = values
        const searchProjectAlia = {
          pageNum,
          pageSize: 20,
          cityId: this.cityId,
          projectId: this.projectId
        }
        if (typeCode) {
          searchProjectAlia.typeCode = typeCode
        }
        if (keyword) {
          searchProjectAlia.keyword = keyword.trim()
        }
        this.props.getProjectAliaList(searchProjectAlia,res=>{
          if(res.records.length<1&&pageNum!==1){
            searchProjectAlia.pageNum = pageNum - 1
            setTimeout(()=>{
              this.handleSearch(null,pageNum - 1)
            },100)
          }
        })
        // console.log(this.props.projectAliaList)
        // if(this.props.getProjectAliaList(searchProjectAlia).payload[0].pageNum<1 && pageNum!==1){
        //     this.handleSearch(null,pageNum-1)
        // }
      }
    })
  }

  handleConfirmDelete = () => {
    const that = this
    for(let i of this.state.selectedRowKeys){
      let item = this.props.projectAliaList.find(e => e.id === i)
      const aliaTypeList = this.props.model.get('aliaTypeList').toJS()
      let typeCodeName =
        aliaTypeList.filter(e => e.code === `${item.typeCode}`) || ''
      typeCodeName = typeCodeName[0]?typeCodeName[0].name:''
      if((typeCodeName==='网络推广名'||typeCodeName==='证载名称')&&item.areaName){
        if((item.prjAreaName===item.areaName)){
          let arr = item.projectAlias.split('，')
          for(let i of arr){
            if(item.alias === i){
              confirm({
                title: '要被删除的相关楼盘名称，也会将所关联楼盘的楼盘别名里，名称完全相同的别名删掉！',
                okText: '确定',
                okType: 'danger',
                cancelText: '取消',
                width: '440px',
                onOk() {
                  that.handleDelete()
                }
              })
              return
            }
          }
        }
      }
    }
    confirm({
      title: '您是否确定删除?',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        that.handleDelete()
      }
    })
  }

  handleDelete = () => {
    const data = {
      cityId: this.cityId,
      ids: this.state.selectedRowKeys.join(',')
    }
    const { pageNum } = this.props.model.get('pagination')
    this.props.delProjectAlia(data, () => {
      Message.success('删除成功')
      this.handleSearch(null, pageNum)
    })
  }

  /* 新增 1.带 projectId; 2. 不带 projectId */
  handleAddProName = (editData = {}) => {
    if (this.projectId) {
      editData.projectId = this.projectId
    }
    this.setState({
      editData,
      addModalVisible: true
    })
  }

  /* 编辑/查看 功能 */
  handleEditProName = editData => {
    this.setState({
      editData,
      editModalVisible: true
    })
  }

  handleCloseModal = () => {
    this.setState({
      editModalVisible: false,
      addModalVisible: false,
      editData: {}
    })
  }

  handleExportData = () => {
    const { typeCode, keyword } = this.props.form.getFieldsValue([
      'typeCode',
      'keyword'
    ])
    const { selectedRowKeys } = this.state
    const exportQry = {
      cityId: this.cityId,
      typeCode,
      keyword: keyword ? keyword.trim() : keyword,
      projectId: this.projectId,
      ids: selectedRowKeys.join(',')
    }
    // const cityId = this.cityId
    const that = this
    this.props.exportProjectName(exportQry, () => {
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
        name: '相关楼盘名称'
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
    const aliaTypeList = this.props.model.get('aliaTypeList')

    let proNameStatue = 1
    if (this.projectId) {
      const { sysStatus = 1 } = this.props.model.get('projectDetail')
      proNameStatue = sysStatus
    }
    // const { cityId, cityName } = this.state
    // console.log(cityId, cityName)
    return (
      <Form>
        <Row>
          <Col {...layout(12, 12, 8, 8)}>
            <FormItem
              label="别名类型"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
            >
              {getFieldDecorator('typeCode')(
                <Select placeholder="请选择别名" allowClear>
                  {aliaTypeList.map(item => (
                    <Option value={item.get('code')} key={item.get('code')}>
                      {item.get('name')}
                    </Option>
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
              {getFieldDecorator('keyword',{
                initialValue: this.projectName
              })(
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
          {proNameStatue === 1 ? (
            <Row>
              {pagePermission('fdc:hd:residence:saleName:add') ? (
                <Button
                  style={{ marginRight: 16 }}
                  onClick={() => this.handleAddProName()}
                  icon="plus"
                  type="primary"
                >
                  新增
                </Button>
              ) : (
                ''
              )}

              {pagePermission('fdc:hd:residence:saleName:delete') ? (
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
                  pathname: router.RES_PRONAME_IMPORT,
                  // search: 'importType=1212106'
                  search: `importType=${1212106}&cityId=${
                    this.cityId
                  }&cityName=${this.cityName}`
                }}
              >
                {pagePermission('fdc:hd:residence:saleName:import') ? (
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
              {pagePermission('fdc:hd:residence:saleName:export') ? (
                <Button
                  icon="download"
                  onClick={this.handleExportData}
                  type="primary"
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
    const { areaName, projectName, sysStatus = 1 } = projectDetail

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
    const aliaTypeList = this.props.model.get('aliaTypeList')
    const columns = [
      {
        title: '正式楼盘',
        width: 252,
        render: record => {
          // 只显示没有删除的相关楼盘别名即楼盘别名状态为1的数据 - 库晶晶
          // 楼盘状态 - projectStatus
          const { projectStatus, prjAreaName, projectName } = record

          let text = ''
          if (prjAreaName) {
            text = `${prjAreaName} | ${projectName}`
          } else {
            text = projectName
          }

          return (
            <Popover
              content={<div style={{ maxWidth: '200px' }}>{text}</div>}
              title={false}
              placement="topLeft"
            >
              {pagePermission('fdc:hd:residence:saleName:change') ? (
                <a onClick={() => this.handleEditProName(record)}>
                  <div
                    className={
                      projectStatus === 1 ? null : `${styles.delProName}`
                    }
                  >
                    <div className={styles.limitProjectName}>{text}</div>
                  </div>
                </a>
              ) : (
                <div
                  className={
                    projectStatus === 1 ? null : `${styles.delProName}`
                  }
                >
                  <a className={styles.limitProjectName}>{text}</a>
                </div>
              )}
            </Popover>
          )
        }
      },
      {
        title: '别名类型',
        width: 120,
        render: ({ typeCode }) => {
          let typeCodeName =
            aliaTypeList.filter(item => item.get('code') === `${typeCode}`) ||
            ''
          if (typeCodeName.size > 0) {
            typeCodeName = typeCodeName.get('0').get('name')
          }
          return <span>{typeCodeName}</span>
        }
      },
      {
        title: '相关楼盘名称',
        width: 250,
        render: ({ alias, areaName }) => {
          let text = ''
          if (areaName) {
            text = `${areaName} | ${alias}`
          } else {
            text = alias
          }
          return (
            <Popover
              content={<div style={{ maxWidth: '200px' }}>{text}</div>}
              title={false}
              placement="topLeft"
            >
              <div className={styles.limitProjectName}>{text}</div>
            </Popover>
          )
        }
      },
      {
        title: '备注',
        width: 200,
        dataIndex: 'sysComment'
      }
    ]

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      getCheckboxProps: record => ({
        disabled: record.projectStatus === 0
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
        dataSource={this.props.projectAliaList}
        rowSelection={rowSelection}
        pagination={pagination}
        loading={this.context.loading.includes(actions.GET_PROJECT_ALIA_LIST)}
        scroll={{ y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  render() {
    const { cityId, cityName } = this.state
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderProjectInfo()}
          {this.renderTable()}
        </div>
        <ProNameEdit
          editModalVisible={this.state.editModalVisible}
          onCloseModal={this.handleCloseModal}
          editData={this.state.editData}
          onSearch={this.handleSearch}
          cityId={cityId}
          cityName={cityName}
          pageNum={this.state.pageNum}
        />
        <ProNameAdd
          addModalVisible={this.state.addModalVisible}
          onCloseModal={this.handleCloseModal}
          editData={this.state.editData}
          onSearch={this.handleSearch}
          cityId={cityId}
          cityName={cityName}
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
)(ProName)
