import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.projectAvg,
  mapCheckPriceConfig: createSelector(
      state => state.projectAvg.get('mapCheckPriceConfig'),
      mapCheckPriceConfig => mapCheckPriceConfig.toJS()
  ),
  compareDatas: createSelector(
    state => state.projectAvg.get('compareDatas'),
    compareDatas => compareDatas.toJS()
  ),
  baseDatas: createSelector(
    state => state.projectAvg.get('baseDatas'),
    baseDatas => baseDatas.toJS()
  ),
  caseDatas: createSelector(
    state => state.projectAvg.get('caseDatas'),
    caseDatas => caseDatas.toJS()
  ),
  caseEstimate: createSelector(
    state => state.projectAvg.get('caseEstimate'),
    caseEstimate => caseEstimate.toJS()
  ),
  baseEstimate: createSelector(
    state => state.projectAvg.get('baseEstimate'),
    baseEstimate => baseEstimate.toJS()
  ),
  housePrice: createSelector(
    state => state.projectAvg.get('housePrice'),
    housePrice => housePrice.toJS()
  ),
  basePriceHistory: createSelector(
    state => state.projectAvg.get('basePriceHistory'),
    basePriceHistory => basePriceHistory.toJS()
  ),
  casePriceHistory: createSelector(
    state => state.projectAvg.get('casePriceHistory'),
    casePriceHistory => casePriceHistory.toJS()
  ),
  estimateAvg: createSelector(
    state => state.projectAvg.get('estimateAvg'),
    estimateAvg => estimateAvg.toJS()
  ),
  estimateWeight: createSelector(
    state => state.projectAvg.get('estimateWeight'),
    estimateWeight => estimateWeight.toJS()
  ),
  standardHousePriceTwo: createSelector(
    state => state.projectAvg.get('standardHousePriceTwo'),
    standardHousePriceTwo => standardHousePriceTwo.toJS()
  ),
  // 根据月份获取案例均价详情 WY
  monthToDetail: createSelector(
    state => state.projectAvg.get('monthToDetail'),
    monthToDetail => monthToDetail.toJS()
  ),
  // 根据月份获取案例均价详情 WY
  monthToBase: createSelector(
    state => state.projectAvg.get('monthToBase'),
    monthToBase => monthToBase.toJS()
  ),

  errorCaseList: createSelector(
    state => state.projectAvg.get('errorCaseList'),
    errorCaseList => errorCaseList.toJS()
  ),
  // 根据月份获取评估案例均价详情 WY
  estimateMonthToDetail: createSelector(
    state => state.projectAvg.get('estimateMonthToDetail'),
    estimateMonthToDetail => estimateMonthToDetail.toJS()
  ),
  // 根据评估月份获取评估基准价详情 WY
  estimateMonthToWeightDetail: createSelector(
    state => state.projectAvg.get('estimateMonthToWeightDetail'),
    estimateMonthToWeightDetail => estimateMonthToWeightDetail.toJS()
  ),
  // 根据评估月份获取标准房价格详情 WY
  standardHousePriceDetail: createSelector(
    state => state.projectAvg.get('standardHousePriceDetail'),
    standardHousePriceDetail => standardHousePriceDetail.toJS()
  )
})
