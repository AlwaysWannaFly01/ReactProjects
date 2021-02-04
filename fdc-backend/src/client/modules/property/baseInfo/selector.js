import { createStructuredSelector, createSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.baseInfo,
  baseInfoList: createSelector(
    state => state.baseInfo.get('baseInfoList'),
    baseInfoList => baseInfoList.toJS()
  ),
  projectDetail: state => state.baseInfo.get('projectDetail'),
  defaultCity: state => state.engine.get('defaultCity'),
  buildRateList: createSelector(
    state => state.baseInfo.get('buildRateList'),
    buildRateList => buildRateList.toJS()
  ),
  aloneArea: createSelector(
    state => state.baseInfo.get('aloneArea'),
    aloneArea => aloneArea.toJS()
  ),
  areaDrawList: createSelector(
    state => state.baseInfo.get('areaDrawList'),
    areaDrawList => areaDrawList.toJS()
  )
})
