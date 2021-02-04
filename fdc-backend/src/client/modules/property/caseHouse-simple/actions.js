import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'caseHouseSample',
  actions: {
    getAreaList: 'GET_AREA_LIST',
    setAreaList: 'SET_AREA_LIST',

    fetchCaseList: 'FETCH_CASE_LIST',
    setCaseList: 'SET_CASE_LIST',

    getProjectList: 'GET_PROJECT_LIST',
    getProjectPop: 'GET_PROJECT_POP',
    setProjectPop: 'SET_PROJECT_POP',

    addCase: 'ADD_CASE',

    getCaseDetail: 'GET_CASE_DETAIL',
    setCaseDetail: 'SET_CASE_DETAIL',
    clearCaseDetail: 'CLEAR_CASE_DETAIL',

    deleteCases: 'DELETE_CASES',

    exportCase: 'EXPORT_CASE',

    isActiveProject: 'IS_ACTIVE_PROJECT',
    // 样本楼盘
    getSampleList: 'GET_SAMPLE_LIST',
    setSampleList: 'SET_SAMPLE_LIST',
    // 基础下 的样本
    getSampleListInBase: 'GET_SAMPLE_LIST_INBASE',
    setSampleListInBase: 'SET_SAMPLE_LIST_INBASE',

    addSamples: 'ADD_SAMPLES',
    deleteSamples: 'DELETE_SAMPLES',

    relateSample: 'RELATE_SAMPLE',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES',
    // 一键自动关联
    autoRelated: 'AUTO_RELATED',
    autoRelatedStatus: 'AUTO_RELATED_STATUS'
  }
})

export default actions
export { containerActions }
