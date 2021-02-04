import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'warningStatistics',
  actions: {
    getAreaList: 'GET_AREA_LIST',
    setDistrictAreas: 'SET_DISTRICT_AREAS',
    initialFetch: 'INITIAL_FETCH',
    getPriceWarningList: 'GET_PRICE_WARNING_LIST',
    setPriceWarningList: 'SET_PRICE_WARNING_LIST',
    priceWarningExport: 'PRICE_WARNING_EXPORT',
    getVisitCities: 'GET_VISIT_CITIES',
    setVisitCities: 'SET_VISIT_CITIES'
  }
})

export default actions
export { containerActions }
