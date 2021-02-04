import React from 'react'
import router from 'client/router'
import moment from 'moment'
import { Popover } from 'antd'
import styles from './PriceRate.less'
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
    path: router.RES_PRO_PROJECT_AVG,
    name: '楼盘价格'
  },
  {
    key: 3,
    path: '',
    name: '价格比值'
  }
]

// export const breadListDetail = [
//   {
//     key: 1,
//     path: '',
//     name: '住宅',
//     icon: 'home'
//   },
//   {
//     key: 2,
//     path: router.RES_PRO_PROJECT_AVG,
//     name: '楼盘价格'
//   },
//   {
//     key: 3,
//     path: router.RES_PRO_PRICE_RATE,
//     search: `cityId=${cityId}&cityName=${cityName}`,
//     name: '价格比值'
//   },
//   {
//     key: 4,
//     path: '',
//     name: '详情'
//   }
// ]

// 价格比值列表
export const columns = [
  {
    title: '行政区',
    width: 120,
    dataIndex: 'areaName',
    render: areaName => (
      <Popover content={<div style={{ maxWidth: '200px' }}>{areaName}</div>}>
        <div className={styles.limitAreaName}>{areaName}</div>
      </Popover>
    )
  },
  {
    title: '楼盘名称',
    width: 208,
    dataIndex: 'projectName',
    render: projectName => (
      <Popover content={<div style={{ maxWidth: '200px' }}>{projectName}</div>}>
        <div className={styles.limitSampleProjectName}>{projectName}</div>
      </Popover>
    )
  },
  {
    title: '价格比值',
    width: 120,
    dataIndex: 'priceRate',
    render: priceRate => (
      <div>
        {priceRate === null || undefined ? '——' : <div>{priceRate}</div>}
      </div>
    )
  },
  {
    title: '所有房号标准系数平均值',
    // width: 150,
    dataIndex: 'standardRateAvg',
    render: standardRateAvg => (
      <div>
        {standardRateAvg === null || undefined ? (
          '——'
        ) : (
          <div>{standardRateAvg}</div>
        )}
      </div>
    )
  },
  {
    title: '楼盘所有楼层差平均值',
    // width: 150,
    dataIndex: 'floorDiffAvg',
    render: floorDiffAvg => (
      <div>
        {floorDiffAvg === null || undefined ? '——' : <div>{floorDiffAvg}</div>}
      </div>
    )
  },
  {
    title: '城市所有楼层差平均值',
    // width: 150,
    dataIndex: 'cityFloorDiffAvg',
    render: cityFloorDiffAvg => (
      <div>
        {cityFloorDiffAvg === null || undefined ? (
          '——'
        ) : (
          <div>{cityFloorDiffAvg}</div>
        )}
      </div>
    )
  },
  {
    title: '更新时间',
    // width: 150,
    render: date => {
      if (!date) return null
      return moment(date).format('YYYY-MM-DD HH:mm:ss')
    },
    dataIndex: 'modTime'
  }
]
