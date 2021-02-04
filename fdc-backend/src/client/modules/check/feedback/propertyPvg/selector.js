import { createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.propertyPvg,
  propertyPvgList: state => state.propertyPvg.get('propertyPvgList').toJS(),
  cityList: state => state.cityRange.get('cityList'),
  sourceProduct: state => state.propertyPvg.get('sourceProduct').toJS(),
  answerList: state => state.propertyPvg.get('answerList').toJS(),
  oneLineList: state => state.propertyPvg.get('oneLineList').toJS(),
  authorityList: state => state.propertyPvg.get('authorityList').toJS()
})
