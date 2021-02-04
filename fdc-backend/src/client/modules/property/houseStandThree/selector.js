import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.houseStandThree,
  importLogList: createSelector(
    state => state.houseStandThree.get('importLogList'),
    importLogList => importLogList.toJS()
  )
})
