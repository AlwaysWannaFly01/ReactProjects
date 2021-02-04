import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.priceRate,
  priceRateList: createSelector(
    state => state.priceRate.get('priceRateList'),
    priceRateList => priceRateList.toJS()
  )
  // sampleList: state => state.priceRate.get('sampleList').toJS(),
  // newHouseList: state => state.priceRate.get('newHouseList').toJS(),
  // sampleListInBase: state => state.priceRate.get('sampleListInBase').toJS()
})
