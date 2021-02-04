import { createStructuredSelector, createSelector } from 'reselect'
import {fromJS} from "immutable"

export const modelSelector = createStructuredSelector({
  model: state => state.dataQuick,
  caseList: createSelector(
    state => state.dataQuick.get('caseList'),
    caseList => caseList.toJS(),
  ),
  // provinceCityList: createSelector(
  //     state => state.dataQuick.get('provinceCityList'),
  //     provinceCityList => provinceCityList.toJS()
  // ),
})
