import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.caseLosure,
  caseList: createSelector(
    state => state.caseLosure.get('caseList'),
    caseList => caseList.toJS()
  ),
})
