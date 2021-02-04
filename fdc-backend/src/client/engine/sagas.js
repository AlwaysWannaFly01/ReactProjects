import { take, fork, call, put, select } from 'redux-saga/effects'
import isNode from 'detect-node'
import { injectSaga } from 'client/utils/store'
import * as serverApi from 'client/api/common.api'
import * as actions from './actions'

function path2array(pathname) {
  return pathname.split('/').slice(1)
}

/**
 * 根据deep返回是否相等
 * @param  {Array} path1
 * @param  {Array} path2
 * @param  {Number} deep
 * @return {Boolean}
 */
function equalsPath(path1, path2, deep) {
  let matches = 0
  path1.some((item, index) => {
    if (item === path2[index]) {
      matches += 1
      return false
    }
    return true
  })
  // 根据路由定义规则，匹配4个以上返回true
  return matches >= deep
}

/**
 * 递归查找openKeys 和 selectedKeys
 * @param  {Array} menus
 * @param  {String} pathname
 * @return {Object}
 */
function walkMenuByPath(menus, pathname, deep) {
  let ret
  menus.some(item => {
    if (ret) {
      return true
    }
    // 没有二级以上的菜单
    if (item.path) {
      if (equalsPath(path2array(item.path), pathname, deep)) {
        ret = {
          openKeys: [],
          selectedKeys: [item.key]
        }
      }
    } else if (item.children) {
      ret = walkMenuByPath(item.children, pathname, deep + 1)
      if (ret) {
        ret.openKeys = [...ret.openKeys, item.key]
      }
    }
    return false
  })
  return ret
}

/**
 * 解析路由json
 * @param  {String} pathname
 * @param  {Array} routes
 * @return {Object}
 */
function parsePath(pathname, routes) {
  const ret = {
    openKeys: [],
    selectedKeys: [],
    sideMenus: routes
  }
  const arrayPathname = path2array(pathname)
  // 查找openKeys 和 selectedKeys
  const mergeRet = walkMenuByPath(ret.sideMenus, arrayPathname, 1) || {}
  return {
    ...ret,
    ...mergeRet
  }
}

function* setRoutes(pathname, menus) {
  const ret = parsePath(pathname, menus)
  ret.routes = menus
  // ret.lastMatch = getMenuPath(pathname)
  yield put(actions.setRoutes(ret))
}

function* updateSideMenus() {
  while (true) {
    const { pathname } = yield take(actions.UPDATE_SIDE_MENUS)
    const menus = yield select(state => state.engine.get('routes'))
    console.log(pathname, menus.toJS())
    yield call(setRoutes, pathname, menus.toJS())
  }
}

function* getDefaultCity() {
  while (true) {
    yield take(actions.GET_DEFAULT_CITY)
    try {
      const { data: defaultCity } = yield call(serverApi.getDefaultCity)
      console.log(!isNode && defaultCity)
      if (!isNode && defaultCity) {
        const { id } = defaultCity
        sessionStorage.setItem('FDC_CITY', id)
        sessionStorage.setItem('FDC_CITY_INFO', JSON.stringify(defaultCity))
      }
      // console.log(defaultCity, 11)
      yield put(actions.setDefaultCity(defaultCity || {}))
    } catch (err) {
      console.log(err)
    }
  }
}

// 取resourceCodeList 递归
const resourceCodeList = []
function getResourceCode(menus) {
  menus.forEach(item => {
    resourceCodeList.push({
      resourceCode: item.resourceCode,
      resourceName: item.resourceName
    })
    if (item.childrens && item.childrens.length > 0) {
      getResourceCode(item.childrens)
    }
  })
  return resourceCodeList
}

function* getMenuPermissions() {
  while (true) {
    yield take(actions.GET_MENU_PERMISSIONS)
    try {
      const { data: menuPermissions } = yield call(serverApi.getMenuPermissions)
      if (menuPermissions && menuPermissions.length) {
        const menus = getResourceCode(menuPermissions)
          localStorage.setItem('menuAuth', JSON.stringify(menus))
      } else {
          localStorage.removeItem('menuAuth')
      }
      yield put(actions.setMenuPermissions(menuPermissions))
    } catch (err) {
      console.log(err)
    }
  }
}

injectSaga({
  namespace: 'engine',
  sagas: function* mainSaga() {
    yield fork(updateSideMenus)
    yield fork(getDefaultCity)
    yield fork(getMenuPermissions)
  }
})
