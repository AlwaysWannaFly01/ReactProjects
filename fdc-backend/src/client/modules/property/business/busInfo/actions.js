import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'busInfo',
  actions: {}
})

export default actions
export { containerActions }
