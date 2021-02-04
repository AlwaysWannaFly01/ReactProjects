import { createSelector, createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.publicResource,
  defaultCity: state => state.engine.get('defaultCity'),
  commonFacilityList: createSelector(
    state => state.publicResource.get('commonFacilityList'),
    commonFacilityList => commonFacilityList.toJS()
  )
})
