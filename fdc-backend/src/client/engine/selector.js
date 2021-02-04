import { createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.engine
})
// export const loadingSelector = state => state.engine.get('loading')
export const userInfoSelector = state => state.engine.get('userinfo')
