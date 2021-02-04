import { take, fork, put, all } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/caseLosure.api'
import * as dictApi from 'client/api/dict.api'
import * as commonApi from 'client/api/common.api'
import actions from './actions'

/*模糊查询楼盘*/
function* getProjectsList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.FETCH_PROJECTS_LIST)
    try {
      const res = yield call(serverApi.fetchProjectsList, params, actions.FETCH_PROJECTS_LIST)
      yield put(actions.setProjectsList(res.data || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getAreaList() {
  while (true) {
    const {
      payload: [cityId]
    } = yield take(actions.GET_AREA_LIST)
    try {
      const { data: areaList } = yield call(serverApi.getAreaList, cityId)
      let newAreaList = []
      if (areaList) {
        newAreaList = areaList.map(({ id, areaName }) => ({
          key: id,
          label: areaName,
          value: `${id}`
        }))
      }
      yield put(actions.setAreaList(newAreaList))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 法拍案列列表
function* getClosureCaseTypeList() {
  while (true) {
    yield take(actions.GET_CLOSURE_CASE_TYPE_LIST)
    try {
      const { data: caseTypeList } = yield call(serverApi.getClosureCaseTypeList)
      let newCaseTypeList = []
      if (caseTypeList) {
        newCaseTypeList = caseTypeList.map(({ code, name }) => ({
          key: code,
          label: name,
          value: `${code}`
        }))
      }
      yield put(actions.setClosureCaseTypeList(newCaseTypeList))
    } catch (err) {
      handleErr(err)
    }
  }
}

/*售卖状态*/
function* getEndReasonCode() {
  while (true) {
    yield take(actions.GET_ENDREASON_CODE)
    try {
      const { data: endReasonCode } = yield call(serverApi.getEndReasonCode)
      let newEndReasonCode = []
      if (endReasonCode) {
        newEndReasonCode = endReasonCode.map(({ code, name }) => ({
          key: code,
          label: name,
          value: `${code}`
        }))
      }
      yield put(actions.setEndReasonCode(newEndReasonCode))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* fetchCaseList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.FETCH_CASE_LIST)
    try {
      const res = yield call(
        serverApi.fetchCaseList,
        params,
        actions.FETCH_CASE_LIST
      )
      yield put(actions.setCaseList(res.data || []))
    } catch (err) {
      handleErr(err)
    }
  }
}
// 错误楼盘名称列表
function* fetchErrorList() {
  while (true) {
    const {
      payload: [errorInfo]
    } = yield take(actions.FETCH_ERROR_LIST)
    try {
      const { data: errorCaseList } = yield call(
          commonApi.fetchErrorList,
          { errorInfo },
          actions.FETCH_ERROR_LIST
      )
      yield put(actions.setErrorList(errorCaseList))
    } catch (err) {
      handleErr(err)
    }
  }
}
// 删除 错误楼盘名称列表
function* deleteError() {
  while (true) {
    const {
      payload: [ids, cb]
    } = yield take(actions.DELETE_ERROR)
    try {
      const data = yield call(commonApi.deleteError, ids)
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 一键删除 错误楼盘名称列表
function* deleteAllError() {
  while (true) {
    const {
      payload: [delParams, cb]
    } = yield take(actions.DELETE_ALL_ERROR)
    try {
      const data = yield call(commonApi.deleteAllError, delParams)
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 错误楼盘名称列表 导出
function* exportErrorProject() {
  while (true) {
    const {
      payload: [exportQry, cb]
    } = yield take(actions.EXPORT_ERROR_PROJECT)
    try {
      yield call(commonApi.exportErrorProject, exportQry)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}
// 错误楼盘名称列表 导出
function* exportProjectAvg() {
  while (true) {
    const {
      payload: [exportQry, cb]
    } = yield take(actions.EXPORT_PROJECT_AVG)
    try {
      yield call(commonApi.exportProjectAvg, exportQry)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}
// 编辑楼盘名称
function* editProjectName() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.EDIT_PROJECT_NAME)
    try {
      const res = yield call(commonApi.editProjectName, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

// 城市权限
function* editAuthority() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EDIT_AUTHORITY)
    try {
      const { code, data, message } = yield call(
          commonApi.editAuthority,
          params
      )
      cb(code, data, message)
    } catch (err) {
      handleErr(err)
    }
    cb()
  }
}

function* initialFetch() {
  while (true) {
    yield take(actions.INITIAL_FETCH)
    try {
      const [
        { data: houseUsageList },
        { data: caseTypeList },
        { data: EndReasonCode },
        { data: orientTypeList },
        { data: buildTypeList },
        { data: houseTypeList },
        { data: structTypeList },
        { data: currencyTypeList }
      ] = yield all([
        call(dictApi.getHouseUsage),
        call(serverApi.getClosureCaseTypeList),
        call(serverApi.getEndReasonCode),
        call(dictApi.getOrientType),
        call(dictApi.getBuildingType),
        call(dictApi.getHouseType),
        call(dictApi.getStructType),
        call(dictApi.getCurrencyType)
      ])
      let newCaseTypeList = []
      let newEndReasonCode = []
      if (caseTypeList) {
        newCaseTypeList = caseTypeList.map(({ code, name }) => ({
          key: code,
          label: name,
          value: code
        }))
      }
      if(EndReasonCode){
        newEndReasonCode = EndReasonCode.map(({ code, name }) => ({
          key: code,
          label: name,
          value: code
        }))
      }
      yield all([
        put(actions.setHouseUsage(houseUsageList)),
        put(actions.setClosureCaseTypeList(newCaseTypeList)),
        put(actions.setEndReasonCode(newEndReasonCode)),
        put(actions.setOrientType(orientTypeList)),
        put(actions.setBuildingType(buildTypeList)),
        put(actions.setHouseType(houseTypeList)),
        put(actions.setStructType(structTypeList)),
        put(actions.setCurrencyType(currencyTypeList))
      ])
    } catch (err) {
      handleErr(err)
    }
  }
}

// 新增案例
function* addCase() {
  while (true) {
    const {
      payload: [caseDto, cb]
    } = yield take(actions.ADD_CASE)
    try {
      const data = yield call(serverApi.addCase, caseDto)
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* editCase() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EDIT_CASE)
    try {
      const data = yield call(serverApi.editCase, params)
      cb(data)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getCaseDetail() {
  while (true) {
    const {
      payload: [caseId, cityId]
    } = yield take(actions.GET_CASE_DETAIL)
    try {
      const { data: caseDetail } = yield call(serverApi.getCaseDetail, {
        caseId,
        cityId
      })
      yield put(actions.setCaseDetail(caseDetail))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* deleteCases() {
  while (true) {
    const {
      payload: [ids, cityId, cb]
    } = yield take(actions.DELETE_CASES)
    try {
      const data = yield call(serverApi.deleteCases, { ids, cityId })
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* deleteAllCases() {
  while (true) {
    const {
      payload: [delParams, cb]
    } = yield take(actions.DELETE_ALL_CASES)
    try {
      const data = yield call(serverApi.deleteAllCases, delParams)
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportCase() {
  while (true) {
    const {
      payload: [exportParams, cb]
    } = yield take(actions.EXPORT_CASE)
    try {
      yield call(serverApi.exportCase, exportParams)
      if (typeof cb === 'function') {
        cb()
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* updateVisitCities() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.UPDATE_VISIT_CITIES)
    try {
      const { data: res } = yield call(commonApi.updateVisitCities, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

// function* getAliaType() {
//   while (true) {
//     const {
//       payload: [projectParams, cb]
//     } = yield take(actions.GET_ALIA_TYPE)
//     try {
//       const res = yield call(serverApi.getAliaType, projectParams)
//       if (typeof cb === 'function') {
//         cb(res)
//       }
//     } catch (err) {
//       handleErr(err)
//     }
//   }
// }

injectSaga({
  namespace: 'caseLosure',
  sagas: function* caseLosureSaga() {
    yield fork(getProjectsList)
    yield fork(getAreaList)
    yield fork(getEndReasonCode)
    yield fork(getClosureCaseTypeList)
    yield fork(fetchCaseList)
    yield fork(initialFetch)
    yield fork(addCase)
    yield fork(editCase)
    yield fork(getCaseDetail)
    yield fork(deleteCases)
    yield fork(deleteAllCases)
    yield fork(exportCase)
    yield fork(updateVisitCities)
    yield fork(fetchErrorList)
    yield fork(deleteError)
    yield fork(deleteAllError)
    yield fork(exportErrorProject)
    yield fork(exportProjectAvg)
    yield fork(editProjectName)
    yield fork(editAuthority)
    // yield fork(getAliaType)
  }
})
