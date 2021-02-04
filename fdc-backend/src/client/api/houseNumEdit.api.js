import req from './makeRequest'

function fetchDitcCode() {
  const fetchDecoration = req({ url: '/fdc/dict/decorationType' })
  const fetchHouseType = req({ url: '/fdc/dict/houseType' })
  const fetchNoiseStatus = req({ url: '/fdc/dict/noiseType' })
  const fetchTowards = req({ url: '/fdc/dict/orientationType' })
  const fetchScenes = req({ url: '/fdc/dict/sightType' })
  const fetchHouseStructure = req({ url: '/fdc/dict/structureType' })
  const fetchSubHouseType = req({ url: '/fdc/dict/subHouseType' })
  const fetchUsages = req({ url: '/fdc/dict/houseUsage' })
  const fetchVentLightType = req({ url: '/fdc/dict/ventLightType' })
  return Promise.all([
    fetchDecoration,
    fetchHouseType,
    fetchNoiseStatus,
    fetchTowards,
    fetchScenes,
    fetchHouseStructure,
    fetchSubHouseType,
    fetchUsages,
    fetchVentLightType
  ])
}
// 查询房号详情
function fetchDetail(params) {
  return req({
    url: `/fdc/house/${params.id}`,
    data: params,
    method: 'GET'
  })
}
// 更新房号数据
function updateHouse(houseInfo) {
  return req({
    url: '/fdc/house',
    data: houseInfo,
    method: 'PUT'
  })
}

// 删除房号数据
function removeHouse(ids) {
  return req({
    url: '/fdc/house',
    data: ids,
    method: 'DELETE'
  })
}

function addHouseNum(houseInfo) {
  return req({
    url: '/fdc/house',
    data: houseInfo,
    method: 'POST'
  })
}
// 检查楼栋状态
function fetchBuildingDetail(params) {
  const { id: buildId } = params
  return req({
    // url: `/fdc/building/detail/${tabType}/${id}`,
    url: `/fdc/building/detail/${buildId}`,
    data: params,
    method: 'GET'
  })
}

export default {
  fetchDitcCode,
  fetchBuildingDetail,
  addHouseNum,
  removeHouse,
  fetchDetail,
  updateHouse
}
