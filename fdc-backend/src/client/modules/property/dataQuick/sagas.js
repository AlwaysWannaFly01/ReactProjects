import { take, fork, put, all } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/dataQuick.api'
import * as dictApi from 'client/api/dict.api'
import * as commonApi from 'client/api/common.api'
import actions from './actions'

// function* getAreaList() {
//   while (true) {
//     const {
//       payload: [cityId]
//     } = yield take(actions.GET_AREA_LIST)
//     try {
//       const { data: areaList } = yield call(serverApi.getAreaList, cityId)
//       let newAreaList = []
//       if (areaList) {
//         newAreaList = areaList.map(({ id, areaName }) => ({
//           key: id,
//           label: areaName,
//           value: `${id}`
//         }))
//       }
//       yield put(actions.setAreaList(newAreaList))
//     } catch (err) {
//       handleErr(err)
//     }
//   }
// }

/*查询当前城市是否有相同关联的楼盘地址*/
function* addressValidate() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.ADDRESS_VALIDATE)
    try {
      const res = yield call(serverApi.addressValidate, params, actions.ADDRESS_VALIDATE)
      cb(res)
      //yield put(actions.setProjectDetail(res.data || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

/*查询库里是否有相同的楼盘名称*/
function* isMatchBatchProject() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.IS_MATCH_BATCH_PROJECT)
    try {
      const res = yield call(serverApi.isMatchBatchProject, params, actions.IS_MATCH_BATCH_PROJECT)
      cb(res)
      //yield put(actions.setProjectDetail(res.data || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

/*获取楼盘详情*/
function* getProjectDetail() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.GET_PROJECT_DETAIL)
    try {
      const res = yield call(serverApi.getProjectDetail, params, actions.GET_PROJECT_DETAIL)
      cb(res.data || {})
      //yield put(actions.setProjectDetail(res.data || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

/*获取楼栋详情*/
function* getBuildingDetail() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.GET_BUILDING_DETAIL)
    try {
      const res = yield call(serverApi.getBuildingDetail, params, actions.GET_BUILDING_DETAIL)
      cb(res.data || [])
      //yield put(actions.setBuildingDetail(res.data || []))
    } catch (err) {
      handleErr(err)
    }
  }
}


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

/*模糊查询楼栋*/
function* fetchBuidingList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.FETCH_BUIDING_LIST)
    try {
      const res = yield call(serverApi.fetchBuidingList, params, actions.FETCH_BUIDING_LIST)
      yield put(actions.setBuidingList(res.data.records || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

/*模糊查询物理层*/
function* fetchFloorList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.FETCH_FLOOR_LIST)
    try {
      const res = yield call(serverApi.fetchFloorList, params, actions.FETCH_FLOOR_LIST)
      yield put(actions.setFloorList(res.data.dataList || []))
      // let floorList = []
      // let unitNoList = []
      // let roomNumList = []
      // if(res.data.records){
      //   /* eslint-disable */
      //   floorList =  res.data.records.filter(function (item) {
      //       if(item.floorNo){
      //         return item
      //       }
      //   })
      //   /* eslint-disable */
      //   unitNoList =  res.data.records.filter(function (item) {
      //     if(item.unitNo){
      //       return item
      //     }
      //   })
      //   /* eslint-disable */
      //   roomNumList =  res.data.records.filter(function (item) {
      //     if(item.roomNum){
      //       return item
      //     }
      //   })
      // }
      //console.log(floorList,unitNoList,roomNumList)
      //yield put(actions.setFloorList({floorList,unitNoList,roomNumList}))
      
    } catch (err) {
      handleErr(err)
    }
  }
}

