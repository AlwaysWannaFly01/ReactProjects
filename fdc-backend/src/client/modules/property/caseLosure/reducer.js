import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'caseLosure',
  initialState: {
    // 行政区列表
    areaList: [],
    ProjectsList: [],
    endReasonCode: [],
    closureCaseTypeList: [],
    pagination: {
      total: 0,
      pageNum: 1,
      pageSize: 20
    },
    caseList:[],
   
    houseUsageList: [],
    orientTypeList: [],
    buildTypeList: [],
    houseTypeList: [],
    structTypeList: [],
    currencyTypeList: [],
  
    // 案例详情
    caseDetail: {},
    // 错误楼盘名称列表
    errorCaseList: []
    // 别名类型列表
    // aliaTypeList: []
  },
  actionHandlers: {
    [actions.SET_ENDREASON_CODE]: (state, { payload: [data] }) =>
        state.set('endReasonCode', fromJS(data)),
    [actions.SET_PROJECTS_LIST]: (state, { payload: [data] }) =>
        state
        .set('ProjectsList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.SET_AREA_LIST]: (state, { payload: [data] }) =>
      state.set('areaList', fromJS(data)),
    [actions.SET_CASE_LIST]: (state, { payload: [data] }) =>
      state
      .set('caseList', fromJS(data.records || []))
      .mergeIn(['pagination'], {
        total: +data.total,
        pageNum: data.pageNum,
        pageSize: data.pageSize
      }),
    [actions.CLEAR_CASE_LIST]: state =>
        state.set('caseList', fromJS([])).set(
            'pagination',
            fromJS({
              total: 0,
              pageNum: 1,
              pageSize: 20
            })
        ),
    [actions.SET_CLOSURE_CASE_TYPE_LIST]: (state, { payload: [data] }) =>
        state.set('closureCaseTypeList', fromJS(data)),
    [actions.SET_HOUSE_USAGE]: (state, { payload: [data] }) =>
        state.set('houseUsageList', fromJS(data)),
    [actions.SET_ORIENT_TYPE]: (state, { payload: [data] }) =>
        state.set('orientTypeList', fromJS(data)),
    [actions.SET_BUILDING_TYPE]: (state, { payload: [data] }) =>
        state.set('buildTypeList', fromJS(data)),
    [actions.SET_HOUSE_TYPE]: (state, { payload: [data] }) =>
        state.set('houseTypeList', fromJS(data)),
    [actions.SET_STRUCT_TYPE]: (state, { payload: [data] }) =>
        state.set('structTypeList', fromJS(data)),
    [actions.SET_CURRENCY_TYPE]: (state, { payload: [data] }) =>
        state.set('currencyTypeList', fromJS(data)),
    [actions.SET_CASE_DETAIL]: (state, { payload: [data] }) =>
        state.set('caseDetail', fromJS(data)),
    // [actions.SET_ERROR_LIST]: (state, { payload: [data] }) =>
    //   state.set('errorCaseList', fromJS(data)),
    [actions.SET_ERROR_LIST]: (state, { payload: [data] }) =>
        state
        .set('errorCaseList', fromJS(data.records || []))
        .mergeIn(['pagination'], {
          total: +data.total,
          pageNum: data.pageNum,
          pageSize: data.pageSize
        }),
    [actions.CLEAR_CASE_DETAIL]: state => state.set('caseDetail', fromJS({}))
    // [actions.SET_ALIA_TYPE]: (state, { payload: [data] }) =>
    //   state.set('aliaTypeList', fromJS(data))
  }
})
