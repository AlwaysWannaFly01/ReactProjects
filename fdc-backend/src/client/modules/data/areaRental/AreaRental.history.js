import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Table, Breadcrumb, Icon, Alert, Form, Row, Button, Modal } from 'antd'
import { parse } from 'qs'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import { Link } from 'react-router-dom'
import moment from 'moment'
import router from 'client/router'
import showTotal from 'client/utils/showTotal'
import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './AreaRental.less'

const confirm = Modal.confirm

/*
 * 区域租售比详情
 * 1.区域租售比列表点击进入 2.历史表中进入
 * author: YJF
 */
class AreaRentalHistory extends Component {
  static propTypes = {
    // form: PropTypes.object.isRequired,
    exportAreaRentalHistory: PropTypes.func.isRequired,
    getAreaRentalHistoryList: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    /* eslint-disable */
    const {
      id,
      cityName,
      areaName,
      areaId,
      cityId,
      avgId,
      entry,
      state,
      type
    } = parse(props.location.search.substr(1))

    this.state = {
      avgId,
      entry,
      state,
      id,
      areaId,
      cityId,
      cityName, //wy change
      areaName,
      loading: false,
      type
    }
  }

  componentDidMount() {
    const { cityId, areaId } = this.state
    if (cityId && areaId) {
      this.props.getAreaRentalHistoryList({
        cityId,
        areaId,
        pageNum: 1,
        pageSize: 20
      })
    } else {
      this.props.history.go(-1)
    }
  }

