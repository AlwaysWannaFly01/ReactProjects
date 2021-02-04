import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as AccountManage from 'client/api/authority.api'
import actions from './actions'

// 获取账号列表
function* getAccountList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_ACCOUNT_LIST)
    console.log(params)
    try {
      const { data } = yield call(
        AccountManage.getAccountList,
        params,
        actions.GET_ACCOUNT_LIST
      )
      data.records.map(item => {
        item.key = item.id
        return item
      })
      for (let i = 0; i < data.records.length; i += 1) {
        if (
          data.records[i].accountSelectedRoles &&
          data.records[i].accountSelectedRoles.length > 0
        ) {
          let accountSelectedRolesI = ''
          for (
            let j = 0;
            j < data.records[i].accountSelectedRoles.length;
            j += 1
          ) {
            accountSelectedRolesI = `${accountSelectedRolesI +
              data.records[i].accountSelectedRoles[j].roleName}, `
          }
          accountSelectedRolesI = accountSelectedRolesI.substring(
            0,
            accountSelectedRolesI.lastIndexOf(',')
          )
          data.records[i].accountSelectedRoleI = accountSelectedRolesI
        }
      }
      yield put(actions.setAccountList(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 账号角色列表
function* getRoleList() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_ROLE_LIST)
    try {
      // const { data } = yield call(AccountManage.getRoleList, data)
      // yield put(actions.setRoleList(data))
      const { data } = yield call(AccountManage.getRoleList, params)
      cb(data)
    } catch (err) {
      handleErr(err)
    }
  }
}

// 角色分配
function* roleDistribute() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.ROLE_DISTRIBUTE)
    try {
      yield call(AccountManage.roleDistribute, params)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

// 注销/激活账号
function* changeStatus() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.CHANGE_STATUS)
    try {
      yield call(AccountManage.changeStatus, params)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

// 重置密码
function* resetPwd() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.RESET_PWD)
    try {
      yield call(AccountManage.resetPwd, params)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

// 编辑角色
function* editAccountRole() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EDIT_ACCOUNT_ROLE)
    try {
      const { code, message } = yield call(
        AccountManage.editAccountRole,
        params
      )
      if (typeof cb === 'function') {
        cb(code, message)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 新增角色
function* addAccountRole() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.ADD_ACCOUNT_ROLE)
    try {
      yield call(AccountManage.addAccountRole, params)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'AccountManage',
  sagas: function* Account() {
    yield fork(getAccountList)
    yield fork(getRoleList)
    yield fork(roleDistribute)
    yield fork(changeStatus)
    yield fork(resetPwd)
    yield fork(editAccountRole)
    yield fork(addAccountRole)
  }
})
