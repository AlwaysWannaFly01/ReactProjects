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
 * 案例均价 - 基准房价
 */
class ProjectAvgBase extends Component {
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
        title: '挂牌基准价',
        width: 150,
        render: (
          basePrice,
          { projectId, id, projectBaseAvgPrice, tag = 1 }
        ) => {
          let ratio = 0
          if (projectBaseAvgPrice > 0) {
            ratio = Math.abs(basePrice / projectBaseAvgPrice - 1)
          }
          const style = {}
          if (ratio > 0.15) {
            style.color = 'red'
          }

          return (
            <Link
              to={{
                pathname: router.RES_PRO_HOUSE_PRICE_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${tag}&useMonth=${
                  this.props.useMonth
                }&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=3`
              }}
            >
              {basePrice ? (
                <span style={style}>{basePrice}</span>
              ) : (
                <span>——</span>
              )}
            </Link>
          )
        },
        dataIndex: 'projectAvgPrice'
      },
      {
        title: '涨跌幅',
        width: 150,
        render: percent => percent !== null && percent !== '' && `${percent}%`,
        dataIndex: 'projectGained'
      },
      {
        title: '价格来源',
        width: 150,
        dataIndex: 'projectPriceType'
      },
      // {
      //   title: '调差初始值',
      //   width: 150,
      //   dataIndex: 'projectBaseAvgPrice'
      // },
      {
        title: '低层',
        width: 120,
        dataIndex: 'lowLayerPrice'
      },
      {
        title: '多层',
        width: 120,
        dataIndex: 'multiLayerPrice'
      },
      {
        title: '小高层',
        width: 120,
        dataIndex: 'smallHighLayerPrice'
      },
      {
        title: '高层',
        width: 120,
        dataIndex: 'highLayerPrice'
      },
      {
        title: '超高层',
        width: 120,
        dataIndex: 'superHighLayerPrice'
      },
      {
        title: '操作',
        fixed: 'right',
        width: 100,
        render: (_, { projectId, id }) => (
          <Link
            to={{
              pathname: router.RES_PRO_BASE_PRICE_HISTORY,
              search: `projectId=${projectId}&activeTabs=2&weightId=${id}&cityId=${cityId}&cityName=${cityName}`
            }}
          >
            历史
          </Link>
        ),
        dataIndex: 'projectId'
      }
    ]

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

    // console.log(this.props.baseDatas)

    return (
      <Table
        rowKey={(record, index) => index}
        pagination={pagination}
        columns={columns}
        dataSource={this.props.baseDatas}
        scroll={{ x: 2000, y: 420 }}
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
)(ProjectAvgBase)
