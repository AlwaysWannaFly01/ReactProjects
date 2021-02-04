import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'auditFloor',
  actions: {
    setAuditList: 'SET_AUDIT_LIST',
    getAuditList: 'GET_AUDIT_LIST',
    // DC楼盘详情   展示信息
    setInformationList: 'SET_INFORMATION_LIST',
    getInformationList: 'GET_INFORMATION_LIST',
    // 可匹配FDC楼盘列表
    setMatchList: 'SET_MATCH_LIST',
    getMatchList: 'GET_MATCH_LIST',
    // 处理回调
    projectDcCheckCB: 'PROJECT_DC_CHECK_CB',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES',
    // 城市权限
    getAuthorityList: 'GET_AUTHORITY_LIST',
    setAuthorityList: 'SET_AUTHORITY_LIST'
  }
})

export default actions
export { containerActions }
