import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'roleManage',
  actions: {
    // 角色管理列表
    getAuthorityList: 'GET_AUTHORITY_LIST',
    setAuthorityList: 'SET_AUTHORITY_LIST',

    delAuthority: 'DEL_AUTHORITY',
    editProduct: 'EDIT_PRODUCT',
    getDataAuthority: 'GET_DATA_AUTHORITY',
    // setDataAuthority: 'SET_DATA_AUTHORITY',

    getRoleCity: 'GET_ROLE_CITY',
    getSetingRole: 'GET_SETING_ROLE',
    setSetingRole: 'SET_SETING_ROLE',

    getSaveRole: 'GET_SAVE_ROLE',
    setSaveRole: 'SET_SAVE_ROLE',
    allSaveRole: 'ALL_SAVE_ROLE',
    // 城市
    getAreaList: 'GET_AREA_LIST',

    getAuthorityCityList: 'GET_AUTHORITY_CITY_LIST', // wy add
    setAuthorityCityList: 'SET_AUTHORITY_CITY_LIST'
  }
})

export default actions
export { containerActions }
