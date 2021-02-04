import { createSelector, createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.projectResource,
  prjectFacilityList: createSelector(
    state => state.projectResource.get('prjectFacilityList'),
    prjectFacilityList => prjectFacilityList.toJS()
  )
})
