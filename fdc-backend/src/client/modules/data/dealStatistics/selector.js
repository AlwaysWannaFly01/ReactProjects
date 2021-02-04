import { createSelector, createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.dealStatistics,
  dealStatisticsList: createSelector(
      state => state.dealStatistics.get('dealStatisticsList'),
      dealStatisticsList => dealStatisticsList.toJS()
  ),
  cityAvgList: createSelector(
    state => state.dealStatistics.get('cityAvgList'),
    cityAvgList => cityAvgList.toJS()
  ),
  areaRentalHistoryList: createSelector(
    state => state.dealStatistics.get('areaRentalHistoryList'),
    areaRentalHistoryList => areaRentalHistoryList.toJS()
  ),
  areaRentalDetail: createSelector(
    state => state.dealStatistics.get('areaRentalDetail'),
    areaRentalDetail => areaRentalDetail.toJS()
  ),
  // defaultCity: createSelector(
  //     state => state.dealStatistics.get('defaultCity'),
  //     defaultCity => defaultCity.toJS()
  // ),
  cityList: state => state.cityRange.get('cityList')
})
