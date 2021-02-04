import { take, fork, put, all } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/baseInfo.api'
import * as commonApi from 'client/api/common.api'
// import moment from 'moment'
import actions from './actions'

function* initialFetch() {
  while (true) {
    const {
      payload: [searchBaseInfo, searchAreaList,cb]
    } = yield take(actions.INITIAL_FETCH)
    try {
      const { data: areaList } = yield call(serverApi.getDistrictAreas, {
        searchAreaList
      })
      const newAreaList = areaList.map(({ id, areaName }) => ({
        key: id,
        label: areaName,
        value: `${id}`
      }))
      yield put(actions.setDistrictAreas(newAreaList))

      // 由于楼盘接口查询较慢，分开调用
      const { data: baseInfoList } = yield call(
        serverApi.getBaseInfoList,
        { searchBaseInfo },
        actions.GET_BASE_INFO_LIST
      )
      if (baseInfoList.records) {
        baseInfoList.records.map(item => {
          item.key = item.id
          return item
        })
      }
      yield put(actions.setBaseInfoList(baseInfoList))
      cb(baseInfoList)
      // const [{ data: baseInfoList }, { data: areaList }] = yield all([
      //   call(
      //     serverApi.getBaseInfoList,
      //     { searchBaseInfo },
      //     actions.GET_BASE_INFO_LIST
      //   ),
      //   call(serverApi.getDistrictAreas, { searchAreaList })
      // ])
      // baseInfoList.records.map(item => {
      //   item.key = item.id
      //   return item
      // })
      // const newAreaList = areaList.map(({ id, areaName }) => ({
      //   key: id,
      //   label: areaName,
      //   value: `${id}`
      // }))
      // yield all([
      //   put(actions.setBaseInfoList(baseInfoList)),
      //   put(actions.setDistrictAreas(newAreaList))
      // ])
    } catch (err) {
      handleErr(err)
    }
  }
}

