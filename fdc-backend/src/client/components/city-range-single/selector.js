import { createSelector, createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  allCityList: createSelector(
    state => state.CityRangeSingle.get('allCityList'),
    allCityList => allCityList.toJS()
  ),
  defaultCity: createSelector(
      state => state.CityRangeSingle.get('defaultCity'),
      defaultCity => defaultCity
  ),
  authorityCity: state => state.CityRangeSingle.get('authorityCity').toJS()
})
