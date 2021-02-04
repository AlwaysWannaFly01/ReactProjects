import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  Icon,
  Form,
  Modal,
  Button,
  Table,
  Input,
  Select,
  Row,
  Col,
  Popconfirm,
  Message,
  Popover
} from 'antd'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import ProjectSelect from 'client/components/project-select'
import { parse } from 'qs'
import showTotal from 'client/utils/showTotal'
import layout from 'client/utils/layout'
import router from 'client/router'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './CaseInfo.less'

const FormItem = Form.Item
const { Option } = Select
const confirm = Modal.confirm

/*
 * 住宅案例数据列表
 */
/* eslint-disable */
class CaseInfoError extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    fetchErrorList: PropTypes.func.isRequired, // 错误楼盘名称列表
    errorCaseList: PropTypes.array.isRequired, // 错误楼盘名称列表
    deleteError: PropTypes.func.isRequired, // 删除
    deleteAllError: PropTypes.func.isRequired, // 一键删除
    exportErrorProject: PropTypes.func.isRequired, // 导出
    editProjectName: PropTypes.func.isRequired, // 编辑保存
    editAuthority: PropTypes.func.isRequired, // 城市权限
    exportProjectAvg: PropTypes.func.isRequired,
    getAliaType: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)

    const { taskId, cityId = '', cityName, importType } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      taskId,
      // 选中table数据
      selectedRowKeys: [],
      selectedRows: [],
      visible: false,
      editData: {},
      cityId,
      cityName,
      importType,
      aliaTypeList:[]
    }
  }

  componentDidMount() {
    // 查询列表
    if (this.state.taskId) {
      const qry = {
        importType: this.state.importType,
        keyword: '',
        pageNum: 1,
        pageSize: 20,
        taskId: this.state.taskId
      }
      this.props.fetchErrorList(qry)
      this.props.getAliaType({},res=>{
        console.log(res)
        if(res.code==='200'){
          this.setState({
            aliaTypeList:res.data
          })
        }
      })
    }
  }

  onProjectSelectRef = ref => {
    this.projectSelectRef = ref
  }

  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    // 重新查询后，清空勾选的数
    this.setState({
      selectedRowKeys: [],
      selectedRows: []
    })

    this.props.form.validateFieldsAndScroll(['keyword'], (err, values) => {
      if (!err) {
        const qry = {
          importType: this.state.importType,
          keyword: values.keyword,
          pageNum: pageNum || 1,
          pageSize: 20,
          taskId: this.state.taskId
        }
        this.props.fetchErrorList(qry)
      }
    })
  }

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

  // 删除案例
  handleBatchDel = () => {
    const ids = this.state.selectedRowKeys.join(',')
    const { importType } = this.state
    this.props.deleteError({ ids, importType }, res => {
      const {data, code, message } = res
    const { pageNum, pageSize, total } = this.props.model.get('pagination')

    // 总的页数
    const temp = total % pageSize
    const tempPage = parseInt(total / pageSize)
    const totalPage = temp == 0 ? tempPage : tempPage + 1
    const pageNumNew =
      pageNum === totalPage
        ? (total - data) % 20 === 0
        ? 1
        : pageNum
        : pageNum
    if (+code === 200) {
      Message.success('删除成功')
      this.handleSearch(null, pageNumNew)
    } else {
      Message.error(message)
    }
  })
  }

  handleDeleteAllError = () => {
    const { taskId, importType } = this.state

    this.props.form.validateFieldsAndScroll(['keyword'], (err, values) => {
      if (!err) {
        // this.setState({
        //   deleteAllCasesLoading: true
        // })
        const { keyword } = values
        const delParams = {
          importType,
          keyword,
          pageNum: 1,
          pageSize: 20,
          taskId
        }

        this.props.deleteAllError(delParams, res => {
          // this.setState({
          //   deleteAllCasesLoading: false
          // })
          const { code, message } = res
          if (+code === 200) {
            Message.success('一键删除成功')
            this.handleSearch(null, 1)
          } else {
            Message.error(message)
          }
        })
      }
    })
  }

  showModal = editData => {
    this.props.editAuthority({ cityId: editData.cityId }, (code, data) => {
      if (+code === 200) {
        if (data === 1000) {
          this.setState({
            editData,
            visible: true
          })
        }
        if (data === 1001) {
          Modal.error({
            title: '温馨提示：',
            content: '你没有该条数据的城市权限，不允许下一步操作'
          })
        }
      }
    })
  }

  handleOk = () => {
    this.props.form.validateFields(
      ['projectItem', 'typeCode'],
      (err, values) => {
        console.log(222)
        // console.log(values)
        if (!err) {
          const { editData } = this.state
          const { pageNum, pageSize, total } = this.props.model.get(
            'pagination'
          )
          // 总的页数
          const temp = total % pageSize
          const tempPage = parseInt(total / pageSize)
          const totalPage = temp == 0 ? tempPage : tempPage + 1
          //如果是最后一页
          // console.log(editData)
          values.alias = editData.projectName
          values.areaName = editData.areaName
          values.cityId = editData.cityId
          values.projectId = values.projectItem.projectId
          delete values.projectItem
          this.props.editProjectName(values, res => {
            const { code, message } = res || {}
            const pageNumNew =
              pageNum == totalPage
                ? (total - 1) % 20 === 0
                  ? 1
                  : pageNum
                : pageNum

            switch (code) {
              case '200':
                Message.success('保存成功')
                this.handleCancel()
                this.handleSearch(null, pageNumNew)
                break
              case '400':
                message === '[projectId]楼盘ID不能为空;'
                  ? Message.error('请选择你要关联的正式楼盘')
                  : Message.error(message)
                break
              default:
                break
            }
          })
        }
      }
    )
  }

  handleCancel = () => {
    this.setState({
      visible: false
    })
  }

  // 导出
  exportCase = () => {
    const { keyword } = this.props.form.getFieldsValue(['keyword'])
    const { selectedRowKeys, cityId, taskId } = this.state
    const exportQry = {
      cityId,
      ids: selectedRowKeys.join(','),
      projectName: keyword ? keyword.trim() : keyword,
      taskId
    }
    const that = this
    
    if(this.state.importType==='1212133'){
      this.props.exportProjectAvg(exportQry, () => {
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
    }else {
      this.props.exportErrorProject(exportQry, () => {
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
  }

  goExportTask = () => {
    if (pagePermission('fdc:hd:export:check')) {
      this.props.history.push({
        pathname: router.RES_EXPORT_TASK,
        search: 'type=1'
      })
    } else {
      Message.warning('没有导出任务页权限，请联系管理员')
    }
  }

  renderBreads() {
    const { importType, cityId, cityName } = this.state
    let breadList
    if(this.state.importType==='1212133'){
       breadList = [
        {
          key: 1,
          path: '',
          name: '住宅',
          icon: 'home'
        },
        {
          key: 2,
          path: router.RES_PRO_PROJECT_AVG,
          name: '楼盘价格'
          // icon: ''
        },
        {
          key: 3,
          path: router.RES_CASEINFO_IMPORT,
          name: '网络参考价',
          icon: '',
          search: `importType=${importType}&cityId=${cityId}&cityName=${cityName}`
        },
        {
          key: 4,
          path: '',
          name: '错误楼盘名称列表',
          icon: ''
        }
      ]
    }else if(this.state.importType==='1212134'){
      breadList = [
        {
          key: 1,
          path: '',
          name: '住宅',
          icon: 'home'
        },
        {
          key: 2,
          path: router.RES_CASE_LOSURE,
          name: '住宅法拍案例'
          // icon: ''
        },
        {
          key: 3,
          path: router.RES_LOSURE_CASEINFO_IMPORT,
          name: '数据导入',
          icon: '',
          search: `importType=${importType}&cityId=${cityId}&cityName=${cityName}`
        },
        {
          key: 4,
          path: '',
          name: '错误楼盘名称列表',
          icon: ''
        }
      ]
    } else {
       breadList = [
        {
          key: 1,
          path: '',
          name: '住宅',
          icon: 'home'
        },
        {
          key: 2,
          path: router.RES_CASEINFO,
          name: '住宅案例数据'
          // icon: ''
        },
        {
          key: 3,
          path: router.RES_CASEINFO_IMPORT,
          name: '数据导入',
          icon: '',
          search: `importType=${importType}&cityId=${cityId}&cityName=${cityName}`
        },
        {
          key: 4,
          path: '',
          name: '错误楼盘名称列表',
          icon: ''
        }
      ]
    }
  
    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.path ? (
              <Link to={{ pathname: item.path, search: item.search }}>
                {item.name}
              </Link>
            ) : (
              item.name
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form

    const { keyword } = this.state

    return (
      <Form onSubmit={e => this.handleSearch(e, 1)} layout="horizontal">
        <Row>
          <Col span={8}>
            <FormItem
              label="楼盘名称"
              labelCol={layout(6, 6)}
              wrapperCol={layout(6, 18)}
            >
              {getFieldDecorator('keyword', {
                initialValue: keyword
              })(<Input placeholder="请输入楼盘名称" maxLength={100} />)}
            </FormItem>
          </Col>
          <Col span={2}>
            <Button
              htmlType="submit"
              type="primary"
              icon="search"
              style={{ marginLeft: 16, marginTop: 4 }}
            >
              查询
            </Button>
          </Col>
        </Row>
        <Row style={{ marginBottom: 16 }}>
          <Button
            type="danger"
            icon="delete"
            style={{ marginRight: 16 }}
            disabled={!this.state.selectedRowKeys.length}
            onClick={this.handleConfirmDelete}
          >
            删除
          </Button>

          <Popconfirm
            title="你将删除所有数据，确定一键删除？"
            onConfirm={() => this.handleDeleteAllError()}
          >
            <Button type="danger" icon="delete" style={{ marginRight: 16 }}>
              一键删除
            </Button>
          </Popconfirm>
          <Button type="primary" icon="download" onClick={this.exportCase}>
            导出
          </Button>
        </Row>
      </Form>
    )
  }

  renderTable() {
    // const { cityId, cityName } = this.state
    const columns = [
      {
        title: '城市',
        width: 150,
        dataIndex: 'cityName'
      },
      {
        title: '行政区',
        width: 150,
        render: ({ areaName }) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{areaName}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitAreaName}>{areaName}</div>
          </Popover>
        )
      },
      {
        title: '楼盘名称',
        width: 212,
        render: text => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{text}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitProjectName}>{text}</div>
          </Popover>
        ),
        dataIndex: 'projectName'
      },
      {
        title: '数量',
        width: 160,
        dataIndex: 'caseCount'
      },
      {
        title: '操作',
        width: 150,
        // dataIndex: 'ownership'
        render: record => (
          <div>
            <Button type="primary" onClick={() => this.showModal(record)}>
              编辑
            </Button>
          </div>
        )
      }
    ]

    const { pageNum, total } = this.props.model.get('pagination')
    const pagination = {
      current: pageNum,
      pageSize: 20,
      total,
      showTotal,
      showQuickJumper: true,
      onChange: pageNum => {
        this.handleSearch(null, pageNum)
      }
    }

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectedRows
        })
      }
    }

    return (
      <Table
        pagination={pagination}
        rowSelection={rowSelection}
        columns={columns}
        rowKey="id"
        loading={this.context.loading.includes(actions.FETCH_ERROR_LIST)}
        dataSource={this.props.errorCaseList}
        className={styles.defineTable}
      />
    )
  }

  render() {
    const { getFieldDecorator } = this.props.form
    // const aliaTypeList = this.props.model.get('aliaTypeList')
    // console.log(aliaTypeList)
    const { editData } = this.state
    const projectItem = {
      areaId: editData.areaId,
      areaName: editData.areaName,
      cityId: editData.cityId,
      projectId: editData.id,
      projectName: editData.projectName
    }
    const whichProject = {
      areaId: editData.areaId,
      areaName: editData.areaName,
      cityId: editData.cityId,
      projectId: editData.id,
      projectName: editData.projectName
    }

    const {aliaTypeList} = this.state
    const { cityId } = editData
    const cityIdSting = String(cityId)
    return (
      // <Spin spinning={this.state.deleteAllCasesLoading}>
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderTable()}
        </div>
        <Modal
          title="编辑相关楼盘名称"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          destroyOnClose={true}
          maskClosable={false}
        >
          <Form>
            <FormItem
              label="城市"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
              className={styles.errorCaseAlone}
            >
              {editData.cityName}
            </FormItem>
            <FormItem
              label="行政区"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
              className={styles.errorCaseAlone}
            >
              {editData.areaName}
            </FormItem>
            <FormItem
              label="错误楼盘名称"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
              className={styles.errorCase}
            >
              {editData.projectName}
            </FormItem>
            <FormItem
              label="正式楼盘"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
              className={styles.errorCase}
            >
              {getFieldDecorator('projectItem', {
                rules: [
                  {
                    required: true,
                    message: '请选择正式楼盘'
                  }
                ]
              })(
                <ProjectSelect
                  projectItem={projectItem}
                  cityId={cityIdSting}
                  whichProject={whichProject}
                  // onProjectSelectRef={this.onProjectSelectRef}
                />
              )}
            </FormItem>
            <FormItem
              label="别名类型"
              labelCol={layout(6, 6)}
              wrapperCol={layout(18, 16)}
            >
              {getFieldDecorator('typeCode', {
                rules: [
                  {
                    required: true,
                    message: '请选择别名类型'
                  }
                ],
                initialValue: '9019002'
              })(
                <Select placeholder="请选择别名类型" allowClear>
                  {aliaTypeList.map(item => (
                    <Option value={item.code} key={item.code}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
      // </Spin>
    )
  }
}

export default compose(
  Form.create(),
  connect(modelSelector, containerActions)
)(CaseInfoError)
