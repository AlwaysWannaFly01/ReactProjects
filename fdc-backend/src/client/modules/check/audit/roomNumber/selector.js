import { createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.roomNO,
  cityList: state => state.cityRange.get('cityList'),
  houseList: state => state.roomNO.get('houseList').toJS(),
  houseDetail: state => state.roomNO.get('houseDetail').toJS(),
  fdcHouseList: state => state.roomNO.get('fdcHouseList').toJS(),
  preMatchList: state => state.roomNO.get('preMatchList').toJS(),
  conditionList: state => state.roomNO.get('conditionList').toJS(),
  authorityList: state => state.roomNO.get('authorityList').toJS()
})
