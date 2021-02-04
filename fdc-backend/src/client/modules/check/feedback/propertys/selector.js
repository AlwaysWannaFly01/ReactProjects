import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.propertys,
  propertysList: createSelector(
    state => state.propertys.get('propertysList'),
    propertysList => propertysList.toJS()
  ),
  cityList: state => state.cityRange.get('cityList'),
  sourceProduct: state => state.propertys.get('sourceProduct').toJS(),
  answerList: state => state.propertys.get('answerList').toJS()
})
