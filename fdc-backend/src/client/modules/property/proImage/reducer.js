import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'proImage',
  initialState: {
    projectImageList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 10
    },

    projectDetail: {},

    buildDetail: {},
    // 图片类型
    photoTypeList: []
  },
  actionHandlers: {
    [actions.SET_PROJECT_IMAGE_LIST]: (state, { payload: [data] }) =>
      state
        .set('projectImageList', fromJS(data.records))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_PROJECT_DETAIL]: (state, { payload: [data] }) =>
      state.set('projectDetail', fromJS(data)),
    [actions.SET_PHOTO_TYPE]: (state, { payload: [data] }) =>
      state.set('photoTypeList', fromJS(data)),
    [actions.SET_BUILD_DETAIL]: (state, { payload: [data] }) =>
      state.mergeDeep({ buildDetail: fromJS(data) })
  }
})
