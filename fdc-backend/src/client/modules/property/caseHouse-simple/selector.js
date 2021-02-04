import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.caseHouseSample,
  caseList: createSelector(
    state => state.caseHouseSample.get('caseList'),
    caseList => caseList.toJS()
  ),
  sampleList: state => state.caseHouseSample.get('sampleList').toJS(),
  newHouseList: state => state.caseHouseSample.get('newHouseList').toJS(),
  sampleListInBase: state =>
    state.caseHouseSample.get('sampleListInBase').toJS()
})
