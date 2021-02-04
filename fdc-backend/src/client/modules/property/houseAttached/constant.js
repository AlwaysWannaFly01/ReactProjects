import React, { Fragment } from 'react'
/* 是否证载 */
export const facilityTypeList = [
  {
    value: '1',
    label: '是'
  },
  {
    value: '0',
    label: '否'
  }
]

/* 附属房屋类型 */
export const attachedOptionList = [
  {
    value: '1',
    label: '地下室'
  },
  {
    value: '2',
    label: '杂物间'
  }
]
// 楼盘附属房屋价格计算方法 表格
export const columns = [
  // {
  //   title: '附属房屋类型',
  //   width: 150,
  //   dataIndex: 'subHouseTypeName'
  // },
  {
    title: '是否证载',
    width: 143,
    dataIndex: 'isOnPropertyName'
  },
  {
    title: '计算方法',
    width: 111,
    dataIndex: 'arithmeticTypeName'
  },
  {
    title: '值',
    width: 87,
    dataIndex: 'arithmeticValue',
    render: (arithmeticValue, { arithmeticTypeName }) => (
      <Fragment>
        {arithmeticTypeName === '折扣值' ? (
          <span>{arithmeticValue}%</span>
        ) : (
          <span>{arithmeticValue}元</span>
        )}
      </Fragment>
    )
  },
  {
    title: '数据权属',
    width: 151,
    dataIndex: 'ownership'
  },
  {
    title: '录入人',
    width: 173,
    dataIndex: 'creator'
  },
  {
    title: '时间',
    width: 130,
    dataIndex: 'crtTime',
    render: crtTime => (crtTime ? crtTime.split('T', 1) : '')
  }
]

/* 计算方法 */
export const calcuMethodList = [
  {
    value: '101',
    label: '一口价'
  },
  {
    value: '102',
    label: '折扣值'
  }
]