/*模糊查询单元*/
function* fetchUnitNoList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.FETCH_UNIT_NO_LIST)
    try {
      const res = yield call(serverApi.fetchFloorList, params, actions.FETCH_UNIT_NO_LIST)
      yield put(actions.setUnitNoList(res.data.dataList || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

/*模糊查询室号*/
function* fetchRoomNumList() {
  while (true) {
    const {
      payload: [params]
    } = yield take(actions.FETCH_ROOM_NUM_LIST)
    try {
      const res = yield call(serverApi.fetchFloorList, params, actions.FETCH_ROOM_NUM_LIST)
      yield put(actions.setRoomNumList(res.data.dataList || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

/*获取房号详情*/
function* getHouseDetail() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.GET_HOUSE_DETAIL)
    try {
      const res = yield call(serverApi.getHouseDetail, params, actions.GET_HOUSE_DETAIL)
      cb(res.data || null)
      //yield put(actions.setHouseDetail(res.data || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

/*获取自动估价*/
function* fetchValuation() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.FETCH_VALUATION)
    try {
      const res = yield call(serverApi.fetchValuation, params, actions.FETCH_VALUATION)
      cb(res)
     // yield put(actions.setValuation(res.data || []))
    } catch (err) {
      handleErr(err)
    }
  }
}

// 获取快捷数据详情
function* fetchQuickDataDetail() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.FETCH_QUICK_DATA_DETAIL)
    try {
      const {code,data,message} = yield call(serverApi.fetchQuickDataDetail, params, actions.FETCH_QUICK_DATA_DETAIL)
      cb({code, data, message})
      //yield put(actions.setQuickDataDetail(res.data || []))
    } catch (err) {
      cb(err)
      handleErr(err)
    }
  }
}

/*保存快捷数据操作*/
function* saveQuickMaintainData() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.SAVE_QUICK_MAINTAIN_DATA)
    try {
      const {code,data,message} = yield call(serverApi.saveQuickMaintainData, params, actions.SAVE_QUICK_MAINTAIN_DATA)
      cb({code, data, message})
    } catch (err) {
      handleErr(err)
    }
    //cb()
  }
}

/*校验urL参数*/
function* fetchValidateRegion() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.FETCH_VALIDATE_REGION)
    try {
      const {code,data,message} = yield call(serverApi.fetchValidateRegion, params, actions.FETCH_VALIDATE_REGION)
      cb({code, data, message})
    } catch (err) {
      handleErr(err)
    }
    //cb()
  }
}

function* getProvinceCityList() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.GET_PROVINCE_CITY_LIST)
    try {
      const res = yield call(serverApi.getProvinceCityList, params, actions.GET_PROVINCE_CITY_LIST)
      
      //yield put(actions.setProvinceCityList(res.data || []))
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

/*补全房号*/
function* fetchCompleteHouseData() {
  while (true) {
    const {
      payload: [params,cb]
    } = yield take(actions.FETCH_COMPLETE_HOUSE_DATA)
    try {
      const res = yield call(serverApi.fetchCompleteHouseData, params, actions.FETCH_COMPLETE_HOUSE_DATA)
      cb(res)
      //yield put(actions.setCompleteHouseData(res.data || []))
    } catch (err) {
      handleErr(err)
      //cb()
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
      //cb()
    }
  }
}

// 删除时校验相关楼盘名称匹配
function* verifyProjectName() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.VERIFY_PROJECT_NAME)
    try {
      const { code, data, message } = yield call(
          serverApi.verifyProjectName,
          params
      )
      cb({ code, data, message })
    } catch (err) {
      handleErr(err)
      cb(err)
    }
  }
}

// 删除时校验相关楼盘地址匹配
function* verifyProjectAddress() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.VERIFY_PROJECT_ADDRESS)
    try {
      const { code, data, message } = yield call(
          serverApi.verifyProjectAddress,
          params
      )
      cb({ code, data, message })
    } catch (err) {
      handleErr(err)
      cb(err)
    }
  }
}

