import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'dataCityAvg',
  actions: {
    getObjectType: 'GET_OBJECT_TYPE',
    setObjectType: 'SET_OBJECT_TYPE',

    getCityAvgPrice: 'GET_CITY_AVG_PRICE',
    setCityAvgPrice: 'SET_CITY_AVG_PRICE',

    getAreaList: 'GET_AREA_LIST',
    getSubAreas: 'GET_SUB_AREAS',

    getLastMonthCityAvgPrice: 'GET_LAST_MONTH_CITY_AVG_PRICE',
    setLastMonthCityAvgPrice: 'SET_LAST_MONTH_CITY_AVG_PRICE',

    addCityAvgPrice: 'ADD_CITY_AVG_PRICE',
    editCityAvgPrice: 'EDIT_CITY_AVG_PRICE',

    getCityAvgPriceDetail: 'GET_CITY_AVG_PRICE_DETAIL',
    setCityAvgPriceDetail: 'SET_CITY_AVG_PRICE_DETAIL',
    clearCityAvgPriceDetail: 'CLEAR_CITY_AVG_PRICE_DETAIL',

    exportCityAvgPrice: 'EXPORT_CITY_AVG_PRICE',
    cityAvgPriceMonth: 'CITYAVGPRICEMONTH'
  }
})

export default actions
export { containerActions }
