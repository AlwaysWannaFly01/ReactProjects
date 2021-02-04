import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.commonExportTask,
  exportTaskList: createSelector(
    state => state.commonExportTask.get('exportTaskList'),
    exportTaskList => exportTaskList.toJS()
  )
})
