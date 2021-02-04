import { take, fork, put } from 'redux-saga/effects'
import call from 'redux-saga-call'
import { injectSaga } from 'client/utils/store'
import handleErr from 'client/utils/handleErr'
import * as serverApi from 'client/api/proImage.api'
import * as commonApi from 'client/api/common.api'
import actions from './actions'

function* getProjectImageList() {
  while (true) {
    const {
      payload: [qry,cb]
    } = yield take(actions.GET_PROJECT_IMAGE_LIST)
    try {
      const { data: projectImageList } = yield call(
        serverApi.getProjectImageList,
        qry,
        actions.GET_PROJECT_IMAGE_LIST
      )
      projectImageList.records.map(item => {
        item.key = item.id
        return item
      })
      yield put(actions.setProjectImageList(projectImageList))
      cb(projectImageList)
    } catch (err) {
      handleErr(err)
    }
  }
}
// 图片类型
function* getPhotoType() {
  while (true) {
    yield take(actions.GET_PHOTO_TYPE)
    try {
      const { data: photoTypeList } = yield call(serverApi.getPhotoType)
      yield put(actions.setPhotoType(photoTypeList))
    } catch (err) {
      handleErr(err)
    }
  }
}
// 编辑图片
function* editPhoto() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.EDIT_PHOTO)
    try {
      const res = yield call(serverApi.editPhoto, params)
      cb(res)
    } catch (err) {
      handleErr(err)
    }
  }
}

function* delProjectImages() {
  while (true) {
    const {
      payload: [ids, cb]
    } = yield take(actions.DEL_PROJECT_IMAGES)
    try {
      yield call(serverApi.delProjectImages, ids)
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
// 图片保存
function* pictureSave() {
  while (true) {
    const {
      payload: [params, cb]
    } = yield take(actions.PICTURE_SAVE)
    try {
      const  res  = yield call(serverApi.pictureSave, params)
      console.log(typeof cb === 'function')
      if (typeof cb === 'function') {
        cb(res)
      }
    } catch (err) {
      handleErr(err)
    }
  }
}

injectSaga({
  namespace: 'proImage',
  sagas: function* proImageSaga() {
    yield fork(getProjectImageList)
    yield fork(delProjectImages)
    yield fork(getProjectDetail)
    yield fork(getBuildDetail)
    yield fork(updateVisitCities)
    yield fork(getPhotoType)
    yield fork(editPhoto)
    yield fork(pictureSave)
  }
})
