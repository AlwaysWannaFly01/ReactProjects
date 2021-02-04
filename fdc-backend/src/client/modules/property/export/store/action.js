import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'baseExport',
  actions: {
    exportAreaData: 'EXPORT_AREA_DATA',
    exportRoomData: 'EXPORT_ROOM_DATA',
    exportBuildingData: 'EXPORT_BUILDING_DATA',
    fetchAreas: 'FETCH_AREAS',
    // 切换城市
    updateVisitCities: 'UPDATE_VISIT_CITIES'
  }
})

export { containerActions, actions }
