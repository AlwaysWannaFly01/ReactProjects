import React from 'react'
import moment from 'moment'
import { Popover } from 'antd'
import styles from './CaseInfo.less'
/* 面包屑 */
export const breadList = [
  {
    key: 1,
    path: '',
    name: '住宅',
    icon: 'home'
  },
  {
    key: 2,
    path: '',
    name: '样本楼盘列表'
  }
]

// 样本楼盘列表
export const columns = [
  {
    title: '行政区',
    width: 108,
    dataIndex: 'areaName',
    fixed: 'left',
    render: areaName => (
      <Popover content={<div style={{ maxWidth: '200px' }}>{areaName}</div>}>
        <div className={styles.limitAreaName}>{areaName}</div>
      </Popover>
    )
  },
  {
    title: '样本楼盘名称',
    width: 208,
    dataIndex: 'sampleProjectName',
    fixed: 'left',
    render: sampleProjectName => (
      <Popover
        content={<div style={{ maxWidth: '200px' }}>{sampleProjectName}</div>}
      >
        <div className={styles.limitSampleProjectName}>{sampleProjectName}</div>
      </Popover>
    )
  },
  {
    title: '是否活跃楼盘',
    width: 110,
    dataIndex: 'isActive',
    fixed: 'left',
    render: isActive => (isActive === 1 ? '是' : '否')
  },
  {
    title: '上个月挂牌基准价',
    // width: 160,
    dataIndex: 'lastMounthProjectAvgPrice'
  },
  {
    title: '本月挂牌基准价',
    // width: 150,
    dataIndex: 'projectAvgPrice'
  },
  {
    title: '挂牌基准价涨跌幅',
    // width: 150,
    dataIndex: 'projectAvgPriceChg',
    render: projectAvgPriceChg => (
      <div>
        {projectAvgPriceChg === null || undefined ? (
          ' '
        ) : (
          <div>{projectAvgPriceChg}%</div>
        )}
      </div>
    )
  },
  {
    title: '挂牌基准价调差初始值',
    // width: 180,
    dataIndex: 'projectBaseAvgPrice'
  },
  {
    title: '主建筑类型',
    // width: 200,
    dataIndex: 'buildingTypeName'
  },
  {
    title: '竣工日期',
    // width: 150,
    dataIndex: 'deliveryDate',
    render: deliveryDate => {
      const v = deliveryDate ? moment(deliveryDate).format('YYYY-MM-DD') : ''
      return v
    }
  },
  {
    title: '距离',
    // width: 160,
    dataIndex: 'distance',
    render: distance => (
      <div>{distance ? <div>{distance.toFixed(1)}</div> : ''}</div>
    )
  },
  {
    title: '楼盘地址',
    width: 188,
    dataIndex: 'address',
    render: address => (
      <Popover content={<div style={{ maxWidth: '200px' }}>{address}</div>}>
        <div className={styles.limitAddress}>{address}</div>
      </Popover>
    )
  },
  {
    title: '关联时间',
    // width: 150,
    dataIndex: 'lateDate',
    render: lateDate => (lateDate ? moment(lateDate).format('YYYY-MM-DD') : '')
  }
]

// 样本楼盘列表 新增弹窗
export const columnsPop = [
  {
    title: '行政区',
    width: 108,
    dataIndex: 'areaName',
    fixed: 'left',
    render: areaName => (
      <Popover content={<div style={{ maxWidth: '200px' }}>{areaName}</div>}>
        <div className={styles.limitAreaName}>{areaName}</div>
      </Popover>
    )
  },
  {
    title: '样本楼盘名称',
    width: 208,
    dataIndex: 'sampleProjectName',
    fixed: 'left',
    render: sampleProjectName => (
      <Popover
        content={<div style={{ maxWidth: '200px' }}>{sampleProjectName}</div>}
      >
        <div className={styles.limitSampleProjectName}>{sampleProjectName}</div>
      </Popover>
    )
  },
  {
    title: '是否活跃楼盘',
    width: 110,
    dataIndex: 'isActive',
    fixed: 'left',
    render: isActive => (isActive === 1 ? '是' : '否')
  },
  {
    title: '上个月挂牌基准价',
    // width: 160,
    dataIndex: 'lastMounthProjectAvgPrice'
  },
  {
    title: '本月挂牌基准价',
    // width: 160,
    dataIndex: 'projectAvgPrice'
  },
  {
    title: '挂牌基准价涨跌幅',
    // width: 160,
    dataIndex: 'projectAvgPriceChg',
    render: projectAvgPriceChg => (
      <div>
        {projectAvgPriceChg === null || undefined ? (
          ' '
        ) : (
          <div>{projectAvgPriceChg}%</div>
        )}
      </div>
    )
  },
  {
    title: '挂牌基准价调差初始值',
    // width: 160,
    dataIndex: 'projectBaseAvgPrice'
  },
  {
    title: '主建筑类型',
    // width: 160,
    dataIndex: 'buildingTypeName'
  },
  {
    title: '竣工日期',
    // width: 160,
    dataIndex: 'deliveryDate',
    render: deliveryDate => {
      const v = deliveryDate ? moment(deliveryDate).format('YYYY-MM-DD') : ''
      return v
    }
  },
  {
    title: '距离',
    // width: 150,
    dataIndex: 'distance',
    render: distance => (
      <div>{distance ? <div>{distance.toFixed(1)}</div> : ''}</div>
    )
  },
  {
    title: '楼盘地址',
    // width: 160,
    dataIndex: 'address',
    render: address => (
      <Popover content={<div style={{ maxWidth: '200px' }}>{address}</div>}>
        <div className={styles.limitAddress}>{address}</div>
      </Popover>
    )
  }
]
