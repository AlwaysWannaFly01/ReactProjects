import { take, fork } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import API from 'client/api/baseDataImport.api'
import * as commonApi from 'client/api/common.api'
import { actions } from './action'

// 取消 导入日志上传
function* importCanel() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.IMPORT_CANEL)
    try {
      const data = yield call(API.importCanel, params)
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}
// 加载 导入日志列表
function* fetchImportLogs() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.FETCH_IMPORT_LOGS)
    try {
      // const { data } = yield call(API.fetchImportLogs, params)
      // if (typeof cb === 'function') {
      //   cb(data)
      // }
      const err = yield call(API.fetchImportLogs, params)
      if (typeof cb === 'function') {
        cb(err)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}


// 删除 导入日志列表
function* delLogs() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.DELETE_LOGS)
    try {
      const { data } = yield call(API.deleteLogs, params)
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 导入类型
function* queryImportTypes() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.QUERY_IMPORT_TYPE)
    try {
      const { data } = yield call(API.fetchImportTypes, params)
      if (typeof cb === 'function') {
        cb(data)
      }
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
// 导入模板下载
function* downloadTemplate() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.DOWNLOAD_TEMPLATE)
    try {
      const type = params.type
      switch (type) {
          // 法拍案例
        case '1212134':
          params.url = '/fdc/excel/template/foreclosureCase'
          yield call(API.downloadTemp, params)
          break
        // 楼盘别名
        case '1212106':
          params.url = '/fdc/excel/template/alias'
          yield call(API.downloadTemp, params)
          break
        case '1212108':
          params.url = '/fdc/excel/template/address'
          yield call(API.downloadTemp, params)
          break
        // 楼盘均价列表三个接口
        case '1212004':
        case '1212104':
        case '1212107':
          params.url = '/fdc/excel/template/project'
          yield call(API.downloadTemp, params)
          break
        case '1212121':
          params.url = '/fdc/excel/template/projectBuildingTypeRate'
          yield call(API.downloadTemp, params)
          break
        // 案例数据
        case '1212003':
          params.url = '/fdc/excel/template/case'
          yield call(API.downloadTemp, params)
          break
        // 样本案例
        case '1212112':
          params.url = '/fdc/excel/template/sampleCase'
          yield call(API.downloadTemp, params)
          break
        // 住宅样本楼盘
        case '1212117':
          params.url = '/fdc/excel/template/sampleProject' // todo
          yield call(API.downloadTemp, params)
          break
        // 附属房屋算法
        case '1212118':
          params.url = '/fdc/excel/template/subHouseSetting' // todo
          yield call(API.downloadTemp, params)
          break
        // 租金案例
        case '1212113':
          params.url = '/fdc/excel/template/rentCase'
          yield call(API.downloadTemp, params)
          break
        // 长租公寓
        case '1212114':
          params.url = '/fdc/excel/template/rentApartmentCase'
          yield call(API.downloadTemp, params)
          break
        // 商业
        case '1212124':
          params.url = '/fdc/excel/template/commercial'
          yield call(API.downloadTemp, params)
          break
        // 楼盘配套
        case '1212115':
          params.url = '/fdc/excel/template/projectFacilities'
          yield call(API.downloadTemp, params)
          break
        // 公共配套
        case '1212116':
          params.url = '/fdc/excel/template/commonFacilties'
          yield call(API.downloadTemp, params)
          break
        // 城市均价
        case '1212111':
          params.url = '/fdc/excel/template/cityAvgPrice'
          yield call(API.downloadTemp, params)
          break

        // 网络参考价 wy
        case '1212119':
          params.url = '/fdc/excel/template/reference'
          yield call(API.downloadTemp, params)
          break
        // 楼盘评级结果
        case '1212131':
          params.url = '/fdc/excel/template/projectGrade'
          yield call(API.downloadTemp, params)
          break
        // 楼盘评级规则
        case '1212132':
          params.url = '/fdc/excel/template/projectGradeRules'
          yield call(API.downloadTemp, params)
          break
        case '1212133':
          params.url = '/fdc/excel/template/reference'
          yield call(API.downloadTemp, params)
          break
        default:
          params.url = '/fdc/excel/template/project'
          yield call(API.downloadTemp, params)
          break
      }
      if (typeof cb === 'function') {
        cb()
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 住宅楼盘信息导入
function* handupFile() {
  while (true) {
    const {
      payload: [formData, cb]
    } = yield take(actions.HANDUP_FILE)
    try {
      yield call(API.fdcCommonImport, formData)
      if (typeof cb === 'function') {
        cb()
      }
    } catch (err) {
      if (typeof cb === 'function') {
        cb(err)
      }
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
      yield call(API.exportErr, id)
      if (typeof cb === 'function') {
        cb()
      }
    } catch (err) {
      cb()
      handleErr(err)
    }
  }
}

// 下载楼盘名称错误数据条数
function* downloadErrProjectName() {
  while (true) {
    const {
      payload: [id, cb]
    } = yield take(actions.DOWNLOAD_ERR_PROJECT_NAME)
    try {
      yield call(API.exportErrProjectName, id)
      if (typeof cb === 'function') {
        cb()
      }
    } catch (err) {
      cb()
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

injectSaga({
  namespace: 'commonImport',
  sagas: function* CaseRelate() {
    yield fork(importCanel)
    yield fork(downloadErr)
    yield fork(downloadErrProjectName)
    yield fork(queryImportTypes)
    yield fork(fetchImportLogs)
    yield fork(delLogs)
    yield fork(downloadTemplate)
    yield fork(handupFile)
    yield fork(updateVisitCities)
    yield fork(maxImportSize)
  }
})
