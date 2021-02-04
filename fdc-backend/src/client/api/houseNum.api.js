// 房号服务 API
import makeRequest from './makeRequest'

/**
 * 房号名称（单元 + 楼层 + 室号）（如：1单元101室） houseName
 * 价格系数（权重值）（单价 / 楼盘均价） priceRate
 * 建筑面积 houseArea
 * 是否确认面积 （1：是 / 0： 否) isAreaConfirmed
 * 套内面积 houseInternalArea
 * 主要用途 usageCode
 * 户型2016 (比如：小户型，大户型，复式户型) houseTypeCode
 * 户型结构2005（比如：平面，跃式，复式） structureCode
 * 朝向code,2004（比如：东，南，西，北） orientationCode
 * 景观code,2006（比如：街景、海景） sightCode
 * 通风采光1216（比如：全明通透，采光欠佳，通风欠佳） ventLightCode
 * 噪音情况(2025) (如：安静，较安静，微吵) noiseCode
 * 装修档次6026（比如：豪华，普通，中档） decorationCode
 * 附属房屋类型 subHouseType
 * 附属房屋面积 subHouseArea
 * 单价（单位：元 / 平方米） unitprice
 * 是否有厨房（1：是 / 0： 否） isWithKitchen
 * 阳台数 balconyNum
 * 洗手间数 washroomNum
 * 是否带花园（1：是 / 0： 否） hasGarden
 * 是否可估（1：是 / 0： 否） isAbleEvaluated
 * 数据权属 ownership
 * 是否锁定（1：是 / 0： 否） isLocked
 */
export function getDataList(qry) {
  return makeRequest({
    url: '/fdc/house',
    data: qry
  })
}

// 新增房号
export function addHouseName(data) {
  return makeRequest({
    url: '/fdc/house/batch/add',
    method: 'POST',
    data
  })
}

// 批量修改
export function updateHouseCols(data) {
  return makeRequest({
    url: '/fdc/house/batch/update',
    method: 'PUT',
    data
  })
}

// 项目均价与楼盘均价
export function getHouseAvgprice(qry) {
  return makeRequest({
    url: '/fdc/house/avgPrice',
    data: qry
  })
}

// 清空房号
export function delAllHouse(qry) {
  return makeRequest({
    url: '/fdc/house/deleteAll',
    method: 'DELETE',
    data: qry
  })
}

// 根据实际层批量修改房号
export function batchUpdateFloor(data) {
  return makeRequest({
    url: '/fdc/house/batch/floor/update',
    method: 'PUT',
    data
  })
}

// 查看楼盘详情
export function getProjectDetail({ projectId, cityId }) {
  return makeRequest({
    url: `/fdc/projects/${projectId}`,
    data: {
      cityId
    }
  })
}

// 获取房号详情
export function getHouseDetail(params) {
  return makeRequest({
    url: `/fdc/house/${params.id}`,
    data: params
  })
}

// 新增房号
export function addHouseNum(houseInfo) {
  return makeRequest({
    url: '/fdc/house',
    data: houseInfo,
    method: 'POST'
  })
}

// 更新房号数据
export function editHouseNum(houseInfo) {
  return makeRequest({
    url: '/fdc/house',
    data: houseInfo,
    method: 'PUT'
  })
}

// 删除房号
export function deleteHouseNum(ids) {
  return makeRequest({
    url: '/fdc/house',
    data: ids,
    method: 'DELETE'
  })
}

// 计算价格系数
export function calculateHousePrice(data) {
  return makeRequest({
    url: '/fdc/house/batch/calculate',
    method: 'PUT',
    data
  })
}
