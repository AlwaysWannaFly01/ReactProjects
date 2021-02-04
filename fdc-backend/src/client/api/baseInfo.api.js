// 房产数据 / 住宅 / 基础数据 API
import qs from 'qs'
import makeRequest from './makeRequest'

// 楼盘列表
export function getBaseInfoList({ searchBaseInfo }) {
  return makeRequest({
    url: '/fdc/projects',
    data: searchBaseInfo
  })
}

// 行政区列表
export function getDistrictAreas({ searchAreaList }) {
  return makeRequest({
    url: '/fdc/districts/area',
    data: searchAreaList
  })
}

// 行政区列表
export function getDistrictAreas1(searchAreaList) {
  return makeRequest({
    url: '/fdc/districts/area',
    data: searchAreaList
  })
}

// 获取片区列表
export function getSubAreas(areaId) {
  return makeRequest({
    url: '/fdc/districts/subArea',
    data: {
      areaId
    }
  })
}

// 获取主用途列表
export function getUsageType() {
  // return makeRequest({
  //   url: '/fdc/dict/usageType'
  // })
  // 根据产品、后台需求暂时写死这个字典，勿喷
  // eslint-disable-next-line
  return { code:'200', message: 'success', data: [{ code: '1001001', name: '居住' }, {'code':'1001002','name':'居住(别墅)'},{'code':'1001003','name':'居住(洋房)'},{'code':'1001016','name':'居住(商住)'},{'code':'1001004','name':'商业'},{'code':'1001005','name':'办公'},{'code':'1001006','name':'工业'},{'code':'1001015','name':'公寓'},{'code':'1001007','name':'商业、居住'},{'code':'1001008','name':'商业、办公'},{'code':'1001009','name':'办公、居住'},{'code':'1001010','name':'停车场'},{'code':'1001011','name':'酒店'},{'code':'1001012','name':'加油站'},{'code':'1001013','name':'综合'},{'code':'1001014','name':'其他'}]}
}

// 获取主建筑类型
export function getBuildingType() {
  return makeRequest({
    url: '/fdc/dict/buildingType'
  })
}

// 获取产权形式
export function getOwnershipType() {
  return makeRequest({
    url: '/fdc/dict/ownershipType'
  })
}

// 获取学区属性 wy
export function getSchoolDistrictProperty() {
  return makeRequest({
    url: '/fdc/dict/schoolDistrictProperty'
  })
}

// 获取地铁属性 wy
export function getsubwayProperty() {
  return makeRequest({
    url: '/fdc/dict/subwayProperty'
  })
}

// 获取物业类型
export function getObjectType() {
  // return makeRequest({
  //   url: '/fdc/dict/objectType'
  // })
  return { code: '200', message: 'success',data:[{"code":"1002001","name":"普通住宅"},{"code":"1002003","name":"公寓"},{"code":"1002004","name":"酒店式公寓"},{"code":"1002021","name":"商住"},{"code":"1002027","name":"别墅"},{"code":"1002005","name":"独立别墅"},{"code":"1002006","name":"联排别墅"},{"code":"1002007","name":"叠加别墅"},{"code":"1002008","name":"双拼别墅"},{"code":"1002009","name":"旅馆"},{"code":"1002010","name":"花园洋房"},{"code":"1002011","name":"老洋房"},{"code":"1002012","name":"新式里弄"},{"code":"1002013","name":"旧式里弄"},{"code":"1002014","name":"商业"},{"code":"1002015","name":"办公"},{"code":"1002016","name":"厂房"},{"code":"1002017","name":"酒店"},{"code":"1002018","name":"仓储"},{"code":"1002019","name":"车位"},{"code":"1002020","name":"综合"},{"code":"1002022","name":"其他"},{"code":"1002025","name":"地下室、储藏室"},{"code":"1002026","name":"车库"}]}
}

// 实际用途
export function getActualUsageType() {
  return makeRequest({
    url: '/fdc/dict/actualUsageType'
  })
}

