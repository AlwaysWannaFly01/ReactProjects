import router from 'client/router'
import React, { Fragment } from 'react'
import { Popover } from 'antd'
import styles from './AuditFloor.less'
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
    name: '楼盘',
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
    path: router.AUDIT_FLOOR,
    name: '楼盘',
    icon: ''
  },
  {
    key: 3,
    path: '',
    name: '详情',
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
    render: processDateTime => (
      <Fragment>
        <div className={styles.limitProcessDateTime}>
          {processDateTime ? processDateTime.split('T').join(' ') : ''}
        </div>
      </Fragment>
    ),
    dataIndex: 'processDateTime'
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
    title: '楼盘别名',
    width: 108,
    dataIndex: 'projectAlias',
    render: projectAlias => (
      <Popover
        content={<div style={{ maxWidth: '200px' }}>{projectAlias}</div>}
      >
        <div className={styles.limitProjectAlias}>{projectAlias}</div>
      </Popover>
    )
  }
]
// DC楼栋编辑页表格
export const editColumns = [
  {
    title: '行政区',
    width: 100,
    dataIndex: 'areaName',
    render: (areaName, { sysStatus }) => (
      <div className={sysStatus ? null : `${styles.delProject}`}>
        {areaName}
      </div>
    )
  },
  {
    title: '楼盘名称',
    width: 180,
    dataIndex: 'projectName',
    render: (projectName, { sysStatus }) => (
      <div className={sysStatus ? null : `${styles.delProject}`}>
        {projectName}
      </div>
    )
  },
  {
    title: '楼盘别名',
    width: 180,
    dataIndex: 'projectAlias',
    render: (projectAlias, { sysStatus }) => (
      <div className={sysStatus ? null : `${styles.delProject}`}>
        {projectAlias}
      </div>
    )
  },
  {
    title: '楼盘地址',
    width: 100,
    dataIndex: 'address',
    render: (address, { sysStatus }) => (
      <Popover content={address} placement="topLeft">
        <div className={sysStatus ? null : `${styles.delProject}`}>
          <div className={styles.limitAreaName}>{address}</div>
        </div>
      </Popover>
    )
  },
  {
    title: '栋/户',
    width: 100,
    dataIndex: 'totalHouseNum',
    render: (totalHouseNum, { sysStatus, totalBuildingNum }) => (
      <div className={sysStatus ? null : `${styles.delProject}`}>
        {totalBuildingNum}/{totalHouseNum}
      </div>
    )
  }
]
