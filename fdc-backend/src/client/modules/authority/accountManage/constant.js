import React, { Fragment } from 'react'
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
    name: '账号管理'
  }
]
// 账号管理表格
export const column = [
  // {
  //   title: '账号',
  //   dataIndex: 'principal',
  //   width: 157
  // },
  // {
  //   title: '姓名',
  //   dataIndex: 'userName',
  //   width: 145
  // },
  {
    title: '状态',
    dataIndex: 'sysStatus',
    width: 124,
    render: sysStatus => (
      <Fragment>
        <div>{sysStatus === 1 ? '已激活' : '已注销'}</div>
      </Fragment>
    )
  },
  {
    title: '到期时间',
    dataIndex: 'availableEndDate',
    width: 240,
    render: availableEndDate => (
      <Fragment>
        <div>{availableEndDate || '永久'}</div>
      </Fragment>
    )
  }
]
// 数据权限
export const authorityList = [
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
// 页面及操作权限 树
// export const treeData = [
//   {
//     title: '全部',
//     key: '0',
//     children: [
//       {
//         title: '住宅基础数据',
//         key: '0-0',
//         children: [
//           {
//             title: '楼盘',
//             key: '0-0-0',
//             children: [
//               { title: '查看', key: '0-0-0-0' },
//               { title: '新增', key: '0-0-0-1' },
//               { title: '修改', key: '0-0-0-2' },
//               { title: '删除', key: '0-0-0-3' },
//               { title: '还原', key: '0-0-0-4' },
//               { title: '锁住数据', key: '0-0-0-5' },
//               { title: '导入数据', key: '0-0-0-6' },
//               { title: '导出数据', key: '0-0-0-7' }
//             ]
//           },
//           {
//             title: '楼栋',
//             key: '0-0-1',
//             children: [
//               { title: '查看', key: '0-0-1-0' },
//               { title: '新增', key: '0-0-1-1' },
//               { title: '修改', key: '0-0-1-2' },
//               { title: '删除', key: '0-0-1-3' },
//               { title: '还原', key: '0-0-1-4' },
//               { title: '锁住数据', key: '0-0-1-5' },
//               { title: '导入数据', key: '0-0-1-6' },
//               { title: '导出数据', key: '0-0-1-7' }
//             ]
//           },
//           {
//             title: '房号',
//             key: '0-0-2',
//             children: [
//               { title: '查看', key: '0-0-2-0' },
//               { title: '新增', key: '0-0-2-1' },
//               { title: '修改', key: '0-0-2-2' },
//               { title: '删除', key: '0-0-2-3' },
//               { title: '还原', key: '0-0-2-4' },
//               { title: '锁住数据', key: '0-0-2-5' },
//               { title: '导入数据', key: '0-0-2-6' },
//               { title: '导出数据', key: '0-0-2-7' }
//             ]
//           }
//         ]
//       },
//       {
//         title: '住宅案例数据',
//         key: '0-1',
//         children: [
//           { title: '查看', key: '0-1-0-0' },
//           { title: '新增', key: '0-1-0-1' },
//           { title: '修改', key: '0-1-0-2' },
//           { title: '删除', key: '0-1-0-3' },
//           { title: '导入数据', key: '0-1-0-4' },
//           { title: '导出数据', key: '0-1-0-5' }
//         ]
//       },
//       {
//         title: '住宅样本案例',
//         key: '0-2',
//         children: [
//           { title: '查看', key: '0-2-0-0' },
//           { title: '新增', key: '0-2-0-1' },
//           { title: '修改', key: '0-2-0-2' },
//           { title: '删除', key: '0-2-0-3' },
//           { title: '导入数据', key: '0-2-0-4' },
//           { title: '导出数据', key: '0-2-0-5' }
//         ]
//       },
//       {
//         title: '住宅样本楼盘',
//         key: '0-3',
//         children: [
//           { title: '查看', key: '0-3-0-0' },
//           { title: '新增', key: '0-3-0-1' },
//           { title: '修改', key: '0-3-0-2' },
//           { title: '删除', key: '0-3-0-3' },
//           { title: '导入数据', key: '0-3-0-4' },
//           { title: '导出数据', key: '0-3-0-5' }
//         ]
//       },
//       {
//         title: '住宅租金案例',
//         key: '0-4',
//         children: [
//           { title: '查看', key: '0-4-0-0' },
//           { title: '新增', key: '0-4-0-1' },
//           { title: '修改', key: '0-4-0-2' },
//           { title: '删除', key: '0-4-0-3' },
//           { title: '导入数据', key: '0-4-0-4' },
//           { title: '导出数据', key: '0-4-0-5' }
//         ]
//       },
//       {
//         title: '相关楼盘名称',
//         key: '0-5',
//         children: [
//           { title: '查看', key: '0-5-0-0' },
//           { title: '新增', key: '0-5-0-1' },
//           { title: '修改', key: '0-5-0-2' },
//           { title: '删除', key: '0-5-0-3' },
//           { title: '导入数据', key: '0-5-0-4' },
//           { title: '导出数据', key: '0-5-0-5' }
//         ]
//       },
//       {
//         title: '相关楼盘地址',
//         key: '0-6',
//         children: [
//           { title: '查看', key: '0-6-0-0' },
//           { title: '新增', key: '0-6-0-1' },
//           { title: '修改', key: '0-6-0-2' },
//           { title: '删除', key: '0-6-0-3' },
//           { title: '导入数据', key: '0-6-0-4' },
//           { title: '导出数据', key: '0-6-0-5' }
//         ]
//       },
//       {
//         title: '楼盘均价',
//         key: '0-7',
//         children: [
//           { title: '查看', key: '0-7-0-0' },
//           { title: '新增', key: '0-7-0-1' },
//           { title: '修改', key: '0-7-0-2' },
//           { title: '删除', key: '0-7-0-3' },
//           { title: '导入数据', key: '0-7-0-4' },
//           { title: '导出数据', key: '0-7-0-5' }
//         ]
//       },
//       {
//         title: '公共配套',
//         key: '0-8',
//         children: [
//           { title: '查看', key: '0-8-0-0' },
//           { title: '新增', key: '0-8-0-1' },
//           { title: '修改', key: '0-8-0-2' },
//           { title: '删除', key: '0-8-0-3' },
//           { title: '导入数据', key: '0-8-0-4' },
//           { title: '导出数据', key: '0-8-0-5' }
//         ]
//       },
//       {
//         title: '长租公寓案例数据',
//         key: '0-9',
//         children: [
//           { title: '查看', key: '0-9-0-0' },
//           { title: '新增', key: '0-9-0-1' },
//           { title: '修改', key: '0-9-0-2' },
//           { title: '删除', key: '0-9-0-3' },
//           { title: '导入数据', key: '0-9-0-4' },
//           { title: '导出数据', key: '0-9-0-5' }
//         ]
//       },
//       {
//         title: '导出任务',
//         key: '0-10',
//         children: [
//           { title: '查看', key: '0-10-0-0' },
//           { title: '新增', key: '0-10-0-1' },
//           { title: '修改', key: '0-10-0-2' },
//           { title: '删除', key: '0-10-0-3' },
//           { title: '导入数据', key: '0-10-0-4' },
//           { title: '导出数据', key: '0-10-0-5' }
//         ]
//       }
//     ]
//   }
// ]
