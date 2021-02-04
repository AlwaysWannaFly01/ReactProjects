import { createSelector, createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.losureStatistics,
  losureStatisticsList: createSelector(
      state => state.losureStatistics.get('losureStatisticsList'),
      losureStatisticsList => losureStatisticsList.toJS()
  ),
  cityAvgList: createSelector(
    state => state.losureStatistics.get('cityAvgList'),
    cityAvgList => cityAvgList.toJS()
  ),
  areaRentalHistoryList: createSelector(
    state => state.losureStatistics.get('areaRentalHistoryList'),
    areaRentalHistoryList => areaRentalHistoryList.toJS()
  ),
  areaRentalDetail: createSelector(
    state => state.losureStatistics.get('areaRentalDetail'),
    areaRentalDetail => areaRentalDetail.toJS()
  ),
  cityList: state => state.cityRange.get('cityList')
})
