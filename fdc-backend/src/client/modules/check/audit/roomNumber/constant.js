import router from 'client/router'
import React, { Fragment } from 'react'
import { Popover } from 'antd'
import styles from './RoomNumber.less'
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
    name: '房号',
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
    path: router.AUDIT_NUMBER,
    name: '房号',
    icon: ''
  },
  {
    key: 3,
    path: '',
    name: '房号详情',
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
    dataIndex: 'processStateDesc'
  },
  {
    title: '处理人',
    width: 180,
    dataIndex: 'processUser'
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
    width: 150,
    dataIndex: 'fdcProjectId',
    render: (fdcProjectId, { fdcProjectStatus }) => (
      <Fragment>
        <div className={fdcProjectStatus ? null : `${styles.delProject}`}>
          {fdcProjectId}
        </div>
      </Fragment>
    )
  },
  {
    title: '关联楼栋ID',
    width: 150,
    dataIndex: 'fdcBuildingId',
    render: (fdcBuildingId, { fdcBuildingStatus }) => (
      <Fragment>
        <div className={fdcBuildingStatus ? null : `${styles.delProject}`}>
          {fdcBuildingId}
        </div>
      </Fragment>
    )
  },
  {
    title: '关联单元室号',
    width: 175,
    dataIndex: 'fdcRoomNum',
    render: (fdcRoomNum, { fdcUnitNo }) => (
      <Fragment>
        <div>
          {fdcUnitNo}
          {fdcRoomNum}
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
    width: 200,
    dataIndex: 'projectName',
    render: projectName => (
      <Popover content={<div style={{ maxWidth: '200px' }}>{projectName}</div>}>
        <div className={styles.limitProjectName}>{projectName}</div>
      </Popover>
    )
  },
  {
    title: '楼栋名称',
    width: 200,
    dataIndex: 'buildingName',
    render: buildingName => (
      <Popover
        content={<div style={{ maxWidth: '200px' }}>{buildingName}</div>}
      >
        <div className={styles.limitBuildingName}>{buildingName}</div>
      </Popover>
    )
  },
  {
    title: '单元室号',
    width: 130,
    dataIndex: 'roomNum',
    render: (roomNum, { unitNo }) => (
      <Fragment>
        <Popover
          content={
            <div style={{ maxWidth: '200px' }}>{`${unitNo}${roomNum}`}</div>
          }
        >
          <div className={styles.limitUnitNo}>
            {unitNo}
            {roomNum}
          </div>
        </Popover>
      </Fragment>
    )
  }
]
// DC楼栋编辑页表格
export const editColumns = [
  {
    title: '单元室号',
    width: 100,
    dataIndex: 'unitRoom'
  },
  {
    title: '房号最高楼层',
    width: 180,
    dataIndex: 'houseMaxFloor'
  },
  {
    title: '单元室号总楼层',
    width: 180,
    dataIndex: 'totalFloor'
  },
  {
    title: '房号总数',
    width: 100,
    dataIndex: 'totalHouse'
  }
]
// DC房号弹窗表格  与之关联
export const popupColumns = [
  {
    title: '所在楼层',
    width: 120,
    dataIndex: 'floorNo'
  },
  {
    title: 'DC',
    width: 150,
    dataIndex: 'houseName'
  },
  {
    title: 'FDC',
    width: 150,
    dataIndex: 'fdcHouseName'
  }
]

export const columnsDetail = [
  {
    title: '房号名称',
    width: 130,
    dataIndex: 'houseName',
    key: 'houseName',
    fixed: 'left',
    render: houseName => (
      <Popover content={houseName}>
        <div className={styles.limitTaskName}>{houseName}</div>
      </Popover>
    )
  },
  {
    title: '物理层',
    width: 100,
    dataIndex: 'floorNo',
    key: 'floorNo'
  },
  {
    title: '实际层',
    dataIndex: 'actualFloor',
    key: '1',
    width: 150
  },
  {
    title: '用途',
    dataIndex: 'usage',
    key: '2',
    width: 150
  },
  {
    title: '建筑面积',
    dataIndex: 'houseArea',
    key: '3',
    width: 150
  },
  {
    title: '户型',
    dataIndex: 'houseType',
    key: '4',
    width: 150
  },
  {
    title: '朝向',
    dataIndex: 'orientation',
    key: '5',
    width: 150
  },
  {
    title: '景观',
    dataIndex: 'sight',
    key: '6',
    width: 150
  },
  {
    title: '装修',
    dataIndex: 'decoration',
    key: '7',
    width: 150
  },
  {
    title: '通风采光',
    dataIndex: 'ventLight',
    key: '8',
    width: 150
  },
  {
    title: '价格系数',
    dataIndex: 'priceRate',
    key: '9',
    width: 150
  },
  {
    title: '户型结构',
    dataIndex: 'structure',
    key: '10',
    width: 150
  },
  {
    title: '单价',
    dataIndex: 'unitprice',
    key: '11',
    width: 150
  },
  {
    title: '总价',
    dataIndex: 'totalPrice',
    key: '12',
    width: 150
  },
  {
    title: '是否可估',
    dataIndex: 'isAbleEvaluated',
    render: isAbleEvaluated => <div>{isAbleEvaluated === 1 ? '是' : '否'}</div>,
    key: '13',
    width: 150
  },
  {
    title: '面积确认',
    dataIndex: 'isAreaConfirmed',
    render: isAreaConfirmed => <div>{isAreaConfirmed === 1 ? '是' : '否'}</div>,
    key: '14',
    width: 150
  },
  {
    title: '套内面积',
    dataIndex: 'houseInternalArea',
    key: '15',
    width: 150
  },
  {
    title: '附属房屋类型',
    dataIndex: 'subHouse',
    key: '16',
    width: 150
  },
  {
    title: '附属房屋面积',
    dataIndex: 'subHouseArea',
    key: '17',
    width: 150
  },
  {
    title: '有无厨房',
    dataIndex: 'isWithKitchen',
    render: isWithKitchen => <div>{isWithKitchen === 1 ? '是' : '否'}</div>,
    key: '18',
    width: 150
  },
  {
    title: '阳台数',
    dataIndex: 'balconyNum',
    key: '19',
    width: 150
  },
  {
    title: '洗手间数',
    dataIndex: 'washroomNum',
    key: '20',
    width: 150
  },
  {
    title: '噪音情况',
    dataIndex: 'noise',
    key: '21',
    width: 150
  }
]
