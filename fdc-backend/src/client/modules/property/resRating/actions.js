import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'ResRating',
  actions: {
    getAreaList: 'GET_AREA_LIST', // 加载行政区字典
    setAreaList: 'SET_AREA_LIST',

    getEstateRatingSearch: 'GET_ESTATE_RATING_SEARCH',
    setEstateRatingSearch: 'SET_ESTATE_RATING_SEARCH',

    exportRatingResult: 'EXPORT_RATING_RESULT',
    exportRatingResultHistory: 'EXPORT_RATING_RESULT_HISTORY',

    getRatingRuleDetail: 'GET_RATING_RULE_DETAIL',
    setRatingRuleDetail: 'SET_RATING_RULE_DETAIL',

    editRatingResult: 'EDIT_RATING_RESULT',
    addRatingResult: 'ADD_RATING_RESULT',

    getAllDetail: 'GET_ALL_DETAIL',
    setAllDetail: 'SET_ALL_DETAIL',

    getRatingHistory: 'GET_RATING_HISTORY',
    setRatingHistory: 'SET_RATING_HISTORY',

    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES',

    getGradeDetail: 'GET_GRADE_DETAIL'
  }
})

export default actions
export { containerActions }
