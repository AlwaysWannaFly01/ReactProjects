import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Table, Popover } from 'antd'
import moment from 'moment'
import { Link } from 'react-router-dom'
// import Immutable from 'immutable'

import showTotal from 'client/utils/showTotal'
import router from 'client/router'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ProjectRent.less'

/*
 * 案例均价 - 基准房价
 */
class ProjectRentBase extends Component {
  static propTypes = {
    baseDatas: PropTypes.array.isRequired,
    onSearch: PropTypes.func.isRequired,
    useMonth: PropTypes.string,
    cityId: PropTypes.string,
    cityName: PropTypes.string,
    areaIds: PropTypes.string,
    keyword: PropTypes.string
  }

  render() {
    /* eslint-disable */
    const { cityId, cityName, areaIds, keyword } = this.props
    const columns = [
      {
        title: '行政区',
        dataIndex: 'areaName',
        width: 120,
        fixed: 'left'
      },
      {
        title: '楼盘名称',
        // dataIndex: 'projectName',
        width: 210,
        fixed: 'left',
        render: ({ projectName }) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{projectName}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitProjectName}>{projectName}</div>
          </Popover>
        )
      },
      {
        title: '楼盘别名',
        width: 210,
        // dataIndex: 'projectAlias',
        render: ({ alias }) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{alias}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitProjectName}>{alias}</div>
          </Popover>
        )
      },
      {
        title: '估价月份',
        width: 120,
        render: (_, { userMonth }) => {
          if (userMonth) {
            return moment(userMonth).format('YYYY-MM')
          }
          return moment(this.props.useMonth).format('YYYY-MM')
        },
        dataIndex: 'userMonth'
      },
      {
        title: '住宅基准租金',
        width: 150,
        render: (houseAvgRent, { projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRO_HOUSE_RENT_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${tag}&useMonth=${
                  this.props.useMonth
                }&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=2&activeTabs=2`
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
        render: (apartmentAvgRent, { projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRO_HOUSE_RENT_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${tag}&useMonth=${
                  this.props.useMonth
                }&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=2&activeTabs=2`
              }}
            >
              {apartmentAvgRent ? (
                <span>{apartmentAvgRent}</span>
              ) : (
                <span>——</span>
              )}
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
        render: (occopantAvgRent, { projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRO_HOUSE_RENT_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${tag}&useMonth=${
                  this.props.useMonth
                }&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=2&activeTabs=2`
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
        title: ''
      },
      {
        title: '操作',
        fixed: 'right',
        width: 100,
        render: (_, { projectId, id }) => (
          <Link
            to={{
              pathname: router.RES_PRO_BASE_RENT_HISTORY,
              search: `projectId=${projectId}&activeTabs=2&weightId=${id}&cityId=${cityId}&cityName=${cityName}`
            }}
          >
            历史
          </Link>
        ),
        dataIndex: 'projectId'
      }
    ]

    // const baseDatas = [
    //   {
    //     key: '1',
    //     name: '胡彦斌',
    //     age: 32,
    //     address: '西湖区湖底公园1号'
    //   },
    //   {
    //     key: '2',
    //     name: '胡彦祖',
    //     age: 42,
    //     address: '西湖区湖底公园1号'
    //   }
    // ]

    const { pageNum, pageSize, total } = this.props.model.get('basePagination')
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
        rowKey={(record, index) => index}
        pagination={pagination}
        columns={columns}
        dataSource={this.props.baseDatas}
        // dataSource={baseDatas}
        scroll={{ x: 1800, y: 420 }}
        className={styles.tableDetailRoom}
      />
    )
  }
}

export default compose(
  connect(
    modelSelector,
    containerActions
  )
)(ProjectRentBase)
