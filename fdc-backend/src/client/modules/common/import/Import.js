import React, { Component } from 'react'
import {
  Upload,
  Button,
  Icon,
  Alert,
  Badge,
  Input,
  Popconfirm,
  message,
  Table,
  Modal,
  Form,
  Spin,
  Breadcrumb,
  Popover, Message
} from 'antd'
import { connect } from 'react-redux'
import moment from 'moment'
import qs from 'qs'
import { compose } from 'redux'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
// import { pagePermission } from 'client/utils'

import router from 'client/router'
import showTotal from 'client/utils/showTotal'
import { getSession, toNumber } from 'client/utils/assist'

import { containerActions } from './store/action'
import './store/sagas'

import styles from './import.less'

const FormItem = Form.Item

/**
 * author: LiuYaoChange
 * versition: 1.0
 * create Date: 2018-05-14
 */
/* eslint-disable */
class Import extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    fetchImportLogs: PropTypes.func,
    importCanel: PropTypes.func,
    queryImportType: PropTypes.func,
    handupFile: PropTypes.func,
    downloadErr: PropTypes.func,
    downloadErrProjectName: PropTypes.func,
    downloadTemp: PropTypes.func,
    location: PropTypes.object,
    form: PropTypes.object,
    delLogs: PropTypes.func,
    updateVisitCities: PropTypes.func.isRequired,
    maxImportSize: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    const search = props.location.search.substr(1)
    const { importType, projectId, cityId = '', cityName = '' } = qs.parse(
      search
    )

    this.state = {
      taskInfos: [],
      showConfirm: false,
      loadErr: false,
      fileName: '',
      uploading: false,
      visible: false,
      loading: true,
      deleting: false,
      downloading: false,
      cityId,
      cityName,
      localeW: '暂无数据',
      maxSize:20
    }

    this.columns = [
      {
        title: '任务名称',
        width: 324,
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
        width: 169,
        dataIndex: 'creator'
      },
      {
        title: '创建时间',
        width: 193,
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
        width: 108,
        dataIndex: 'succeedNumber'
      },
      {
        title: '错误条数',
        width: 108,
        render: ({ id, dataErrNumber }) => {
          const num = toNumber(dataErrNumber)
          return num > 0 ? (
            <a onClick={() => this.downloadErr(id)}>{dataErrNumber}</a>
          ) : (
            dataErrNumber
          )
          // if (importType === '1212003') {
          //   // 是否可以下载错误文件
          //   const isDownload = num > 0 || nameErrNumber > 0
          //   return isDownload ? (
          //     <a onClick={() => this.downloadErr(id)}>{dataErrNumber}</a>
          //   ) : (
          //     dataErrNumber
          //   )
          // } else {
          //   return num > 0 ? (
          //     <a onClick={() => this.downloadErr(id)}>{dataErrNumber}</a>
          //   ) : (
          //     dataErrNumber
          //   )
          // }
        }
        // dataIndex: 'dataErrNumber'
      },
      {
        title: '处理状态',
        width: 117,
        render: ({ isCompleted, remark, id}) => {
          if (isCompleted.toString() == '-1') {
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
          if (isCompleted == 1) {
            return <Badge status="success" text="成功" />
          }else if(isCompleted == 2){
            return (
                <div>
                  <Popconfirm
                      title="是否取消本次数据导入？"
                      onConfirm={() =>this.confirm(id)}
                      okText="是"
                      cancelText="否"
                  >
                    <a href="#"><Badge status="warning" text={remark} /></a>
                  </Popconfirm>
                </div>
            )
          }else if(isCompleted == 0){
            return <Badge status="processing" text="处理中" />
          }
          return <Badge status="error" text="上传取消" />
        }
        // dataIndex: 'isCompleted'
      }
    ]

    // 如果是案例数据导入 还需要展示楼盘名称错误
    if (importType === '1212003') {
      this.columns.splice(4, 0, {
        title: '楼盘名称错误条数',
        width: 193,
        dataIndex: 'nameErrNumber',
        // render: ({ nameErrNumber }) => <span>{nameErrNumber || 0}</span>
        render: (text, record) => (
          <Link
            to={{
              pathname: router.RES_CASEINFO_ERROR,
              search: `importType=${importType}&taskId=${record.id}&cityId=${
                this.cityId
              }&cityName=${this.cityName}`
            }}
          >
            <div>{text === null ? 0 : text}</div>
          </Link>
        )
      })
    }
  
    // 如果是法拍案例数据导入 还需要展示楼盘名称错误
    if (importType === '1212134') {
      this.columns.splice(4, 0, {
        title: '楼盘名称错误条数',
        width: 193,
        // dataIndex: 'nameErrNumber',
        render: ({id, nameErrNumber}) => nameErrNumber > 0 ? (
            <a onClick={() => this.downloadErrProjectName(id)}>{nameErrNumber}</a>
        ):(
            <span>{nameErrNumber}</span>
        )
        // render: (text, record) => (
        //     <Link
        //         to={{
        //           pathname: router.RES_CASE_LOSURE_ERROR,
        //           search: `importType=${importType}&taskId=${record.id}&cityId=${
        //               this.cityId
        //           }&cityName=${this.cityName}`
        //         }}
        //     >
        //       <div>{text === null ? 0 : text}</div>
        //     </Link>
        // )
      })
    }

    if (importType === '1212119'||importType === '1212133') {
      this.columns.splice(4, 0, {
        title: '楼盘名称错误条数',
        width: 193,
        dataIndex: 'nameErrNumber',
        // render: ({ nameErrNumber }) => <span>{nameErrNumber || 0}</span>
        render: (text, record) => (
          <Link
            to={{
              pathname: router.RES_PROJECTAVG_ERROR,
              search: `importType=${importType}&taskId=${record.id}&cityId=${
                this.cityId
              }&cityName=${this.cityName}`
            }}
          >
            <div>{text === null ? 0 : text}</div>
          </Link>
        )
      })
    }
    if (importType === '1212113') {
      this.columns.splice(4, 0, {
        title: '楼盘名称错误条数',
        width: 193,
        dataIndex: 'nameErrNumber',
        // render: ({ nameErrNumber }) => <span>{nameErrNumber || 0}</span>
        render: (text, record) => (
          <div>{text === null ? 0 : text}</div>
        )
      })
    }
    this.importType = importType
    // 楼盘配套导入需要 projectId
    this.projectId = projectId
    this.logIds = []
    this.handleSelectChange = this.handleSelectChange.bind(this)
    this.handlePageChange = this.handlePageChange.bind(this)
    this.handleSelectRow = this.handleSelectRow.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
  }
  componentDidMount() {
    const { cityId, cityName } = this.state
    this.cityId = getSession('FDC_CITY') || cityId
    this.cityName = cityName
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
    this.props.maxImportSize(cityId,(res)=>{
      this.setState({
        maxSize: res
      })
    })
    this.initLoad(this.importType) // 调用后台接口查询数据
  }
  file = null
  total = 0
  pageNum = 1
  pageSize = 20
  // 调用后台接口查询数据
  initLoad(importType) {
    this.queryTaskList(importType)
    // this.setState({ loading: true })
  }
  
  confirm = (id) => {
    let parm = {
      taskId : id,
    }
    this.props.importCanel(parm, data => {
      if(data.code == 200){
        message.success('取消成功');
        this.initLoad(this.importType)
      }else{
        message.success(message);
      }
    })     //取消上传
  }
  
  // 加载导入任务列表数据
  queryTaskList(importType) {
    const params = {
      cityId: this.state.cityId,
      importType,
      pageNum: this.pageNum,
      pageSize: this.pageSize
    }
    // this.props.fetchImportLogs(params, data => {
    //   this.total = data.total - 0
    //   const lists = data.records
    //   if (Array.isArray(lists)) {
    //     lists.forEach(item => {
    //       item.crtTime = moment(item.crtTime).format('YYYY-MM-DD HH:mm:ss')
    //     })
    //   }
    //   this.setState({
    //     loading: false,
    //     taskInfos: lists
    //   })
    // })
    // wy change2019/6/4 无数据查看权限
    this.props.fetchImportLogs(params, err => {
      const { code, data } = err
      if (code === '200') {
        this.total = data.total - 0
        const lists = data.records
        if (Array.isArray(lists)) {
          lists.forEach(item => {
            item.crtTime = moment(item.crtTime).format('YYYY-MM-DD HH:mm:ss')
          })
        }
        this.setState({
          loading: false,
          taskInfos: lists,
          localeW: '暂无数据'
        })
      } else {
        this.setState({
          loading: false,
          taskInfos: [],
          localeW: '无数据查看权限'
        })
      }
    })
  }
  /**
   * 选择文件提交前的回调
   * @param file 当前文件对象
   * @param fileList 选择的文件列表
   * @return Uploading will be stopped with false or a rejected Promise returned
   */
  handleSelectChange(file) {
    this.file = file
    this.setState({
      fileName: file.name
    })
    return false
  }
  /**
   * 表格中的一行被选中的回调
   * @param record
   * @param selected
   * @param selectedRows
   * @param nativeEvent
   *
   */
  handleSelectRow(ids) {
    this.logIds = ids
  }
  downloadErr = id => {
    // window.event.preventDefault()
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
  // 下载错误楼盘名称
  downloadErrProjectName = id => {
    // window.event.preventDefault()
    if (!id) return
    this.setState({
      loadErr: true
    })
    this.props.downloadErrProjectName({ id }, () => {
      this.setState({
        loadErr: false
      })
    })
  }
  /**
   * 分页器页面数量改变的回调
   * @param size
   * @param page
   *
   */
  handlePageChange(page, size) {
    this.pageNum = page
    this.pageSize = size
    this.queryTaskList(this.importType)
  }
  // 删除数据前的确认
  beforeDelete = () => {
    if (this.logIds.length < 1) {
      message.warning('请选择要删除的任务记录')
      return
    }
    this.setState({
      showConfirm: true
    })
  }
  // 取消删除操作
  handleCancelDel = () => {
    this.setState({
      showConfirm: false
    })
  }
  // 确认删除数据
  handleConfirmDel = () => {
    this.setState({
      showConfirm: false
    })
    this.handleDelete()
  }
  // 删除数据
  handleDelete() {
    const params = {
      cityId: this.cityId,
      ids: this.logIds.join(',')
    }
    this.setState({
      deleting: true
    })
    this.props.delLogs(params, () => {
      message.success('删除记录成功')
      this.logIds = []
      this.setState({
        deleting: false
      })
      this.pageNum = 1
      this.queryTaskList(this.importType)
    })
  }

  // 下载导入模板
  downloadTemp = () => {
    this.setState({
      downloading: true
    })
    // console.log(this.importType)
    this.props.downloadTemp({ type: this.importType }, () => {
      this.setState({
        downloading: false
      })
    })
  }

  // 输入任务名称后开始上传
  handleUpload() {
    const reg = /(\.xlsm |\.xlsx|\.xls)$/ // 检验上传的文件格式是否正确

    if (!this.file) {
      message.warning('请选择你要导入数据的文件！')
      return
    }

    if (!reg.test(this.file.name)) {
      message.warning('请选择正确格式的文件！')
      return
    }
    // 限制20M
    const isLt20M = this.file.size / 1024 / 1024 < this.state.maxSize
    if (!isLt20M) {
      Message.warning(`文件大小不能大于${this.state.maxSize}M`)
      return
    }

    this.setState({
      visible: true
    })
  }

  // 确认后开始上传
  handleConfirm() {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let formData = {}
        if (typeof FormData === 'function') {
          formData = new FormData()
        }
        formData.append('file', this.file)
        formData.append('importType  ', this.importType)
        formData.append('cityId ', this.cityId)
        formData.append('taskName ', values.taskName)
        this.setState({
          uploading: true
        })
        // 调用上传接口
        this.props.handupFile(formData, err => {
          this.setState({
            uploading: false
          })
          if (err) {
            message.error(`文件上传失败:${err}`)
          } else {
            this.setState({
              fileName: ''
            })
            this.file = null
            this.props.form.setFieldsValue({ taskName: '' })
            this.queryTaskList(this.importType) // 调用后台接口查询数据
            message.success('文件上传成功！')
          }
        })
        this.setState({
          visible: false
        })
      }
    })
  }

  // 取消上传
  handleCancel() {
    this.setState({
      visible: false
    })
  }

  handleGoback = () => {
    this.props.history.goBack()
  }

  renderBreads() {
    const pathObj = {
      1212004: router.RES_BASEINFO,
      1212003: router.RES_CASEINFO,
      1212106: router.RES_PRO_NAME,
      1212108: router.RES_PRO_ADDR,
      1212107: router.RES_PRO_PROJECT_AVG,
      1212112: router.RES_SAMPLE_CASEINFO,
      1212117: router.RES_SAMPLE_CASEHOUSE,
      1212118: router.RES_HOUSE_ATTACHED,
      1212113: router.RES_RENT_CASEINFO,
      1212114: router.RES_APART_CASE_INFO,
      1212115: router.RES_PROJECT_RESOURCE,
      1212116: router.RES_PUBLIC_RESOURCE,
      1212111: router.DATA_CITY_PVG,
      1212119: router.RES_PRO_PROJECT_RENT,
      1212121: router.RES_BUILD_RATIO,
      1212124: router.BUS_BUSINFO,
      1212131: router.RES_RATING,
      1212132: router.DATA_ESTATE_RATING_IMPORT,
      1212130: router.DATA_AREA_RENTAL,
      1212134: router.RES_CASE_LOSURE
    }

    const nameObj = {
      1212004: '住宅基础数据',
      1212003: '住宅案例数据',
      1212106: '相关楼盘名称',
      1212108: '相关楼盘地址',
      1212107: '楼盘价格',
      1212112: '样本案例',
      1212117: '基础楼盘列表',
      1212118: '楼盘附属房屋价格计算方法',
      1212113: '租金案例',
      1212114: '长租公寓',
      1212115: '楼盘配套',
      1212116: '公共配套',
      1212111: '城市均价',
      1212119: '楼盘租金',
      1212129: '楼盘租售比',
      1212121: '建筑物类型比值',
      1212124: '商业基础数据',
      1212131: '楼盘评级结果',
      1212132: '楼盘评级规则',
      1212130: '区域租售比',
      1212133: '网络参考价',
      1212134: '住宅法拍案例'
    }

    const { cityId, cityName } = this.state
    const breadList = [
      {
        key: 1,
        path: '',
        name: '住宅',
        icon: 'home'
      }
    ]
    if (this.importType === '1212121' || this.importType === '1212131') {
      breadList.push(
        {
          key: 2,
          path: router.RES_BASEINFO,
          name: '住宅基础数据'
        },
        {
          key: 3,
          path: pathObj[this.importType],
          name: nameObj[this.importType]
        },
        {
          key: 4,
          path: '',
          name: '数据导入'
        }
      )
    } else {
      breadList.push(
        {
          key: 2,
          path: pathObj[this.importType],
          name: nameObj[this.importType]
        },
        {
          key: 3,
          path: '',
          name: '数据导入'
        }
      )
    }

    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.path ? (
              <Link
                to={{
                  pathname: item.path,
                  search: this.projectId
                    ? `projectId=${this.projectId}&cityId=${cityId}&cityName=${cityName}`
                    : `cityId=${cityId}&cityName=${cityName}`
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
    const wrapStyle = {
      marginTop: 16
    }

    const { getFieldDecorator } = this.props.form

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    }

    const { total, pageNum, pageSize } = this
    const {
      taskInfos,
      deleting,
      loadErr,
      downloading,
      loading,
      fileName,
      uploading
    } = this.state
    // 表格的rowSelection 配置
    const tableConfig = {
      onChange: this.handleSelectRow
    }
    // 分页器的配置
    const pagination = {
      current: pageNum,
      pageSize,
      total,
      showTotal,
      showSizeChanger: false,
      showQuickJumper: true,
      onChange: (page, size) => {
        this.handlePageChange(page, size)
      },
      onShowSizeChange: (page, size) => {
        this.handlePageChange(page, size)
      }
    }
    const props = {
      name: 'file',
      showUploadList: false,
      action: '//jsonplaceholder.typicode.com/posts/',
      headers: {
        authorization: 'authorization-text'
      },
      onChange(info) {
        if (info.file.status !== 'uploading') {
          // console.log(info.file, info.fileList)
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} file uploaded successfully`)
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} file upload failed.`)
        }
      }
    }

    let x = 960
    if (this.importType === '1212003') {
      x = 1200
    }

    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          <Spin
            // tip="正在导出数据，数据量大可能要花费一定时间，请耐心等待..."
            size="large"
            spinning={loadErr}
          >
            <div className={styles['fdc-fixed']}>
              <div className={styles['filter-search-wrap']}>
                <Input disabled value={fileName} />
              </div>
              <ul className={styles['fdc-fixed']}>
                <li className={styles['import-btn-wrap']}>
                  <Upload beforeUpload={this.handleSelectChange} {...props}>
                    <Button>
                      <Icon type="upload" />
                      选择文件
                    </Button>
                  </Upload>
                </li>
                <li className={styles['import-btn-wrap']}>
                  <Button
                    icon="edit"
                    onClick={() => this.handleUpload()}
                    loading={uploading}
                  >
                    开始上传
                  </Button>
                </li>
                <li className={styles['import-btn-wrap']}>
                  <Button
                    type="danger"
                    icon="delete"
                    loading={deleting}
                    onClick={this.beforeDelete}
                  >
                    删除记录
                  </Button>
                </li>
                {this.importType === '1212130' ||
                this.importType === '1212107' ||
                this.importType === '1212119'||this.importType === '1212129' ||this.importType === '1212131' ||this.importType === '1212132' ? null : (
                  <li className={styles['import-btn-wrap']}>
                    <Button
                      icon="download"
                      loading={downloading}
                      onClick={this.downloadTemp}
                    >
                      模板下载
                    </Button>
                  </li>
                )}
                <Button onClick={this.handleGoback} style={{ marginLeft: 8 }}>
                  返回
                </Button>
              </ul>
            </div>
            <div className="import-task-info-table-wrap" style={wrapStyle}>
              <Table
                rowKey="id"
                rowSelection={tableConfig}
                loading={loading}
                columns={this.columns}
                pagination={pagination}
                dataSource={taskInfos}
                scroll={{ x, y: 540 }}
                locale={{
                  emptyText: this.state.localeW
                }}
                className={styles.defineTable}
              />
            </div>
            <Modal
              title="任务名称"
              style={{ top: '30%' }}
              visible={this.state.visible}
              onOk={() => this.handleConfirm()}
              onCancel={() => this.handleCancel()}
            >
              <Form layout="inline" onSubmit={this.handleSubmit}>
                <FormItem {...formItemLayout} label="任务名称">
                  {getFieldDecorator('taskName', {
                    rules: [
                      { required: true, message: '请输入任务名称' },
                      {
                        whitespace: true,
                        message: '请输入任务名称'
                      }
                    ]
                  })(
                    <Input
                      style={{ width: 250 }}
                      placeholder="任务名称"
                      maxLength={100}
                    />
                  )}
                </FormItem>
              </Form>
            </Modal>
            <Modal
              title="删除数据"
              visible={this.state.showConfirm}
              onOk={this.handleConfirmDel}
              onCancel={this.handleCancelDel}
            >
              <Alert
                message="删除数据"
                description="你选择的数据将被永久删除，是否要删除？"
                type="warning"
                showIcon
              />
            </Modal>
          </Spin>
        </div>
      </div>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    null,
    containerActions
  )
)(Import)
