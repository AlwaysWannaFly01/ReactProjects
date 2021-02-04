import { createActions } from 'client/utils/store'

const { actions, containerActions } = createActions({
  namespace: 'propertyPvg',
  actions: {
    setSourceProduct: 'SET_SOURCE_PRODUCT',
    getSourceProduct: 'GET_SOURCE_PRODUCT',

    getPropertyPvgList: 'GET_PROPERTY_PVG_LIST',
    setPropertyPvgList: 'SET_PROPERTY_PVG_LIST',

    replyPvgResponse: 'REPLY_PVG_RESPONSE',

    getAnswerList: 'GET_ANSWER_LIST',
    setAnswerList: 'SET_ANSWER_LIST',

    getOneLineList: 'GET_ONE_LINE_LIST',
    setOneLineList: 'SET_ONE_LINE_LIST',

    getAuthorityList: 'GET_AUTHORITY_LIST',
    setAuthorityList: 'SET_AUTHORITY_LIST'
  }
})

export default actions
export { containerActions }
