import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.houseStand,
  coefficientList: createSelector(
    state => state.houseStand.get('coefficientList'),
    coefficientList => coefficientList.toJS()
  ),
  importLogList: createSelector(
    state => state.houseStand.get('importLogList'),
    importLogList => importLogList.toJS()
  )
})
