import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'cityList',
  actions: {
    getVisitCities: 'GET_VISIT_CITIES',
    // setVisitCities: 'SET_VISIT_CITIES',

    setGeneralCities: 'SET_GENERAL_CITIES',
    setProvinceList: 'SET_PROVINCE_LIST',
    setCityList: 'SET_CITY_LIST',
    updateVisitCities: 'UPDATE_VISIT_CITIES',

    getCityList: 'GET_CITY_LIST',

    searchVisitCity: 'SEARCH_VISIT_CITY'
  }
})

export default actions
export { containerActions }
