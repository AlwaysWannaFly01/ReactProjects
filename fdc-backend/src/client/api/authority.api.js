// 权限管理
import qs from 'qs'
import req from './makeRequest'

// 角色管理
// 角色管理 / 角色列表
export function getAuthorityList(params) {
  // return req({
  //   url: '/fdc/roles',
  //   data: params,
  //   method: 'GET'
  // })
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return req({
    url: `/fdc/roles?${data}`
  })
}
// 删除
export function delAuthority(id) {
  return req({
    url: '/fdc/roles',
    method: 'DELETE',
    data: { id }
  })
}

//  添加/修改产品
export function editProduct(data) {
  return req({
    method: data.id ? 'PUT' : 'POST',
    url: '/fdc/roles',
    data
  })
}

//  设置角色权限
export function getSetingRole({ roleId, params }) {
  return req({
    method: 'POST',
    url: `/fdc/roles/${roleId}/rolePerms`,
    data: params
  })
}

// 查询角色菜单资源权限
export function getSaveRole(roleId) {
  return req({
    url: `/fdc/roles/${roleId}/roleResMenuPerms`
  })
}

// 角色管理 / 数据权限
export function getDataAuthority() {
  return req({
    url: '/fdc/roles/dataPermTypeMap'
  })
}

// 获取角色城市权限
export function getRoleCity(id) {
  return req({
    url: `/fdc/roles/${id}/getRolesCity`,
    method: 'GET'
  })
}

// 账号管理
// 获取账号列表
export function getAccountList(data) {
  return req({
    url: '/fdc/account',
    data
  })
}
// 账号角色列表
export function getRoleList(authId) {
  return req({
    url: '/fdc/account/role/list',
    data: { authId }
  })
}
// 角色分配
export function roleDistribute(data) {
  return req({
    url: '/fdc/account/role/allot',
    method: 'PUT',
    data
  })
}
// 设置新密码
export function resetPwd(accountId) {
  return req({
    url: `/fdc/account/password/reset?accountId=${accountId}`,
    method: 'PUT'
  })
}

// 注销/激活账号
export function changeStatus(data) {
  return req({
    url: '/fdc/account/status',
    method: 'PUT',
    data
  })
}

// 编辑账号角色
export function editAccountRole(data) {
  return req({
    url: '/fdc/account',
    method: 'PUT',
    data
  })
}

// 新增账号角色
export function addAccountRole(data) {
  return req({
    url: '/fdc/account',
    method: 'POST',
    data
  })
}
