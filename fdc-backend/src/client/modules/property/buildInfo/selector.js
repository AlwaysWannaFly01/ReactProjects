import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.buildInfo,
  buildInfoList: createSelector(
    state => state.buildInfo.get('buildInfoList'),
    buildInfoList => buildInfoList.toJS()
  ),
  defaultCity: state => state.engine.get('defaultCity')
})
