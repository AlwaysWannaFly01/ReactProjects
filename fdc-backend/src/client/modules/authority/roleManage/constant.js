import router from 'client/router'
/* 面包屑 */
export const breadList = [
  {
    key: 1,
    path: '',
    name: '权限管理',
    icon: 'home'
  },
  {
    key: 2,
    path: '',
    name: '角色管理'
  }
]

/* 面包屑 设置权限 */
export const breadListSet = [
  {
    key: 1,
    path: '',
    name: '权限管理',
    icon: 'home'
  },
  {
    key: 2,
    path: router.AUTHORITY_ROLE_MANAGE,
    name: '角色管理'
  },
  {
    key: 3,
    path: '',
    name: '设置权限'
  }
]

export const column = [
  // {
  //   key: '1',
  //   title: '角色',
  //   dataIndex: 'roleName',
  //   width: 208
  // },
  // {
  //   key: '2',
  //   title: '描述',
  //   dataIndex: 'description',
  //   width: 188
  // },
  {
    key: '3',
    title: '数据权限',
    dataIndex: 'dataPermTypeName',
    width: 259
  }
]
// 数据权限
export const dataAuthorityList = [
  {
    key: 1,
    value: '所有权限'
  },
  {
    key: 2,
    value: '所在公司及以下数据'
  },
  {
    key: 3,
    value: '仅本人数据'
  },
  {
    key: 4,
    value: '无数据权限'
  }
]

export const treeData = [
  {
    title: '0-0',
    key: '0-0',
    children: [
      {
        title: '0-0-0',
        key: '0-0-0',
        children: [
          { title: '0-0-0-0', key: '4' },
          { title: '0-0-0-1', key: '5' },
          { title: '0-0-0-2', key: '6' }
        ]
      },
      {
        title: '0-0-1',
        key: '0-0-1',
        children: [
          { title: '0-0-1-0', key: '7' },
          { title: '0-0-1-1', key: '8' },
          { title: '0-0-1-2', key: '9' }
        ]
      },
      {
        title: '0-0-2',
        key: '0-0-2'
      }
    ]
  },
  {
    title: '0-1',
    key: '0-1',
    children: [
      { title: '0-1-0-0', key: '0-1-0-0' },
      { title: '0-1-0-1', key: '0-1-0-1' },
      { title: '0-1-0-2', key: '0-1-0-2' }
    ]
  },
  {
    title: '0-2',
    key: '0-2'
  }
]

export const arrTest = [
  {
    available: 1,
    children: [
      {
        available: 1,
        children: [
          {
            available: 1,
            disabled: false,
            key: '572511424793538560',
            label: '查看',
            leafFlag: 1,
            pid: '572510918394245120',
            pids: '0,572510742589992960,572510918394245120,',
            resourceId: '572511424793538560',
            resourceName: '查看',
            resourceType: 'Button',
            sortSeq: null,
            status: 0,
            value: '572511424793538560'
          },
          {
            available: 1,
            disabled: false,
            key: '572511610282438656',
            label: '新增',
            leafFlag: 1,
            pid: '572510918394245120',
            pids: '0,572510742589992960,572510918394245120,',
            resourceId: '572511610282438656',
            resourceName: '新增',
            resourceType: 'Button',
            sortSeq: null,
            status: 0,
            value: '572511610282438656'
          }
        ],
        disabled: false,
        key: '572510918394245120',
        label: '城市均价',
        leafFlag: 0,
        pid: '572510742589992960',
        pids: '0,572510742589992960,',
        resourceId: '572510918394245120',
        resourceName: '城市均价',
        resourceType: 'Menu',
        sortSeq: null,
        status: 0,
        value: '572510918394245120'
      },
      {
        available: 1,
        disabled: false,
        key: '576409880244637696',
        label: '导出任务',
        leafFlag: 0,
        pid: '572510742589992960',
        pids: '0,572510742589992960,',
        resourceId: '576409880244637696',
        resourceName: '导出任务',
        resourceType: 'Menu',
        sortSeq: null,
        status: 0,
        value: '576409880244637696'
      }
    ],
    disabled: false,
    key: '572510742589992960',
    label: '数据统计',
    leafFlag: 0,
    pid: '0',
    pids: '0,',
    resourceId: '572510742589992960',
    resourceName: '数据统计',
    resourceType: 'Menu',
    sortSeq: null,
    status: 0,
    value: '572510742589992960'
  },
  {
    available: 1,
    children: [
      {
        available: 1,
        children: [
          {
            available: 1,
            disabled: false,
            key: '575776434958721024',
            label: '查看',
            leafFlag: 1,
            pid: '575776178623832064',
            pids: '0,575776033987452928,575776178623832064,',
            resourceId: '575776434958721024',
            resourceName: '查看',
            resourceType: 'List',
            sortSeq: null,
            status: 0,
            value: '575776434958721024'
          },
          {
            available: 1,
            disabled: false,
            key: '577500469614735360',
            label: '更改配置',
            leafFlag: 1,
            pid: '575776178623832064',
            pids: '0,575776033987452928,575776178623832064,',
            resourceId: '577500469614735360',
            resourceName: '更改配置',
            resourceType: 'Button',
            sortSeq: null,
            status: 0,
            value: '577500469614735360'
          }
        ],
        disabled: false,
        key: '575776178623832064',
        label: '数据来源管理',
        leafFlag: 0,
        pid: '575776033987452928',
        pids: '0,575776033987452928,',
        resourceId: '575776178623832064',
        resourceName: '数据来源管理',
        resourceType: 'Menu',
        sortSeq: null,
        status: 0,
        value: '575776178623832064'
      }
    ],
    disabled: false,
    key: '575776033987452928',
    label: '后台配置',
    leafFlag: 0,
    pid: '0',
    pids: '0,',
    resourceId: '575776033987452928',
    resourceName: '后台配置',
    resourceType: 'Menu',
    sortSeq: null,
    status: 0,
    value: '575776033987452928'
  }
]
