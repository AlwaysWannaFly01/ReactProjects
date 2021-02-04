import { createStructuredSelector, createSelector } from 'reselect'

const importLogs = state => state.baseExport.get('importLogs')
const mapStates = createStructuredSelector({
  importLogs: createSelector(
    [importLogs],
    importLogs => {
      if (!Array.isArray(importLogs)) {
        importLogs = []
      }
      return importLogs
    }
  )
})

export { mapStates }
