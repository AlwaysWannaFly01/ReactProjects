import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'estateRating',
  actions: {
    getAreaList: 'GET_AREA_LIST',
    getLoopLine: 'GET_LOOP_LINE',
    getSubAreas: 'GET_SUB_AREAS',
    exportGradeRules: 'EXPORT_GRADE_RULES',

    getRatingRuleSearch: 'GET_RATING_RULE_SEARCH',
    setRatingRuleSearch: 'SET_RATING_RULE_SEARCH',

    editEstateRating: 'EDIT_ESTATE_RATING'
  }
})

export default actions
export { containerActions }
