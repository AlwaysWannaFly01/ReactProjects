import { createStructuredSelector } from 'reselect'

export const modelSelector = createStructuredSelector({
  model: state => state.DatasourceManage,
  channelList: state => state.DatasourceManage.get('channelList').toJS(),
  dataList: state => state.DatasourceManage.get('dataList').toJS(),
  productDataList: state => state.DatasourceManage.get('productDataList').toJS()
})
