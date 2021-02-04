import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.projectRent,
  compareDatas: createSelector(
    state => state.projectRent.get('compareDatas'),
    compareDatas => compareDatas.toJS()
  ),
  baseDatas: createSelector(
    state => state.projectRent.get('baseDatas'),
    baseDatas => baseDatas.toJS()
  ),
  caseDatas: createSelector(
    state => state.projectRent.get('caseDatas'),
    caseDatas => caseDatas.toJS()
  ),
  rentRatioDatas: createSelector(
    state => state.projectRent.get('rentRatioDatas'),
    rentRatioDatas => rentRatioDatas.toJS()
  ),
  basePriceHistory: createSelector(
    state => state.projectRent.get('basePriceHistory'),
    basePriceHistory => basePriceHistory.toJS()
  ),
  casePriceHistory: createSelector(
    state => state.projectRent.get('casePriceHistory'),
    casePriceHistory => casePriceHistory.toJS()
  ),
  rentRatioDatasHistory: createSelector(
    state => state.projectRent.get('rentRatioDatasHistory'),
    rentRatioDatasHistory => rentRatioDatasHistory.toJS()
  ),
  // 根据月份获取案例均价详情 WY
  monthToDetail: createSelector(
    state => state.projectRent.get('monthToDetail'),
    monthToDetail => monthToDetail.toJS()
  )
  // 根据月份获取案例均价详情 WY
  // monthToBase: createSelector(
  //   state => state.projectRent.get('monthToBase'),
  //   monthToBase => monthToBase
  // )
})
