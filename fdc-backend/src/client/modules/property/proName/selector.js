import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.proName,
  projectAliaList: createSelector(
    state => state.proName.get('projectAliaList'),
    projectAliaList => projectAliaList.toJS()
  )
})
