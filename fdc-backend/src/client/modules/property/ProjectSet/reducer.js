import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'projectSet',
  initialState: {
    // 行政区列表
    areaList: [],
    // 案例列表
    projectSetList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },
    // 楼盘集合下的行政区
    upAreaList: [],
    // 案例详情
    setDetail: {},
    selectProjectList: [],
    paginationDown: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },
    setPopList: [],
    paginationPop: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    }
  },
  actionHandlers: {
    [actions.SET_AREA_LIST]: (state, { payload: [data] }) =>
      state.set('areaList', fromJS(data)),
    [actions.SET_PROJECT_SET]: (state, { payload: [data] }) =>
      state
        .set('projectSetList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_UP_AREA]: (state, { payload: [data] }) =>
      state.set('upAreaList', fromJS(data)),
    [actions.SET_SET_DETAIL]: (state, { payload: [data] }) =>
      state.set('setDetail', fromJS(data)),
    [actions.SET_SET_PROJECT_LIST]: (state, { payload: [data] }) =>
      state
        .set('selectProjectList', fromJS(data.records || []))
        .mergeIn(['paginationDown'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_SET_POP_LIST]: (state, { payload: [data] }) =>
      state
        .set('setPopList', fromJS(data.records || []))
        .mergeIn(['paginationPop'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        })
  }
})
