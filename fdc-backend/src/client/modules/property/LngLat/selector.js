import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.lngLat,
  importLogList: createSelector(
    state => state.lngLat.get('importLogList'),
    importLogList => importLogList.toJS()
  )
})
