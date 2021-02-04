import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'CityRangeSingle',
  actions: {
    getAllCityList: 'GET_ALL_CITY_LIST',
    setAllCityList: 'SET_ALL_CITY_LIST',

    setCityList: 'SET_CITY_LIST',

    getAuthorityCityList: 'GET_AUTHORITY_CITY_LIST', // wy add
    setAuthorityCityList: 'SET_AUTHORITY_CITY_LIST',
  
    getDefaultCity: 'GET_DEFAULT_CITY', // 获取默认城市
    setDefaultCity: 'SET_DEFAULT_CITY', // 设置默认城市
  }
})

export default actions
export { containerActions }
