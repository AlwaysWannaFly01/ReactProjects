import { createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  userInfo: state => state.engine.get('userinfo'),
  defaultCity: state => state.engine.get('defaultCity')
})
// export const loadingSelector = state => state.mainframe.get('loading')
