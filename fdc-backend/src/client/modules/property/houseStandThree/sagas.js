import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/houseStandThree.api'
import * as commonApi from 'client/api/common.api'
import actions from './actions'

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

// 下载错误数据
function* downloadErr() {
  while (true) {
    const {
      payload: [id, cb]
    } = yield take(actions.DOWNLOAD_ERR)
    try {
      yield call(serverApi.downloadErr, id)
      if (typeof cb === 'function') {
        cb()
      }
    } catch (err) {
      cb()
      handleErr(err)
    }
  }
}

// 导入通用接口 开始上传的确定按钮
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

function* exportTempExcel() {
  while (true) {
    const {
      payload: [cb]
    } = yield take(actions.EXPORT_TEMP_EXCEL)
    try {
      yield call(serverApi.exportTempExcel)
      cb()
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

// function* getImportExcelLogsCb() {
//   while (true) {
//     const {
//       payload: [data, cb]
//     } = yield take(actions.GET_IMPORT_EXCEL_LOGS_CB)
//     try {
//       const err = yield call(
//         serverApi.getImportExcelLogsCb,
//         data,
//         actions.GET_IMPORT_EXCEL_LOGS_CB
//       )
//       cb(err)
//     } catch (err) {
//       handleErr(err)
//     }
//   }
// }

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

// function* downCoefficientWord() {
//   while (true) {
//     yield take(actions.DOWN_COEFFICIENT_WORD)
//     try {
//       yield call(serverApi.downCoefficientWord)
//     } catch (err) {
//       handleErr(err)
//     }
//   }
// }

// function* exportErrorExcel() {
//   while (true) {
//     const {
//       payload: [id, cb]
//     } = yield take(actions.EXPORT_ERROR_EXCEL)
//     try {
//       yield call(serverApi.exportErrorExcel, id)
//       cb()
//     } catch (err) {
//       handleErr(err)
//     }
//   }
// }

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
      console.log(res)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'houseStandThree',
  sagas: function* houseStandSaga() {
    yield fork(getImportExcelLogs)
    yield fork(downloadErr)
    // yield fork(getImportExcelLogsCb)
    yield fork(delImportLogs)
    yield fork(exportExcelCoefficient)
    yield fork(importExcelCoefficient)
    yield fork(exportTempExcel)
    yield fork(delProjectCoef)
    yield fork(getProjectDetail)
    // yield fork(downCoefficientWord)
    // yield fork(exportErrorExcel)
    yield fork(updateVisitCities)
    yield fork(maxImportSize)
  }
})
