import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'DatasourceManage',
  actions: {
    setChannelList: 'SET_CHANNEL_LIST',
    getChannelList: 'GET_CHANNEL_LIST',
    // 行政区
    getListByCity: 'GET_LIST_BY_CITY',
    // 产品列表详情
    getProductByCity: 'GET_PRODUCT_BY_CITY',
    // 保存产品列表
    saveProductList: 'SAVE_PRODUCT_LIST',
    // 数据字典
    setDataList: 'SET_DATA_LIST',
    getDataList: 'GET_DATA_LIST',
    // 删除
    delProduct: 'DEL_PRODUCT',
    // 产品列表
    setProductList: 'SET_PRODUCT_LIST',
    getProductList: 'GET_PRODUCT_LIST',

    // 验证行政区配置
    validateAreaConfig: 'VALIDATE_AREA_CONFIG',
    clearCaseList: 'CLEAR_CASE_LIST'
  }
})

export default actions
export { containerActions }
