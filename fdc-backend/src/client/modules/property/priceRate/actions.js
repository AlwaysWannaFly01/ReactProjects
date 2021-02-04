import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'priceRate',
  actions: {
    getAreaList: 'GET_AREA_LIST',
    setAreaList: 'SET_AREA_LIST',

    fetchPriceRateList: 'FETCH_PRICE_RATE_LIST',
    setPriceRateList: 'SET_PRICE_RATE_LIST',

    exportPriceRate: 'EXPORT_PRICE_RATE',

    getPriceRateDetail: 'GET_PRICE_RATE_DETAIL',
    setPriceRateDetail: 'SET_PRICE_RATE_DETAIL',

    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES'
  }
})

export default actions
export { containerActions }
