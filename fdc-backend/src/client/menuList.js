/**
 * @description FDC 菜单结构与用户中心对接
 */

/* eslint-disable */
const menuList = [
  {
    resourceName: '工作台',
    resourceType: 'Menu',
    resourceCode: 'home',
    routePath: '/home'
  },
  {
    resourceName: '房产数据',
    resourceType: 'Menu',
    resourceCode: 'property',
    routePath: '/property',
    children: [
      {
        resourceName: '住宅',
        resourceType: 'Menu',
        resourceCode: 'res',
        routePath: '/property/res',
        children: [
          {
            resourceName: '住宅基础数据',
            resourceType: 'Menu',
            resourceCode: 'baseInfo',
            routePath: '/property/res/base-info',
            children: [
              {
                resourceName: '查询',
                resourceType: 'Button',
                resourceCode: 'baseInfo-Seach'
              },
              {
                resourceName: '新增',
                resourceType: 'Button',
                resourceCode: 'baseInfo-Add'
              },
              {
                resourceName: '删除',
                resourceType: 'Button',
                resourceCode: 'baseInfo-Delete'
              },
              {
                resourceName: '还原',
                resourceType: 'Button',
                resourceCode: 'baseInfo-Restore'
              },
              {
                resourceName: '导出',
                resourceType: 'Button',
                resourceCode: 'baseInfo-Download'
              },
              {
                resourceName: '导入',
                resourceType: 'Button',
                resourceCode: 'baseInfo-Upload'
              },
              {
                resourceName: '城市标准差',
                resourceType: 'Button',
                resourceCode: 'baseInfo-city-standard'
              },
              {
                resourceName: '编辑楼盘',
                resourceType: 'Button',
                resourceCode: 'project-edit'
              },
              {
                resourceName: '跳转楼盘别名',
                resourceType: 'Button',
                resourceCode: 'baseInfo-projectAlias-link'
              },
              {
                resourceName: '跳转楼盘地址',
                resourceType: 'Button',
                resourceCode: 'baseInfo-projectAddr-link'
              },
              {
                resourceName: '跳转楼栋列表',
                resourceType: 'Button',
                resourceCode: 'buildInfo-link'
              },
              {
                resourceName: '跳转图片列表',
                resourceType: 'Button',
                resourceCode: 'project-img-link'
              },
              {
                resourceName: '跳转楼盘系数差',
                resourceType: 'Button',
                resourceCode: 'baseInfo-project-standard-link'
              },
              {
                resourceName: '楼盘编辑',
                resourceType: 'Menu',
                resourceCode: 'baseInfo',
                routePath: '/property/res/base-info/add',
                children: [
                  {
                    resourceName: '楼盘编辑',
                    resourceType: 'Menu',
                    resourceCode: 'projectEdit',
                    routePath: '/property/res/base-info/add',
                    children: [
                      {
                        resourceName: '楼盘保存',
                        resourceType: 'Button',
                        resourceCode: 'projectSave'
                      },
                      {
                        resourceName: '项目图片',
                        resourceType: 'Button',
                        resourceCode: 'projectImage'
                      },
                      {
                        resourceName: '房号系数差',
                        resourceType: 'Button',
                        resourceCode: 'houseStand'
                      },
                      {
                        resourceName: '楼盘合并',
                        resourceType: 'Button',
                        resourceCode: 'projectMerge'
                      },
                      {
                        resourceName: '楼盘拆分',
                        resourceType: 'Button',
                        resourceCode: 'projectSplite'
                      },
                      {
                        resourceName: '转楼栋',
                        resourceType: 'Button',
                        resourceCode: 'buildInfo-link'
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            resourceName: '住宅案例数据',
            resourceType: 'Menu',
            resourceCode: 'caseInfo',
            routePath: '/property/res/case-info'
          },
          {
            resourceName: '相关楼盘名称',
            resourceType: 'Menu',
            resourceCode: 'proName',
            routePath: '/property/res/pro-name'
          },
          {
            resourceName: '相关楼盘地址',
            resourceType: 'Menu',
            resourceCode: 'proAddr',
            routePath: '/property/res/pro-addr'
          },
          {
            resourceName: '楼盘均价',
            resourceType: 'Menu',
            resourceCode: 'projectAvg',
            routePath: '/property/res/pro-avg'
          }
        ]
      }
    ]
  }
]
