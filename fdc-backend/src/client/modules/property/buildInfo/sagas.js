import { take, fork, put, all } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/buildInfo.api'
import * as dictApi from 'client/api/dict.api'
import * as commonApi from 'client/api/common.api'
import actions from './actions'

function* getBuildInfoList() {
  while (true) {
    const {
      payload: [qry]
    } = yield take(actions.GET_BUILD_INFO_LIST)
    try {
      const { data: buildInfoList } = yield call(
        serverApi.getBuildInfoList,
        qry,
        actions.GET_BUILD_INFO_LIST
      )
      buildInfoList.records.map(item => {
        item.key = item.id
        return item
      })

      const { cityId, projectId } = qry
      const buildTotalParams = {
        cityId,
        projectId
      }
      const { data: buildTotal } = yield call(
        serverApi.getBuildTotal,
        buildTotalParams
      )
      yield put(actions.setBuildTotal(buildTotal))
      yield put(actions.setBuildInfoList(buildInfoList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* delBuild() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.DEL_BUILD)
    try {
      yield call(serverApi.delBuild, data)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

function* restoreBuild() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.RESTORE_BUILD)
    try {
      const { data: res } = yield call(
        serverApi.restoreBuild,
        data,
        actions.GET_BUILD_INFO_LIST
      )
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* batchUpdateBuild() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.BATCH_UPDATE_BUILD)
    try {
      const { data: res } = yield call(serverApi.batchUpdateBuild, data)
      cb(true, res)
    } catch (err) {
      cb(false)
      handleErr(err)
    }
  }
}

function* addBuild() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.ADD_BUILD)
    try {
      const res = yield call(serverApi.addBuild, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* editBuild() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.EDIT_BUILD)
    try {
      const res = yield call(serverApi.editBuild, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* calculateHouse() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.CALCULATE_HOUSE)
    try {
      const { data: res } = yield call(serverApi.calculateHouse, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* syncHouse() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.SYNC_HOUSE)
    try {
      const { data: res } = yield call(serverApi.syncHouse, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getBuildDetail() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_BUILD_DETAIL)
    try {
      const { data: buildDetail } = yield call(serverApi.getBuildDetail, params)
      cb()
      yield put(actions.setBuildDetail(buildDetail))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* initialAddFetchFirst() {
  while (true) {
    yield take(actions.INITIAL_ADD_FETCH_FIRST)
    try {
      const [
        { data: owershipTypeList },
        { data: actualUsageTypeList },
        { data: objectTypeList },
        { data: usageTypeList },
        { data: buildingTypeList }
      ] = yield all([
        call(dictApi.getOwershipType),
        call(dictApi.getActualUsageType),
        call(dictApi.getObjectType),
        call(dictApi.getUsageType),
        call(dictApi.getBuildingType)
      ])
      yield all([
        put(actions.setOwershipType(owershipTypeList)),
        put(actions.setActualUsageType(actualUsageTypeList)),
        put(actions.setObjectType(objectTypeList)),
        put(actions.setUsageType(usageTypeList)),
        put(actions.setBuildingType(buildingTypeList))
      ])
    } catch (err) {
      handleErr(err)
    }
  }
}

function* initialAddFetchThird() {
  while (true) {
    yield take(actions.INITIAL_ADD_FETCH_THIRD)
    try {
      const [
        { data: orientTypeList },
        { data: sightTypeList },
        { data: buildStructureList },
        { data: locationCodeList },
        { data: houseAreaCodeList }
      ] = yield all([
        call(dictApi.getOrientType),
        call(dictApi.getSightType),
        call(dictApi.getBuildStructure),
        call(dictApi.getLocationCode),
        call(dictApi.getHouseAreaCode)
      ])
      yield all([
        put(actions.setOrientType(orientTypeList)),
        put(actions.setSightType(sightTypeList)),
        put(actions.setBuildStructure(buildStructureList)),
        put(actions.setLocationCode(locationCodeList)),
        put(actions.setHouseAreaCode(houseAreaCodeList))
      ])
    } catch (err) {
      handleErr(err)
    }
  }
}

function* initialAddFetchForth() {
  while (true) {
    yield take(actions.INITIAL_ADD_FETCH_FORTH)
    try {
      const [
        { data: externalWallList },
        { data: insideDecorateTypeList },
        { data: wallTypeList },
        { data: maintenanceCodeList },
        { data: gasCodeList },
        { data: warmCodeList }
      ] = yield all([
        call(dictApi.getExternalWall),
        call(dictApi.getInsideDecorateType),
        call(dictApi.getWallTypeCode),
        call(dictApi.getMaintenanceCode),
        call(dictApi.getGasCode),
        call(dictApi.getWarmCode)
      ])
      yield all([
        put(actions.setExternalWall(externalWallList)),
        put(actions.setInsideDecorateType(insideDecorateTypeList)),
        put(actions.setWallTypeCode(wallTypeList)),
        put(actions.setMaintenanceCode(maintenanceCodeList)),
        put(actions.setGasCode(gasCodeList)),
        put(actions.setWarmCode(warmCodeList))
      ])
    } catch (err) {
      handleErr(err)
    }
  }
}

function* validBuildCopy() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.VALID_BUILD_COPY)
    try {
      const { data: res } = yield call(serverApi.validBuildCopy, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* buildCopy() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.BUILD_COPY)
    try {
      const { data: res } = yield call(serverApi.buildCopy, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* validBuildName() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.VALID_BUILD_NAME)
    try {
      const { data: res } = yield call(serverApi.validBuildName, data)
      cb(res)
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
  namespace: 'buildInfo',
  sagas: function* buildInfoSaga() {
    yield fork(getBuildInfoList)
    yield fork(addBuild)
    yield fork(editBuild)
    yield fork(delBuild)
    yield fork(restoreBuild)
    yield fork(batchUpdateBuild)
    yield fork(calculateHouse)
    yield fork(syncHouse)
    yield fork(getBuildDetail)
    yield fork(initialAddFetchFirst)
    yield fork(initialAddFetchThird)
    yield fork(initialAddFetchForth)
    yield fork(validBuildCopy)
    yield fork(buildCopy)
    yield fork(validBuildName)
    yield fork(getProjectDetail)
    yield fork(updateVisitCities)
  }
})