function* initialAddFetchFirst() {
  while (true) {
    const {
      payload: [searchAreaList]
    } = yield take(actions.INITIAL_ADD_FETCH_FIRST)
    try {
      const [{ data: areaList }, { data: usageTypeList }] = yield all([
        call(serverApi.getDistrictAreas, { searchAreaList }),
        call(serverApi.getUsageType)
      ])
      const newAreaList = areaList.map(({ id, areaName }) => ({
        key: id,
        label: areaName,
        value: id
      }))
      yield all([
        put(actions.setDistrictAreas(newAreaList)),
        put(actions.setUsageType(usageTypeList))
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
        { data: buildingTypeList },
        { data: ownershipTypeList },
        { data: schoolDistrictList }, // 获取学区属性
        { data: objectTypeList },
        { data: actualUsageTypeList }
      ] = yield all([
        call(serverApi.getBuildingType),
        call(serverApi.getOwnershipType),
        call(serverApi.getSchoolDistrictProperty), // 获取学区属性
        call(serverApi.getObjectType),
        call(serverApi.getActualUsageType)
      ])
      // console.log(schoolDistrictList)
      let newObjectTypeList = []
      // 由前端去掉三个字段
      newObjectTypeList = objectTypeList.filter(
        item =>
          item.name !== '非普通住宅' &&
          item.name !== '经济适用房' &&
          item.name !== '补差商品住房'
      )

      yield all([
        put(actions.setBuildingType(buildingTypeList)),
        put(actions.setOwnershipType(ownershipTypeList)),
        put(actions.setSchoolDistrictProperty(schoolDistrictList)), // 获取学区属性
        put(actions.setObjectType(newObjectTypeList)),
        put(actions.setActualUsageType(actualUsageTypeList))
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
      const [{ data: landPlanUsageList }, { data: landLevelList }] = yield all([
        call(serverApi.getLandPlanUsage),
        call(serverApi.getLandLevel)
      ])
      yield all([
        put(actions.setLandPlanUsage(landPlanUsageList)),
        put(actions.setLandLevel(landLevelList))
      ])
    } catch (err) {
      handleErr(err)
    }
  }
}

function* initialAddFetchFifth() {
  while (true) {
    yield take(actions.INITIAL_ADD_FETCH_FIFTH)
    try {
      const [
        { data: decorationTypeList },
        { data: buildingQualityList },
        { data: communitySizeList },
        { data: managementQualityList },
        { data: communityClosenessList },
        { data: classCodeList },
        { data: loopLineList },
        { data: diversionVehicleList },
        { data: subwayPropertyList }, // 获取地铁属性
        { data: subwayCodeList },
        { data: projectFeatureList }
      ] = yield all([
        call(serverApi.getDecorationType),
        call(serverApi.getBuildingQuality),
        call(serverApi.getCommunitySize),
        call(serverApi.getManagementQuality),
        call(serverApi.getCommunityCloseness, actions.GET_COMMUNITY_CLOSENESS),
        call(serverApi.getClassCode),
        call(serverApi.getLoopLine),
        call(serverApi.getDiversionVehicle),
        call(serverApi.getsubwayProperty), // 获取地铁属性
        call(serverApi.getSubwayCode),
        call(serverApi.getProjectFeature)
      ])
      // console.log(subwayPropertyList)
      yield all([
        put(actions.setDecorationType(decorationTypeList)),
        put(actions.setBuildingQuality(buildingQualityList)),
        put(actions.setCommunitySize(communitySizeList)),
        put(actions.setManagementQuality(managementQualityList)),
        put(actions.setCommunityCloseness(communityClosenessList)),
        put(actions.setClassCode(classCodeList)),
        put(actions.setLoopLine(loopLineList)),
        put(actions.setDiversionVehicle(diversionVehicleList)),
        put(actions.setsubwayProperty(subwayPropertyList)), // 获取地铁属性
        put(actions.setSubwayCode(subwayCodeList)),
        put(actions.setProjectFeature(projectFeatureList))
      ])
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getSubAreas() {
  while (true) {
    const {
      payload: [areaId]
    } = yield take(actions.GET_SUB_AREAS)
    try {
      const { data: subAreaList } = yield call(serverApi.getSubAreas, areaId)
      yield put(actions.setSubAreas(subAreaList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getBaseInfoList() {
  while (true) {
    const {
      payload: [searchBaseInfo,cb]
    } = yield take(actions.GET_BASE_INFO_LIST)
    try {
      const { data: baseInfoList, code, message } = yield call(
        serverApi.getBaseInfoList,
        { searchBaseInfo },
        actions.GET_BASE_INFO_LIST
      )
      if(baseInfoList){
        baseInfoList.records.map(item => {
          item.key = item.id
          return item
        })
        yield put(actions.setBaseInfoList(baseInfoList))
      }
      cb({code:code ,message:message})
    } catch (err) {
      handleErr(err)
    }
  }
}

function* addProject() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.ADD_PROJECT)
    try {
      const res = yield call(serverApi.addProject, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* editProject() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.EDIT_PROJECT)
    try {
      const res = yield call(serverApi.editProject, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* delProjects() {
  while (true) {
    const {
      payload: [ids, cityId, cb]
    } = yield take(actions.DEL_PROJECTS)
    try {
      yield call(serverApi.delProjects, { ids, cityId })
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}

function* restoreProjects() {
  while (true) {
    const {
      payload: [ids, cityId, cb]
    } = yield take(actions.RESTORE_PROJECTS)
    try {
      const { data: res } = yield call(serverApi.restoreProjects, {
        ids,
        cityId
      })
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getProjectDetail() {
  while (true) {
    const {
      payload: [projectId, cityId, cb]
    } = yield take(actions.GET_PROJECT_DETAIL)
    try {
      const { data: projectDetail } = yield call(serverApi.getProjectDetail, {
        projectId,
        cityId
      })
      if (typeof cb === 'function') {
        cb(projectDetail)
      }
      // 这个projectDetail就是把请求接口的data，赋值给了这个变量projectDetail
      yield put(actions.setProjectDetail(projectDetail))
    } catch (err) {
      handleErr(err)
    }
  }
}
// wy change 没有楼盘权限要调用的接口
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

function* validProjectSplit() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.VALID_PROJECT_SPLIT)
    try {
      const { data: response } = yield call(serverApi.validProjectSplit, data)
      // console.log(response)
      cb(response)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getSplitBuildList() {
  while (true) {
    const {
      payload: [data]
    } = yield take(actions.GET_SPLIT_BUILD_LIST)
    try {
      let { data: splitBuildList } = yield call(
        serverApi.getSplitBuildList,
        data
      )
      splitBuildList = splitBuildList.map(({ buildingId, buildingName }) => ({
        value: buildingId,
        key: buildingId,
        title: buildingName,
        isDel: false
      }))
      yield put(actions.setSplitBuildList(splitBuildList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getMergeProjectList() {
  while (true) {
    const {
      payload: [cityId]
    } = yield take(actions.GET_MERGE_PROJECT_LIST)
    try {
      const { data: mergeProjectList } = yield call(
        serverApi.getMergeProjectList,
        cityId
      )
      yield put(actions.setMergeProjectList(mergeProjectList))
    } catch (err) {
      handleErr(err)
    }
  }
}

function* splitProject() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.SPLIT_PROJECT)
    try {
      const { data: res } = yield call(serverApi.splitProject, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* mergeProjects() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.MERGE_PROJECT)
    try {
      const res = yield call(serverApi.mergeProjects, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getCityCount() {
  while (true) {
    const {
      payload: [cityId]
    } = yield take(actions.GET_CITY_COUNT)
    try {
      const { data } = yield call(serverApi.getCityCount, cityId)
      if (data) {
        yield put(actions.setCityCount(data))
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* addValidateProjectName() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.ADD_VALIDATE_PROJECT_NAME)
    try {
      const { data: res, message: msg, code } = yield call(
        serverApi.addValidateProjectName,
        data
      )
      cb(res,code, msg)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* editValidateProjectName() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.EDIT_VALIDATE_PROJECT_NAME)
    try {
      const { data: res, message: msg, code } = yield call(
        serverApi.editValidateProjectName,
        data
      )
      cb(res, msg, code)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* addValidateProjectAlias() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.ADD_VALIDATE_PROJECT_ALIAS)
    try {
      const { data: res, message: msg, code } = yield call(
        serverApi.addValidateProjectAlias,
        data
      )
      cb(res, msg, code)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* editValidateProjectAlias() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.EDIT_VALIDATE_PROJECT_ALIAS)
    try {
      const { data: res, message: msg, code } = yield call(
        serverApi.editValidateProjectAlias,
        data
      )
      cb(res, msg, code)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* hasMatchProjectAlias() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.HAS_MATCH_PROJECT_ALIAS)
    try {
      const { data: res, message: msg, code } = yield call(
        serverApi.hasMatchProjectAlias,
        data
      )
      cb(res, msg, code)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getPinyinStringLo() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.GET_PINYIN_STRING_LO)
    try {
      const { data: strData } = yield call(serverApi.getPinyinStringLo, data)
      cb(strData)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getBuildTotal() {
  while (true) {
    const {
      payload: [buildTotalParams, cb]
    } = yield take(actions.GET_BUILD_TOTAL)
    try {
      const { data: buildTotal } = yield call(
        serverApi.getBuildTotal,
        buildTotalParams
      )
      cb(buildTotal)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* getDefaultCity() {
  while (true) {
    const {
      payload: [cb]
    } = yield take(actions.GET_DEFAULT_CITY)
    try {
      const { data: defaultCity } = yield call(commonApi.getDefaultCity)
      console.log(defaultCity)
      debugger
      let cityId
      if (defaultCity) {
        cityId = defaultCity.id
        sessionStorage.setItem('FDC_CITY', cityId)
        sessionStorage.setItem('FDC_CITY_INFO', JSON.stringify(defaultCity))
      }
      cb(cityId)
    } catch (err) {
      cb(false)
      console.log(err)
    }
  }
}

function* updateVisitCities() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.UPDATE_VISIT_CITIES)
    try {
      const res = yield call(commonApi.updateVisitCities, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

// S 建筑物类型比值
function* getBuildRateList() {
  while (true) {
    const {
      payload: [rateParams]
    } = yield take(actions.GET_BUILD_RATE_LIST)
    try {
      const { data: buildRateList } = yield call(
        serverApi.getBuildRateList,
        rateParams,
        actions.GET_BUILD_RATE_LIST
      )
      yield put(actions.setBuildRateList(buildRateList))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 行政区
function* getAloneArea() {
  while (true) {
    const {
      payload: [cityId, cb]
    } = yield take(actions.GET_ALONE_AREA)
    try {
      const { data: aloneArea } = yield call(serverApi.getDistrictAreas1, {
        cityId
      })
      const newAloneArea = aloneArea.map(({ id, areaName }) => ({
        key: id,
        label: areaName,
        value: `${id}`
      }))
      if (typeof cb === 'function') {
        cb(newAloneArea)
      }
      yield put(actions.setAloneArea(newAloneArea))
    } catch (err) {
      handleErr(err)
    }
  }
}
// 导出
function* exportRate() {
  while (true) {
    const {
      payload: [exportParams, cb]
    } = yield take(actions.EXPORT_RATE)
    try {
      const data = yield call(serverApi.exportRate, exportParams)
      if (typeof cb === 'function') {
        cb(data)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}
// E 建筑物类型比值
// S 片区绘制
// 城市行政区/片区绘制情况列表
function* getAreaDraw() {
  while (true) {
    const {
      payload: [drawAreaInfo, cb]
    } = yield take(actions.GET_AREA_DRAW)
    try {
      const { data: areaDrawList } = yield call(
        serverApi.getAreaDraw,
        { drawAreaInfo },
        actions.GET_AREA_DRAW
      )
      if (typeof cb === 'function') {
        cb(areaDrawList)
      }
      yield put(actions.setAreaDraw(areaDrawList))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 3. 新建/修改绘制
function* newChangeDraw() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.NEW_CHANGE_DRAW)
    try {
      const res = yield call(serverApi.newChangeDraw, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}
function* deleteAreaDraw() {
  while (true) {
    const {
      payload: [ids, cityId, cb]
    } = yield take(actions.DELETE_AREA_DRAW)
    try {
      const res = yield call(serverApi.deleteAreaDraw, { ids, cityId })
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}
function* relationSubArea() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.RELATION_SUBAREA)
    try {
      const res = yield call(serverApi.relationSubArea, data)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}
// 1. 获取当前城市或片区下所有有经纬度的正式楼盘
function* officialEstate() {
  while (true) {
    const {
      payload: [projectParams, cb]
    } = yield take(actions.OFFICIAL_ESTATE)
    try {
      const res = yield call(serverApi.officialEstate, projectParams)
      if (typeof cb === 'function') {
        cb(res)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

function* exportOnceCase() {
  while (true) {
    const {
      payload: [projectParams, cb]
    } = yield take(actions.EXPORT_ONCE_CASE)
    try {
      const res = yield call(serverApi.exportOnceCase, projectParams)
      if (typeof cb === 'function') {
        cb(res)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}
function* delProjectAlia() {
  while (true) {
    const {
      payload: [data, cb]
    } = yield take(actions.DEL_PROJECT_ALIA)
    try {
      console.log(data)
      yield call(serverApi.delProjectAlia, data)
      cb()
    } catch (err) {
      handleErr(err)
    }
  }
}


// E 片区绘制
injectSaga({
  namespace: 'baseInfo',
  sagas: function* BaseInfoSaga() {
    yield fork(initialFetch)
    yield fork(initialAddFetchFirst)
    yield fork(initialAddFetchThird)
    yield fork(initialAddFetchForth)
    yield fork(initialAddFetchFifth)
    yield fork(getBaseInfoList)
    yield fork(getSubAreas)
    yield fork(addProject)
    yield fork(editProject)
    yield fork(delProjects)
    yield fork(restoreProjects)
    yield fork(getProjectDetail)
    yield fork(getAllDetail) // 没有楼盘权限时调用的接口
    yield fork(validProjectSplit)
    yield fork(getSplitBuildList)
    yield fork(getMergeProjectList)
    yield fork(splitProject)
    yield fork(mergeProjects)
    yield fork(getCityCount)
    yield fork(addValidateProjectName)
    yield fork(editValidateProjectName)
    yield fork( addValidateProjectAlias)
    yield fork(editValidateProjectAlias)
    yield fork(hasMatchProjectAlias)
    yield fork(getPinyinStringLo)
    yield fork(getBuildTotal)
    yield fork(getDefaultCity)
    yield fork(updateVisitCities)
    yield fork(getBuildRateList)
    yield fork(getAloneArea)
    yield fork(exportRate)
    yield fork(getAreaDraw)
    yield fork(newChangeDraw)
    yield fork(officialEstate)
    yield fork(deleteAreaDraw)
    yield fork(relationSubArea)
    yield fork(exportOnceCase)
    yield fork(delProjectAlia)
  }
})
