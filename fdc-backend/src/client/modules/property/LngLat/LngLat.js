import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Upload,
  Button,
  Icon,
  Row,
  Table,
  Badge,
  Message,
  Input,
  Breadcrumb,
  Popover,
  Modal,
  Spin
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

import styles from './LngLat.less'
import LngLatName from './LngLat.name'

const confirm = Modal.confirm

/**
 * 住宅 >片区绘制 >住宅基础数据 >片区经纬度导入
 * author: wy
 */
class LngLat extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    getImportExcelLogs: PropTypes.func.isRequired,
    importLogList: PropTypes.array.isRequired,
    downloadErr: PropTypes.func.isRequired,
    importExcelCoefficient: PropTypes.func.isRequired,
    exportTempExcel: PropTypes.func.isRequired,
    getProjectDetail: PropTypes.func.isRequired,
    delImportLogs: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
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
      cityId,
      cityName,
      loadErr: false,
      // 上传文件的名称
      uploadFileName: '',
      uploadFile: '',
      uploading: false,
      // 是否显示 清除修正系数表
      houseNumModalVisible: false,
      // 是否显示 输入任务名
      taskNameModalVisible: false,

      selectedRowKeys: [],
      // 模板下载 是否加载中
      downloading: false,
      maxSize: 20
    }
  }

  componentDidMount() {
    const { cityId, projectId } = this.state
    this.handleSearch(null, 1)

    this.props.getProjectDetail(projectId, cityId)
    this.props.maxImportSize(cityId, res => {
      this.setState({
        maxSize: res
      })
    })
  }

  // 获取导入任务列表
  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    const params = {
      pageNum,
      pageSize: 20,
      cityId: this.state.cityId,
      importType: 1212123
    }
    this.props.getImportExcelLogs(params)
  }

  handleShowFactorModal = () => {
    this.setState({
      houseNumModalVisible: !this.state.houseNumModalVisible
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
        that.handleDelete()
      }
    })
  }

  handleDelete = () => {
    const data = {
      ids: this.state.selectedRowKeys.join(','),
      cityId: this.state.cityId
    }
    this.props.delImportLogs(data, () => {
      this.setState({
        selectedRowKeys: []
      })
      Message.success('删除成功')
      this.handleSearch(null, 1)
    })
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
    const { uploadFile, cityId } = this.state

    const formData = new FormData()

    formData.append('file', uploadFile)
    formData.append('cityId', cityId)
    formData.append('importType', '1212123')
    formData.append('taskName', taskName)

    this.setState({
      uploading: true
    })

    this.props.importExcelCoefficient(formData, () => {
      this.setState({
        uploading: false
      })
      this.handleSearch(null, 1)
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
    this.setState({
      downloading: true
    })
    this.props.exportTempExcel(() => {
      this.setState({ downloading: false })
    })
  }

  downloadErr = id => {
    if (!id) return
    this.setState({
      loadErr: true
    })
    this.props.downloadErr({ id }, () => {
      this.setState({
        loadErr: false
      })
    })
  }

  renderBreads() {
    const { cityId, cityName } = this.state

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
      },
      {
        key: 3,
        path: router.RES_AREA_DRAW,
        search: `cityId=${cityId}&cityName=${cityName}`,
        name: '片区绘制'
      },
      {
        key: 4,
        path: '',
        name: '片区经纬度导入'
      }
    ]

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

  renderButtons() {
    const {
      selectedRowKeys,
      uploadFileName,
      uploading,
      downloading
    } = this.state
    let delBtnDisable = true
    if (selectedRowKeys && selectedRowKeys.length > 0) {
      delBtnDisable = false
    }

    const { projectDetail } = this.props.model
    const { sysStatus = 1 } = projectDetail
    return (
      <div>
        <Row>
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
                {/* fdc:hd:residence:base:ratioThree:import */}
                {pagePermission('fdc:hd:residence:base:ratioThree:import') ? (
                  <Button>
                    <Icon type="upload" /> 选择文件
                  </Button>
                ) : (
                  ' '
                )}
              </Upload>
              {uploadFileName ? (
                <span>
                  {/* fdc:hd:residence:base:ratioThree:import */}
                  {pagePermission('fdc:hd:residence:base:ratioThree:import') ? (
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
                  {/* fdc:hd:residence:base:ratioThree:delete */}
                  {/* <Button
                    style={{ marginLeft: 8 }}
                    type="danger"
                    onClick={this.handleDelUploadFile}
                  >
                    删除上传
                  </Button> */}
                </span>
              ) : null}
              {pagePermission('fdc:hd:residence:base:ratioThree:delete') ? (
                <Button
                  type="danger"
                  style={{ marginLeft: 8 }}
                  disabled={delBtnDisable}
                  onClick={this.handleConfirmDelete}
                >
                  删除记录
                </Button>
              ) : null}
            </span>
          ) : null}
          <Button
            style={{ marginLeft: 8 }}
            loading={downloading}
            onClick={this.handleExportTempExcel}
          >
            模板下载
          </Button>

          <Button
            style={{ marginLeft: 16 }}
            onClick={() => this.props.history.goBack()}
          >
            返回
          </Button>
        </Row>
      </div>
    )
  }

  renderTable() {
    const columns = [
      {
        title: '任务名称',
        width: 212,
        render: ({ taskName }) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{taskName}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitTaskName}>{taskName}</div>
          </Popover>
        )
      },
      {
        title: '创建人',
        width: 180,
        dataIndex: 'creator'
      },
      {
        title: '创建时间',
        width: 200,
        render: crtTime => {
          if (crtTime === null || crtTime === undefined || crtTime === '') {
            return ''
          }
          return moment(crtTime).format('YYYY-MM-DD HH:mm:ss')
        },
        dataIndex: 'crtTime'
      },
      {
        title: '成功条数',
        width: 120,
        dataIndex: 'succeedNumber'
      },
      {
        title: '错误条数',
        width: 120,
        // dataIndex: 'dataErrNumber',
        render: ({ id, dataErrNumber }) => {
          const num = +dataErrNumber
          return num > 0 ? (
            <a onClick={() => this.downloadErr(id)}>{dataErrNumber}</a>
          ) : (
            dataErrNumber
          )
        }
      },
      {
        title: '处理状态',
        width: 120,
        render: ({ isCompleted, remark }) => {
          if (isCompleted < 0) {
            return (
              <Popover
                placement="topRight"
                content={
                  <div style={{ width: 200, maxHeight: 200, overflow: 'auto' }}>
                    {remark || '暂无'}
                  </div>
                }
                title="错误信息"
              >
                <span>
                  <Badge status="error" text="失败" />
                </span>
              </Popover>
            )
          }
          if (isCompleted > 0) {
            return <Badge status="success" text="成功" />
          }
          return <Badge status="processing" text="处理中" />
        }
        // dataIndex: 'isCompleted'
      }
    ]

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
        this.handleSearch(null, pageNum)
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
        style={{ marginTop: 24 }}
        pagination={pagination}
        columns={columns}
        rowSelection={rowSelection}
        dataSource={this.props.importLogList}
        loading={this.context.loading.includes(actions.GET_IMPORT_EXCEL_LOGS)}
        scroll={{ y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  render() {
    const { loadErr } = this.state

    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          <Spin
            // tip="正在导出数据，数据量大可能要花费一定时间，请耐心等待..."
            size="large"
            spinning={loadErr}
          >
            {this.renderButtons()}
            {this.renderTable()}
            <LngLatName
              taskNameModalVisible={this.state.taskNameModalVisible}
              onStartUpload={this.handleStartUpload}
              onCloseModal={this.handleImportName}
            />
          </Spin>
        </div>
      </div>
    )
  }
}

export default connect(
  modelSelector,
  containerActions
)(LngLat)
