import { injectReducer } from 'client/utils/store'
import { actions } from './action'

injectReducer({
  namespace: 'commonImport',
  initialState: {
    importLogs: []
  },
  actionHandlers: {
    [actions.RECEIVE_CASE_IMPORT_LOG]: (state, action) => {
      const data = action.payload[0]
      return state.set('importLogs', data)
    }
  }
})
