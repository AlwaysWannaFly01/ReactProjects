import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'cityRange',
  actions: {
    getAllCityList: 'GET_ALL_CITY_LIST',
    setAllCityList: 'SET_ALL_CITY_LIST',

    setCityList: 'SET_CITY_LIST',

    getAuthorityCityList: 'GET_AUTHORITY_CITY_LIST', // wy add
    setAuthorityCityList: 'SET_AUTHORITY_CITY_LIST'
  }
})

export default actions
export { containerActions }
