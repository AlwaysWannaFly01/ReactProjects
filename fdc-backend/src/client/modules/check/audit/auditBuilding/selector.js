import { createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.building,
  cityList: state => state.cityRange.get('cityList'),
  buildList: state => state.building.get('buildList').toJS(),
  buildDetail: state => state.building.get('buildDetail').toJS(),
  fdcBuildList: state => state.building.get('fdcBuildList').toJS(),
  authorityList: state => state.building.get('authorityList').toJS()
})
