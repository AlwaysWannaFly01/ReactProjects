import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.proAddr,
  projectAddrList: createSelector(
    state => state.proAddr.get('projectAddrList'),
    projectAddrList => projectAddrList.toJS()
  )
})
