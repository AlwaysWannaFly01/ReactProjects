import { createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.cityList,
  defaultCity: state => state.engine.get('defaultCity')
})
