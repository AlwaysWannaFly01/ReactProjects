import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'roomNO',
  actions: {
    // 房号列表
    setHouseList: 'SET_HOUSE_LIST',
    getHouseList: 'GET_HOUSE_LIST',
    // 房号详情
    setHouseDetail: 'SET_HOUSE_DETAIL',
    getHouseDetail: 'GET_HOUSE_DETAIL',
    // 房号 匹配FDC房号
    setfdcHouseList: 'SET_FDC_HOUSE_LIST',
    getfdcHouseList: 'GET_FDC_HOUSE_LIST',
    // 房号 确定房号关联列表 换成回调
    setPreMatchList: 'SET_PRE_MATCH_LIST',
    getPreMatchList: 'GET_PRE_MATCH_LIST',
    // 回调方法
    fdcRoomCheckCB: 'FDC_ROOM_CHECK_CB',
    // DC房号 DC房号转正式房号 确定按钮
    sureButton: 'SURE_BUTTON',
    // 房号关联情况
    setConditionList: 'SET_CONDITION_LIST',
    getConditionList: 'GET_CONDITION_LIST',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES',
    // 城市权限
    getAuthorityList: 'GET_AUTHORITY_LIST',
    setAuthorityList: 'SET_AUTHORITY_LIST'
  }
})

export default actions
export { containerActions }
