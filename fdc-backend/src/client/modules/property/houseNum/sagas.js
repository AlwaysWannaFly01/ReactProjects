import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/houseNum.api'
import * as dictApi from 'client/api/dict.api'
import * as buildInfoApi from 'client/api/buildInfo.api'
import * as commonApi from 'client/api/common.api'
import actions from './actions'

function* getDataList() {
  while (true) {
    const {
      payload: [qry]
    } = yield take(actions.GET_DATA_LIST)
    try {
      const { data } = yield call(
        serverApi.getDataList,
        qry,
        actions.GET_DATA_LIST
      )
      // 用于HouseFloor组件
      // floorList、houseColList按照数据返回的顺序排序
      const floorList = []
      const houseColList = []

      data.dataList.map(item => {
        floorList.push(item.floorNo)
        item.key = item.floorNo
        // 是否为新增层
        item.isAddFloor = false
        return item
      })

      data.title.forEach(item => {
        const itemArr = item.split(',')
        // 排除
        if (itemArr.length > 1) {
          // 取单元室号
          houseColList.push(`${itemArr[0]},${itemArr[1]}`)
        }
      })

      yield put(actions.setHouseTitle(data.title))
      yield put(actions.setDateList(data.dataList))
      yield put(actions.setTotalFloorNum(data.totalFloorNum || 0))
      yield put(actions.setHouseFloor(floorList, houseColList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* addHouseName() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.ADD_HOUSE_NAME)
    try {
      const res = yield call(serverApi.addHouseName, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getHouseAvgprice() {
  while (true) {
    const {
      payload: [qry]
    } = yield take(actions.GET_HOUSE_AVG_PRICE)
    try {
      const { data: avgPrice } = yield call(serverApi.getHouseAvgprice, qry)
      yield put(actions.setHouseAvgprice(avgPrice))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* updateHouseCols() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.UPDATE_HOUSE_COLS)
    try {
      const { data: res } = yield call(serverApi.updateHouseCols, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getUsageType() {
  while (true) {
    yield take(actions.GET_USAGE_TYPE)
    try {
      const { data: usageTypeList } = yield call(dictApi.getUsageType)
      yield put(actions.setUsageType(usageTypeList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getStructType() {
  while (true) {
    yield take(actions.GET_STRUCT_TYPE)
    try {
      const { data: structTypeList } = yield call(dictApi.getStructType)
      yield put(actions.setStructType(structTypeList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getOrientType() {
  while (true) {
    yield take(actions.GET_ORIENT_TYPE)
    try {
      const { data: orientTypeList } = yield call(dictApi.getOrientType)
      yield put(actions.setOrientType(orientTypeList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getSightType() {
  while (true) {
    yield take(actions.GET_SIGHT_TYPE)
    try {
      const { data: sightTypeList } = yield call(dictApi.getSightType)
      yield put(actions.setSightType(sightTypeList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getVentLightType() {
  while (true) {
    yield take(actions.GET_VENT_LIGHT_TYPE)
    try {
      const { data: ventLightTypeList } = yield call(dictApi.getVentLightType)
      yield put(actions.setVentLightType(ventLightTypeList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getNoiseType() {
  while (true) {
    yield take(actions.GET_NOISE_TYPE)
    try {
      const { data: noiseTypeList } = yield call(dictApi.getNoiseType)
      yield put(actions.setNoiseType(noiseTypeList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getDecorateType() {
  while (true) {
    yield take(actions.GET_DECORATE_TYPE)
    try {
      const { data: decorateTypeList } = yield call(dictApi.getDecorateType)
      yield put(actions.setDecorateType(decorateTypeList))
    } catch (err) {
      handleErr(err)
    }
  }
}

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

function* delAllHouse() {
  while (true) {
    const {
      payload: [qry, cb]
    } = yield take(actions.DEL_ALL_HOUSE)
    try {
      yield call(serverApi.delAllHouse, qry)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getHouseType() {
  while (true) {
    yield take(actions.GET_HOUSE_TYPE)
    try {
      const { data: houseTypeList } = yield call(dictApi.getHouseType)
      yield put(actions.setHouseType(houseTypeList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getHouseUsage() {
  while (true) {
    yield take(actions.GET_HOUSE_USAGE)
    try {
      const { data: houseUsageList } = yield call(dictApi.getHouseUsage)
      yield put(actions.setHouseUsage(houseUsageList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* batchUpdateFloor() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.BATCH_UPDTAE_FLOOR)
    try {
      const res = yield call(serverApi.batchUpdateFloor, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getBuildDetail() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.GET_BUILD_DETAIL)
    try {
      const { data: buildDetail } = yield call(
        buildInfoApi.getBuildDetail,
        params
      )
      yield put(actions.setBuildDetail(buildDetail))
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

function* getHouseDict() {
  while (true) {
    yield take(actions.GET_HOUSE_DICT)
    try {
      const { data: houseDict } = yield call(dictApi.getHouseDict)
      yield put(actions.setHouseDict(houseDict))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getHouseDetail() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.GET_HOUSE_DETAIL)
    try {
      const { data: houseDetail } = yield call(serverApi.getHouseDetail, params)
      yield put(actions.setHouseDetail(houseDetail))
      if (typeof cb === 'function') {
        cb(houseDetail)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* addHouseNum() {
  while (true) {
    const {
      payload: [houseInfo, cb]
    } = yield take(actions.ADD_HOUSE_NUM)
    try {
      const data = yield call(serverApi.addHouseNum, houseInfo)
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 更新房号信息
function* editHouseNum() {
  while (true) {
    const {
      payload: [houseInfo, cb]
    } = yield take(actions.EDIT_HOUSE_NUM)
    try {
      const data = yield call(serverApi.editHouseNum, houseInfo)
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 删除房号
function* deleteHouseNum() {
  while (true) {
    const {
      payload: [ids, cb]
    } = yield take(actions.DELETE_HOUSE_NUM)
    try {
      yield call(serverApi.deleteHouseNum, ids)
      if (typeof cb === 'function') {
        cb()
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

// 计算价格系数
function* calculateHousePrice() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.CALCULATE_HOUSE_PRICE)
    try {
      const { data: succMsg } = yield call(
        serverApi.calculateHousePrice,
        params
      )
      cb({ code: 200, succMsg })
    } catch (err) {
      handleErr(err)
      cb({ code: 500 })
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
  namespace: 'houseNum',
  sagas: function* houseNumSaga() {
    yield fork(getDataList)
    yield fork(addHouseName)
    yield fork(getHouseAvgprice)
    yield fork(updateHouseCols)
    yield fork(getUsageType)
    yield fork(getStructType)
    yield fork(getOrientType)
    yield fork(getSightType)
    yield fork(getVentLightType)
    yield fork(getNoiseType)
    yield fork(getDecorateType)
    yield fork(getSubHouseType)
    yield fork(delAllHouse)
    yield fork(getHouseType)
    yield fork(batchUpdateFloor)
    yield fork(getBuildDetail)
    yield fork(getHouseUsage)
    yield fork(getProjectDetail)
    yield fork(getHouseDict)
    yield fork(getHouseDetail)
    yield fork(addHouseNum)
    yield fork(editHouseNum)
    yield fork(deleteHouseNum)
    yield fork(calculateHousePrice)
    yield fork(updateVisitCities)
  }
})
