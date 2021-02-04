import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.caseInfo,
  caseList: createSelector(
    state => state.caseInfo.get('caseList'),
    caseList => caseList.toJS()
  ),
  errorCaseList: createSelector(
    state => state.caseInfo.get('errorCaseList'),
    errorCaseList => errorCaseList.toJS()
  )
})
