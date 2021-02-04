import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'proName',
  initialState: {
    projectAliaList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },

    areaList: [],
    // 别名类型列表
    aliaTypeList: [],
    projectDetail: {}
  },
  actionHandlers: {
    [actions.SET_PROJECT_ALIA_LIST]: (state, { payload: [data] }) =>
      state
        .set('projectAliaList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_DISTRICT_AREAS]: (state, { payload: [data] }) =>
      state.set('areaList', fromJS(data)),
    [actions.SET_ALIA_TYPE]: (state, { payload: [data] }) =>
      state.set('aliaTypeList', fromJS(data)),
    [actions.SET_PROJECT_DETAIL]: (state, { payload: [data] }) =>
      state.set('projectDetail', fromJS(data))
  }
})
