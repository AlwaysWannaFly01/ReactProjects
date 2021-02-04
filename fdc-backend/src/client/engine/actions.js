import { bindActionCreators } from 'redux'
import isNode from 'detect-node'

export const SET_ROUTES = 'engine/SET_ROUTES'
export const setRoutes = config => ({ type: SET_ROUTES, config })

export const UPDATE_SIDE_MENUS = 'engine/UPDATE_SIDE_MENUS'
export const updateSideMenus = ({ pathname }) => ({
  type: UPDATE_SIDE_MENUS,
  pathname
})

export const SET_OPEN_KEYS = 'engine/SET_OPEN_KEYS'
export const setOpenKeys = openKeys => dispatch =>
  dispatch({ type: SET_OPEN_KEYS, openKeys })

export const SET_SIDE_MENUS = 'engine/SET_SIDE_MENUS'
export const setSideMenus = config => ({ type: SET_SIDE_MENUS, config })

export const SET_LOADING = 'engine/SET_LOADING'
export const setLoading = loadingName => dispatch => {
  if (!isNode && loadingName) {
    dispatch({ type: SET_LOADING, loadingName })
  }
}

export const DELETE_LOADING = 'engine/DELETE_LOADING'
export const deleteLoading = loadingName => dispatch => {
  if (!isNode && loadingName) {
    dispatch({ type: DELETE_LOADING, loadingName })
  }
}

export const GET_DEFAULT_CITY = 'engine/GET_DEFAULT_CITY'
export const getDefaultCity = () => ({ type: GET_DEFAULT_CITY })

export const SET_DEFAULT_CITY = 'engine/SET_DEFAULT_CITY'
export const setDefaultCity = defaultCity => ({
  type: SET_DEFAULT_CITY,
  defaultCity
})

export const GET_MENU_PERMISSIONS = 'engine/GET_MENU_PERMISSIONS'
export const getMenuPermissions = () => ({ type: GET_MENU_PERMISSIONS })
export const SET_MENU_PERMISSIONS = 'engine/SET_MENU_PERMISSIONS'
export const setMenuPermissions = menuPermissions => ({
  type: SET_MENU_PERMISSIONS,
  menuPermissions
})

export const containerActions = dispatch =>
  bindActionCreators(
    {
      // getRoutes,
      updateSideMenus,
      setOpenKeys,
      getDefaultCity,
      setDefaultCity,

      getMenuPermissions,
      setMenuPermissions
    },
    dispatch
  )
