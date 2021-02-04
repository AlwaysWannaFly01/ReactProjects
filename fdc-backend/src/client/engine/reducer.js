import { injectReducer } from 'client/utils/store'
import routes from 'client/router/config'
import { fromJS } from 'immutable'
//将数组或者对象转换为Immutable
import * as actions from './actions'

const getState = (initialState = {}) => ({
  routes, // metadata
  // sideNav: {
  //   list: [],
  //   openKeys: [],
  //   selectedKeys: []
  // },
  loading: [],

  userinfo: {},
  ...initialState,
  // 用户登录默认城市
  defaultCity: {
    provinceId: '',
    id: '',
    cityName: ''
  },

  // 菜单权限
  menuPerssions: {}
})

injectReducer({
  namespace: 'engine',
  initialState: getState({}),
  actionHandlers: {
    // [actions.SET_ROUTES]: (state, { config }) => {
    //   /* eslint-disable */
    //   console.log(openKeys)
    //   const { routes, sideMenus, openKeys, selectedKeys } = config
    //   const oldOpenKeys = state.getIn(['sideNav', 'openKeys'])
    //   const mergeObject = {
    //     list: sideMenus,
    //     openKeys: Set([...oldOpenKeys, ...openKeys]).toJS(),
    //     selectedKeys
    //   }
    //   if (routes) {
    //     state = state.merge({
    //       routes
    //     })
    //   }
    //   return state.merge({
    //     sideNav: mergeObject
    //   })
    // },
    // [actions.SET_OPEN_KEYS]: (state, { openKeys }) =>
    //   state.setIn(['sideNav', 'openKeys'], fromJS(openKeys)),
    [actions.SET_LOADING]: (state, { loadingName }) =>
      state.update('loading', loading => loading.push(loadingName)),
    [actions.DELETE_LOADING]: (state, { loadingName }) =>
      state.update('loading', loading =>
        loading.filter(item => item !== loadingName)
      ),
    [actions.SET_DEFAULT_CITY]: (state, { defaultCity }) =>
      state.set('defaultCity', fromJS(defaultCity)),
    [actions.SET_MENU_PERMISSIONS]: (state, { menuPermissions }) =>
      state.set('menuPerssions', fromJS(menuPermissions))
  }
})

export default getState
