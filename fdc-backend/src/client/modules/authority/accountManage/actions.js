import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'AccountManage',
  actions: {
    getAccountList: 'GET_ACCOUNT_LIST',
    setAccountList: 'SET_ACCOUNT_LIST',

    getRoleList: 'GET_ROLE_LIST',
    setRoleList: 'SET_ROLE_LIST',

    roleDistribute: 'ROLE_DISTRIBUTE',
    changeStatus: 'CHANGE_STATUS',

    resetPwd: 'RESET_PWD',
    editAccountRole: 'EDIT_ACCOUNT_ROLE',
    addAccountRole: 'ADD_ACCOUNT_ROLE'
  }
})

export default actions
export { containerActions }
