import React from 'react'
// import router from 'client/router'
import { Popover } from 'antd'
import moment from 'moment'
import styles from './ProjectSet.less'

export const setList = [
  {
    value: 1,
    label: '按照片区划分'
  },
  {
    value: 2,
    label: '按照行政区划分'
  }
]

export const usageList = [
  {
    value: 1,
    label: '住宅类'
  },
  {
    value: 2,
    label: '公寓商住类'
  },
  {
    value: 3,
    label: '别墅类'
  },
  {
    value: 4,
    label: '其它类'
  },
]

// 集合楼盘详情列表
export const columns = [
  {
    title: '楼盘名称',
    width: 200,
    dataIndex: 'projectName',
    render: projectName => (
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
    title: '行政区',
    width: 160,
    dataIndex: 'areaName',
    render: areaName => (
      <Popover content={<div style={{ maxWidth: '200px' }}>{areaName}</div>}>
        <div className={styles.limitAreaName}>{areaName}</div>
      </Popover>
    )
  },
  {
    title: '片区',
    width: 160,
    dataIndex: 'subAreaName',
    render: subAreaName => (
      <Popover content={<div style={{ maxWidth: '200px' }}>{subAreaName}</div>}>
        <div className={styles.limitAreaName}>{subAreaName}</div>
      </Popover>
    )
  },
  {
    title: '主用途',
    width: 120,
    dataIndex: 'usageCodeName'
  },
  {
    title: '竣工日期',
    width: 160,
    dataIndex: 'deliveryDate',
    render: deliveryDate => {
      const v = deliveryDate ? moment(deliveryDate).format('YYYY-MM-DD') : ''
      return v
    }
  },
  {
    title: '价格',
    width: 100,
    dataIndex: 'projectPrice'
  }
]

export const timeExplain = (
  <div>
    <span>1）区间左右的值，统一为“包含”；</span>
    <span>
      2）只填左边，来表示区间是 [a，＋∞）；只填右边，来表示区间是（－∞，a]。
    </span>
  </div>
)