// 装修情况
export function getDecorationType() {
  return makeRequest({
    url: '/fdc/dict/decorationType'
  })
}

// 土地规划通途
export function getLandPlanUsage() {
  return makeRequest({
    url: '/fdc/dict/landPlanUsage'
  })
}

// 土地级别
export function getLandLevel() {
  return makeRequest({
    url: '/fdc/dict/landLevel'
  })
}

// 建筑质量
export function getBuildingQuality() {
  return makeRequest({
    url: '/fdc/dict/buildingQuality'
  })
}

// 小区规模
export function getCommunitySize() {
  return makeRequest({
    url: '/fdc/dict/communitySize'
  })
}

// 物业管理质量
export function getManagementQuality() {
  return makeRequest({
    url: '/fdc/dict/managementQuality'
  })
}

// 小区封闭性
export function getCommunityCloseness() {
  return makeRequest({
    url: '/fdc/dict/communityCloseness'
  })
}

// 配套等级
export function getClassCode() {
  return makeRequest({
    url: '/fdc/dict/classCode'
  })
}

// 环线位置
export function getLoopLine() {
  return makeRequest({
    url: '/fdc/dict/loopLine'
  })
}

// 人车分流情况
export function getDiversionVehicle() {
  return makeRequest({
    url: '/fdc/dict/diversionVehicle'
  })
}

// 轨道沿线
export function getSubwayCode() {
  return makeRequest({
    url: '/fdc/dict/subwayCode'
  })
}

// 项目特色
export function getProjectFeature() {
  return makeRequest({
    url: '/fdc/dict/projectFeature'
  })
}

// 新增楼盘
export function addProject(data) {
  return makeRequest({
    url: '/fdc/projects',
    method: 'POST',
    data
  })
}

// 编辑楼盘
export function editProject(data) {
  return makeRequest({
    url: '/fdc/projects',
    method: 'PUT',
    data
  })
}

// 删除楼盘
export function delProjects({ ids, cityId }) {
  return makeRequest({
    url: '/fdc/projects',
    method: 'DELETE',
    data: {
      ids,
      cityId
    }
  })
}

// 还原楼盘
export function restoreProjects({ ids, cityId }) {
  return makeRequest({
    url: `/fdc/projects/restore?ids=${ids}&cityId=${cityId}`,
    method: 'PUT'
  })
}

// 查看楼盘详情 2019/5/28修改多余的一个接口，楼盘没权限的时候
export function getProjectDetail({ projectId, cityId }) {
  return makeRequest({
    url: `/fdc/projects/${projectId}`,
    data: {
      cityId
    }
  })
}

export function getAllDetail({ projectId, cityId }) {
  return makeRequest({
    url: `/fdc/projects/msg/${projectId}`,
    data: {
      cityId
    }
  })
}

// 楼盘拆分校验
/** 提示信息code
 * 1001: 目标楼盘为正式楼盘
 * 1002：目标楼盘为已删除楼盘 后端去除
 * 1003：目标楼盘为新楼盘
 * 1004：目标楼盘有且只有一个已删除楼盘
 * 1005：目标楼盘有多个已删除楼盘
 * 1006：有重名楼栋
 * 1007：参数错误
 * 1008：拆分失败
 * 1009：拆分成功
 * 1010: 目标楼盘与源楼盘重名
 */
export function validProjectSplit(data) {
  return makeRequest({
    url: '/fdc/projects/split/vaild',
    method: 'POST',
    data
  })
}

// 根据楼盘获取需要拆分的楼栋列表
export function getSplitBuildList(data) {
  return makeRequest({
    url: '/fdc/projects/split/building/list',
    data
  })
}

// 楼盘拆分
export function splitProject(data) {
  return makeRequest({
    url: '/fdc/projects/split',
    method: 'POST',
    data
  })
}

// 获取当前城市的所有正式楼盘
export function getMergeProjectList(cityId) {
  return makeRequest({
    url: '/fdc/projects/merge/project/list',
    data: {
      cityId
    }
  })
}

