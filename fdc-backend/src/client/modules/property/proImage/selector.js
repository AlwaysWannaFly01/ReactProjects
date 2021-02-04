import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.proImage,
  projectImageList: createSelector(
    state => state.proImage.get('projectImageList'),
    projectImageList => projectImageList.toJS()
  )
})
