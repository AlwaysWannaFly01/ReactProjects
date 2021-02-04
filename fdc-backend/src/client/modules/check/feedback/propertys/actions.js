import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'propertys',
  actions: {
    setPropertysList: 'SET_PROPERTYS_LIST',
    getPropertysList: 'GET_PROPERTYS_LIST',

    setSourceProduct: 'SET_SOURCE_PRODUCT',
    getSourceProduct: 'GET_SOURCE_PRODUCT',

    setAnswerList: 'SET_ANSWER_LIST',
    getAnswerList: 'GET_ANSWER_LIST',

    replyResponse: 'REPLY_RESPONSE'
  }
})

export default actions
export { containerActions }
