import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/houseStand.api'
import * as commonApi from 'client/api/common.api'
import actions from './actions'

function* getCoefficientList() {
  while (true) {
    const {
      payload: [qry]
    } = yield take(actions.GET_COEFFICIENT_LIST)
    try {
      const { data: coefficientList } = yield call(
        serverApi.getCoefficientList,
        qry,
        actions.GET_COEFFICIENT_LIST
      )
      if (coefficientList.records) {
        coefficientList.records.map(item => {
          item.key = item.id
          return item
        })
      }

      yield put(actions.setCoefficientList(coefficientList))
    } catch (err) {
      handleErr(err)
    }
  }
}
// 2019.6.5 1.5版本导入为无数据查看权限时
function* getImportExcelLogs() {
  while (true) {
    const {
      payload: [data]
    } = yield take(actions.GET_IMPORT_EXCEL_LOGS)
    try {
      const { data: importLogList } = yield call(
        serverApi.getImportExcelLogs,
        data,
        actions.GET_IMPORT_EXCEL_LOGS
      )
      if (importLogList.records) {
        importLogList.records.map(item => {
          item.key = item.id
          return item
        })
      }
      yield put(actions.setImportExcelLogs(importLogList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getImportExcelLogsCb() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.GET_IMPORT_EXCEL_LOGS_CB)
    try {
      const err = yield call(
        serverApi.getImportExcelLogsCb,
        data,
        actions.GET_IMPORT_EXCEL_LOGS_CB
      )
      cb(err)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* delImportLogs() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.DEL_IMPORT_LOGS)
    try {
      yield call(serverApi.delImportLogs, data)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportExcelCoefficient() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.EXPORT_EXCEL_COEFFICIENT)
    try {
      yield call(serverApi.exportExcelCoefficient, data)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

function* importExcelCoefficient() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.IMPORT_EXCEL_COEFFICIENT)
    try {
      yield call(serverApi.importExcelCoefficient, data)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportTempExcel() {
  while (true) {
    yield take(actions.EXPORT_TEMP_EXCEL)
    try {
      yield call(serverApi.exportTempExcel)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* delProjectCoef() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.DEL_PROJECT_COEF)
    try {
      yield call(serverApi.delProjectCoef, data)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getProjectDetail() {
  while (true) {
    const {
      payload: [projectId, cityId]
    } = yield take(actions.GET_PROJECT_DETAIL)
    try {
      const { data: projectDetail } = yield call(serverApi.getProjectDetail, {
        projectId,
        cityId
      })
      yield put(actions.setProjectDetail(projectDetail))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* downCoefficientWord() {
  while (true) {
    yield take(actions.DOWN_COEFFICIENT_WORD)
    try {
      yield call(serverApi.downCoefficientWord)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportErrorExcel() {
  while (true) {
    const {
      payload: [id, cb]
    } = yield take(actions.EXPORT_ERROR_EXCEL)
    try {
      yield call(serverApi.exportErrorExcel, id)
      cb()
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


// 获取限制导入文件大小
function* maxImportSize() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.MAX_IMPORT_SIZE)
    try {
      const { data: res } = yield call(commonApi.maxImportSize, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'houseStand',
  sagas: function* houseStandSaga() {
    yield fork(getCoefficientList)
    yield fork(getImportExcelLogs)
    yield fork(getImportExcelLogsCb)
    yield fork(delImportLogs)
    yield fork(exportExcelCoefficient)
    yield fork(importExcelCoefficient)
    yield fork(exportTempExcel)
    yield fork(delProjectCoef)
    yield fork(getProjectDetail)
    yield fork(downCoefficientWord)
    yield fork(exportErrorExcel)
    yield fork(updateVisitCities)
    yield fork(maxImportSize)
  }
})
