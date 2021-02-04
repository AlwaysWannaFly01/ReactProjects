import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
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
import { pagePermission } from 'client/utils'
import showTotal from 'client/utils/showTotal'
import router from 'client/router'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ResRating.less'
import ResRatingHistoryAdd from './ResRating.newEdit'
import ResRatingHistoryEdit from './ResRating.newEdit'
import { Popover } from 'antd'
const confirm = Modal.confirm

class ResRatingHistory extends Component {
  static propTypes = {
    getRatingHistory: PropTypes.func.isRequired,
    ratingHistory: PropTypes.array.isRequired,
    exportRatingResultHistory: PropTypes.func.isRequired,
    getRatingRuleDetail: PropTypes.func.isRequired, // 获得权重
    updateVisitCities: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    /* eslint-disable */
    const { areaName, projectName, projectId, cityId, cityName } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      areaName,
      projectName,
      projectId,
      cityId,
      cityName,
      visilbeAdd: false,
      editData: {},
      visilbeEdit: false,
      weightDetail: {} // 权重详情数据
    }
  }

  componentDidMount() {
    const { cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
        //获取基准房价历史数据
        this.getRatingHistory(1)
        this.props.getRatingRuleDetail({ cityId: this.cityId }, data => {
          this.setState({ weightDetail: data })
        })
      }
    }, 100)

    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  getRatingHistory = pageNum => {
    const params = {
      cityId: this.cityId,
      projectId: this.state.projectId,
      pageNum,
      pageSize: 20
    }
    this.props.getRatingHistory(params)
  }

  changeNewModal = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    let userMonth = moment(new Date(`${year}-${month}`)).format('YYYY-MM')
    const item = this.props.ratingHistory.find(e=>moment(e.useMonth).utcOffset(8).format('YYYY-MM')===userMonth)
    this.setState({ visilbeAdd: true, editData: item?item:{}, isAdd:true })
  }

  handleCloseModal = () => {
    this.setState({ visilbeAdd: false, visilbeEdit: false })
  }

  handleRatingChange = editData => {
    this.setState({
      visilbeEdit: true,
      editData
    })
  }

  // 导出数据
  exportData = () => {
    const params = {
      cityId: this.cityId,
      projectId: this.state.projectId
    }
    const that = this
    this.props.exportRatingResultHistory(params, res => {
      const { code, message } = res
      if (+code === 200) {
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
      } else {
        Message.error(message)
      }
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
    const { cityId, cityName } = this.state
    const breadListHistory = [
      {
        key: 1,
        path: '',
        name: '住宅',
        icon: 'home'
      },
      {
        key: 2,
        name: '住宅基础数据',
        path: router.RES_BASEINFO
      },
      {
        key: 3,
        name: '楼盘评级结果',
        path: router.RES_RATING,
        search: `cityId=${cityId}&cityName=${cityName}`,
        icon: ''
      },
      {
        key: 4,
        path: '',
        name: '楼盘评级结果历史数据',
        icon: ''
      }
    ]
    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadListHistory.map(item => (
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
    const { areaName, projectName } = this.state

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
    return (
      <Row style={{ marginBottom: 16 }}>
        {pagePermission('fdc:hd:residence:base:ratingResult:add') ? (
          <Button type="primary" icon="plus" onClick={this.changeNewModal}>
            新增
          </Button>
        ) : (
          ''
        )}

        {pagePermission('fdc:hd:residence:base:ratingResult:export') ? (
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
    const columns = [
      {
        title: '月份',
        width: 100,
        fixed: 'left',
        render: date => {
          if (!date) return null
          return moment(date).format('YYYY-MM')
        },
        dataIndex: 'useMonth'
      },
      {
        title: '楼盘等级',
        width: 100,
        fixed: 'left',
        dataIndex: 'grade',
        render: (num) => (
          <span>{num||num===0?num:'——'}</span>
        )
      },
      {
        title: '总得分',
        width: 100,
        fixed: 'left',
        dataIndex: 'totalScore',
        render: (_, record) =>
        {
          console.log(_)
          return (
          <Popover content={<div style={{ maxWidth: '200px' }}>{_}</div>}>
            {pagePermission('fdc:hd:residence:base:ratingResult:change') ? (
              <a onClick={() => this.handleRatingChange(record)}>{_||_===0?_: '——'}</a>
            ) : (
              <span>{_||_===0?_: '——'}</span>
            )}
          </Popover>
          )
        }
        
      },
      {
        title: '楼盘评级排位占比(%)',
        width: 180,
        dataIndex: 'rankRate',
        render: (num) => (
          <span>{num||num===0?num:'——'}</span>
        )
      },
      {
        title: '报盘活跃度得分',
        width: 160,
        dataIndex: 'offerLivenessScore',
        render: (num) => (
          <span>{num||num===0?num:'——'}</span>
        )
      },
      {
        title: 'VQ查询热度得分',
        width: 160,
        dataIndex: 'vqQueryScore',
        render: (num) => (
          <span>{num||num===0?num:'——'}</span>
        )
      },
      {
        title: '竣工日期得分',
        width: 160,
        dataIndex: 'deliveryDateScore',
        render: (num) => (
          <span>{num||num===0?num:'——'}</span>
        )
      },
      {
        title: '开发商得分',
        width: 100,
        dataIndex: 'developerScore',
        render: (num) => (
          <span>{num||num===0?num:'——'}</span>
        )
      },
      {
        title: '楼盘体量得分',
        width: 150,
        dataIndex: 'volumeScore',
        render: (num) => (
          <span>{num||num===0?num:'——'}</span>
        )
      },
      {
        title: '内部配套得分',
        width: 150,
        dataIndex: 'facilitiesScore',
        render: (num) => (
          <span>{num||num===0?num:'——'}</span>
        )
      },
      {
        title: '物业得分',
        width: 100,
        dataIndex: 'managementScore',
        render: (num) => (
          <span>{num||num===0?num:'——'}</span>
        )
      },
      {
        title: '交通得分',
        width: 100,
        dataIndex: 'transportationScore',
        render: (num) => (
          <span>{num||num===0?num:'——'}</span>
        )
      },
      {
        title: '市政得分',
        width: 100,
        dataIndex: 'municipalityScore',
        render: (num) => (
          <span>{num||num===0?num:'——'}</span>
        )
      },
      {
        title: '医疗得分',
        width: 100,
        dataIndex: 'medicalScore',
        render: (num) => (
          <span>{num||num===0?num:'——'}</span>
        )
      },
      {
        title: '教育得分',
        width: 100,
        dataIndex: 'educationScore',
        render: (num) => (
          <span>{num||num===0?num:'——'}</span>
        )
      },
      {
        title: '商业得分',
        width: 100,
        dataIndex: 'commercialScore',
        render: (num) => (
          <span>{num||num===0?num:'——'}</span>
        )
      },
      // {
      //   title: '入围银行白名单得分',
      //   width: 180,
      //   dataIndex: 'bankWhitelistScore',
      //   render: (num) => (
      //     <span>{num||num===0?num:'——'}</span>
      //   )
      // },
      {
        title: '租售比',
        width: 142,
        dataIndex: 'priceRentRatioScore',
        render: commercialScore => <span>{commercialScore || commercialScore===0?commercialScore:'——'}</span>
      },
      {
        title: '价格稳定性',
        width: 142,
        dataIndex: 'priceStabilityScore',
        render: commercialScore => <span>{commercialScore || commercialScore===0?commercialScore:'——'}</span>
      },
      // {
      //   title: '平均成交周期(天)',
      //   width: 180,
      //   dataIndex: 'avgDealPeriod',
      //   render: (num) => (
      //     <span>{num||num===0?num:'——'}</span>
      //   )
      // },
      // {
      //   title: '平均议价空间(%)',
      //   width: 190,
      //   dataIndex: 'avgBargainSpace',
      //   render: (num) => (
      //     <span>{num||num===0?num:'——'}</span>
      //   )
      // },
      {
        title: '修改人',
        width: 150,
        dataIndex: 'modifier',
        render: (num) => (
          <span>{num||num===0?num:'——'}</span>
        )
      },
      {
        title: '修改时间',
        width: 150,
        render: date => {
          if (!date) return null
          return moment(date).format('YYYY-MM-DD HH:mm:ss')
        },
        dataIndex: 'modTime'
      },
      
      
    ]

    const { pageNum, pageSize, total } = this.props.model.get(
      'paginationHistory'
    )
    const pagination = {
      current: pageNum,
      pageSize,
      total,
      showTotal,
      showQuickJumper: true,
      onChange: pageNum => {
        this.getRatingHistory(pageNum)
      }
    }

    return (
      <Table
        columns={columns}
        rowKey="id"
        pagination={pagination}
        dataSource={this.props.ratingHistory}
        loading={this.context.loading.includes(actions.GET_RATING_HISTORY)}
        scroll={{ x: 3000, y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  render() {
    const { editData, weightDetail } = this.state
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderProjectInfo()}
          {this.renderButton()}
          {this.renderTable()}
          <ResRatingHistoryEdit
            modalVisible={this.state.visilbeEdit}
            modalCancel={this.handleCloseModal}
            editData={editData}
            isAdd={false}
            onSearch={this.getRatingHistory}
            projectName={this.state.projectName}
            projectId={this.state.projectId}
            cityId={this.state.cityId}
            weightDetail={weightDetail}
          />
          <ResRatingHistoryAdd
            isAdd={true}
            modalVisible={this.state.visilbeAdd}
            modalCancel={this.handleCloseModal}
            editData={editData}
            onSearch={this.getRatingHistory}
            projectName={this.state.projectName}
            projectId={this.state.projectId}
            cityId={this.state.cityId}
            weightDetail={weightDetail}
            areaName={this.state.areaName}
          />
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
)(ResRatingHistory)
