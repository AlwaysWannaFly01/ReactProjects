import { injectReducer } from 'client/utils/store'
// import { fromJS } from 'immutable'
import { actions } from './action'

injectReducer({
  namespace: 'baseExport',
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
