/**
 *@function fillupFloor
 *@param { Array } dataList 传入的列表数据
 *@description 房号列表 tab 中补楼层，由于物理层不能出现断层，且不能有0层
 */
function insertFloor(dataList, i, newDataList) {
  const hasFloorNoIndex = dataList.findIndex(item => item.floorNo === i)
  if (hasFloorNoIndex === -1) {
    newDataList.push({
      floorNo: i,
      key: i,
      isAddFloor: true,
      actualFloor: `${i}层`
    })
  } else {
    newDataList.push(dataList[hasFloorNoIndex])
  }
  return newDataList
}

function fillupFloor(dataList) {
  let newDataList = []
  const dataListLen = dataList.length

  if (dataListLen > 0) {
    const minFloorNo = dataList[0].floorNo
    const maxFloorNo = dataList[dataListLen - 1].floorNo

    if (minFloorNo > 0) {
      for (let i = 1; i <= maxFloorNo; i += 1) {
        newDataList = insertFloor(dataList, i, newDataList)
      }
    } else if (minFloorNo < 0 && maxFloorNo > 0) {
      for (let i = minFloorNo; i <= maxFloorNo; i += 1) {
        if (i !== 0) {
          newDataList = insertFloor(dataList, i, newDataList)
        }
      }
    } else if (maxFloorNo < 0) {
      for (let i = minFloorNo; i <= -1; i += 1) {
        newDataList = insertFloor(dataList, i, newDataList)
      }
    }
  }
  return newDataList
}

export default fillupFloor
