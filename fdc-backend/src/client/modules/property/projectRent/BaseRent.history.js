import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { getCurMonth } from 'client/utils/assist'
import {
  Alert,
  Breadcrumb,
  Icon,
  Table,
  Row,
  Button,
  Modal,
  message
} from 'antd'
import { parse } from 'qs'
import moment from 'moment'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import showTotal from 'client/utils/showTotal'
import router from 'client/router'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ProjectRent.less'

const confirm = Modal.confirm

class BaseRentHistory extends Component {
  static propTypes = {
    fetchBasePriceHistory: PropTypes.func.isRequired,
    basePriceHistory: PropTypes.array.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    exportBaseAvgHistory: PropTypes.func.isRequired,
    // getProjectDetail: PropTypes.func.isRequired,
    getAllDetail: PropTypes.func.isRequired, // wy change 楼盘没有权限
    updateVisitCities: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    /* eslint-disable */
    const { projectId = '', activeTabs, weightId, cityId, cityName } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      // 楼盘id
      projectId,
      // 激活的tab
      activeTabs,
      weightId,
      cityId,
      cityName
    }
  }

  componentDidMount() {
    const { cityId, cityName, projectId } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
        //获取基准房价历史数据
        this.fetchBasePriceHistory(1)
        // 获取楼盘详情
        // const { projectId } = this.state
        // const { cityId, cityName, projectId } = this.state
        // console.log(cityId, cityName, projectId)
        if (projectId) {
          // this.props.getProjectDetail(projectId, this.cityId)
          this.props.getAllDetail(projectId, this.cityId)
        }
      }
    }, 100)
    // console.log(cityId, cityName, projectId)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  fetchBasePriceHistory = pageNum => {
    const params = {
      cityId: this.cityId,
      projectId: this.state.projectId,
      pageNum,
      pageSize: 20
    }
    this.props.fetchBasePriceHistory(params)
  }

  // 导出数据
  exportData = () => {
    const params = {
      cityId: this.cityId,
      projectId: this.state.projectId
    }
    const that = this
    this.props.exportBaseAvgHistory(params, () => {
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
    const { activeTabs } = this.state
    const breadList = [
      {
        key: 1,
        path: '',
        name: '住宅',
        icon: 'home'
      },
      {
        key: 2,
        path: router.RES_PRO_PROJECT_RENT,
        search: `activeTabs=${activeTabs}`,
        name: '楼盘租金'
      },
      {
        key: 3,
        path: '',
        name: '基准租金历史数据'
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

  renderProjectInfo() {
    const { projectDetail } = this.props.model
    const { areaName, projectName } = projectDetail

    return (
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              当前楼盘&nbsp;
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {areaName} | {projectName}
              </span>
            </p>
          }
          type="info"
          showIcon
        />
      </div>
    )
  }

  renderButton() {
    const { projectId, weightId, activeTabs, cityId, cityName } = this.state
    const { projectDetail } = this.props.model
    const { areaName, projectName } = projectDetail
    return (
      <Row style={{ marginBottom: 16 }}>
        <Link
          to={{
            pathname: router.RES_PRO_BASE_RENT_HISTORY_ADD,
            search: `projectId=${projectId || ''}&weightId=${weightId ||
              ''}&tag=${0}&useMonth=${getCurMonth()}&cityId=${cityId}&cityName=${cityName}&areaNameAdd=${areaName}&projectNameAdd=${projectName}&activeTabs=${activeTabs}`
          }}
        >
          {pagePermission('fdc:hd:residence:saleRent:add') ? (
            <Button type="primary" icon="plus">
              新增
            </Button>
          ) : (
            ''
          )}
        </Link>
        {pagePermission('fdc:hd:residence:saleRent:export') ? (
          <Button
            type="primary"
            icon="download"
            onClick={this.exportData}
            style={{ marginLeft: 16 }}
          >
            导出
          </Button>
        ) : (
          ''
        )}
      </Row>
    )
  }

  renderTable() {
    const { projectDetail } = this.props.model
    const { areaName, projectName } = projectDetail
    const { projectId, cityId, cityName, activeTabs } = this.state
    const columns = [
      {
        title: '估价月份',
        width: 150,
        render: date => {
          if (!date) return null
          return moment(date).format('YYYY-MM-DD')
        },
        dataIndex: 'useMonth'
      },
      {
        title: '住宅基准租金',
        width: 150,
        render: (houseAvgRent, { useMonth, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRO_HOUSE_RENT_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${1}&useMonth=${moment(useMonth).format(
                  'YYYY-MM-DD'
                )}&entry=2&cityId=${cityId}&cityName=${cityName}&areaNameAdd=${areaName}&projectNameAdd=${projectName}&activeTabs=${activeTabs}`
              }}
            >
              {houseAvgRent ? <span>{houseAvgRent}</span> : <span>——</span>}
            </Link>
          )
        },
        dataIndex: 'houseAvgRent'
      },
      {
        title: '涨跌幅',
        width: 120,
        render: houseAvgRentGained =>
          `${houseAvgRentGained ? houseAvgRentGained + '%' : ''}`,
        dataIndex: 'houseAvgRentGained'
      },
      {
        title: '公寓基准租金',
        width: 150,
        render: (apartmentAvgRent, { useMonth, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRO_HOUSE_RENT_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${1}&useMonth=${moment(useMonth).format(
                  'YYYY-MM-DD'
                )}&entry=2&cityId=${cityId}&cityName=${cityName}&areaNameAdd=${areaName}&projectNameAdd=${projectName}&activeTabs=${activeTabs}`
              }}
            >
              <span>{apartmentAvgRent || '——'}</span>
            </Link>
          )
        },
        dataIndex: 'apartmentAvgRent'
      },
      {
        title: '涨跌幅',
        width: 120,
        render: apartmentAvgRentGained =>
          `${apartmentAvgRentGained ? apartmentAvgRentGained + '%' : ''}`,
        dataIndex: 'apartmentAvgRentGained'
      },
      {
        title: '商住基准租金',
        width: 150,
        render: (occopantAvgRent, { useMonth, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRO_HOUSE_RENT_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${1}&useMonth=${moment(useMonth).format(
                  'YYYY-MM-DD'
                )}&entry=2&cityId=${cityId}&cityName=${cityName}&areaNameAdd=${areaName}&projectNameAdd=${projectName}&activeTabs=${activeTabs}`
              }}
            >
              {occopantAvgRent ? (
                <span>{occopantAvgRent}</span>
              ) : (
                <span>——</span>
              )}
            </Link>
          )
        },
        dataIndex: 'occopantAvgRent'
      },
      {
        title: '涨跌幅',
        width: 120,
        render: occopantAvgRentGained =>
          `${occopantAvgRentGained ? occopantAvgRentGained + '%' : ''}`,
        dataIndex: 'occopantAvgRentGained'
      },
      {
        title: '别墅',
        width: 100,
        dataIndex: 'villaRent'
      },
      {
        title: '独幢',
        width: 100,
        dataIndex: 'singleVillaRent'
      },
      {
        title: '联排',
        width: 100,
        dataIndex: 'platoonVillaRent'
      },
      {
        title: '叠加',
        width: 100,
        dataIndex: 'superpositionVillaRent'
      },
      {
        title: '双拼',
        width: 100,
        dataIndex: 'duplexesVillaRent'
      },
      {
        title: '修改人',
        width: 150,
        dataIndex: 'modifier'
      },
      {
        title: '修改时间',
        width: 200,
        render: date => {
          if (!date) return null
          return moment(date).format('YYYY-MM-DD HH:mm:ss')
        },
        dataIndex: 'modTime'
      }
    ]

    const { pageNum, pageSize, total } = this.props.model.get(
      'basePriceHistoryPagination'
    )
    const pagination = {
      current: pageNum,
      pageSize,
      total,
      showTotal,
      showQuickJumper: true,
      onChange: pageNum => {
        this.fetchBasePriceHistory(pageNum)
      }
    }

    return (
      <Table
        columns={columns}
        rowKey="id"
        pagination={pagination}
        dataSource={this.props.basePriceHistory}
        // dataSource={basePriceHistory}
        loading={this.context.loading.includes(actions.FETCH_BASE_RENT_HISTORY)}
        scroll={{ x: 1800, y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderProjectInfo()}
          {this.renderButton()}
          {this.renderTable()}
        </div>
      </div>
    )
  }
}

export default compose(
  connect(
    modelSelector,
    containerActions
  )
)(BaseRentHistory)
