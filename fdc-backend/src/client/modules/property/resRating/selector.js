import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.ResRating,
  estateRatingList: createSelector(
    state => state.ResRating.get('estateRatingList'),
    estateRatingList => estateRatingList.toJS()
  ),
  // ratingRuleDetail: createSelector(
  //   state => state.ResRating.get('ratingRuleDetail'),
  //   ratingRuleDetail => ratingRuleDetail.toJS()
  // ),
  ratingHistory: createSelector(
    state => state.ResRating.get('ratingHistory'),
    ratingHistory => ratingHistory.toJS()
  )
})
