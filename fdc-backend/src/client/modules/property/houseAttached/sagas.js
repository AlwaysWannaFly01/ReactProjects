import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as baseInfoApi from 'client/api/baseInfo.api'
import * as dictApi from 'client/api/dict.api'
import * as houseAttachedApi from 'client/api/houseAttached.api'
import actions from './actions'

function* getProjectDetail() {
  while (true) {
    const {
      payload: [projectId, cityId]
    } = yield take(actions.GET_PROJECT_DETAIL)
    try {
      const { data: projectDetail } = yield call(baseInfoApi.getProjectDetail, {
        projectId,
        cityId
      })
      yield put(actions.setProjectDetail(projectDetail))
    } catch (err) {
      handleErr(err)
    }
  }
}
// 附属房屋 请求之前的接口 选择框
function* getSubHouseType() {
  while (true) {
    yield take(actions.GET_SUB_HOUSE_TYPE)
    try {
      const { data: subHouseTypeList } = yield call(dictApi.getSubHouseType)
      yield put(actions.setSubHouseType(subHouseTypeList))
    } catch (err) {
      handleErr(err)
    }
  }
}
// 附属房屋算法列表
function* getSubHouseList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_SUB_HOUSE_LIST)
    try {
      const { data } = yield call(
        houseAttachedApi.getSubHouseList,
        params,
        actions.GET_SUB_HOUSE_LIST
      )
      if (data) {
        yield put(actions.setSubHouseList(data))
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// // 附属房屋算法列表 改成回掉函数
// function* getSubHouseList() {
//   while (true) {
//     const {
//       payload: [data, cb]
//     } = yield take(actions.GET_SUB_HOUSE_LIST)
//     try {
//       const { data: res } = yield call(houseAttachedApi.getSubHouseList, data)
//       cb(res)
//     } catch (err) {
//       handleErr(err)
//     }
//   }
// }
// 新增弹窗 确定按钮
function* addAttachedHouse() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.ADD_ATTACHED_HOUSE)
    try {
      const res = yield call(houseAttachedApi.addAttachedHouse, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}
// 导出
function* exportAttachedHouse() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EXPORT_ATTACHED_HOUSE)
    try {
      yield call(houseAttachedApi.exportAttachedHouse, params)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}
// 删除
function* delAttachedHouse() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.DEL_ATTACHED_HOUSE)
    try {
      yield call(houseAttachedApi.delAttachedHouse, data)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}
// 编辑
function* editAttachedHouse() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.EDIT_ATTACHED_HOUSE)
    try {
      const res = yield call(houseAttachedApi.editAttachedHouse, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}
// 附属房屋 的 计算方法
function* getArithmeticType() {
  while (true) {
    yield take(actions.GET_ARITHMETIC_TYPE)
    try {
      const { data: subArithmeticList } = yield call(dictApi.getArithmeticType)
      yield put(actions.setArithmeticType(subArithmeticList))
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'houseAttached',
  sagas: function* houseStandSaga() {
    yield fork(getProjectDetail)
    yield fork(getSubHouseType)
    yield fork(getSubHouseList)
    yield fork(addAttachedHouse)
    yield fork(exportAttachedHouse)
    yield fork(delAttachedHouse)
    yield fork(editAttachedHouse)
    yield fork(getArithmeticType)
  }
})
