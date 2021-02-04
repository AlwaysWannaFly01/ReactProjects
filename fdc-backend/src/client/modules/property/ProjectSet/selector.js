import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.projectSet,
  projectSetList: createSelector(
    state => state.projectSet.get('projectSetList'),
    projectSetList => projectSetList.toJS()
  ),
  upAreaList: state => state.projectSet.get('upAreaList').toJS(),
  selectProjectList: state => state.projectSet.get('selectProjectList').toJS(),
  setPopList: state => state.projectSet.get('setPopList').toJS()
})
