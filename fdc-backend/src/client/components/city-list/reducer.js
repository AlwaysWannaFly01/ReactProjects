import { injectReducer } from 'client/utils/store'
import { fromJS } from 'immutable'
import actions from './actions'

injectReducer({
  namespace: 'cityList',
  initialState: {
    // 常用城市列表
    generalCities: [],
    // 省份列表
    provinceList: [],
    // 城市列表
    cityList: [],
    // 切换身份后默认城市
    defaultCityName: ''
  },
  actionHandlers: {
    [actions.SET_GENERAL_CITIES]: (state, { payload: [data] }) =>
      state.set('generalCities', fromJS(data)),
    [actions.SET_PROVINCE_LIST]: (state, { payload: [data] }) =>
      state.set('provinceList', fromJS(data)),
    [actions.SET_CITY_LIST]: (
      state,
      { payload: [{ allCities = [], provinceId }] }
    ) => {
      let cityList = []
      let defaultCityName = ''
      if (provinceId) {
        const provinceList = state.get('provinceList')
        provinceList.forEach(item => {
          if (+item.get('id') === provinceId) {
            cityList = item.get('cities')
            defaultCityName = cityList.length
              ? cityList.get('0').get('cityName')
              : ''
          }
        })
      } else {
        defaultCityName = allCities.length ? allCities[0].cityName : ''
        cityList = allCities.length ? allCities : []
      }
      return state
        .set('cityList', fromJS(cityList))
        .set('defaultCityName', defaultCityName)
    }
  }
})
