import { createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.AccountManage,
  accountList: state => state.AccountManage.get('accountList').toJS(),
  roleList: state => state.AccountManage.get('roleList').toJS()
})
