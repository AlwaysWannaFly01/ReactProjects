import { createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.roleManage,
  authorityList: state => state.roleManage.get('authorityList').toJS(),
  roleResMenuPerms: state => state.roleManage.get('roleResMenuPerms').toJS(),
  roleAllMenu: state => state.roleManage.get('roleAllMenu').toJS(),
  authorityCity: state => state.roleManage.get('authorityCity').toJS()
})
