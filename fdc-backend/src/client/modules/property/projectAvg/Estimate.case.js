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
 * 只看评估案例均价 --estimate
 */
class ProjectAvgBase extends Component {
  static propTypes = {
    caseEstimate: PropTypes.array.isRequired,
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
        title: '评估案例均价',
        width: 150,
        render: (projectAvgPrice, { projectId, useMonth, id, tag = 1 }) => (
          <Link
            to={{
              pathname: router.RES_PRO_ESTIMATE_CASE_DETAIL,
              search: `projectId=${projectId || ''}&weightId=${id ||
                ''}&tag=${tag}&useMonth=${moment(useMonth).format(
                'YYYY-MM'
              )}&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=4`
            }}
          >
            <span>{projectAvgPrice || '——'}</span>
          </Link>
        ),
        dataIndex: 'projectAvgPrice'
      },
      {
        title: '涨跌幅',
        width: 150,
        render: percent => percent !== null && percent !== '' && `${percent}%`,
        dataIndex: 'projectGained'
      },
      {
        title: '参考',
        width: 210,
        render: (
          _,
          { caseCount, estimateReferencePrice }
        ) => {
          // 参考
          let content = ''
          if (estimateReferencePrice) {
            content = `${caseCount || 0}(${estimateReferencePrice})`
          }
          return (
            <div>
              <span>{content}</span>
            </div>
          )
        }
      },
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
              pathname: router.RES_PRO_ESTIMATE_CASE_HISTORY,
              search: `projectId=${projectId}&activeTabs=4&weightId=${id}&cityId=${cityId}&cityName=${cityName}`
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

    // console.log(this.props.caseEstimate)

    return (
      <Table
        rowKey={(record, index) => index}
        pagination={pagination}
        columns={columns}
        dataSource={this.props.caseEstimate}
        // dataSource={dataSource}
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
)(ProjectAvgBase)
