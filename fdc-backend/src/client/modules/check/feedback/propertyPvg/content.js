import router from 'client/router'
/* 面包屑 */
export const breadList = [
  {
    key: 1,
    path: '',
    name: '反馈中心',
    icon: 'home'
  },
  {
    key: 2,
    path: '',
    name: '楼盘价格',
    icon: ''
  }
]
/* 处理状态 */
export const dealStatusList = [
  {
    value: '2001',
    label: '待回复'
  },
  {
    value: '2002',
    label: '处理中'
  },
  {
    value: '2003',
    label: '已回复'
  },
  {
    value: '2004',
    label: '已完成'
  }
]
/* 产品来源 */
export const productSourceList = [
  {
    value: 1003036,
    label: 'VQWEB'
  },
  {
    value: 1003038,
    label: 'VQAPI'
  },
  {
    value: 1003450,
    label: '反馈中心'
  }
]
export const tableColumns = [
  {
    title: '处理状态',
    width: 100,
    dataIndex: 'dealingState',
    render: dealingState => {
      if (dealingState === 2001) {
        return '待回复'
      } else if (dealingState === 2002) {
        return '处理中'
      } else if (dealingState === 2003) {
        return '已回复'
      } else if (dealingState === 2004) {
        return '已完成'
      }
      return null
    }
  },
  {
    title: '处理人',
    width: 180,
    dataIndex: 'dealingId'
  },
  {
    title: '处理时间',
    width: 180,
    dataIndex: 'dealingTime',
    render: dealingTime => {
      if (dealingTime) {
        return dealingTime.split('.')[0]
      }
      return null
    }
  },
  {
    title: '来源产品',
    width: 100,
    dataIndex: 'sourceProduct',
    render: sourceProduct => {
      const obj = productSourceList.filter(i => i.value === sourceProduct)
      return obj && obj.length ? obj[0].label : null
    }
  },
  {
    title: '来源机构',
    width: 180,
    dataIndex: 'companyName'
  },
  {
    title: '来源时间',
    width: 180,
    dataIndex: 'crtTime',
    render: crtTime => {
      if (crtTime) {
        return crtTime.split('.')[0]
      }
      return null
    }
  },
  {
    title: '所在地区',
    width: 180,
    render: ({ provinceName, cityName, disttrictName }) =>
      `${provinceName}${cityName}${disttrictName}`
  },
  {
    title: '楼盘名称',
    width: 300,
    dataIndex: 'projectName'
  },
  {
    title: '建议价格',
    width: 100,
    dataIndex: 'suggestPrice'
  }
]
/**
 * 回复
 */
export const breadReplyList = [
  {
    key: 1,
    path: '',
    name: '反馈中心',
    icon: 'home'
  },
  {
    key: 2,
    path: router.FEEDBACK_PROPERTY_PVG,
    name: '楼盘价格',
    icon: ''
  },
  {
    key: 3,
    path: '',
    name: '处理',
    icon: ''
  }
]
