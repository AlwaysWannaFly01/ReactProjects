import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'houseAttached',
  actions: {
    getProjectDetail: 'GET_PROJECT_DETAIL',
    setProjectDetail: 'SET_PROJECT_DETAIL',
    // 附属房屋 请求之前的接口 选择框
    getSubHouseType: 'GET_SUB_HOUSE_TYPE',
    setSubHouseType: 'SET_SUB_HOUSE_TYPE',
    // 附属房屋算法列表
    getSubHouseList: 'GET_SUB_HOUSE_LIST',
    setSubHouseList: 'SET_SUB_HOUSE_LIST',
    // 新增弹窗 确定按钮
    addAttachedHouse: 'ADD_ATTACHED_HOUSE',
    // 导出
    exportAttachedHouse: 'EXPORT_ATTACHED_HOUSE',
    // 删除
    delAttachedHouse: 'DEL_ATTACHED_HOUSE',
    // 编辑
    editAttachedHouse: 'EDIT_ATTACHED_HOUSE',
    // 附属房屋 的 计算方法
    getArithmeticType: 'GET_ARITHMETIC_TYPE',
    setArithmeticType: 'SET_ARITHMETIC_TYPE'
  }
})

export default actions
export { containerActions }
