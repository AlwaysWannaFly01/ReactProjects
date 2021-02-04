import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.caseInfoSample,
  caseList: createSelector(
    state => state.caseInfoSample.get('caseList'),
    caseList => caseList.toJS()
  )
})
