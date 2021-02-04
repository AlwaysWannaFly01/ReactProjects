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
 * 案例均价 - 案例均价
 */
class ProjectRentCase extends Component {
  static propTypes = {
    caseDatas: PropTypes.array.isRequired,
    useMonth: PropTypes.string,
    onSearch: PropTypes.func.isRequired,
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
        width: 200,
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
        //dataIndex: 'projectName'
      },
      {
        title: '楼盘别名',
        width: 200,
        render: ({ alias }) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{alias}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitProjectName}>{alias}</div>
          </Popover>
        )
        //dataIndex: 'alias'
      },
      {
        title: '案例月份',
        width: 120,
        render: (_, { userMonth }) => {
          if (userMonth) {
            return moment(userMonth / 1000).format('YYYY-MM')
          }
          return moment(this.props.useMonth)
            .add(-1, 'M')
            .format('YYYY-MM')
        },
        dataIndex: 'userMonth'
      },
      {
        title: '住宅案例租金',
        width: 150,
        render: (houseAvgRent, { useMonth, projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRO_CASE_RENT_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${tag}&useMonth=${moment(new Date(useMonth)).format(
                  'YYYY-MM-01'
                )}&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=3&activeTabs=3`
              }}
            >
              <span>{houseAvgRent || '——'}</span>
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
        title: '公寓案例租金',
        width: 150,
        render: (apartmentAvgRent, { useMonth, projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRO_CASE_RENT_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${tag}&useMonth=${moment(new Date(useMonth)).format(
                  'YYYY-MM-01'
                )}&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=3&activeTabs=3`
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
        title: '商住案例租金',
        width: 150,
        render: (occopantAvgRent, { useMonth, projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRO_CASE_RENT_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${tag}&useMonth=${moment(new Date(useMonth)).format(
                  'YYYY-MM-01'
                )}&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=3&activeTabs=3`
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
        title: '操作',
        width: 100,
        fixed: 'right',
        render: (_, { projectId }) => (
          <Link
            to={{
              pathname: router.RES_PRO_CASE_RENT_HISTORY,
              search: `projectId=${projectId}&activeTabs=3&cityId=${cityId}&cityName=${cityName}`
            }}
          >
            <span>历史</span>
          </Link>
        ),
        dataIndex: 'projectId'
      }
    ]

    // const caseDatas = [
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

    const { pageNum, pageSize, total } = this.props.model.get('casePagination')
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
        dataSource={this.props.caseDatas}
        // dataSource={caseDatas}
        scroll={{ x: 1600, y: 420 }}
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
)(ProjectRentCase)
