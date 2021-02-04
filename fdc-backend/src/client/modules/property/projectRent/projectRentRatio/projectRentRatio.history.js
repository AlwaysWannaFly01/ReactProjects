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
  message,
  Spin
} from 'antd'
import { parse } from 'qs'
import moment from 'moment'
import Immutable from 'immutable'
import { Link } from 'react-router-dom'
import { pagePermission } from 'client/utils'
import router from 'client/router'
import showTotal from 'client/utils/showTotal'

import actions, { containerActions } from '../actions'
import { modelSelector } from '../selector'
import '../sagas'
import '../reducer'

import styles from '../ProjectRent.less'

const confirm = Modal.confirm
class projectRentRatioHistory extends Component {
  static propTypes = {
    getRentRatioHistoryData: PropTypes.func.isRequired,
    rentRatioDatasHistory: PropTypes.array.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    exportRentRatioHistory: PropTypes.func.isRequired,
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
        //获取楼盘租金租售比历史数据
        const params = {
          cityId: this.cityId,
          projectId: this.state.projectId,
          pageNum: 1,
          pageSize: 20
        }
        this.props.getRentRatioHistoryData(params)
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

  // 导出数据
  exportData = () => {
    const params = {
      cityId: this.cityId,
      projectId: this.state.projectId
    }
    const that = this
    this.props.exportRentRatioHistory(params, () => {
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
        search: `activeTabs=${activeTabs}`,
        name: '楼盘租金'
      },
      {
        key: 3,
        path: router.RES_PRORENT_RENTAL,
        search: `importType=1212129&cityId=${this.state.cityId}&cityName=${this.state.cityName}`,
        name: '楼盘租售比'
      },
      {
        key: 4,
        path: '',
        name: '楼盘租售比历史'
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
            pathname: router.RES_PRORENT_RENTAL_ADD,
            search: `projectId=${
              this.state.projectId
            }&cityId=${cityId}&cityName=${cityName}&activeTabs=${activeTabs}`
          }}
        >
          {pagePermission('fdc:hd:residence:rentalRatio:add') ? (
            <Button type="primary" icon="plus">
              新增
            </Button>
          ) : (
            ''
          )}
        </Link>
        {pagePermission('fdc:hd:residence:rentalRatio:export') ? (
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
    const { areaName, projectName, areaIds, keyword } = projectDetail
    const { cityId, cityName } = this.state
    console.log(cityId)
    const columns = [
      {
        title: '月份',
        width: 120,
        dataIndex: 'useMonth',
        render: useMonth => this.formatTime(useMonth, 'YYYY-MM')
      },
      {
        title: '住宅租售比（计算)',
        width: 150,
        render: (houseRate, { useMonth, projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRORENT_RENTAL_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${tag}&useMonth=${moment(new Date(useMonth)).format(
                  'YYYY-MM-01'
                )}&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=3&activeTabs=3`
              }}
            >
              <span>{houseRate || '——'}</span>
            </Link>
          )
        },
        dataIndex: 'houseRate'
      },
      {
        title: '住宅租售比（人工）',
        width: 150,
        render: (houseRateManual, { useMonth, projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRORENT_RENTAL_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${tag}&useMonth=${moment(new Date(useMonth)).format(
                  'YYYY-MM-01'
                )}&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=3&activeTabs=3`
              }}
            >
              <span>{houseRateManual || '——'}</span>
            </Link>
          )
        },
        dataIndex: 'houseRateManual'
      },
      {
        title: '公寓租售比（计算）',
        width: 150,
        render: (apartmentRate, { useMonth, projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRORENT_RENTAL_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${tag}&useMonth=${moment(new Date(useMonth)).format(
                  'YYYY-MM-01'
                )}&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=3&activeTabs=3`
              }}
            >
              {apartmentRate ? <span>{apartmentRate}</span> : <span>——</span>}
            </Link>
          )
        },
        dataIndex: 'apartmentRate'
      },
      {
        title: '公寓租售比（人工）',
        width: 150,
        render: (apartmentRateManual, { useMonth, projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRORENT_RENTAL_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${tag}&useMonth=${moment(new Date(useMonth)).format(
                  'YYYY-MM-01'
                )}&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=3&activeTabs=3`
              }}
            >
              {apartmentRateManual ? (
                <span>{apartmentRateManual}</span>
              ) : (
                <span>——</span>
              )}
            </Link>
          )
        },
        dataIndex: 'apartmentRateManual'
      },
      {
        title: '商住租售比（计算）',
        width: 150,
        render: (occopantRate, { useMonth, projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRORENT_RENTAL_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${tag}&useMonth=${moment(new Date(useMonth)).format(
                  'YYYY-MM-01'
                )}&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=3&activeTabs=3`
              }}
            >
              {occopantRate ? <span>{occopantRate}</span> : <span>——</span>}
            </Link>
          )
        },
        dataIndex: 'occopantRate'
      },
      {
        title: '商住租售比（人工）',
        width: 150,
        render: (occopantRateManual, { useMonth, projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRORENT_RENTAL_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${tag}&useMonth=${moment(new Date(useMonth)).format(
                  'YYYY-MM-01'
                )}&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=3&activeTabs=3`
              }}
            >
              {occopantRateManual ? (
                <span>{occopantRateManual}</span>
              ) : (
                <span>——</span>
              )}
            </Link>
          )
        },
        dataIndex: 'occopantRateManual'
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
      'rentRatioDatasHistoryPagination'
    )
    const pagination = {
      current: pageNum,
      pageSize,
      total,
      showTotal,
      showQuickJumper: true,
      onChange: pageNum => {
        const params = {
          cityId: this.cityId,
          projectId: this.state.projectId,
          pageNum: pageNum,
          pageSize: 20
        }
        this.props.getRentRatioHistoryData(params)
      }
    }

    return (
      <Spin
        spinning={this.context.loading.includes(
          actions.GET_RENT_RATIO_HISTORY_DATA
        )}
      >
        <Table
          columns={columns}
          rowKey="id"
          pagination={pagination}
          dataSource={this.props.rentRatioDatasHistory}
          // dataSource={casePriceHistory}
          scroll={{ x: 1800, y: 420 }}
          loading={this.context.loading.includes(
            actions.FETCH_CASE_PRICE_HISTORY
          )}
          className={styles.defineTable}
        />
      </Spin>
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
)(projectRentRatioHistory)
