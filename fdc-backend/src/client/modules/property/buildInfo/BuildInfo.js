import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import showTotal from 'client/utils/showTotal'
import { Link } from 'react-router-dom'
import {
  Form,
  Table,
  Row,
  Col,
  Checkbox,
  Input,
  Button,
  // Popconfirm,
  Message,
  Alert,
  Breadcrumb,
  Icon,
  Modal,
  Popover
} from 'antd'
import { parse } from 'qs'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import moment from 'moment'

import layout from 'client/utils/layout'
import router from 'client/router'
// import shallowEqual from 'client/utils/shallowEqual'

import BuildInfoBatch from './BuildInfo.batch'
import styles from './BuildInfo.less'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const confirm = Modal.confirm

const projectOptions = [
  {
    label: '正式楼栋',
    value: '1'
  },
  {
    label: '已删除楼栋',
    value: '0'
  }
]

/**
 *  楼栋列表
 * author: YJF
 * 入口: 楼盘列表中栋户点击 - 带ProjectId
 */
class BuildInfo extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    getBuildInfoList: PropTypes.func.isRequired,
    buildInfoList: PropTypes.array.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    delBuild: PropTypes.func.isRequired,
    restoreBuild: PropTypes.func.isRequired,
    calculateHouse: PropTypes.func.isRequired,
    // syncHouse: PropTypes.func.isRequired,
    getProjectDetail: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)

    // 126198461722292928
    /* eslint-disable */
    const {
      projectId = '',
      prjStatus = '1',
      scopes,
      keyword,
      pageNum = 1,
      cityId = '',
      cityName = ''
    } = parse(props.location.search.substr(1))

    this.state = {
      // 选中的筛选范围 id数组
      checkedProjectList: scopes ? scopes.split(',') : ['1'],
      // 是否全部选中
      checkedAllProject: false,
      indeterminateProject: true,

      // projectId
      projectId,
      // 楼盘状态
      prjStatus,

      // 选中table数据
      selectedRowKeys: [],
      selectedRows: [],
      // 批量修改窗口是否显示
      // 批量删除传入的正式楼栋
      selectedFormalRows: [],
      batchModalVisible: false,

      keyword,
      pageNum,

      btnLoading: false,
      computeLoading: false,

      restoreBtnLoading: false,
      cityId,
      cityName
    }
  }

  componentDidMount() {
    const {
      pageNum,
      projectId,
      checkedProjectList,
      keyword,
      prjStatus,
      cityId,
      cityName
    } = this.state

    const scopes = checkedProjectList.join(',')

    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      // this.cityName =
      //   JSON.parse(sessionStorage.getItem('FDC_CITY_INFO')).cityName || '北京市'
      if (this.cityId) {
        clearInterval(this.cityIdInterval)

        const qry = {
          pageNum,
          pageSize: 20,
          projectId,
          cityId: this.cityId,
          scopes,
          keyword
        }
        this.props.getBuildInfoList(qry)

        // 获取楼盘详情
        this.props.getProjectDetail(projectId, this.cityId)
      }
    }, 100)

    // 处理查询条件
    const buildInfoSearch = `projectId=${projectId}&prjStatus=${prjStatus}&scopes=${scopes ||
      ''}&keyword=${keyword || ''}&pageNum=${pageNum}`
    localStorage.setItem('BUILD_INFO_SEARCH', buildInfoSearch)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  onCheckAllProjectChange = e => {
    const projectOptionsValue = []
    projectOptions.forEach(item => {
      projectOptionsValue.push(item.value)
    })
    this.setState({
      checkedProjectList: e.target.checked ? projectOptionsValue : [],
      indeterminateProject: false,
      checkedAllProject: e.target.checked
    })
  }

  onCheckProjectChange = checkedList => {
    this.setState({
      checkedProjectList: checkedList,
      indeterminateProject:
        !!checkedList.length && checkedList.length < projectOptions.length,
      checkedAllProject: checkedList.length === projectOptions.length
    })
  }

  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    this.setState({
      selectedRowKeys: [],
      selectedRows: []
    })
    const { checkedProjectList, projectId, prjStatus } = this.state

    const keyword = this.props.form.getFieldValue('keyword')

    // console.log(checkedProjectList, 222)
    const qry = {
      pageNum,
      pageSize: 20,
      projectId,
      cityId: this.cityId,
      keyword: keyword ? keyword.trim() : ''
    }
    if (checkedProjectList.length) {
      qry.scopes = checkedProjectList.join(',')
    }
    this.props.getBuildInfoList(qry)

    // 保存查询条件
    // 楼盘ID&楼盘状态&筛选范围&关键字
    // projectId&prjStatus&scopes&keyword&pageNum
    const { scopes = '', keyword: searchKeyword } = qry

    const buildInfoSearch = `projectId=${projectId}&prjStatus=${prjStatus}&scopes=${scopes ||
      ''}&keyword=${searchKeyword || ''}&pageNum=${pageNum}`
    this.context.router.history.push({
      pathname: this.props.location.pathname,
      search: buildInfoSearch
    })
    // 将楼栋列表查询条件设置到 sessionStorage,用于保存/编辑返回使用
    localStorage.setItem('BUILD_INFO_SEARCH', buildInfoSearch)
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
    const { selectedRows } = this.state
    // 删除操作前端过滤选中的已删除楼栋
    const idsArr = []
    selectedRows.forEach(item => {
      // 楼栋状态为1能删除
      if (item.status === 1) {
        idsArr.push(item.id)
      }
    })
    if (idsArr.length > 0) {
      const data = {
        cityId: this.cityId,
        ids: idsArr.join(',')
      }
      this.props.delBuild(data, () => {
        Message.success('删除成功')
        this.handleSearch(null, 1)
      })
    } else {
      Message.info('未选中正式楼栋')
    }
  }

  handleRestoreBuild = () => {
    const { selectedRows } = this.state
    // 还原操作前过滤掉正式楼栋
    const idsArr = []
    selectedRows.forEach(item => {
      if (item.status === 0) {
        idsArr.push(item.id)
      }
    })
    if (idsArr.length > 0) {
      this.setState({
        restoreBtnLoading: true
      })

      const data = {
        cityId: this.cityId,
        buildingIds: idsArr.join(','),
        projectId: this.state.projectId
      }
      this.props.restoreBuild(data, res => {
        /* eslint-disable */
        const { tipsCode, tipsMsg, successNum, failNum } = res
        switch (tipsCode) {
          case 1003:
            Message.warn(
              `有重名楼栋，还原成功${successNum}条，还原失败${failNum}条,请再次确认`
            )
            this.handleSearch(null, 1)
            break
          case 1002:
            Message.error(tipsMsg)
            break
          case 1001:
            Message.success(`还原成功${successNum}条，还原失败${failNum}条`)
            this.handleSearch(null, 1)
            break
          default:
            break
        }
        this.setState({
          restoreBtnLoading: false
        })
      })
    } else {
      Message.info('未选中删除楼栋')
    }
  }

  handleBatchUpdate = () => {
    // 批量删除传入的selectedRows
    // 传入正式楼栋
    const selectedFormalRows = []
    const { prjStatus, selectedRows } = this.state
    if (+prjStatus === 1) {
      selectedRows.forEach(item => {
        if (+item.status === 1) {
          selectedFormalRows.push(item)
        }
      })
    }

    if (selectedFormalRows.length > 0) {
      this.setState({
        batchModalVisible: true,
        selectedFormalRows
      })
    } else {
      Message.warn('没有选中正式楼栋')
    }
  }

  handleCloseBatchModal = () => {
    this.setState({
      batchModalVisible: false
    })
  }

  // 如果计算房号
  handleComputeHouse = () => {
    // 传入正式楼栋
    const selectedFormalRows = []
    const selectedFormalRowsKey = []
    const { prjStatus, selectedRows, projectId } = this.state
    if (+prjStatus === 1) {
      selectedRows.forEach(item => {
        if (+item.status === 1) {
          selectedFormalRows.push(item)
          selectedFormalRowsKey.push(item.id)
        }
      })
    }

    if (selectedRows.length > 0 && selectedFormalRows.length === 0) {
      Message.warn('请选择正式楼栋')
      return
    }

    this.setState({
      computeLoading: true
    })

    const data = {
      cityId: this.cityId,
      projectId,
      buildingIds: selectedFormalRowsKey.length
        ? selectedFormalRowsKey.join(',')
        : null
    }
    this.props.calculateHouse(data, res => {
      if (res) {
        const { tipsCode, tipsMsg, houseCountList } = res
        switch (tipsCode) {
          case 1001:
            // Message.success(tipsMsg)
            Modal.info({
              title: '计算结果',
              content: (
                <div className={styles.syncModal}>
                  {houseCountList.map(item => (
                    <div key={item.buildingId} className={styles.syncRes}>
                      <div className={styles.syncBuildName}>
                        {item.buildingName}
                      </div>
                      &nbsp; 成功
                      <span style={{ color: '#33CABB' }}>
                        {item.successNum}
                      </span>
                      条，失败
                      <span style={{ color: 'red' }}>{item.failNum}</span>条
                    </div>
                  ))}
                </div>
              )
            })
            break
          case 1002:
            Message.error(tipsMsg)
            break
          case 1003:
            Message.info(tipsMsg)
            break
          default:
            break
        }
      }
      this.setState({
        computeLoading: false
      })
    })
  }

  handleSyncVQ = () => {
    // 传入正式楼栋
    const selectedFormalRows = []
    const selectedFormalRowsKey = []
    const { prjStatus, selectedRows, projectId } = this.state
    if (+prjStatus === 1) {
      selectedRows.forEach(item => {
        if (+item.status === 1) {
          selectedFormalRows.push(item)
          selectedFormalRowsKey.push(item.id)
        }
      })
    }

    if (selectedRows.length > 0 && selectedFormalRows.length === 0) {
      Message.warn('请选择正式楼栋')
      return
    }

    this.setState({
      btnLoading: true
    })

    const data = {
      cityId: this.cityId,
      projectId,
      buildingIds: selectedFormalRowsKey.length
        ? selectedFormalRowsKey.join(',')
        : null
    }

    this.props.syncHouse(data, res => {
      if (res) {
        // houseCountList
        const { tipsCode, tipsMsg, houseCountList } = res
        if (tipsCode === 1001) {
          // Message.success(tipsMsg)
          Modal.info({
            title: '同步结果',
            content: (
              <div className={styles.syncModal}>
                {houseCountList.map(item => (
                  <div key={item.buildingId} className={styles.syncRes}>
                    <div className={styles.syncBuildName}>
                      {item.buildingName}
                    </div>
                    &nbsp; 成功
                    <span style={{ color: '#33CABB' }}>{item.successNum}</span>
                    条，失败
                    <span style={{ color: 'red' }}>{item.failNum}</span>条
                  </div>
                ))}
              </div>
            )
          })
        } else {
          Message.error(tipsMsg)
        }
        this.setState({
          btnLoading: false
        })
      }
    })
  }

  renderBreads() {
    const {
      areaId,
      areaName,
      id,
      projectName,
      sysStatus
    } = this.props.model.get('projectDetail')
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
        path: router.RES_BASEINFO,
        name: areaName,
        search: `areaId=${areaId}&cityId=${cityId}&cityName=${cityName}`
      },
      {
        key: 4,
        path: router.RES_BASEINFO_ADD,
        name:
          projectName && projectName.length > 10
            ? `${projectName.substr(0, 10)}...`
            : projectName,
        search: `projectId=${id}&status=${sysStatus}&cityId=${cityId}&cityName=${cityName}`
      },
      {
        key: 5,
        path: '',
        name: '楼栋列表'
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

  renderForm() {
    const {
      checkedAllProject,
      indeterminateProject,
      checkedProjectList,

      projectId,
      prjStatus,

      keyword,

      btnLoading,
      computeLoading,
      restoreBtnLoading,
      cityName // change WY
    } = this.state

    const { getFieldDecorator } = this.props.form

    let buildInfoList = this.props.buildInfoList
    buildInfoList = buildInfoList.filter(item => item.status === 1)

    return (
      <Form>
        <Row>
          <FormItem
            label="筛选范围"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
          >
            <Checkbox
              indeterminate={indeterminateProject}
              checked={checkedAllProject}
              onChange={this.onCheckAllProjectChange}
            >
              全部
            </Checkbox>
            <CheckboxGroup
              options={projectOptions}
              value={checkedProjectList}
              onChange={this.onCheckProjectChange}
            />
          </FormItem>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label="关键字"
              labelCol={layout(6, 6)}
              wrapperCol={layout(6, 18)}
            >
              {getFieldDecorator('keyword', {
                initialValue: keyword
              })(<Input placeholder="请输入关键字" maxLength={100} />)}
            </FormItem>
          </Col>
          <Col span={2}>
            <Button
              style={{ marginLeft: 16, marginTop: 4 }}
              type="primary"
              icon="search"
              onClick={e => this.handleSearch(e, 1)}
            >
              查询
            </Button>
          </Col>
        </Row>
        {prjStatus === '1' ? (
          <Row>
            <Link
              to={{
                pathname: router.RES_BUILD_INFO_ADD,
                search: `projectId=${projectId}&cityId=${
                  this.cityId
                }&cityName=${cityName}`
              }}
            >
              {pagePermission('fdc:hd:residence:base:building:add') ? (
                <Button style={{ marginRight: 16 }} icon="plus" type="primary">
                  新增
                </Button>
              ) : (
                ''
              )}
            </Link>
            {pagePermission('fdc:hd:residence:base:building:delete') ? (
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
            {pagePermission('fdc:hd:residence:base:building:return') ? (
              <Button
                style={{ marginRight: 16 }}
                disabled={this.state.selectedRowKeys.length === 0}
                onClick={this.handleRestoreBuild}
                icon="reload"
                loading={restoreBtnLoading}
              >
                还原
              </Button>
            ) : (
              ''
            )}

            {pagePermission('fdc:hd:residence:base:building:change') ? (
              <Button
                style={{ marginRight: 16 }}
                disabled={this.state.selectedRowKeys.length === 0}
                onClick={this.handleBatchUpdate}
              >
                批量修改
              </Button>
            ) : (
              ''
            )}

            <Link
              to={{
                pathname: router.RES_BASEINFO_IMPORT,
                // search: 'importType=1212004'
                search: `importType=${1212004}&cityId=${
                  this.cityId
                }&cityName=${cityName}`
              }}
            >
              {pagePermission('fdc:hd:residence:base:import') ? (
                <Button
                  style={{ marginRight: 16 }}
                  icon="upload"
                  type="primary"
                >
                  导入
                </Button>
              ) : (
                ''
              )}
            </Link>
            <Link
              to={{
                pathname: router.RES_PRO_EXPORT,
                // search: 'exportType=1'
                search: `exportType=${1}&cityId=${
                  this.cityId
                }&cityName=${cityName}`
              }}
            >
              <Button
                style={{ marginRight: 16 }}
                icon="download"
                type="primary"
              >
                导出
              </Button>
            </Link>
            {pagePermission('fdc:hd:residence:base:building:calculate') ? (
              <Button
                style={{ marginRight: 16 }}
                onClick={this.handleComputeHouse}
                loading={computeLoading}
                disabled={buildInfoList.length === 0}
              >
                计算房号差
              </Button>
            ) : (
              ''
            )}
            {pagePermission('fdc:hd:residence:base:building:synchro') ? (
              <Button
                style={{ marginRight: 16 }}
                onClick={this.handleSyncVQ}
                loading={btnLoading}
                disabled={buildInfoList.length === 0}
              >
                同步VQ系数
              </Button>
            ) : (
              ''
            )}
          </Row>
        ) : null}
      </Form>
    )
  }

  renderRow() {
    const {
      buildingNumber,
      houseNumber,
      projectName,
      areaName
    } = this.props.model.get('buildTotal')

    const { prjStatus } = this.state

    return (
      <Row style={{ marginTop: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              当前楼盘名称&nbsp;
              <span
                style={{
                  fontWeight: 600,
                  color: prjStatus === '1' ? '#33CABB' : '#FF0000'
                }}
              >
                {areaName} | {projectName}
              </span>
              &nbsp;&nbsp; 楼栋共计
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {buildingNumber || 0}
              </span>
              个. 房号共计
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {houseNumber || 0}
              </span>
              个.
            </p>
          }
          type="info"
          showIcon
        />
      </Row>
    )
  }

  renderTable() {
    const { projectId, cityName } = this.state

    const columns = [
      {
        title: '楼栋名称',
        width: 112,
        /* eslint-disable */
        render: ({ buildingName, id, status }) => {
          // 判断楼栋状态 默认为正式楼栋
          // let buildStatus = true
          // if (prjStatus === 1) {
          //   buildStatus = status === 1
          // } else {
          //   buildStatus = false
          // }

          return (
            <Popover
              content={
                <div style={{ maxWidth: '200px', wordBreak: 'break-all' }}>
                  {buildingName}
                </div>
              }
              title={false}
              placement="topLeft"
            >
              <Link
                to={{
                  pathname: router.RES_BUILD_INFO_ADD,
                  search: `projectId=${projectId}&buildId=${id}&cityId=${
                    this.cityId
                  }&cityName=${cityName}`
                }}
                className={status ? null : `${styles.delBuild}`}
              >
                <div className={styles.limitBuildingName}>{buildingName}</div>
              </Link>
            </Popover>
          )
        }
      },
      {
        title: '楼栋别名',
        width: 112,
        render: ({ buildingAlias }) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{buildingAlias}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitBuildingAlias}>{buildingAlias}</div>
          </Popover>
        )
      },
      {
        title: '地上总楼层',
        width: 150,
        dataIndex: 'totalFloorNum'
      },
      {
        title: '建筑类型',
        width: 100,
        dataIndex: 'buildingType'
      },
      {
        title: '建成年代',
        width: 120,
        // dataIndex: 'buildDate',
        render: ({ buildDate }) => (
          <span>{buildDate ? moment(buildDate).format('YYYY-MM-DD') : ''}</span>
        )
      },
      {
        title: '楼栋系数',
        width: 100,
        dataIndex: 'priceRate'
      },
      {
        title: '总套数',
        width: 100,
        render: ({ id, totalHouseholdNum }) => (
          <Fragment>
            {pagePermission('fdc:hd:residence:base:roomNum:check') ? (
              <Link
                to={{
                  pathname: router.RES_HOUSE_NUM,
                  search: `projectId=${projectId}&buildId=${id}&cityId=${
                    this.cityId
                  }&cityName=${cityName}`
                }}
              >
                {totalHouseholdNum || 0}
              </Link>
            ) : (
              <a>{totalHouseholdNum || 0}</a>
            )}
          </Fragment>
        )
      },
      {
        title: '建筑形式',
        width: 150,
        dataIndex: 'actualUsage'
      },
      {
        title: '其他',
        width: 150,
        render: ({ id, photoCount }) => (
          <Fragment>
            {pagePermission('fdc:hd:residence:base:buildingPicture:check') ? (
              <Link
                to={{
                  pathname: router.RES_PRO_IMAGE,
                  search: `projectId=${projectId}&buildingId=${id}&cityId=${
                    this.cityId
                  }&cityName=${cityName}`
                }}
              >
                图片(
                {photoCount})
              </Link>
            ) : (
              <a>
                图片(
                {photoCount})
              </a>
            )}
          </Fragment>
        )
      },
      {
        title: '是否锁定',
        width: 100,
        render: ({ isLBuildingName }) => (
          // <Switch
          //   checkedChildren={<Icon type="lock" />}
          //   unCheckedChildren={<Icon type="unlock" />}
          //   checked={+isLBuildingName === 1}
          // />
          <span>{isLBuildingName ? '是' : '否'}</span>
        )
        // ({ 1: <Icon type="lock" />, 0: <Icon type="unlock" /> }[
        //   isLBuildingName
        // ])
      },
      {
        title: '数据权属',
        width: 150,
        dataIndex: 'ownership'
      }
    ]

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectedRows
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
        columns={columns}
        dataSource={this.props.buildInfoList}
        style={{ marginTop: 16 }}
        rowSelection={rowSelection}
        pagination={pagination}
        loading={this.context.loading.includes(actions.GET_BUILD_INFO_LIST)}
        scroll={{ x: 1550, y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  render() {
    const { projectId } = this.state

    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderRow()}
          {this.renderTable()}
        </div>
        <BuildInfoBatch
          batchModalVisible={this.state.batchModalVisible}
          selectedRows={this.state.selectedFormalRows}
          onCloseBatchModal={this.handleCloseBatchModal}
          onSearch={this.handleSearch}
          projectId={projectId}
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
)(BuildInfo)
