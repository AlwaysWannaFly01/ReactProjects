import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.houseNum,
  dataList: createSelector(
    state => state.houseNum.get('dataList'),
    dataList => dataList.toJS()
  ),
  houseTitle: createSelector(
    state => state.houseNum.get('houseTitle'),
    houseTitle => houseTitle.toJS()
  ),
  buildStatus: state => state.houseNum.get('buildStatus')
})
