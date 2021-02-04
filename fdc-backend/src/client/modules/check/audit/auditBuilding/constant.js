import router from 'client/router'
import React, { Fragment } from 'react'

import { Popover } from 'antd'
import styles from './AuditBuilding.less'
/* 面包屑 */
export const breadList = [
  {
    key: 1,
    path: '',
    name: 'DC',
    icon: 'home'
  },
  {
    key: 2,
    path: '',
    name: '楼栋',
    icon: ''
  }
]
/* DC编辑页面的面包屑 */
export const breadEditList = [
  {
    key: 1,
    path: '',
    name: 'DC',
    icon: 'home'
  },
  {
    key: 2,
    path: router.AUDIT_BUILDING,
    name: '楼栋',
    icon: ''
  },
  {
    key: 3,
    path: '',
    name: '楼栋详情',
    icon: ''
  }
]
/* 处理状态 */
export const dealStatusList = [
  {
    value: '1',
    label: '待处理'
  },
  {
    value: '2',
    label: '已处理'
  },
  {
    value: '3',
    label: '暂不处理'
  },
  {
    value: '4',
    label: '垃圾箱'
  }
]

export const tableColumns = [
  {
    title: '处理状态',
    width: 120,
    dataIndex: 'processStateDesc',
    render: processStateDesc => (
      <div className={styles.limitProcessState}>{processStateDesc}</div>
    )
  },
  {
    title: '处理人',
    width: 160,
    dataIndex: 'processUser',
    render: processUser => (
      <div className={styles.limitProcessUser}>{processUser}</div>
    )
  },
  {
    title: '处理时间',
    width: 180,
    dataIndex: 'processDateTime',
    render: processDateTime => (
      <Fragment>
        <div className={styles.limitProcessDateTime}>
          {processDateTime ? processDateTime.split('T').join(' ') : ''}
        </div>
      </Fragment>
    )
  },
  {
    title: '关联楼盘ID',
    width: 180,
    dataIndex: 'fdcProjectId',
    render: (fdcProjectId, { fdcProjectStatus }) => (
      <Fragment>
        <div className={styles.limitFdcProjectId}>
          <div
            className={fdcProjectStatus === 0 ? `${styles.delProject}` : null}
          >
            {fdcProjectId}
          </div>
        </div>
      </Fragment>
    )
  },
  {
    title: '关联楼栋ID',
    width: 180,
    dataIndex: 'fdcBuildingId',
    render: (fdcBuildingId, { fdcBuildingStatus }) => (
      <Fragment>
        <div className={styles.limitFdcBuildingId}>
          <div
            className={fdcBuildingStatus === 0 ? `${styles.delProject}` : null}
          >
            {fdcBuildingId}
          </div>
        </div>
      </Fragment>
    )
  },
  {
    title: '来源方',
    width: 200,
    dataIndex: 'companyName',
    render: companyName => (
      <Popover content={<div style={{ maxWidth: '200px' }}>{companyName}</div>}>
        <div className={styles.limitCompanyName}>{companyName}</div>
      </Popover>
    )
  },
  {
    title: '来源时间',
    width: 150,
    dataIndex: 'crtTime',
    render: crtTime => (
      <Fragment>
        <div className={styles.limitCrtTime}>
          {crtTime ? crtTime.split('T', 1) : ''}
        </div>
      </Fragment>
    )
  },
  {
    title: '城市',
    width: 100,
    dataIndex: 'cityName',
    render: cityName => (
      <Popover content={<div style={{ maxWidth: '200px' }}>{cityName}</div>}>
        <div className={styles.limitCityName}>{cityName}</div>
      </Popover>
    )
  },
  {
    title: '行政区',
    width: 100,
    dataIndex: 'areaName',
    render: areaName => (
      <Popover content={<div style={{ maxWidth: '200px' }}>{areaName}</div>}>
        <div className={styles.limitCityName}>{areaName}</div>
      </Popover>
    )
  },
  {
    title: '楼盘名称',
    width: 188,
    dataIndex: 'projectName',
    render: projectName => (
      <Popover content={<div style={{ maxWidth: '200px' }}>{projectName}</div>}>
        <div className={styles.limitProjectName}>{projectName}</div>
      </Popover>
    )
  },
  {
    title: '楼栋名称',
    width: 150,
    dataIndex: 'buildingName',
    render: buildingName => (
      <Popover
        content={<div style={{ maxWidth: '200px' }}>{buildingName}</div>}
      >
        <div className={styles.limitBuildingName}>{buildingName}</div>
      </Popover>
    )
  }
]
// DC楼栋编辑页表格
export const editColumns = [
  {
    title: '楼栋名称',
    width: 100,
    dataIndex: 'buildingName',
    render: (buildingName, { sysStatus }) => (
      <Popover content={buildingName} trigger="hover">
        <div className={sysStatus ? null : `${styles.delProject}`}>
          <div className={styles.limitbuildingName}>{buildingName}</div>
        </div>
      </Popover>
    )
  },
  {
    title: '楼栋别名',
    width: 180,
    dataIndex: 'buildingAlias',
    render: (buildingAlias, { sysStatus }) => (
      <div className={sysStatus ? null : `${styles.delProject}`}>
        {buildingAlias}
      </div>
    )
  },
  {
    title: '总楼层',
    width: 180,
    dataIndex: 'totalFloorNum',
    render: (totalFloorNum, { sysStatus }) => (
      <div className={sysStatus ? null : `${styles.delProject}`}>
        {totalFloorNum}
      </div>
    )
  },
  {
    title: '建筑类型',
    width: 100,
    dataIndex: 'buildingType',
    render: (buildingType, { sysStatus }) => (
      <div className={sysStatus ? null : `${styles.delProject}`}>
        {buildingType}
      </div>
    )
  },
  {
    title: '建筑年代',
    width: 100,
    dataIndex: 'buildDate',
    render: (buildDate, { sysStatus }) => (
      <div className={sysStatus ? null : `${styles.delProject}`}>
        {buildDate ? buildDate.split('T', 1) : ''}
      </div>
    )
  },
  {
    title: '楼栋系数',
    width: 100,
    dataIndex: 'priceRate',
    render: (priceRate, { sysStatus }) => (
      <div className={sysStatus ? null : `${styles.delProject}`}>
        {priceRate}
      </div>
    )
  },
  {
    title: '总套数',
    width: 100,
    dataIndex: 'totalHouseholdNum',
    render: (totalHouseholdNum, { sysStatus }) => (
      <div className={sysStatus ? null : `${styles.delProject}`}>
        {totalHouseholdNum}
      </div>
    )
  },
  {
    title: '实际用途',
    width: 100,
    dataIndex: 'actualUsage',
    render: (actualUsage, { sysStatus }) => (
      <div className={sysStatus ? null : `${styles.delProject}`}>
        {actualUsage}
      </div>
    )
  }
]