  exportCityPvg = () => {
    const { cityId, areaId } = this.state
    // const params = this.handlePreSubmitData()
    const params = {
      cityId,
      areaId,
      pageNum: 1,
      pageSize: 20
    }
    const that = this
    this.props.exportAreaRentalHistory(params, () => {
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
    if (pagePermission('fdc:ds:export:check')) {
      this.props.history.push({
        pathname: router.DATA_EXPORT_TASK,
        search: 'type=2'
      })
    } else {
      message.warning('没有导出任务页权限，请联系管理员')
    }
  }

  renderBreads() {
    const breadList = [
      {
        key: 1,
        path: router.DATA_AREA_RENTAL,
        name: '区域租售比',
        icon: 'appstore'
      },
      {
        key: 2,
        path: '',
        name: '区域租售比历史数据'
      }
    ]
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

  renderProjectInfo() {
    const { cityName, areaName } = this.state
    return (
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              当前区域&nbsp;
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {cityName || ''} | {areaName || ''}
              </span>
            </p>
          }
          type="info"
          showIcon
        />
      </div>
    )
  }

  renderForm() {
    const {
      exportLoading,
      id,
      areaId,
      cityId,
      cityName, // change WY
      areaName
    } = this.state
    // 物业类型
    return (
      <Form style={{ marginTop: 8 }} onSubmit={e => this.handleSearch(e, 1)}>
        <Row style={{ marginBottom: 16 }}>
          <Link
            to={{
              pathname: router.DATA_AREA_RENTAL_DETAIL,
              search: `id=${id}&avgId=${id ||
                ''}&cityName=${cityName}&areaName=${areaName ||
                ''}&areaId=${areaId}&cityId=${cityId}&entry=1&type=add`
            }}
          >
            {pagePermission('fdc:ds:regionalRental:add') ? (
              <Button type="primary" icon="plus" style={{ marginRight: 16 }}>
                新增
              </Button>
            ) : (
              ''
            )}
          </Link>
          {pagePermission('fdc:ds:regionalRental:export') ? (
            <Button
              type="primary"
              icon="download"
              onClick={this.exportCityPvg}
              loading={exportLoading}
            >
              导出
            </Button>
          ) : (
            ''
          )}
        </Row>
      </Form>
    )
  }

  renderTable() {
    /* eslint-disable */
    const columns = [
      {
        title: '月份',
        render: useMonth => {
          if (!useMonth) return null
          return moment(useMonth).format('YYYY-MM')
        },
        dataIndex: 'useMonth',
        width: 100
      },
      {
        title: '住宅租售比（计算）',
        width: 150,
        render: (
          houseRate,
          { id, cityName, areaName, areaId, cityId, useMonth }
        ) => (
          <Link
            to={{
              pathname: router.DATA_AREA_RENTAL_DETAIL,
              search: `id=${id}&avgId=${id ||
                ''}&cityName=${cityName}&areaName=${areaName ||
                ''}&entry=1&type=detail&areaId=${areaId}&cityId=${cityId}&useMonth=${moment(
                useMonth
              ).format('YYYY-MM-DD')}`
            }}
          >
            <span>{houseRate || '——'}</span>
          </Link>
        ),
        dataIndex: 'houseRate'
      },
      {
        title: '住宅租售比（人工）',
        width: 150,
        render: (
          houseRateManual,
          { id, cityName, areaName, areaId, cityId, useMonth }
        ) => (
          <Link
            to={{
              pathname: router.DATA_AREA_RENTAL_DETAIL,
              search: `id=${id}&avgId=${id ||
                ''}&cityName=${cityName}&areaName=${areaName ||
                ''}&entry=1&type=detail&areaId=${areaId}&cityId=${cityId}&useMonth=${moment(
                useMonth
              ).format('YYYY-MM-DD')}`
            }}
          >
            <span>{houseRateManual || '——'}</span>
          </Link>
        ),
        dataIndex: 'houseRateManual'
      },
      {
        title: '公寓租售比（计算）',
        width: 150,
        render: (
          apartmentRate,
          { id, cityName, areaName, areaId, cityId, useMonth }
        ) => (
          <Link
            to={{
              pathname: router.DATA_AREA_RENTAL_DETAIL,
              search: `id=${id}&avgId=${id ||
                ''}&cityName=${cityName}&areaName=${areaName ||
                ''}&entry=1&type=detail&areaId=${areaId}&cityId=${cityId}&useMonth=${moment(
                useMonth
              ).format('YYYY-MM-DD')}`
            }}
          >
            <span>{apartmentRate || '——'}</span>
          </Link>
        ),
        dataIndex: 'apartmentRate'
      },
      {
        title: '公寓租售比（人工）',
        width: 150,
        render: (
          apartmentRateManual,
          { id, cityName, areaName, areaId, cityId, useMonth }
        ) => (
          <Link
            to={{
              pathname: router.DATA_AREA_RENTAL_DETAIL,
              search: `id=${id}&avgId=${id ||
                ''}&cityName=${cityName}&areaName=${areaName ||
                ''}&entry=1&type=detail&areaId=${areaId}&cityId=${cityId}&useMonth=${moment(
                useMonth
              ).format('YYYY-MM-DD')}`
            }}
          >
            <span>{apartmentRateManual || '——'}</span>
          </Link>
        ),
        dataIndex: 'apartmentRateManual'
      },
      {
        title: '商住租售比（计算）',
        width: 150,
        render: (
          occopantRate,
          { id, cityName, areaName, areaId, cityId, useMonth }
        ) => (
          <Link
            to={{
              pathname: router.DATA_AREA_RENTAL_DETAIL,
              search: `id=${id}&avgId=${id ||
                ''}&cityName=${cityName}&areaName=${areaName ||
                ''}&entry=1&type=detail&areaId=${areaId}&cityId=${cityId}&useMonth=${moment(
                useMonth
              ).format('YYYY-MM-DD')}`
            }}
          >
            <span>{occopantRate || '——'}</span>
          </Link>
        ),
        dataIndex: 'occopantRate'
      },
      {
        title: '商住租售比（人工）',
        width: 150,
        render: (
          occopantRateManual,
          { id, cityName, areaName, areaId, cityId, useMonth }
        ) => (
          <Link
            to={{
              pathname: router.DATA_AREA_RENTAL_DETAIL,
              search: `id=${id}&avgId=${id ||
                ''}&cityName=${cityName}&areaName=${areaName ||
                ''}&entry=1&type=detail&areaId=${areaId}&cityId=${cityId}&useMonth=${moment(
                useMonth
              ).format('YYYY-MM-DD')}`
            }}
          >
            <span>{occopantRateManual || '——'}</span>
          </Link>
        ),
        dataIndex: 'occopantRateManual'
      },
      {
        title: '修改人',
        dataIndex: 'modifier',
        width: 100
      },
      {
        title: '修改时间',
        render: modTime => {
          if (!modTime) return null
          return moment(modTime).format('YYYY-MM-DD HH:mm:ss')
        },
        dataIndex: 'modTime',
        width: 150
      },
      {
        title: '' //此处添加一个空列，让此列去自适应一行宽度
      }
    ]

    const { pageNum, pageSize, total } = this.props.model.get('areaPagination')
    const pagination = {
      current: pageNum,
      pageSize,
      total,
      showTotal,
      showQuickJumper: true,
      onChange: pageNum => {
        this.props.onSearch(null, pageNum)
      }
    }

    return (
      <Table
        rowKey="id"
        pagination={pagination}
        columns={columns}
        dataSource={this.props.areaRentalHistoryList} // areaRentalHistoryList替换
        // scroll={{ x: 1000, y: 420 }}
        className={styles.tableDetailRoom}
        loading={this.context.loading.includes(
          actions.GET_AREA_RENTAL_HISTORY_LIST
        )}
      />
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderProjectInfo()}
          {this.renderForm()}
          {this.renderTable()}
        </div>
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
)(AreaRentalHistory)
