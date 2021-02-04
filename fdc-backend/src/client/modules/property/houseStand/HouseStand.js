import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Upload,
  Button,
  Icon,
  Row,
  Tabs,
  Table,
  Badge,
  Message,
  Input,
  Alert,
  Breadcrumb,
  Popover,
  Modal,
  message
} from 'antd'
import { parse } from 'qs'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import moment from 'moment'

import showTotal from 'client/utils/showTotal'
import router from 'client/router'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './HouseStand.less'

import HouseStandName from './HouseStand.name'
import HouseStandFactor from './HouseStand.factor'

const TabPane = Tabs.TabPane
const confirm = Modal.confirm

/**
 * 住宅 房号系数差 / 城市标准差
 * author: YJF
 */
class HouseStand extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    getCoefficientList: PropTypes.func.isRequired,
    getImportExcelLogs: PropTypes.func.isRequired,
    importLogList: PropTypes.array.isRequired,
    getImportExcelLogsCb: PropTypes.func.isRequired, // 写个回调函数，用于导入时无数据查看权限
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    delImportLogs: PropTypes.func.isRequired,
    exportExcelCoefficient: PropTypes.func.isRequired,
    coefficientList: PropTypes.array.isRequired,
    importExcelCoefficient: PropTypes.func.isRequired,
    exportTempExcel: PropTypes.func.isRequired,
    getProjectDetail: PropTypes.func.isRequired,
    downCoefficientWord: PropTypes.func.isRequired,
    exportErrorExcel: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired,
    maxImportSize: PropTypes.func.isRequired
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

    this.state = {
      // 来源页面 projectId有值表示来自单个楼盘编辑
      projectId,
      // 当前激活的Tab,
      currentTab: '1',
      // 是否显示 清除修正系数表
      houseNumModalVisible: false,
      // 是否显示 输入任务名
      taskNameModalVisible: false,

      selectedRowKeys: [],

      // 上传文件的名称
      uploadFileName: '',
      uploadFile: '',
      uploading: false,
      cityId,
      cityName,
      localeW: '暂无数据',
      maxSize: 20
    }
  }

  componentDidMount() {
    const { cityId, cityName } = this.state
    this.props.maxImportSize(cityId, res => {
      this.setState({
        maxSize: res
      })
    })
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
        this.getImportExcelLogs(1)
        this.props.getProjectDetail(this.state.projectId, this.cityId)
        // 修改 无数据查看权限时 wy change
        const params = {
          pageNum: 1,
          pageSize: 20,
          cityId: this.cityId,
          importType: 1212105
        }
        this.props.getImportExcelLogsCb(params, err => {
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
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  // 获取导入任务列表
  getImportExcelLogs = pageNum => {
    const params = {
      pageNum,
      pageSize: 20,
      cityId: this.cityId,
      importType: 1212105
    }
    this.props.getImportExcelLogs(params)
  }

  // 获取系数列表服务
  getCoefficientList = (pageNum, fixedTypeCode) => {
    const { projectId } = this.state
    const qry = {
      cityId: this.cityId,
      pageNum,
      pageSize: 20,
      scopeType: projectId ? 2 : 1,
      fixedTypeCode,
      projectId
    }
    this.props.getCoefficientList(qry)
  }

  handleChangeTab = tabKey => {
    this.setState({
      currentTab: tabKey
    })
    if (tabKey === '1') {
      this.getImportExcelLogs(1)
    } else {
      this.getCoefficientList(1, tabKey)
    }
  }

  handleConfirmDelete = () => {
    const that = this
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
      ids: this.state.selectedRowKeys.join(','),
      cityId: this.cityId
    }
    this.props.delImportLogs(data, () => {
      this.setState({
        selectedRowKeys: []
      })
      Message.success('删除成功')
      this.getImportExcelLogs(1)
    })
  }

  handleShowFactorModal = () => {
    this.setState({
      houseNumModalVisible: !this.state.houseNumModalVisible
    })
  }

  handleExportData = () => {
    const data = {
      cityId: this.cityId,
      projectId: this.state.projectId ? this.state.projectId : '0'
    }
    const that = this
    // debugger
    this.props.exportExcelCoefficient(data, () => {
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

  handleImportFile = file => {
    this.setState({
      uploadFileName: file.name,
      uploadFile: file
    })
  }

  handleImportName = () => {
    const { uploadFileName, uploadFile } = this.state
    // 检验上传的文件格式 必须为Excel
    const reg = /(\.xlsx|\.xls)$/
    if (!reg.test(uploadFileName)) {
      Message.warning('请选择正确格式的文件！')
      return
    }

    // 限制20M
    const isLt20M = uploadFile.size / 1024 / 1024 < this.state.maxSize
    if (!isLt20M) {
      Message.warning(`文件大小不能大于${this.state.maxSize}M`)
      return
    }

    this.setState({
      taskNameModalVisible: !this.state.taskNameModalVisible
    })
  }

  handleStartUpload = taskName => {
    const { uploadFile } = this.state

    const formData = new FormData()

    formData.append('file', uploadFile)
    formData.append('cityId', this.cityId)
    formData.append('importType', '1212105')
    formData.append('taskName', taskName)

    this.setState({
      uploading: true
    })

    this.props.importExcelCoefficient(formData, () => {
      this.setState({
        uploading: false
      })
      this.getImportExcelLogs(1)
      this.setState({
        uploadFileName: '',
        uploadFile: ''
      })
      Message.success('上传成功')
    })
  }

  handleDelUploadFile = () => {
    this.setState({
      uploadFileName: '',
      uploadFile: ''
    })
  }

  handleExportTempExcel = () => {
    this.props.exportTempExcel()
  }

  downCoefficientWord = () => {
    this.props.downCoefficientWord()
  }

  // 导出出错数据
  handleExportErrorExcel = id => {
    // console.log(id)
    this.props.exportErrorExcel(id, () => {
      Message.success('导出成功')
    })
  }

  renderButtons() {
    const {
      selectedRowKeys,
      currentTab,
      uploadFileName,
      uploading
    } = this.state
    let delBtnDisable = true
    if (selectedRowKeys && selectedRowKeys.length > 0 && currentTab === '1') {
      delBtnDisable = false
    }
    // console.log(delBtnDisable)
    const { projectDetail } = this.props.model
    const { sysStatus = 1 } = projectDetail
    // console.log(projectDetail.toJS(), sysStatus)
    return (
      <div>
        <div style={{ display: 'flex' }}>
          {sysStatus === 1 ? (
            <span>
              <Input
                style={{ width: 200, marginRight: 8 }}
                value={uploadFileName}
                disabled
              />
              <Upload
                showUploadList={false}
                beforeUpload={this.handleImportFile}
              >
                {pagePermission('fdc:hd:residence:base:ratio:import') ? (
                  <Button>
                    <Icon type="upload" /> 选择文件
                  </Button>
                ) : (
                  ' '
                )}
              </Upload>
              {uploadFileName ? (
                <span>
                  {/* <Button
                    style={{ marginLeft: 8 }}
                    type="danger"
                    onClick={this.handleDelUploadFile}
                  >
                    删除上传
                  </Button> */}
                  {pagePermission('fdc:hd:residence:base:ratio:import') ? (
                    <Button
                      style={{ marginLeft: 8 }}
                      icon="upload"
                      onClick={this.handleImportName}
                      loading={uploading}
                    >
                      开始上传
                    </Button>
                  ) : (
                    ''
                  )}
                </span>
              ) : null}

              {pagePermission('fdc:hd:residence:base:ratio:delete') ? (
                <Button
                  type="danger"
                  style={{ marginLeft: 8 }}
                  disabled={delBtnDisable}
                  onClick={this.handleConfirmDelete}
                >
                  删除记录
                </Button>
              ) : (
                ''
              )}
            </span>
          ) : null}
          <Button style={{ marginLeft: 8 }} onClick={this.downCoefficientWord}>
            操作文档下载
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={this.handleExportTempExcel}
          >
            模版下载
          </Button>
          <Button
            style={{ marginLeft: 16 }}
            onClick={() => this.props.history.goBack()}
          >
            返回
          </Button>
        </div>

        {sysStatus === 1 ? (
          <Row style={{ marginTop: 8 }}>
            {pagePermission('fdc:hd:residence:base:ratio:export') ? (
              <Button
                style={{ marginLeft: 8 }}
                onClick={this.handleExportData}
                icon="download"
              >
                导出
              </Button>
            ) : (
              ''
            )}

            {pagePermission('fdc:hd:residence:base:ratio:reset') ? (
              <Button
                style={{ marginLeft: 8 }}
                onClick={this.handleShowFactorModal}
              >
                清除修正系数
              </Button>
            ) : null}
          </Row>
        ) : null}
      </div>
    )
  }

  renderTabs() {
    return (
      <Tabs style={{ marginTop: 8 }} onChange={this.handleChangeTab}>
        <TabPane tab="导入任务" key="1">
          {this.renderTaskTable()}
        </TabPane>
        <TabPane tab="楼层差" key="1033003">
          {this.renderFloorList()}
        </TabPane>
        <TabPane tab="朝向" key="1033001">
          {this.renderOrient()}
        </TabPane>
        <TabPane tab="景观" key="1033002">
          {this.renderScenery()}
        </TabPane>
        <TabPane tab="通风采光" key="1033006">
          {this.renderLight()}
        </TabPane>
        <TabPane tab="装修" key="1033004">
          {this.renderFitment()}
        </TabPane>
        <TabPane tab="面积段" key="1033005">
          {this.renderAcreage()}
        </TabPane>
      </Tabs>
    )
  }

  // 导入任务
  renderTaskTable() {
    const columns = [
      {
        title: '任务名称',
        width: 212,
        // dataIndex: 'taskName',
        render: ({ taskName }) => {
           const task = (<div style={{width: 280}}>${taskName}</div>)
           return   (
            <Popover content={task} title={false} placement="topLeft">
            <div className={styles.limitTaskName}>{taskName}</div>
            </Popover>
          )
        }
      },
      {
        title: '创建人',
        width: 200,
        dataIndex: 'creator'
      },
      {
        title: '创建时间',
        width: 200,
        render: ({ crtTime }) => (
          <span>{moment(crtTime).format('YYYY-MM-DD HH:mm:ss')}</span>
        )
      },
      {
        title: '成功条数',
        width: 120,
        dataIndex: 'succeedNumber'
      },
      {
        title: '错误条数',
        width: 120,
        render: ({ dataErrNumber, id }) => (
          <span>
            {dataErrNumber > 0 ? (
              <a onClick={() => this.handleExportErrorExcel(id)}>
                {dataErrNumber}
              </a>
            ) : (
              dataErrNumber
            )}
          </span>
        )
      },
      {
        title: '处理状态',
        width: 120,
        render: ({ isCompleted, remark = '无' }) => (
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
              }[isCompleted]
            }
          </span>
        )
      }
    ]

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: selectedRowKeys => {
        this.setState({
          selectedRowKeys
        })
      }
    }

    const { pageNum, pageSize, total } = this.props.model.get(
      'importPagination'
    )
    const pagination = {
      current: pageNum,
      pageSize,
      total,
      showTotal,
      showQuickJumper: true,
      onChange: pageNum => {
        this.getImportExcelLogs(pageNum)
      }
    }

    return (
      <Table
        columns={columns}
        dataSource={this.props.importLogList}
        rowSelection={rowSelection}
        pagination={pagination}
        loading={this.context.loading.includes(actions.GET_IMPORT_EXCEL_LOGS)}
        scroll={{ y: 420 }}
        locale={{
          emptyText: this.state.localeW
        }}
        className={styles.defineTable}
      />
    )
  }

  // 楼层差
  renderFloorList() {
    const columns = [
      {
        title: '总楼层',
        width: 150,
        dataIndex: 'totalFloorNum'
      },
      {
        title: '所在楼层',
        width: 150,
        dataIndex: 'floorNo'
      },
      {
        title: '楼层差_百分比%',
        width: 200,
        dataIndex: 'floorPriceDiff'
      },
      {
        title: '是否带电梯',
        width: 200,
        // dataIndex: 'hasElevator',
        render: ({ hasElevator }) => (
          <span>{hasElevator === 1 ? '是' : '否'}</span>
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
        this.getCoefficientList(pageNum, this.state.currentTab)
      }
    }

    return (
      <Table
        columns={columns}
        dataSource={this.props.coefficientList}
        pagination={pagination}
        loading={this.context.loading.includes(actions.GET_COEFFICIENT_LIST)}
        scroll={{ y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  // 朝向
  renderOrient() {
    const columns = [
      {
        title: '朝向',
        width: 120,
        dataIndex: 'fixedTypeName'
      },
      {
        title: '修正系数_百分比',
        width: 240,
        dataIndex: 'housePriceDiff'
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
        this.getCoefficientList(pageNum, this.state.currentTab)
      }
    }

    return (
      <Table
        columns={columns}
        dataSource={this.props.coefficientList}
        pagination={pagination}
        loading={this.context.loading.includes(actions.GET_COEFFICIENT_LIST)}
        scroll={{ y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  // 景观
  renderScenery() {
    const columns = [
      {
        title: '景观',
        width: 120,
        dataIndex: 'fixedTypeName'
      },
      {
        title: '修正系数_百分比',
        width: 240,
        dataIndex: 'housePriceDiff'
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
        this.getCoefficientList(pageNum, this.state.currentTab)
      }
    }

    return (
      <Table
        columns={columns}
        dataSource={this.props.coefficientList}
        pagination={pagination}
        loading={this.context.loading.includes(actions.GET_COEFFICIENT_LIST)}
        scroll={{ y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  // 通风采光
  renderLight() {
    const columns = [
      {
        title: '通风采光',
        width: 150,
        dataIndex: 'fixedTypeName'
      },
      {
        title: '修正系数_百分比',
        width: 200,
        dataIndex: 'housePriceDiff'
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
        this.getCoefficientList(pageNum, this.state.currentTab)
      }
    }

    return (
      <Table
        columns={columns}
        dataSource={this.props.coefficientList}
        pagination={pagination}
        loading={this.context.loading.includes(actions.GET_COEFFICIENT_LIST)}
        scroll={{ y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  // 装修
  renderFitment() {
    const columns = [
      {
        title: '装修',
        width: 150,
        dataIndex: 'fixedTypeName'
      },
      {
        title: '修正系数_百分比',
        width: 240,
        dataIndex: 'housePriceDiff'
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
        this.getCoefficientList(pageNum, this.state.currentTab)
      }
    }

    return (
      <Table
        columns={columns}
        pagination={pagination}
        dataSource={this.props.coefficientList}
        loading={this.context.loading.includes(actions.GET_COEFFICIENT_LIST)}
        scroll={{ y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  // 面积段
  renderAcreage() {
    const columns = [
      {
        title: '建筑类型',
        width: 150,
        dataIndex: 'fixedTypeName'
      },
      {
        title: '面积段',
        width: 150,
        dataIndex: 'subFixedTypeName'
      },
      {
        title: '修正系数_百分比',
        width: 240,
        dataIndex: 'housePriceDiff'
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
        this.getCoefficientList(pageNum, this.state.currentTab)
      }
    }

    return (
      <Table
        columns={columns}
        pagination={pagination}
        dataSource={this.props.coefficientList}
        loading={this.context.loading.includes(actions.GET_COEFFICIENT_LIST)}
        scroll={{ y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  renderBreads() {
    const { projectId, cityId, cityName } = this.state

    const {
      // areaId,
      // areaName,
      id,
      projectName,
      sysStatus
    } = this.props.model.get('projectDetail')

    const breadList = [
      {
        key: 1,
        path: '',
        name: '住宅',
        icon: 'home'
      },
      {
        key: 2,
        path: router.RES_BASEINFO,
        name: '住宅基础数据'
      }
    ]

    if (projectId) {
      breadList.push(
        // {
        //   key: 3,
        //   path: router.RES_BASEINFO,
        //   name: areaName,
        //   search: `areaId=${areaId}`
        // },
        {
          key: 4,
          path: router.RES_BASEINFO_ADD,
          name:
            projectName && projectName.length > 10
              ? `${projectName.substr(0, 10)}...`
              : projectName,
          search: `projectId=${id}&status=${sysStatus}&cityId=${cityId}&cityName=${cityName}`
        }
      )
    }

    breadList.push({
      key: 5,
      path: '',
      name: projectId ? '楼盘系数差' : '城市系数差'
    })

    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.path ? (
              <Link
                to={{
                  pathname: item.path,
                  search: item.search
                }}
              >
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

  render() {
    const { projectDetail } = this.props.model
    // 行政区名称、楼盘名称、楼盘状态
    const { areaName = '暂无', projectName, sysStatus = 1 } = projectDetail

    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderButtons()}
          {projectName ? (
            <Row style={{ marginTop: 16 }}>
              <Alert
                style={{ minHeight: 40, paddingBottom: 0 }}
                message={
                  <p>
                    当前楼盘名称{' '}
                    <span
                      style={{
                        fontWeight: 600,
                        color: sysStatus === 1 ? '#33CABB' : '#FF0000'
                      }}
                    >
                      {areaName} | {projectName}
                    </span>
                  </p>
                }
                type="info"
                showIcon
              />
            </Row>
          ) : null}
          {this.renderTabs()}
          <HouseStandFactor
            modalVisible={this.state.houseNumModalVisible}
            onCloseModal={this.handleShowFactorModal}
            projectId={this.state.projectId}
            onRefreshPage={this.handleChangeTab}
            currentTab={this.state.currentTab}
          />
          <HouseStandName
            taskNameModalVisible={this.state.taskNameModalVisible}
            onStartUpload={this.handleStartUpload}
            onCloseModal={this.handleImportName}
          />
        </div>
      </div>
    )
  }
}

export default connect(
  modelSelector,
  containerActions
)(HouseStand)
