import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/estateRating.api'
import * as commonApi from 'client/api/common.api'
// import moment from 'moment'
import actions from './actions'

// 获取行政区列表
function* getAreaList() {
  while (true) {
    const {
      payload: [cityId]
    } = yield take(actions.GET_AREA_LIST)
    try {
      const { data: areaList } = yield call(commonApi.getAreaList, cityId)
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

function* getEstateRatingSearch() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.GET_ESTATE_RATING_SEARCH)
    try {
      const data = yield call(
        serverApi.getEstateRatingSearch,
        params,
        actions.GET_ESTATE_RATING_SEARCH
      )
      const {data:estateRatingList} = data
      yield put(actions.setEstateRatingSearch(estateRatingList))
      cb(data)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportRatingResult() {
  while (true) {
    const {
      payload: [exportParams, cb]
    } = yield take(actions.EXPORT_RATING_RESULT)
    try {
      const res = yield call(serverApi.exportRatingResult, exportParams)
      if (typeof cb === 'function') {
        cb(res)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportRatingResultHistory() {
  while (true) {
    const {
      payload: [exportParams, cb]
    } = yield take(actions.EXPORT_RATING_RESULT_HISTORY)
    try {
      const res = yield call(serverApi.exportRatingResultHistory, exportParams)
      if (typeof cb === 'function') {
        cb(res)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getRatingRuleDetail() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_RATING_RULE_DETAIL)
    try {
      const { data: ratingRuleDetail } = yield call(
        serverApi.getRatingRuleDetail,
        params,
        actions.GET_RATING_RULE_DETAIL
      )
      yield put(actions.setRatingRuleDetail(ratingRuleDetail))
      if (typeof cb === 'function') {
        cb(ratingRuleDetail)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 楼盘评级修改
function* editRatingResult() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EDIT_RATING_RESULT)
    try {
      const res = yield call(serverApi.editRatingResult, params)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

// 楼盘评级修改
function* addRatingResult() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.ADD_RATING_RESULT)
    try {
      const res = yield call(serverApi.addRatingResult, params)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getAllDetail() {
  while (true) {
    const {
      payload: [projectId, cityId]
    } = yield take(actions.GET_ALL_DETAIL)
    try {
      const { data: projectDetail } = yield call(serverApi.getAllDetail, {
        projectId,
        cityId
      })
      yield put(actions.setAllDetail(projectDetail))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getRatingHistory() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_RATING_HISTORY)
    try {
      const { data: ratingHistory } = yield call(
        serverApi.getRatingHistory,
        params,
        actions.GET_RATING_HISTORY
      )
      yield put(actions.setRatingHistory(ratingHistory))
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

// 楼盘评级规则详情
function* getGradeDetail() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_GRADE_DETAIL)
    try {
      const res = yield call(serverApi.getGradeDetail, params)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'ResRating',
  sagas: function* resRatingSaga() {
    yield fork(getAreaList)
    yield fork(getEstateRatingSearch)
    yield fork(exportRatingResult)
    yield fork(exportRatingResultHistory)
    yield fork(getRatingRuleDetail)
    yield fork(editRatingResult)
    yield fork(addRatingResult)
    yield fork(getAllDetail)
    yield fork(getRatingHistory)
    yield fork(updateVisitCities)
    yield fork(getGradeDetail)
  }
})
