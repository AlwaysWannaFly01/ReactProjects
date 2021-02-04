import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'houseStandThree',
  initialState: {
    // coefficientList: [],
    // pagination: {
    //   total: 0,
    //   pageNum: 1,
    //   pageSize: 10
    // },
    // 导入日志记录
    importLogList: [],
    importPagination: {
      total: 0,
      pageNum: 1,
      pageSize: 10
    },

    projectDetail: {}
  },
  actionHandlers: {
    // [actions.SET_COEFFICIENT_LIST]: (state, { payload: [data] }) =>
    //   state
    //     .set('coefficientList', fromJS(data.records || []))
    //     .mergeIn(['pagination'], {
    //       total: +data.total,
    //       pageNum: data.pageNum,
    //       pageSize: data.pageSize
    //     }),
    [actions.SET_IMPORT_EXCEL_LOGS]: (state, { payload: [data] }) =>
      state
        .set('importLogList', fromJS(data.records || []))
        .mergeIn(['importPagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_PROJECT_DETAIL]: (state, { payload: [data] }) =>
      state.set('projectDetail', fromJS(data))
  }
})
