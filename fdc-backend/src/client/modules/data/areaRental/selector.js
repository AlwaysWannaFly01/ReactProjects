import { createSelector, createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.dataAreaRental,
  cityAvgList: createSelector(
    state => state.dataAreaRental.get('cityAvgList'),
    cityAvgList => cityAvgList.toJS()
  ),
  areaRentalList: createSelector(
    state => state.dataAreaRental.get('areaRentalList'),
    areaRentalList => areaRentalList.toJS()
  ),
  areaRentalHistoryList: createSelector(
    state => state.dataAreaRental.get('areaRentalHistoryList'),
    areaRentalHistoryList => areaRentalHistoryList.toJS()
  ),
  areaRentalDetail: createSelector(
    state => state.dataAreaRental.get('areaRentalDetail'),
    areaRentalDetail => areaRentalDetail.toJS()
  ),
  cityList: state => state.cityRange.get('cityList')
})
