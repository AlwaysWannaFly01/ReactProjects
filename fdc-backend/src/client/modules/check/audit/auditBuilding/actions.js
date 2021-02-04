import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'building',
  actions: {
    // 楼栋列表
    setBuildList: 'SET_BUILD_LIST',
    getBuildList: 'GET_BUILD_LIST',
    // 楼栋详情
    setBuildDetail: 'SET_BUILD_DETAIL',
    getBuildDetail: 'GET_BUILD_DETAIL',
    // 楼栋 匹配FDC楼栋
    setfdcBuildList: 'SET_FDC_BUILD_LIST',
    getfdcBuildList: 'GET_FDC_BUILD_LIST',
    // 回调方法
    fdcBuildCheckCB: 'FDC_BUILD_CHECK_CB',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES',
    // 城市权限
    getAuthorityList: 'GET_AUTHORITY_LIST',
    setAuthorityList: 'SET_AUTHORITY_LIST'
  }
})

export default actions
export { containerActions }
