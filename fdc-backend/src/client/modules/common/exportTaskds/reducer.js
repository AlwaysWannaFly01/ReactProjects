import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'commonExportTask',
  initialState: {
    // 导出类型列表
    exportTypeList: [],

    exportTaskList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    }
  },
  actionHandlers: {
    [actions.SET_EXPORT_TYPE]: (state, { payload: [data] }) =>
      state.set('exportTypeList', fromJS(data)),
    [actions.SET_EXPORT_TASK_LIST]: (state, { payload: [data] }) =>
      state
        .set('exportTaskList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        })
  }
})
