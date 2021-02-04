import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.caseInfoApart,
  caseList: createSelector(
    state => state.caseInfoApart.get('caseList'),
    caseList => caseList.toJS()
  )
})
