import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/exportTask.api'
import * as dictApi from 'client/api/dict.api'
import actions from './actions'

function* getExportType() {
  while (true) {
    const {
      payload: [moduleType]
    } = yield take(actions.GET_EXPORT_TYPE)
    try {
      const { data: exportTypeList } = yield call(
        dictApi.getExportType,
        moduleType
      )
      yield put(actions.setExportType(exportTypeList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getExportTaskList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_EXPORT_TASK_LIST)
    try {
      const { data } = yield call(
        serverApi.getExportTaskList,
        params,
        actions.GET_EXPORT_TASK_LIST
      )
      if (data) {
        yield put(actions.setExportTaskList(data))
      }
    } catch (err) {
      handleErr(err)
    }
  }
}
// 2019.6.6 1.5版本导入为无数据查看权限时
function* getExportTaskListCb() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_EXPORT_TASK_LIST_CB)
    try {
      const err = yield call(
        serverApi.getExportTaskListCb,
        params,
        actions.GET_EXPORT_TASK_LIST_CB
      )
      cb(err)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* downExportTaskExcel() {
  while (true) {
    const {
      payload: [id, cb]
    } = yield take(actions.DOWN_EXPORT_TASK_EXCEL)
    try {
      const res = yield call(serverApi.downExportTaskExcel, id)
      if (res) {
        cb(res)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}
// 删除 WY
function* getDelExport() {
  while (true) {
    const {
      payload: [ids, cb]
    } = yield take(actions.GET_DEL_EXPORT)
    try {
      const { code, message } = yield call(serverApi.getDelExport, {
        ids
      })
      if (typeof cb === 'function') {
        cb(code, message)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'commonExportTask',
  sagas: function* exportTaskSaga() {
    yield fork(getExportType)
    yield fork(getExportTaskList)
    yield fork(getExportTaskListCb)
    yield fork(downExportTaskExcel)
    yield fork(getDelExport)
  }
})