// 楼盘合并
/* 提示信息code
 * 提示信息Code
 * 10001: 有重名楼栋
 * 10002：合并失败
 * 10003：合并成功
 */
export function mergeProjects(data) {
  return makeRequest({
    url: '/fdc/projects/merge',
    method: 'POST',
    data
  })
}

// 统计楼盘的楼栋数和房号数
export function getCityCount(cityId) {
  return makeRequest({
    url: '/fdc/count',
    data: {
      cityId
    }
  })
}

// 校验新增编辑楼盘名称(2：检验通过，1：有正式楼盘，0：有删除楼盘，3：有重名的楼盘别名，4：有重名的相关楼盘名称)
export function addValidateProjectName(data) {
  return makeRequest({
    url: '/fdc/projects/validate/add',
    data,
    method: 'POST'
  })
}

// 校验编辑楼盘名称(2：检验通过，1：有正式楼盘，0：有删除楼盘)
export function editValidateProjectName(data) {
  return makeRequest({
    url: '/fdc/projects/validate/update',
    data,
    method: 'POST'
  })
}
export function addValidateProjectAlias(data) {
  return makeRequest({
    url: '/fdc/projects/validate/addAlias',
    data,
    method: 'POST'
  })
}

export function editValidateProjectAlias(data) {
  return makeRequest({
    url: '/fdc/projects/validate/updateAlias',
    data,
    method: 'POST'
  })
}
export function hasMatchProjectAlias(Params) {
  const data = qs.stringify(Params, { encodeValuesOnly: true })
  console.log(data)
  return makeRequest({
    url: `/fdc/project/aliases/hasMatchProjectAlias?${data}`,
  })
}

// 汉字转换成拼音(全拼，简拼)，全小写
export function getPinyinStringLo(data) {
  return makeRequest({
    url: '/fdc/common/get/pinyin/lo',
    data
  })
}

// 楼栋统计,楼栋总数.房号总数
export function getBuildTotal({ cityId, projectId }) {
  return makeRequest({
    url: `/fdc/building/total/${cityId}/${projectId}`
  })
}

// S 建筑物类型比值
// 表格
export function getBuildRateList(params) {
  const data = qs.stringify(params, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/projectBuildingTypeRate?${data}`
  })
}
// 导出
export function exportRate(exportParams) {
  const data = qs.stringify(exportParams, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/projectBuildingTypeRate/export/async?${data}`
  })
}

// 一键导出楼盘配套
export function exportOnceCase(exportParams) {
  const data = qs.stringify(exportParams, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/projectFacilities/exportAll/async?${data}`
  })
}

// E 建筑物类型比值
// S 片区绘制
// 2.城市行政区/片区绘制情况列表
export function getAreaDraw({ drawAreaInfo }) {
  return makeRequest({
    url: '/fdc/subAreaDraw',
    data: drawAreaInfo
  })
}
// 删除片区
export function deleteAreaDraw({ ids, cityId }) {
  return makeRequest({
    url: '/fdc/subAreaDraw',
    method: 'DELETE',
    data: {
      ids,
      cityId
    }
  })
}
// 3. 新建/修改绘制
export function newChangeDraw(data) {
  return makeRequest({
    url: '/fdc/subAreaDraw/addOrUpdate',
    method: 'POST',
    data
  })
}
// 1. 获取当前城市或片区下所有有经纬度的正式楼盘
export function officialEstate(projectParams) {
  const data = qs.stringify(projectParams, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/subAreaDraw/project/list?${data}`
  })
}
// 5. 关联片区
export function relationSubArea(data) {
  return makeRequest({
    url: '/fdc/subAreaDraw/relation',
    method: 'PUT',
    data
  })
}
// 删除相关楼盘名称
export function delProjectAlia(data) {
  const param = qs.stringify(data, { encodeValuesOnly: true })
  return makeRequest({
    url: `/fdc/project/aliases?${param}`,
    method: 'DELETE',
  })
}
// E 片区绘制
