import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { pagePermission } from 'client/utils'
import router from 'client/router'
// import RoleManage from './RoleManage'
// 权限管理 / 角色管理 / 设置权限
import { RoleManage, RoleManageSet } from './roleManage'
import AccountManage from './accountManage'

class Authority extends Component {
  render() {
    return (
      <Switch>
        {/* 角色管理 */}
        {pagePermission('fdc:am:roleManagement') ? (
          <Route
            path={router.AUTHORITY}
            exact
            render={() => <Redirect to={router.AUTHORITY_ROLE_MANAGE} />}
          />
        ) : (
          ''
        )}

        {/* 账号管理 */}
        {pagePermission('fdc:am:accountManagement') ? (
          <Route
            path={router.AUTHORITY}
            exact
            render={() => <Redirect to={router.AUTHORITY_ACCOUNT_MANAGE} />}
          />
        ) : (
          ''
        )}
        <Route
          path={router.AUTHORITY_ROLE_MANAGE_SET}
          component={RoleManageSet}
        />
        <Route path={router.AUTHORITY_ROLE_MANAGE} component={RoleManage} />
        {/* 账号管理 */}
        <Route
          path={router.AUTHORITY_ACCOUNT_MANAGE}
          component={AccountManage}
        />
      </Switch>
    )
  }
}

export default Authority
