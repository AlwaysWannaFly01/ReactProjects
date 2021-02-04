import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'CityRangeSingle',
  initialState: {
    // 所有的省份城市
    allCityList: [],
    // 城市列表
    cityList: [],
    // 权限城市
    authorityCity: [],
    defaultCity: '' //默认城市
  },
  actionHandlers: {
    [actions.SET_DEFAULT_CITY]: (state, { payload: [data] }) =>
        state.set('defaultCity', fromJS(data)),
    [actions.SET_ALL_CITY_LIST]: (state, { payload: [data] }) =>
      state.set('allCityList', fromJS(data)),
    [actions.SET_CITY_LIST]: (state, { payload: [data] }) =>
      state.set('cityList', fromJS(data)),
    [actions.SET_AUTHORITY_CITY_LIST]: (state, { payload: [data] }) =>
      state.set('authorityCity', fromJS(data))
  }
})
