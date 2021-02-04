const config = [
  {
    name: '工作台',
    key: 'home',
    path: '/home',
    showMenu: true,
    resCode: 'fdc:xxx'
  },
  {
    name: '数据审核',
    key: 'check',
    path: '/check',
    showMenu: true,
    resCode: 'fdc:dc',
    children: [
      {
        name: '反馈中心',
        key: 'feedback',
        path: '/check/feedback',
        icon: 'home',
        resCode: 'fdc:dc:feedbackCenter',
        children: [
          {
            name: '楼盘',
            key: 'house',
            path: '/check/feedback/house',
            resCode: 'fdc:dc:feedbackCenter:sale'
            // icon: 'appstore'
          },
          {
            name: '楼盘价格',
            key: 'housePvg',
            path: '/check/feedback/house-pvg',
            resCode: 'fdc:dc:feedbackCenter:saleAvgPrice'
            // icon: 'export'
          }
        ]
      }
      // {
      //   name: 'DC',
      //   key: 'audit',
      //   path: '/check/audit',
      //   icon: 'home',
      //   children: [
      //     {
      //       name: '楼盘',
      //       key: 'floor',
      //       path: '/check/audit/floor',
      //       icon: 'deployment-unit'
      //     },
      //     {
      //       name: '楼栋',
      //       key: 'building',
      //       path: '/check/audit/building',
      //       icon: 'gold'
      //     },
      //     {
      //       name: '房号',
      //       key: 'number',
      //       path: '/check/audit/number',
      //       icon: 'home'
      //     }
      //   ]
      // }
    ]
  },
  {
    name: '房产数据',
    key: 'property',
    path: '/property',
    showMenu: true,
    resCode: 'fdc:hd',
    children: [
      {
        name: '住宅',
        key: 'res',
        path: '/property/res',
        icon: 'home',
        resCode: 'fdc:hd:residence',
        children: [
          {
            name: '住宅基础数据',
            key: 'baseInfo',
            path: '/property/res/base-info',
            resCode: 'fdc:hd:residence:base'
          },
          {
            name: '住宅案例数据',
            key: 'caseList',
            path: '/property/res/case-info',
            resCode: 'fdc:hd:residence:case'
          },
          {
            name: '住宅样本案例',
            key: 'sampleCaseList',
            path: '/property/res/sample-case-info',
            resCode: 'fdc:hd:residence:sampleCase'
          },
          {
            name: '住宅样本楼盘',
            key: 'sampleCaseHouse',
            path: '/property/res/sample-case-house',
            resCode: 'fdc:hd:residence:sampleSale'
          },
          {
            name: '住宅租金案例',
            key: 'rentCaseList',
            path: '/property/res/rent-case-info',
            resCode: 'fdc:hd:residence:rental'
          },
          {
            name: '住宅法拍案例',
            key: 'caseLosure',
            path: '/property/res/losure-case-info',
            resCode: 'fdc:hd:residence:foreclosureCase'
          },
          {
            name: '相关楼盘名称',
            key: 'projectName',
            path: '/property/res/pro-name',
            resCode: 'fdc:hd:residence:saleName'
          },
          {
            name: '相关楼盘地址',
            key: 'projectAddr',
            path: '/property/res/pro-addr',
            resCode: 'fdc:hd:residence:saleAddress'
          },
          {
            name: '楼盘价格',
            key: 'projectAvg',
            path: '/property/res/project-avg',
            resCode: 'fdc:hd:residence:average'
          },
          {
            name: '楼盘租金',
            key: 'projectRent',
            path: '/property/res/project-rent',
            resCode: 'fdc:hd:residence:saleRent'
            // path: '/property/res/project-rent',
            // resCode: 'fdc:hd:residence:saleRent'
          },
          {
            name: '公共配套',
            key: 'public',
            path: '/property/res/public-resource',
            resCode: 'fdc:hd:residence:commonMatch'
          }
        ]
      },
      {
        name: '商业',
        key: 'bus',
        path: '/property/bus',
        icon: 'shopping',
        resCode: 'fdc:hd:bus',
        children: [
          {
            name: '商业基础数据',
            key: 'busInfo',
            path: '/property/bus/bus-info',
            resCode: 'fdc:hd:bus:busInfo'
          }
        ]
      },
      {
        name: '长租公寓',
        key: 'apartment',
        path: '/property/apartment',
        icon: 'appstore',
        resCode: 'fdc:hd:longRental',
        children: [
          {
            name: '案例数据',
            key: 'caseList-apart',
            path: '/property/apartment/case-info',
            resCode: 'fdc:hd:longRental:caseData'
          }
        ]
      },
      {
        name: '导出任务',
        key: 'baseExportTask',
        // path: '/property/export-task?type=1',
        // path: '/property/export-task', // wy change
        path: '/property/export-taskhd',
        icon: 'export',
        resCode: 'fdc:hd:export'
      }
    ]
  },
  // {
  //   name: '审核',
  //   key: 'check',
  //   path: '/check',
  //   children: [
  //     {
  //       name: '审核Test',
  //       key: 'checkTest',
  //       path: '/check/test',
  //       icon: 'file-text'
  //     }
  //   ]
  // },
  {
    name: '数据统计',
    key: 'data',
    path: '/data',
    showMenu: true,
    resCode: 'fdc:ds',
    children: [
      {
        name: '城市均价',
        key: 'cityPvg',
        path: '/data/city-pvg',
        icon: 'appstore',
        resCode: 'fdc:ds:cityAvg'
      },
      {
        name: '价格预警统计',
        key: 'warningStatistics',
        path: '/data/warning-statistics',
        icon: 'alert',
        resCode: 'fdc:ds:warningStatistics'
      },
      {
        name: '成交数据统计',
        key: 'dealStatistics',
        path: '/data/deal-statistics',
        icon: 'transaction',
        resCode: 'fdc:ds:dealStatistics'
      },
      {
        name: '法拍数据统计',
        key: 'foreclosureStatistics',
        path: '/data/losure-statistics',
        icon: 'security-scan',
        resCode: 'fdc:ds:foreclosureStatistics'
      },
      {
        name: '区域租售比',
        key: 'areaRental',
        path: '/data/area-rental',
        icon: 'environment',
        resCode: 'fdc:ds:regionalRental'
      },
      {
        name: '楼盘评级规则',
        key: 'estateRating',
        path: '/data/estate-rating',
        icon: 'bank',
        resCode: 'fdc:ds:ratingRules'
      },
      {
        name: '导出任务',
        key: 'dataExportTask',
        path: '/data/export-taskds',
        // path: '/data/export-task?type=2',
        icon: 'export',
        resCode: 'fdc:ds:export'
      }
    ]
  },
  // {
  //   name: '数据分析',
  //   key: 'analyze',
  //   path: '/analyze'
  // }

  {
    name: '后台配置',
    key: 'backConfig',
    path: '/backConfig',
    showMenu: false,
    resCode: 'fdc:bm',
    children: [
      {
        name: '数据来源管理',
        key: 'datasourceManage',
        path: '/backConfig/datasourceManage',
        icon: 'home',
        resCode: 'fdc:bm:dataAdmin'
      }
    ]
  },
  {
    name: '权限管理',
    key: 'authority',
    path: '/authority',
    showMenu: false,
    resCode: 'fdc:am',
    children: [
      {
        name: '权限管理',
        key: 'center',
        path: '/authority/center',
        showMenu: false,
        icon: 'home',
        resCode: 'fdc:am',
        children: [
          {
            name: '角色管理',
            key: 'roleManage',
            path: '/authority/center/roleManage',
            resCode: 'fdc:am:roleManagement'
          },
          {
            name: '账号管理',
            key: 'accountManage',
            path: '/authority/center/accountManage',
            resCode: 'fdc:am:accountManagement'
          }
        ]
      }
    ]
  }
]

function mapToBreadcrumb(config) {
  let ret = {}
  config.forEach(item => {
    if (item.children) {
      ret = {
        [item.path]: item.name,
        ...ret,
        ...mapToBreadcrumb(item.children)
      }
    } else {
      ret[item.path] = item.name
    }
  })
  return ret
}

const breadcrumbMap = mapToBreadcrumb(config)

export default config
export { breadcrumbMap }
