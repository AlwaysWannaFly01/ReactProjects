import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.caseInfoRent,
  caseList: createSelector(
    state => state.caseInfoRent.get('caseList'),
    caseList => caseList.toJS()
  )
})
