import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/estateRating.api'
import * as dictApi from 'client/api/dict.api'
import actions from './actions'

function* getAreaList() {
  while (true) {
    const {
      payload: [cityId, cb]
    } = yield take(actions.GET_AREA_LIST)
    try {
      const res = yield call(dictApi.getAreaList, cityId)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getLoopLine() {
  while (true) {
    const {
      payload: [cb]
    } = yield take(actions.GET_LOOP_LINE)
    try {
      const res = yield call(serverApi.getLoopLine)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getSubAreas() {
  while (true) {
    const {
      payload: [areaId, cb]
    } = yield take(actions.GET_SUB_AREAS)
    try {
      const { data } = yield call(dictApi.getSubAreas, areaId)
      cb(data)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getRatingRuleSearch() {
  while (true) {
    const {
      payload: [searchRatingRule]
    } = yield take(actions.GET_RATING_RULE_SEARCH)
    try {
      const { data: ratingRlueList } = yield call(
        serverApi.getRatingRuleSearch,
        searchRatingRule,
        actions.GET_RATING_RULE_SEARCH
      )
      yield put(actions.setRatingRuleSearch(ratingRlueList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportGradeRules() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EXPORT_GRADE_RULES)
    try {
      const res = yield call(serverApi.exportGradeRules, params)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

// 楼盘评级规则修改(规则不存在就添加)
function* editEstateRating() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EDIT_ESTATE_RATING)
    try {
      const res = yield call(serverApi.editEstateRating, params)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'estateRating',
  sagas: function* dataAreaRentalSaga() {
    yield fork(getAreaList)
    yield fork(getLoopLine)
    yield fork(getSubAreas)
    yield fork(getRatingRuleSearch)
    yield fork(exportGradeRules)
    yield fork(editEstateRating)
  }
})
