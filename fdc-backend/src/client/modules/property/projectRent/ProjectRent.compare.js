import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Table, Popover } from 'antd'
import moment from 'moment'
import { Link } from 'react-router-dom'

import showTotal from 'client/utils/showTotal'
import router from 'client/router'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ProjectRent.less'

/*
 * 楼盘租金 - 只看对比
 */
class ProjectRentCompare extends Component {
  static propTypes = {
    compareDatas: PropTypes.array.isRequired,
    onSearch: PropTypes.func.isRequired,
    useMonth: PropTypes.string,
    cityId: PropTypes.string,
    cityName: PropTypes.string
  }

  render() {
    const { cityId, cityName } = this.props
    /* eslint-disable */
    const columns = [
      {
        title: '行政区',
        width: 120,
        // dataIndex: 'areaName'
        render: ({ areaName }) => (
          <Popover
            content={<div style={{ maxWidth: '120px' }}>{areaName}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitAreaName}>{areaName}</div>
          </Popover>
        )
      },
      {
        title: '楼盘名称',
        width: 200,
        // dataIndex: 'projectName',
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
        width: 200,
        // dataIndex: 'aliasName'
        render: ({ aliasName }) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{aliasName}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitProjectAlias}>{aliasName}</div>
          </Popover>
        )
      },
      {
        title: '估价月份',
        width: 118,
        render: (_, { useMonth }) => {
          if (useMonth) {
            return moment(useMonth).format('YYYY-MM')
          }
          return moment(this.props.useMonth).format('YYYY-MM')
        },
        dataIndex: 'useMonth'
      },
      {
        title: '住宅案例租金',
        width: 120,
        render: (
          houseCaseRent,
          { useMonth, projectId, baseRentId, tag = 1 }
        ) => (
          <Link
            to={{
              pathname: router.RES_PRO_CASE_RENT_DETAIL,
              search: `projectId=${projectId || ''}&weightId=${baseRentId ||
                ''}&tag=${tag}&useMonth=${moment(new Date(useMonth))
                .subtract(1, 'months')
                .format(
                  'YYYY-MM-01'
                )}&entry=1&cityId=${cityId}&cityName=${cityName}&compare=1&activeTabs=1`
            }}
          >
            <span>{houseCaseRent || '——'}</span>
          </Link>
        ),
        dataIndex: 'houseCaseRent'
      },
      {
        title: '住宅基准租金',
        width: 120,
        render: (houseBaseRent, { projectId, baseRentId, tag = 1 }) => (
          <Link
            to={{
              pathname: router.RES_PRO_HOUSE_RENT_DETAIL,
              search: `projectId=${projectId || ''}&weightId=${baseRentId ||
                ''}&tag=${tag}&useMonth=${
                this.props.useMonth
              }&entry=1&cityId=${cityId}&cityName=${cityName}&compare=1&activeTabs=1`
            }}
          >
            <span>{houseBaseRent || '——'}</span>
          </Link>
        ),
        dataIndex: 'houseBaseRent'
      },
      {
        title: '公寓案例租金',
        width: 130,
        render: (
          apartmentCaseRent,
          { useMonth, projectId, baseRentId, tag = 1 }
        ) => (
          <Link
            to={{
              pathname: router.RES_PRO_CASE_RENT_DETAIL,
              search: `projectId=${projectId || ''}&weightId=${baseRentId ||
                ''}&tag=${tag}&useMonth=${moment(new Date(useMonth))
                .subtract(1, 'months')
                .format(
                  'YYYY-MM-01'
                )}&entry=1&cityId=${cityId}&cityName=${cityName}&compare=1&activeTabs=1`
            }}
          >
            <span>{apartmentCaseRent || '——'}</span>
          </Link>
        ),
        dataIndex: 'apartmentCaseRent'
      },
      {
        title: '公寓基准租金',
        width: 130,
        render: (apartmentBaseRent, { projectId, caseRentId, tag = 1 }) => (
          <Link
            to={{
              pathname: router.RES_PRO_HOUSE_RENT_DETAIL,
              search: `projectId=${projectId}&avgId=${caseRentId ||
                ''}&tag=${tag}&useMonth=${
                this.props.useMonth
              }&entry=1&cityId=${cityId}&cityName=${cityName}&compare=1&activeTabs=1`
            }}
          >
            <span>{apartmentBaseRent || '——'}</span>
          </Link>
        ),
        dataIndex: 'apartmentBaseRent'
      },
      {
        title: '商住案例租金',
        width: 130,
        render: (
          occopantCaseRent,
          { useMonth, projectId, caseRentId, tag = 1 }
        ) => (
          <Link
            to={{
              pathname: router.RES_PRO_CASE_RENT_DETAIL,
              search: `projectId=${projectId}&avgId=${caseRentId ||
                ''}&tag=${tag}&useMonth=${moment(new Date(useMonth))
                .subtract(1, 'months')
                .format(
                  'YYYY-MM-01'
                )}&entry=1&cityId=${cityId}&cityName=${cityName}&compare=1&activeTabs=1`
            }}
          >
            <span>{occopantCaseRent || '——'}</span>
          </Link>
        ),
        dataIndex: 'occopantCaseRent'
      },
      {
        title: '商住基准租金',
        width: 130,
        render: (occopantBaseRent, { projectId, caseRentId, tag = 1 }) => (
          <Link
            to={{
              pathname: router.RES_PRO_HOUSE_RENT_DETAIL,
              search: `projectId=${projectId}&avgId=${caseRentId ||
                ''}&tag=${tag}&useMonth=${
                this.props.useMonth
              }&entry=1&cityId=${cityId}&cityName=${cityName}&compare=1&activeTabs=1`
            }}
          >
            <span>{occopantBaseRent || '——'}</span>
          </Link>
        ),
        dataIndex: 'occopantBaseRent'
      }
    ]

    // const compareDatas = [
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

    const { pageNum, pageSize, total } = this.props.model.get('comPagination')
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
        scroll={{ y: 420 }}
        dataSource={this.props.compareDatas}
        // dataSource={compareDatas}
        className={styles.defineTable}
      />
    )
  }
}

export default compose(
  connect(
    modelSelector,
    containerActions
  )
)(ProjectRentCompare)
