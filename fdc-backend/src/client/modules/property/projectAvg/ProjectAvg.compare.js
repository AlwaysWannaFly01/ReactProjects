import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Table, Popover,List } from 'antd'
import moment from 'moment'
import { Link } from 'react-router-dom'

import showTotal from 'client/utils/showTotal'
import router from 'client/router'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ProjectAvg.less'

/*
 * 案例均价 - 看对比
 */
class ProjectAvgCompare extends Component {
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
        width: 119,
        fixed: 'left',
        // dataIndex: 'areaName'
        render: ({ areaName }) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{areaName}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitAreaName}>{areaName}</div>
          </Popover>
        )
      },
      {
        title: '楼盘名称',
        width: 249,
        fixed: 'left',
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
        width: 221,
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
        render: (_, { userMonth }) => {
          if (userMonth) {
            return moment(userMonth).format('YYYY-MM')
          }
          return moment(this.props.useMonth).format('YYYY-MM')
        },
        dataIndex: 'userMonth'
      },
      {
        title: '挂牌基准价修改时间',
        width: 180,
        dataIndex: 'projectWeightUpdateTime',
        render: (_, { projectWeightUpdateTime }) => {
          if (projectWeightUpdateTime) {
            return moment(projectWeightUpdateTime).format('YYYY-MM-DD')
          }
        }
      },
      {
        title: '挂牌案例均价',
        width: 120,
        render: (avgPrice, { projectId, avgId, tag = 1 }) => (
          <Link
            to={{
              pathname: router.RES_PRO_CASE_PRICE_DETAIL,
              search: `projectId=${projectId}&avgId=${avgId ||
                ''}&tag=${tag}&useMonth=${
                this.props.useMonth
              }&entry=1&cityId=${cityId}&cityName=${cityName}&compare=1`
            }}
          >
            <span>{avgPrice || '——'}</span>
          </Link>
        ),
        dataIndex: 'avgPrice'
      },
      {
        title: '挂牌基准价',
        width: 120,
        render: (weightAvgPrice, { projectId, weightId, tag = 1 }) => (
          <Link
            to={{
              pathname: router.RES_PRO_HOUSE_PRICE_DETAIL,
              search: `projectId=${projectId || ''}&weightId=${weightId ||
                ''}&tag=${tag}&useMonth=${
                this.props.useMonth
              }&entry=1&cityId=${cityId}&cityName=${cityName}&compare=1`
            }}
          >
            <span>{weightAvgPrice || '——'}</span>
          </Link>
        ),
        dataIndex: 'weightAvgPrice'
      },
      {
        title: '模糊估价',
        width: 120,
        dataIndex: 'vaguePrice'
      },
      {
        title: '评估案例均价',
        width: 120,
        render: (estimateAvgPrice, { projectId }) => (
          <Link
            to={{
              pathname: router.RES_PRO_ESTIMATE_CASE_DETAIL,
              search: `projectId=${projectId || ''}&useMonth=${
                this.props.useMonth
              }&entry=3&cityId=${cityId}&cityName=${cityName}&compare=1`
            }}
          >
            <span>{estimateAvgPrice || '——'}</span>
          </Link>
        ),
        dataIndex: 'estimateAvgPrice'
      },
      {
        title: '评估基准价',
        width: 120,
        render: (estimateWeightAvgPrice, { projectId }) => (
          <Link
            to={{
              pathname: router.RES_PRO_ESTIMATE_BASE_DETAIL,
              search: `projectId=${projectId || ''}&useMonth=${
                this.props.useMonth
              }&entry=1&cityId=${cityId}&cityName=${cityName}&compare=1`
            }}
          >
            <span>{estimateWeightAvgPrice || '——'}</span>
          </Link>
        ),
        dataIndex: 'estimateWeightAvgPrice'
      },
      {
        title: '标准房挂牌价',
        width: 120,
        render: (standardHouseAvgPrice, { projectId, standardAvgFlag }) => (
          <Link
            to={{
              pathname: router.RES_PRO_STANDARD_PRICE_DETAIL,
              search: `projectId=${projectId || ''}&useMonth=${
                this.props.useMonth
              }&entry=1&cityId=${cityId}&cityName=${cityName}&compare=1&activePanel=${
                standardAvgFlag === true ? 2 : 1
              }`
            }}
          >
            <span>{standardHouseAvgPrice || '——'}</span>
          </Link>
        ),
        dataIndex: 'standardHouseAvgPrice'
      },
      {
        title: '标准房评估价',
        width: 120,
        render: (
          standardHouseEstimateAvgPrice,
          { projectId, standardWeightFlag }
        ) => (
          <Link
            to={{
              pathname: router.RES_PRO_STANDARD_PRICE_DETAIL,
              search: `projectId=${projectId || ''}&useMonth=${
                this.props.useMonth
              }&entry=1&cityId=${cityId}&cityName=${cityName}&compare=1&activePanel=${
                standardWeightFlag === true ? 4 : 3
              }`
            }}
          >
            <span>{standardHouseEstimateAvgPrice || '——'}</span>
          </Link>
        ),
        dataIndex: 'standardHouseEstimateAvgPrice'
      },
      {
        title: '预警（对比挂牌案例均价）',
        width: 200,
        render: (
          _,
          { earlyWarningA,earlyWarningAColor}
        ) => {
          let color = ''
          switch (earlyWarningAColor) {
            case 0:
              color = 'rgba(0, 0, 0, 0.65)'
              break
            case 1:
              color = '#FF9900'
              break
            case 2:
              color = '#FF0000'
              break
          }
          return (
            <span style={{color: color}}>{(earlyWarningA||earlyWarningA===0)?earlyWarningA:''}</span>
          )
        },
        dataIndex: 'earlyWarningA'
      },
      {
        title: '预警（对比评估案例均价）',
        width: 200,
        render: (
          _,
          { earlyWarningB,earlyWarningBColor}
        ) => {
          let color = ''
          switch (earlyWarningBColor) {
            case 0:
              color = 'rgba(0, 0, 0, 0.65)'
              break
            case 1:
              color = '#FF9900'
              break
            case 2:
              color = '#FF0000'
              break
          }
          return (
            <span style={{color: color}}>{(earlyWarningB||earlyWarningB===0)? earlyWarningB:''}</span>
          )
        },
        dataIndex: 'earlyWarningB'
      },
      {
        title: '预警（对比网络参考价）',
        width: 200,
        render: (
          _,
          {earlyWarningC,earlyWarningCColor}
        ) => {
          let color = ''
          switch (earlyWarningCColor) {
            case 0:
              color = 'rgba(0, 0, 0, 0.65)'
              break
            case 1:
              color = '#FF9900'
              break
            case 2:
              color = '#FF0000'
              break
          }
          return (
            <span style={{color: color}}>{(earlyWarningC||earlyWarningC===0)?earlyWarningC:''}</span>
          )
        },
        dataIndex: 'earlyWarningC'
      },
      
      
      
      {
        title: '挂牌案例参考',
        width: 210,
        render: (
          _,
          { caseCount, projectReferencePrice }
        ) => {
          // 参考
          let content = ''
          if (projectReferencePrice) {
            content = `${caseCount || 0}(${projectReferencePrice})`
          }
          return (
            <div>
              <span>{content}</span>
            </div>
          )
        }
      },
      {
        title: '评估案例参考',
        width: 210,
        render: (
          _,
          { estimateCaseCount, estimateReferencePrice }
        ) => {
          // 参考
          let content = ''
          if (estimateReferencePrice) {
            content = `${estimateCaseCount || 0}(${estimateReferencePrice})`
          }
          return (
            <div>
              <span>{content}</span>
            </div>
          )
        }
      },
      {
        title: '评估基案幅度',
        width: 120,
        render: percent => percent !== null && percent !== '' && `${percent}%`,
        dataIndex: 'estimateRangePercent'
      },
      {
        title: '挂牌评估幅度',
        width: 120,
        render: percent => percent !== null && percent !== '' && `${percent}%`,
        dataIndex: 'priceRangePercent'
      },
      {
        title: '网络参考价',
        // width: 224,
        width: 800,
        // dataIndex: 'sourceSite'
        render: ({ sourceSite }) =>{
          let list = []
          if(sourceSite){
            list = sourceSite.split('；')
            if(sourceSite.lastIndexOf('；')!==-1){
              sourceSite = sourceSite.substring(0, sourceSite.lastIndexOf('；'))
            }
          }
          return(
                <Popover
                  content={
                    <div style={{ maxWidth: '200px',maxHeight:'400px',overflowY:'auto'}}>
                    <List
                      itemLayout="horizontal"
                      dataSource={list}
                      renderItem={(item,index) =>{
                        return(
                          <List.Item>
                            <List.Item.Meta
                              description={item}
                            />
                          </List.Item>
                        )
                      }
                        }
                    />
                  </div>
                  }
                  title={false}
                  placement="topLeft"
                >
                  <div className={styles.limitSourceSite}>{sourceSite}</div>
                </Popover>
          )
        }
      },
      {
        title: '挂牌基准价修改人',
        width: 134,
        dataIndex: 'projectWeightModifier'
      }
    ]

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
        scroll={{ x: 2000, y: 420 }}
        // scroll={{ x: 3500, y: 420 }}
        dataSource={this.props.compareDatas}
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
)(ProjectAvgCompare)
