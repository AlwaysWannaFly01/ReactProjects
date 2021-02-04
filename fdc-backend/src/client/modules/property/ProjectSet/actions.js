import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'projectSet',
  actions: {
    getAreaList: 'GET_AREA_LIST',
    setAreaList: 'SET_AREA_LIST',

    fetchProjectSet: 'FETCH_PROJECT_SET',
    setProjectSet: 'SET_PROJECT_SET',

    getProjectList: 'GET_PROJECT_LIST',
    getProjectPop: 'GET_PROJECT_POP',
    setProjectPop: 'SET_PROJECT_POP',

    addCase: 'ADD_CASE',
    // 4. 获取行政区集合配置列表
    getUpArea: 'GET_UP_AREA',
    setUpArea: 'SET_UP_AREA',
    // 获取片区
    getSubAreas: 'GET_SUB_AREAS',

    getSetDetail: 'GET_SET_DETAIL',
    setSetDetail: 'SET_SET_DETAIL',
    clearCaseDetail: 'CLEAR_CASE_DETAIL',

    deleteCases: 'DELETE_CASES',

    // exportCase: 'EXPORT_CASE',

    // isActiveProject: 'IS_ACTIVE_PROJECT',
    // 集合楼盘列表
    getSetProjectList: 'GET_SET_PROJECT_LIST',
    setSetProjectList: 'SET_SET_PROJECT_LIST',
    // 集合楼盘新增 弹窗
    getSetPopList: 'GET_SET_POP_LIST',
    setSetPopList: 'SET_SET_POP_LIST',

    addSamples: 'ADD_SAMPLES',
    deleteSamples: 'DELETE_SAMPLES',

    updateSet: 'UPDATE_SET', // 修改集合

    relateSample: 'RELATE_SAMPLE',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES'
  }
})

export default actions
export { containerActions }
