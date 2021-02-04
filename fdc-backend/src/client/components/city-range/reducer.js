import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'cityRange',
  initialState: {
    // 所有的省份城市
    allCityList: [],
    // 城市列表
    cityList: [],
    // 权限城市
    authorityCity: []
  },
  actionHandlers: {
    [actions.SET_ALL_CITY_LIST]: (state, { payload: [data] }) =>
      state.set('allCityList', fromJS(data)),
    [actions.SET_CITY_LIST]: (state, { payload: [data] }) =>
      state.set('cityList', fromJS(data)),
    [actions.SET_AUTHORITY_CITY_LIST]: (state, { payload: [data] }) =>
      state.set('authorityCity', fromJS(data))
  }
})
