/**
 *  compareObj 比较对象是否，返回新对象不同的部分
 *  params: (oldDataObj, newDataObj)
 *  用于编辑: 楼盘/楼栋/房号编辑
 *  进行弱类型比较
 */

// 楼盘需要数据追踪的字段
const baseInfoTrackItems = [
  'areaId',
  'projectName',
  'usageCode',
  'projectAlias',
  'landStartDate',
  'openingDate',
  'landEndDate',
  'deliveryDate',
  'address',
  'isLLatitudeXy'
]

// 楼栋需要数据追踪的字段
const buildInfoTrackItems = [
  'buildingName',
  'priceRate',
  'usageCode',
  'buildDate'
]

// 楼栋名称、别名批量修改数据追踪字段
const batchBuildTrackItems = ['buildingName']

/* eslint-disable */
function compareObj(objA, objB, type) {
  let arrkeys = []

  switch (type) {
    case 'baseInfo':
      arrkeys = baseInfoTrackItems
      break
    case 'buildInfo':
      arrkeys = buildInfoTrackItems
      break
    case 'batchBuild':
      arrkeys = batchBuildTrackItems
      break
    default:
      arrkeys = Object.keys(objB)
      break
  }

  for (let i = 0; i < arrkeys.length; i += 1) {
    if (objA[arrkeys[i]] == objB[arrkeys[i]]) {
      // 有 undefined 的值默认为空，POST请求会删除 undefined 字段
      // objB[arrkeys[i]] = objB[arrkeys[i]] || ''

      delete objB[arrkeys[i]]
    }
  }

  return objB
}

export default compareObj
