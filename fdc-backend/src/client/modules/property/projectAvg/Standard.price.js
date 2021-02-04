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

import styles from './ProjectAvg.less'

/*
 * 只看标准房价格
 */
class StandardPrice extends Component {
  static propTypes = {
    housePrice: PropTypes.array.isRequired,
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
        width: 212,
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
        title: '' //此处添加一个空列，让此列去自适应一行宽度
      },
      {
        title: '楼盘别名',
        width: 212,
        // dataIndex: 'projectAlias',
        render: ({ projectAlias }) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{projectAlias}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitProjectName}>{projectAlias}</div>
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
        title: '标准房挂牌案例均价',
        width: 150,
        render: (standardHouseAvgPrice, { projectId }) => (
          <Link
            to={{
              pathname: router.RES_PRO_STANDARD_PRICE_DETAIL,
              search: `projectId=${projectId || ''}&useMonth=${
                this.props.useMonth
              }&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=6&activePanel=1`
            }}
          >
            <span>{standardHouseAvgPrice || '——'}</span>
          </Link>
        ),
        dataIndex: 'standardHouseAvgPrice'
      },
      {
        title: '标准房挂牌基准价',
        width: 150,
        render: (standardHouseWeightPrice, { projectId }) => (
          <Link
            to={{
              pathname: router.RES_PRO_STANDARD_PRICE_DETAIL,
              search: `projectId=${projectId || ''}&useMonth=${
                this.props.useMonth
              }&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=6&activePanel=2`
            }}
          >
            <span>{standardHouseWeightPrice || '——'}</span>
          </Link>
        ),
        dataIndex: 'standardHouseWeightPrice'
      },
      {
        title: '标准房评估案例均价',
        width: 150,
        render: (standardHouseEstimateAvgPrice, { projectId }) => (
          <Link
            to={{
              pathname: router.RES_PRO_STANDARD_PRICE_DETAIL,
              search: `projectId=${projectId || ''}&useMonth=${
                this.props.useMonth
              }&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=6&activePanel=3`
            }}
          >
            <span>{standardHouseEstimateAvgPrice || '——'}</span>
          </Link>
        ),
        dataIndex: 'standardHouseEstimateAvgPrice'
      },
      {
        title: '标准房评估基准价',
        width: 150,
        render: (standardHouseEstimateWeightPrice, { projectId }) => (
          <Link
            to={{
              pathname: router.RES_PRO_STANDARD_PRICE_DETAIL,
              search: `projectId=${projectId || ''}&useMonth=${
                this.props.useMonth
              }&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=6&activePanel=4`
            }}
          >
            <span>{standardHouseEstimateWeightPrice || '——'}</span>
          </Link>
        ),
        dataIndex: 'standardHouseEstimateWeightPrice'
      },
      {
        title: '' //此处添加一个空列，让此列去自适应一行宽度
      },
      {
        title: '操作',
        fixed: 'right',
        width: 100,
        render: (_, { projectId }) => (
          <Link
            to={{
              pathname: router.RES_PRO_STANDARD_PRICE_HISTORY,
              search: `projectId=${projectId}&activeTabs=6&cityId=${cityId}&cityName=${cityName}`
            }}
          >
            历史
          </Link>
        ),
        dataIndex: 'projectId'
      }
    ]

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

    // console.log(this.props.housePrice)

    return (
      <Table
        rowKey={(record, index) => index}
        pagination={pagination}
        columns={columns}
        dataSource={this.props.housePrice}
        // dataSource={dataSource}
        scroll={{ x: 1500, y: 420 }}
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
)(StandardPrice)
