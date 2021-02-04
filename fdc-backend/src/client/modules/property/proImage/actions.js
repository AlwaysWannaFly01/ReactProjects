import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'proImage',
  actions: {
    getProjectImageList: 'GET_PROJECT_IMAGE_LIST',
    setProjectImageList: 'SET_PROJECT_IMAGE_LIST',

    delProjectImages: 'DEL_PROJECT_IMAGES',

    getProjectDetail: 'GET_PROJECT_DETAIL',
    setProjectDetail: 'SET_PROJECT_DETAIL',

    getBuildDetail: 'GET_BUILD_DETAIL',
    setBuildDetail: 'SET_BUILD_DETAIL',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES',
    // 图片类型
    getPhotoType: 'GET_PHOTO_TYPE',
    setPhotoType: 'SET_PHOTO_TYPE',
    // 编辑图片
    editPhoto: 'EDIT_PHOTO',
    // 图片保存
    pictureSave: 'PICTURE_SAVE'
  }
})

export default actions
export { containerActions }
