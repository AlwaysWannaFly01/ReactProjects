import { createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  userInfo: state => state.engine.get('userinfo')
})
