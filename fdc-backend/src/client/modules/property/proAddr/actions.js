import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'proAddr',
  actions: {
    initialFetch: 'INITIAL_FETCH',
    initialAddFetch: 'INITIAL_ADD_FETCH',

    getProjectAddrList: 'GET_PROJECT_ADDR_LIST',
    setProjectAddrList: 'SET_PROJECT_ADDR_LIST',

    addProjectAddr: 'ADD_PROJECT_ADDR',
    delProjectAddr: 'DEL_PROJECT_ADDR',
    editProjectAddr: 'EDIT_PROJECT_ADDR',

    getAddrType: 'GET_ADDR_TYPE',
    setAddrType: 'SET_ADDR_TYPE',

    exportProjectAddr: 'EXPORT_PROJECT_ADDR',

    getProjectDetail: 'GET_PROJECT_DETAIL',
    setProjectDetail: 'SET_PROJECT_DETAIL',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES',
    IsMatchBatchProject:'IS_MATCH_BATCH_PROJECT'
  }
})

export default actions
export { containerActions }
