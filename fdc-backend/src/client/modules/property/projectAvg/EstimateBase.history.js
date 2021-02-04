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

import styles from './ProjectAvg.less'

const confirm = Modal.confirm

class EstimateBaseHistory extends Component {
  static propTypes = {
    estimateWeightHistory: PropTypes.func.isRequired,
    estimateWeight: PropTypes.array.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    exportEstimateWeightHistory: PropTypes.func.isRequired,
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
    this.props.estimateWeightHistory(params)
  }

  // 导出数据
  exportData = () => {
    const params = {
      cityId: this.cityId,
      projectId: this.state.projectId
    }
    const that = this
    this.props.exportEstimateWeightHistory(params, () => {
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
        path: router.RES_PRO_PROJECT_AVG,
        search: `activeTabs=${activeTabs}`,
        name: '楼盘价格'
      },
      {
        key: 3,
        path: '',
        name: '评估基准价历史数据'
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
    const { projectId, weightId, cityId, cityName } = this.state
    const { projectDetail } = this.props.model
    const { areaName, projectName } = projectDetail
    return (
      <Row style={{ marginBottom: 16 }}>
        <Link
          to={{
            pathname: router.RES_PRO_ESTIMATE_BASE_ADD,
            search: `projectId=${projectId || ''}&weightId=${weightId ||
              ''}&tag=${0}&useMonth=${getCurMonth()}&cityId=${cityId}&cityName=${cityName}&areaNameAdd=${areaName}&projectNameAdd=${projectName}`
          }}
        >
          {pagePermission('fdc:hd:residence:average:add') ? (
            <Button type="primary" icon="plus">
              新增
            </Button>
          ) : (
            ''
          )}
        </Link>
        {pagePermission('fdc:hd:residence:average:export') ? (
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
    const { projectId, cityId, cityName } = this.state
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
        title: '评估基准价',
        width: 150,
        render: (basePrice, { useMonth, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRO_ESTIMATE_BASE_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${1}&useMonth=${moment(useMonth).format(
                  'YYYY-MM-DD'
                )}&entry=2&cityId=${cityId}&cityName=${cityName}&areaNameAdd=${areaName}&projectNameAdd=${projectName}`
              }}
            >
              {basePrice ? <span>{basePrice}</span> : <span>——</span>}
            </Link>
          )
        },
        dataIndex: 'projectAvgPrice'
      },
      {
        title: '涨跌幅',
        width: 120,
        render: percent => percent !== null && percent !== '' && `${percent}%`,
        dataIndex: 'projectGained'
      },
      {
        title: '低层',
        width: 150,
        dataIndex: 'lowLayerPrice'
      },
      {
        title: '多层',
        width: 150,
        dataIndex: 'multiLayerPrice'
      },
      {
        title: '小高层',
        width: 150,
        dataIndex: 'smallHighLayerPrice'
      },
      {
        title: '高层',
        width: 150,
        dataIndex: 'highLayerPrice'
      },
      {
        title: '超高层',
        width: 150,
        dataIndex: 'superHighLayerPrice'
      },
      {
        title: '别墅',
        width: 150,
        dataIndex: 'villaPrice'
      },
      {
        title: '联排',
        width: 150,
        dataIndex: 'platoonVillaPrice'
      },
      {
        title: '独幢',
        width: 150,
        dataIndex: 'singleVillaPrice'
      },
      {
        title: '叠加',
        width: 150,
        dataIndex: 'superpositionVillaPrice'
      },
      {
        title: '双拼',
        width: 150,
        dataIndex: 'duplexesVillaPrice'
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
        dataSource={this.props.estimateWeight}
        loading={this.context.loading.includes(actions.ESTIMATE_WEIGHT_HISTORY)}
        scroll={{ x: 2500, y: 420 }}
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
)(EstimateBaseHistory)
