import { createSelector, createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  allCityList: createSelector(
    state => state.cityRange.get('allCityList'),
    allCityList => allCityList.toJS()
  ),
  authorityCity: state => state.cityRange.get('authorityCity').toJS()
})