function* initialFetch() {
  while (true) {
    yield take(actions.INITIAL_FETCH)
    try {
      const [
        { data: addrTypeList},
        { data: aliaTypeList },
        { data: priceSourceList},
        { data: usageTypeList},
        { data: houseUsageList },
        { data: orientTypeList },
        { data: buildTypeList },
        { data: houseTypeList },
        { data: structTypeList },
        { data: currencyTypeList }
      ] = yield all([
        call(serverApi.getAddrType),
        call(serverApi.getAliaType),
        call(serverApi.getPriceSource),
        call(serverApi.getUsageType),
        call(dictApi.getHouseUsage),
        call(dictApi.getOrientType),
        call(dictApi.getBuildingType),
        call(dictApi.getHouseType),
        call(dictApi.getStructType),
        call(dictApi.getCurrencyType)
      ])
      yield all([
        put(actions.setAddrType(addrTypeList)),
        put(actions.setAliaType(aliaTypeList)),
        put(actions.setPriceSource(priceSourceList)),
        put(actions.setUsageType(usageTypeList)),
        put(actions.setHouseUsage(houseUsageList)),
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
// function* addCase() {
//   while (true) {
//     const {
//       payload: [caseDto, cb]
//     } = yield take(actions.ADD_CASE)
//     try {
//       const data = yield call(serverApi.addCase, caseDto)
//       if (typeof cb === 'function') {
//         cb(data)
//       }
//     } catch (err) {
//       handleErr(err)
//     }
//   }
// }

// function* editCase() {
//   while (true) {
//     const {
//       payload: [params, cb]
//     } = yield take(actions.EDIT_CASE)
//     try {
//       const data = yield call(serverApi.editCase, params)
//       cb(data)
//     } catch (err) {
//       handleErr(err)
//     }
//   }
// }

// function* getCaseDetail() {
//   while (true) {
//     const {
//       payload: [caseId, cityId]
//     } = yield take(actions.GET_CASE_DETAIL)
//     try {
//       const { data: caseDetail } = yield call(serverApi.getCaseDetail, {
//         caseId,
//         cityId
//       })
//       yield put(actions.setCaseDetail(caseDetail))
//     } catch (err) {
//       handleErr(err)
//     }
//   }
// }

// function* deleteCases() {
//   while (true) {
//     const {
//       payload: [ids, cityId, cb]
//     } = yield take(actions.DELETE_CASES)
//     try {
//       const data = yield call(serverApi.deleteCases, { ids, cityId })
//       if (typeof cb === 'function') {
//         cb(data)
//       }
//     } catch (err) {
//       handleErr(err)
//     }
//   }
// }

// function* deleteAllCases() {
//   while (true) {
//     const {
//       payload: [delParams, cb]
//     } = yield take(actions.DELETE_ALL_CASES)
//     try {
//       const data = yield call(serverApi.deleteAllCases, delParams)
//       if (typeof cb === 'function') {
//         cb(data)
//       }
//     } catch (err) {
//       handleErr(err)
//     }
//   }
// }

// function* exportCase() {
//   while (true) {
//     const {
//       payload: [exportParams, cb]
//     } = yield take(actions.EXPORT_CASE)
//     try {
//       yield call(serverApi.exportCase, exportParams)
//       if (typeof cb === 'function') {
//         cb()
//       }
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
  namespace: 'dataQuick',
  sagas: function* dataQuickSaga() {
    // yield fork(getAreaList)
    yield fork(getBuildingDetail)
    yield fork(getProjectDetail)
    yield fork(initialFetch)
    yield fork(getProjectsList)
    yield fork(getProvinceCityList)
    yield fork(verifyProjectName)
    yield fork(verifyProjectAddress)
    // yield fork(addCase)
    // yield fork(editCase)
    // yield fork(getCaseDetail)
    // yield fork(deleteCases)
    // yield fork(deleteAllCases)
    // yield fork(exportCase)
    yield fork(updateVisitCities)
    yield fork(editAuthority)
    yield fork(fetchBuidingList)
    yield fork(fetchFloorList)
    yield fork(fetchUnitNoList)
    yield fork(fetchRoomNumList)
    yield fork(fetchValuation)
    yield fork(getHouseDetail)
    yield fork(saveQuickMaintainData)
    yield fork(fetchCompleteHouseData)
    yield fork(fetchValidateRegion)
    yield fork(fetchQuickDataDetail)
    yield fork(isMatchBatchProject)
    yield fork(addressValidate)
    // yield fork(getAliaType)
  }
})
