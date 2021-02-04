import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
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
import { Link } from 'react-router-dom'
import { pagePermission } from 'client/utils'
import router from 'client/router'
import showTotal from 'client/utils/showTotal'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ProjectRent.less'

const confirm = Modal.confirm

class CaseRentHistory extends Component {
  static propTypes = {
    fetchCasePriceHistory: PropTypes.func.isRequired,
    casePriceHistory: PropTypes.array.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    exportCaseAvgHistory: PropTypes.func.isRequired,
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
    const { projectId = '', activeTabs, cityId, cityName } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      // 楼盘id
      projectId,
      activeTabs,
      cityId,
      cityName
    }

    // console.log(this.state)
  }

  componentDidMount() {
    const { projectId, cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
        //获取基准房价历史数据
        this.fetchCasePriceHistory(1)
        // 获取楼盘详情
        // const { projectId } = this.state
        if (projectId) {
          // this.props.getProjectDetail(projectId, this.cityId)
          this.props.getAllDetail(projectId, this.cityId)
        }
      }
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  fetchCasePriceHistory = pageNum => {
    const params = {
      cityId: this.cityId,
      projectId: this.state.projectId,
      pageNum,
      pageSize: 20
    }
    this.props.fetchCasePriceHistory(params)
  }

  // 导出数据
  exportData = () => {
    const params = {
      cityId: this.cityId,
      projectId: this.state.projectId
    }
    const that = this
    this.props.exportCaseAvgHistory(params, () => {
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

  formatTime = (date, type) => {
    if (!date) {
      return ''
    }
    return moment(date).format(type)
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
        search: `activeTabs=${activeTabs}&cityId=${this.state.cityId}&cityName=${this.state.cityName}`,
        name: '楼盘租金'
      },
      {
        key: 3,
        path: '',
        name: '案例租金历史数据'
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
    const { cityId, cityName, activeTabs } = this.state
    return (
      <Row style={{ marginBottom: 16 }}>
        <Link
          to={{
            pathname: router.RES_PRO_CASE_RENT_HISTORY_ADD,
            search: `projectId=${this.state.projectId}&cityId=${cityId}&cityName=${cityName}&activeTabs=${activeTabs}`
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
    const { cityId, cityName, activeTabs } = this.state
    const columns = [
      {
        title: '案例月份',
        width: 120,
        dataIndex: 'useMonth',
        render: useMonth => this.formatTime(useMonth, 'YYYY-MM')
      },
      {
        title: '住宅案例租金',
        width: 150,
        dataIndex: 'houseAvgRent',
        render: (_, { projectId, useMonth, id, houseAvgRent }) => (
          <Link
            to={{
              pathname: router.RES_PRO_CASE_RENT_DETAIL,
              search: `projectId=${projectId || ''}&weightId=${id ||
                ''}&tag=${1}&useMonth=${moment(useMonth).format(
                'YYYY-MM-DD'
              )}&entry=2&cityId=${cityId}&cityName=${cityName}&areaNameAdd=${areaName}&projectNameAdd=${projectName}&activeTabs=${activeTabs}`
            }}
          >
            <span>{houseAvgRent || '——'}</span>
          </Link>
        )
      },
      {
        title: '涨跌幅',
        width: 120,
        render: houseAvgRentGained =>
          `${houseAvgRentGained ? houseAvgRentGained + '%' : ''}`,
        dataIndex: 'houseAvgRentGained'
      },
      {
        title: '公寓案例租金',
        width: 150,
        dataIndex: 'apartmentAvgRent',
        render: (_, { projectId, useMonth, id, apartmentAvgRent }) => (
          <Link
            to={{
              pathname: router.RES_PRO_CASE_RENT_DETAIL,
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
      {
        title: '涨跌幅',
        width: 120,
        render: apartmentAvgRentGained =>
          `${apartmentAvgRentGained ? apartmentAvgRentGained + '%' : ''}`,
        dataIndex: 'apartmentAvgRentGained'
      },
      {
        title: '商住案例租金',
        width: 150,
        dataIndex: 'occopantAvgRent',
        render: (_, { projectId, useMonth, id, occopantAvgRent }) => (
          <Link
            to={{
              pathname: router.RES_PRO_CASE_RENT_DETAIL,
              search: `projectId=${projectId || ''}&weightId=${id ||
                ''}&tag=${1}&useMonth=${moment(useMonth).format(
                'YYYY-MM-DD'
              )}&entry=2&cityId=${cityId}&cityName=${cityName}&areaNameAdd=${areaName}&projectNameAdd=${projectName}&activeTabs=${activeTabs}`
            }}
          >
            <span>{occopantAvgRent || '——'}</span>
          </Link>
        )
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
        width: 120,
        dataIndex: 'villaRent'
      },
      {
        title: '联排',
        width: 120,
        dataIndex: 'platoonVillaRent'
      },
      {
        title: '独幢',
        width: 120,
        dataIndex: 'singleVillaRent'
      },
      {
        title: '叠加',
        width: 120,
        dataIndex: 'superpositionVillaRent'
      },
      {
        title: '双拼',
        width: 120,
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
        dataIndex: 'modTime',
        render: modTime => this.formatTime(modTime, 'YYYY-MM-DD HH:mm:ss')
      }
    ]
    const { pageNum, pageSize, total } = this.props.model.get(
      'casePriceHistoryPagination'
    )
    const pagination = {
      current: pageNum,
      pageSize,
      total,
      showTotal,
      showQuickJumper: true,
      onChange: pageNum => {
        this.fetchCasePriceHistory(pageNum)
      }
    }

    return (
      <Table
        columns={columns}
        rowKey="id"
        pagination={pagination}
        dataSource={this.props.casePriceHistory}
        // dataSource={casePriceHistory}
        scroll={{ x: 1800, y: 420 }}
        loading={this.context.loading.includes(
          actions.FETCH_CASE_PRICE_HISTORY
        )}
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
)(CaseRentHistory)
