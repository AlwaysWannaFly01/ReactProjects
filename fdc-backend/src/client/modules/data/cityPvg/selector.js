import { createSelector, createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.dataCityAvg,
  cityAvgList: createSelector(
    state => state.dataCityAvg.get('cityAvgList'),
    cityAvgList => cityAvgList.toJS()
  ),
  cityList: state => state.cityRange.get('cityList')
})
