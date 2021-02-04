import { createSelector, createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.warningStatistics,
  ratingRlueList: createSelector(
    state => state.estateRating.get('ratingRlueList'),
    ratingRlueList => ratingRlueList.toJS()
  ),
  cityList: state => state.cityRange.get('cityList')
})
