import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.houseAttached,
  subHouseList: createSelector(
    state => state.houseAttached.get('subHouseList'),
    subHouseList => subHouseList.toJS()
  )
})
