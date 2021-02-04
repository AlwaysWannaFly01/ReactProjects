import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as authorityApi from 'client/api/authority.api'
import * as dictApi from 'client/api/dict.api'
import * as commonApi from 'client/api/common.api'
import actions from './actions'

// 角色管理列表
function* getAuthorityList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_AUTHORITY_LIST)
    try {
      const { data: authorityList } = yield call(
        authorityApi.getAuthorityList,
        params
      )
      yield put(actions.setAuthorityList(authorityList))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 删除
function* delAuthority() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.DEL_AUTHORITY)
    try {
      yield call(authorityApi.delAuthority, params)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

// 添加/编辑产品
function* editProduct() {
  while (true) {
    const {
      payload: [payload, cb]
    } = yield take(actions.EDIT_PRODUCT)
    try {
      yield call(authorityApi.editProduct, payload)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

// 数据权限
function* getDataAuthority() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_DATA_AUTHORITY)
    try {
      const { data } = yield call(authorityApi.getDataAuthority, params)
      cb(data)
    } catch (err) {
      handleErr(err)
    }
  }
}
// 设置角色权限
function* getSetingRole() {
  while (true) {
    const {
      payload: [roleId, params, cb]
    } = yield take(actions.GET_SETING_ROLE)
    try {
      const err = yield call(authorityApi.getSetingRole, {
        roleId,
        params
      })
      cb(err)
      // yield put(actions.setSetingRole(data))
    } catch (err) {
      handleErr(err)
    }
  }
}

export function getChildren(nodeList, jsonData) {
  nodeList.forEach(elemet => {
    elemet.children = jsonData.filter(item => item.pid === elemet.resourceId)

    if (elemet.children.length > 0) {
      getChildren(elemet.children, jsonData)
    } else {
      delete elemet.children
    }
  })
}

export function fn(jsonData) {
  // 取得顶级的数据
  const resultObj = []
  const baseNode = jsonData.filter(element => element.pid === '0')
  resultObj.push(...baseNode)
  getChildren(resultObj, jsonData)
  return resultObj
}

export function getKeys(obj) {
  const keys = obj.filter(i => i.status === 1)
  return keys.map(i => i.key)
}

// export function sortData(jsonSort) {

// }

// 查询角色菜单资源权限
function* getSaveRole() {
  while (true) {
    const {
      payload: [roleId, cb]
    } = yield take(actions.GET_SAVE_ROLE)
    try {
      const {
        data: { list }
      } = yield call(authorityApi.getSaveRole, roleId)
      // console.log(fn(list))
      yield put(actions.allSaveRole(list))
      yield put(actions.setSaveRole(fn(list)))
      cb(list)
    } catch (err) {
      handleErr(err)
    }
  }
}

// 城市
function* getRoleCity() {
  while (true) {
    const {
      payload: [cityId, cb]
    } = yield take(actions.GET_ROLE_CITY)
    try {
      const { data } = yield call(authorityApi.getRoleCity, cityId)
      cb(data)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getAreaList() {
  while (true) {
    const {
      payload: [cityId, cb]
    } = yield take(actions.GET_AREA_LIST)
    try {
      const { data } = yield call(dictApi.getAreaList, cityId)
      cb(data)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getAuthorityCityList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_AUTHORITY_CITY_LIST)
    try {
      const { data: authorityCity } = yield call(
        commonApi.getAuthorityCityList,
        params
      )
      yield put(actions.setAuthorityCityList(authorityCity))
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'roleManage',
  sagas: function* DatasourceManageSaga() {
    yield fork(getAuthorityList)
    yield fork(delAuthority)
    yield fork(editProduct)
    yield fork(getDataAuthority)
    yield fork(getSetingRole)
    yield fork(getSaveRole)
    yield fork(getRoleCity)
    yield fork(getAreaList)
    yield fork(getAuthorityCityList)
  }
})
