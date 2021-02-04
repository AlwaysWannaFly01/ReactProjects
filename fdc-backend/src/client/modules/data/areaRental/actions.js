import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'dataAreaRental',
  actions: {
    getAreaRentalHistoryList: 'GET_AREA_RENTAL_HISTORY_LIST',
    setAreaRentalHistoryList: 'SET_AREA_RENTAL_HISTORY_LIST',

    fetchAreaRentalDetail: 'FETCH_AREA_RENTAL_DETAIL',
    setAreaRentalDetail: 'SET_AREA_RENTAL_DETAIL',

    getAreaRentalDetail: 'GET_AREA_RENTAL_DETAIL',
    setAreaRentalDetailt: 'SET_AREA_RENTAL_DETAILT',

    fetchAreaRentalDetailHistory: 'FETCH_AREA_RENTAL_DETAIL_HISTORY',
    setAreaRentalDetailHistory: 'SET_AREA_RENTAL_DETAIL_HISTORY',

    saveAreaRentalHistory: 'SAVE_AREA_RENTAL_HISTORY',
    saveAreaRental: 'SAVE_AREA_RENTAL',

    getAreaList: 'GET_AREA_LIST',
    getSubAreas: 'GET_SUB_AREAS',

    getAreaRentalList: 'GET_AREA_RENTAL_LIST', // 获取区域租售比列表
    setAreaRentalList: 'SET_AREA_RENTAL_LIST', // 设置区域租售比列表

    getLastMonthCityAvgPrice: 'GET_LAST_MONTH_CITY_AVG_PRICE',
    setLastMonthCityAvgPrice: 'SET_LAST_MONTH_CITY_AVG_PRICE',

    addCityAvgPrice: 'ADD_CITY_AVG_PRICE',
    editCityAvgPrice: 'EDIT_CITY_AVG_PRICE',

    clearCityAvgPriceDetail: 'CLEAR_CITY_AVG_PRICE_DETAIL',
    exportAreaRental: 'EXPORT_AREA_RENTAL',
    exportAreaRentalHistory: 'EXPORT_AREA_RENTAL_HISTORY'
  }
})

export default actions
export { containerActions }
