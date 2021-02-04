import { createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.auditFloor,
  cityList: state => state.cityRange.get('cityList'),
  auditFloorList: state => state.auditFloor.get('auditFloorList').toJS(),
  InformationList: state => state.auditFloor.get('showInformationList').toJS(),
  matchList: state => state.auditFloor.get('matchList').toJS(),
  authorityList: state => state.auditFloor.get('authorityList').toJS()
})
