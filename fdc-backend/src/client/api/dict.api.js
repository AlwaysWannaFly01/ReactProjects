// 数据字典 API
import makeRequest from './makeRequest'

// 行政区列表
export function getAreaList(cityId) {
  return makeRequest({
    url: '/fdc/districts/area',
    data: { cityId }
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

// 产权形式
export function getOwershipType() {
  return makeRequest({
    url: '/fdc/dict/ownershipType'
  })
}

// 实际用途
export function getActualUsageType() {
  return makeRequest({
    url: '/fdc/dict/actualUsageType'
  })
}

// 物业类型
export function getObjectType() {
  // return makeRequest({
  //   url: '/fdc/dict/objectType'
  // })
  return { code: '200', message: 'success',data:[{"code":"1002001","name":"普通住宅"},{"code":"1002003","name":"公寓"},{"code":"1002004","name":"酒店式公寓"},{"code":"1002021","name":"商住"},{"code":"1002027","name":"别墅"},{"code":"1002005","name":"独立别墅"},{"code":"1002006","name":"联排别墅"},{"code":"1002007","name":"叠加别墅"},{"code":"1002008","name":"双拼别墅"},{"code":"1002009","name":"旅馆"},{"code":"1002010","name":"花园洋房"},{"code":"1002011","name":"老洋房"},{"code":"1002012","name":"新式里弄"},{"code":"1002013","name":"旧式里弄"},{"code":"1002014","name":"商业"},{"code":"1002015","name":"办公"},{"code":"1002016","name":"厂房"},{"code":"1002017","name":"酒店"},{"code":"1002018","name":"仓储"},{"code":"1002019","name":"车位"},{"code":"1002020","name":"综合"},{"code":"1002022","name":"其他"},{"code":"1002025","name":"地下室、储藏室"},{"code":"1002026","name":"车库"}]}
}

// 用途
export function getUsageType() {
  // return makeRequest({
  //   url: '/fdc/dict/usageType'
  // })
  return { code: '200', message: 'success', data: [{ code: '1001001', name: '居住' }, { code: '1001002', name: '居住(别墅)' }, { code: '1001003', name: '居住(洋房)' }, { code: '1001016', name: '居住(商住)' }, { code: '1001004', name: '商业' }, { code: '1001005', name: '办公' }, { code: '1001006', name: '工业' }, { code: '1001015', name: '公寓' }, { code: '1001007', name: '商业、居住' }, { code: '1001008', name: '商业、办公' }, { code: '1001009', name: '办公、居住' }, { code: '1001010', name: '停车场' }, { code: '1001011', name: '酒店' }, { code: '1001012', name: '加油站' }, { code: '1001013', name: '综合' }, { code: '1001014', name: '其他' }] }
}

// 房号用途
export function getHouseUsage() {
  return makeRequest({
    url: '/fdc/dict/houseUsage'
  })
}

// 主体建筑类型
export function getBuildingType() {
  return makeRequest({
    url: '/fdc/dict/buildingType'
  })
}

// 景观
export function getSightType() {
  return makeRequest({
    url: '/fdc/dict/sightType'
  })
}

// 朝向
export function getOrientType() {
  return makeRequest({
    url: '/fdc/dict/orientationType'
  })
}

// 建筑结构
export function getBuildStructure() {
  return makeRequest({
    url: '/fdc/dict/buildingStructure'
  })
}

// 户型结构
export function getStructType() {
  return makeRequest({
    url: '/fdc/dict/structureType'
  })
}

// 通风采光
export function getVentLightType() {
  return makeRequest({
    url: '/fdc/dict/ventLightType'
  })
}

// 噪音情况
export function getNoiseType() {
  return makeRequest({
    url: '/fdc/dict/noiseType'
  })
}

// 内部装修
export function getInsideDecorateType() {
  return makeRequest({
    url: '/fdc/dict/insideDecorationCode'
  })
}

// 装修
export function getDecorateType() {
  return makeRequest({
    url: '/fdc/dict/decorationType'
  })
}

// 附属房屋
export function getSubHouseType() {
  return makeRequest({
    url: '/fdc/dict/subHouseType'
  })
}

// 附属房屋 的 计算方法
export function getArithmeticType() {
  return makeRequest({
    url: '/fdc/dict/arithmeticType'
  })
}

// 楼栋位置
export function getLocationCode() {
  return makeRequest({
    url: '/fdc/dict/locationCode'
  })
}

// 楼栋户型面积
export function getHouseAreaCode() {
  return makeRequest({
    url: '/fdc/dict/houseAreaCode'
  })
}

// 外墙装修
export function getExternalWall() {
  return makeRequest({
    url: '/fdc/dict/externalWallDecorateCode'
  })
}

// 墙体类型
export function getWallTypeCode() {
  return makeRequest({
    url: '/fdc/dict/wallTypeCode'
  })
}

// 维护情况
export function getMaintenanceCode() {
  return makeRequest({
    url: '/fdc/dict/maintenanceCode'
  })
}

// 管道燃气
export function getGasCode() {
  return makeRequest({
    url: '/fdc/dict/gasCode'
  })
}

// 取暖方式
export function getWarmCode() {
  return makeRequest({
    url: '/fdc/dict/warmCode'
  })
}

// 户型
export function getHouseType() {
  return makeRequest({
    url: '/fdc/dict/houseType'
  })
}

// 币种
export function getCurrencyType() {
  return makeRequest({
    url: '/fdc/dict/currencyType'
  })
}

// 房号页面数据字典合集
export function getHouseDict() {
  return makeRequest({
    url: '/fdc/dict/houseDict'
  })
}

// 押负方式
export function getPayTypeCode() {
  return makeRequest({
    url: '/fdc/dict/payTypeCode'
  })
}

// 出租方式
export function getRentTypeCode() {
  return makeRequest({
    url: '/fdc/dict/rentTypeCode'
  })
}

// 出租案例类型
export function getRentCaseCode() {
  return makeRequest({
    url: '/fdc/dict/rentCaseCode'
  })
}

// 导出类型
export function getExportType(moduleType) {
  return makeRequest({
    url: '/fdc/dict/exportType',
    data: {
      moduleType
    }
  })
}

// 配套类型
export function getFacilityType() {
  return makeRequest({
    url: '/fdc/dict/facilitiesTypeCode'
  })
}

// 公共配套类型
export function getCommonFacilitiesTypeCode() {
  return makeRequest({
    url: '/fdc/dict/commonFacilitiesTypeCode'
  })
}

// 配套子类，联动配套类型
export function getFacilitiesSubTypeCode(typeId) {
  return makeRequest({
    url: '/fdc/dict/facilitiesSubTypeCode',
    data: {
      typeId
    }
  })
}

// 配套等级
export function getFacilityClassCode() {
  return makeRequest({
    url: '/fdc/dict/classCode'
  })
}

// 物业类型-数据统计
export function getPropertyType() {
  return makeRequest({
    url: '/fdc/dict/propertyType'
  })
}

// 来源机构
export function getSourceCompany() {
  return makeRequest({
    url: '/fdc/dict/sourceCompany'
  })
}

// 案列类型列表
export function getCaseTypeList() {
  return makeRequest({
    url: '/fdc/dict/caseType'
  })
}
