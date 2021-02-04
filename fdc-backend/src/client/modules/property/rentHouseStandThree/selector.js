import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.renthouseStandThree,
  importLogList: createSelector(
    state => state.renthouseStandThree.get('importLogList'),
    importLogList => importLogList.toJS()
  )
})
