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
 * 案例均价 - 案例均价
 */
class ProjectAvgCase extends Component {
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
        width: 212,
        // dataIndex: 'projectName',
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
        // dataIndex: 'alias',
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
        title: '挂牌案例均价',
        width: 150,
        render: (caseAvgPrice, { projectId, id, tag }) => (
          <Link
            to={{
              pathname: router.RES_PRO_CASE_PRICE_DETAIL,
              search: `projectId=${projectId}&avgId=${id ||
                ''}&tag=${tag}&useMonth=${
                this.props.useMonth
              }&entry=1&cityId=${cityId}&cityName=${cityName}&areaIds=${areaIds}&keyword=${keyword}&compare=2`
            }}
          >
            <span>{caseAvgPrice || '——'}</span>
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
        title: '只反调差的案例均价',
        width: 160,
        render: ({ inverseDiffCaseCount, inverseDiffAvgPrice }) => {
          let content = ''
          if (
            inverseDiffAvgPrice !== undefined &&
            inverseDiffAvgPrice !== null
          ) {
            content = `${inverseDiffCaseCount || 0}(${inverseDiffAvgPrice})`
          }
          return <span>{content}</span>
        }
        // dataIndex: 'inverseDiffAvgPrice'
      },
      {
        title: '参考',
        width: 150,
        // dataIndex: 'projectReferencePrice',
        render: ({ caseCount, projectReferencePrice }) => {
          let content = ''
          if (
            projectReferencePrice !== undefined &&
            projectReferencePrice !== null
          ) {
            content = `${caseCount || 0}(${projectReferencePrice})`
          }
          return <span>{content}</span>
        }
      },
      {
        title: '确认价格',
        width: 120,
        // dataIndex: 'isConfirmValue',
        render: ({ isConfirmValue }) => {
          return <span>{{ '1': '是', '0': '否' }[isConfirmValue]}</span>
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
        render: (_, { projectId }) => (
          <Link
            to={{
              pathname: router.RES_PRO_CASE_PRICE_HISTORY,
              search: `projectId=${projectId}&activeTabs=3&cityId=${cityId}&cityName=${cityName}`
            }}
          >
            <span>历史</span>
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

    return (
      <Table
        rowKey={(record, index) => index}
        pagination={pagination}
        columns={columns}
        dataSource={this.props.caseDatas}
        scroll={{ x: 2200, y: 420 }}
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
)(ProjectAvgCase)
