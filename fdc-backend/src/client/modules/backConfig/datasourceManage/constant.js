/* 面包屑 */
export const breadList = [
  {
    key: 1,
    path: '',
    name: '后台配置',
    icon: 'home'
  },
  {
    key: 2,
    path: '',
    name: '数据来源管理',
    icon: ''
  }
]

export const columns = [
  {
    title: '物业类型',
    dataIndex: 'propertyType',
    width: 120,
    render: propertyType => propertyType || '住宅'
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    width: 100
  },
  {
    title: '产品',
    dataIndex: 'productName',
    width: 150
  },
  {
    title: '机构',
    dataIndex: 'companyName',
    width: 150
  },
  {
    title: '业务',
    dataIndex: 'businessName',
    width: 150
  }
]
