import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'proName',
  actions: {
    initialFetch: 'INITIAL_FETCH',
    initialAddFetch: 'INITIAL_ADD_FETCH',
    getProjectAliaList: 'GET_PROJECT_ALIA_LIST',
    setProjectAliaList: 'SET_PROJECT_ALIA_LIST',

    addProjectAlia: 'ADD_PROJECT_ALIA',
    editProjectAlia: 'EDIT_PROJECT_ALIA',
    delProjectAlia: 'DEL_PROJECT_ALIA',

    getDistrictAreas: 'GET_DISTRICT_AREAS',
    setDistrictAreas: 'SET_DISTRICT_AREAS',

    getAliaType: 'GET_ALIA_TYPE',
    setAliaType: 'SET_ALIA_TYPE',

    exportProjectName: 'EXPORT_PROJECT_NAME',

    getProjectDetail: 'GET_PROJECT_DETAIL',
    setProjectDetail: 'SET_PROJECT_DETAIL',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES'
  }
})

export default actions
export { containerActions }
