import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'houseAttached',
  initialState: {
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 10
    },
    // 楼盘详情
    projectDetail: {},
    // 附属房屋 请求之前的接口 选择框
    subHouseTypeList: [],
    // 附属房屋算法列表 的数据
    subHouseList: [],
    // 附属房屋 的 计算方法
    subArithmeticList: []
  },
  actionHandlers: {
    [actions.SET_PROJECT_DETAIL]: (state, { payload: [data] }) =>
      state.set('projectDetail', fromJS(data)),
    [actions.SET_SUB_HOUSE_TYPE]: (state, { payload: [data] }) =>
      state.set('subHouseTypeList', fromJS(data)),
    [actions.SET_SUB_HOUSE_LIST]: (state, { payload: [data] }) =>
      state
        .set('subHouseList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_ARITHMETIC_TYPE]: (state, { payload: [data] }) =>
      state.set('subArithmeticList', fromJS(data))
  }
})
