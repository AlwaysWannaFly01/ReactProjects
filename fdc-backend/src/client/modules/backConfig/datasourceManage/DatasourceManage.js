import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import {
  Breadcrumb,
  Icon,
  Input,
  Row,
  Col,
  Button,
  List,
  Form,
  Modal,
  Table,
  message,
  Select
} from 'antd'
import showTotal from 'client/utils/showTotal'
import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import { breadList, columns } from './constant'
import styles from './DatasourceManage.less'

/**
 * @description 后台配置-数据来源管理
 * @author ZLJ
 */
const FormItem = Form.Item
const { Option } = Select
const confirm = Modal.confirm
class DatasourceManage extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    form: PropTypes.object.isRequired,
    getChannelList: PropTypes.func.isRequired,
    getListByCity: PropTypes.func.isRequired,
    getProductByCity: PropTypes.func.isRequired,
    saveProductList: PropTypes.func.isRequired,
    getDataList: PropTypes.func.isRequired,
    dataList: PropTypes.array.isRequired,
    // delProduct: PropTypes.func.isRequired,
    productDataList: PropTypes.array.isRequired,
    getProductList: PropTypes.func.isRequired,
    validateAreaConfig: PropTypes.func.isRequired,
    clearCaseList: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      channelList: [],
      loading: false,
      visible: false,
      title: '',
      productList: [],
      cityId: '',
      areaId: '',
      provinceId: '',
      modify: false,
      id: 1,
      businessCode: '',
      companyId: '',
      productCode: '',
      pageNum: ''
    }
  }
  componentDidMount() {
    this.props.getChannelList(
      {
        pageNum: 1,
        pageSize: 5
      },
      data => {
        this.dealChannelList(data)
      }
    )
  }

  dealChannelList = data => {
    data.forEach(i => {
      if (i.children) {
        i.children.forEach(j => {
          j.showFlag = false
        })
      }
    })
    this.setState({
      channelList: data
    })
  }

  handleOk = e => {
    const {
      productList,
      cityId,
      areaId,
      provinceId // eslint-disable-line
    } = this.state
    const qry = {
      cityId,
      areaId,
      provinceId,
      paramList: [...productList]
    }
    this.props.saveProductList(qry, (code, message) => {
      if (code === '200') {
        message.success('保存成功')
        this.handleCancelCB(e)
      } else {
        message.error(message)
      }
    })
  }

  handleCancel = e => {
    const $this = this
    const { modify } = this.state
    if (modify) {
      confirm({
        title: '保存提示',
        content: '当前配置已改动，是否保存？',
        onOk() {
          $this.handleOk(e)
        },
        onCancel() {
          $this.handleCancelCB(e)
        }
      })
    } else {
      $this.handleCancelCB(e)
    }
  }
  // 如果没有该模块更改配置权限时的取消按钮
  handleCancelCB = () => {
    this.setState({
      visible: false,
      modify: false,
      productList: []
    })
    this.props.clearCaseList()
    this.handleSearch(null, this.state.pageNum)
  }
  changeProductCode = productCode => {
    const { cityId, areaId } = this.state
    this.setState({ productCode, companyId: '', businessCode: '' })
    this.props.form.resetFields(['companyId', 'businessCode'])
    this.props.getDataList({ productCode, cityId, areaId })
  }
  changeCompanyCode = companyId => {
    this.setState({ companyId })
  }
  changeBusinessCode = businessCode => {
    this.setState({ businessCode })
  }
  openModel = (
    parentName,
    provinceId,
    cityName,
    regionName,
    cityId,
    areaId
  ) => {
    this.props.getProductList({ cityId, areaId })
    this.props.getProductByCity({ cityId, areaId }, data => {
      this.setState({ productList: data })
    })
    this.setState({
      visible: true,
      title: regionName
        ? `${parentName}---${cityName}---${regionName}`
        : `${parentName}---${cityName}`,
      cityId,
      areaId,
      provinceId
    })
  }
  moveItem = (id, priority, type) => {
    // type = 1 移除 2 上移 3 下移
    const { productList, areaId } = this.state
    const idx = productList.findIndex(i => i.id === id)
    const item = productList.find(i => i.id === id)
    this.setState({ modify: true })
    if (type === 2 && priority === 1) {
      message.warning('优先级已经最高！')
      return
    }
    const $this = this
    if (type === 1 && !areaId) {
      confirm({
        title: '移除提示',
        content: '将会移除城市下所有行政区的该条配置，是否移除？',
        onOk() {
          productList.splice(idx, 1)
          $this.setState({ productList })
        }
      })
    } else {
      productList.splice(idx, 1)

      if (type === 2) {
        // 上移
        item.priority = priority === 1 ? priority : priority - 1
        productList.splice(idx - 1, 0, item)
      } else if (type === 3) {
        // 下移
        item.priority = priority + 1
        productList.splice(idx + 1, 0, item)
      }
      // 排序
      productList.sort((arg1, arg2) => {
        if (arg1.priority < arg2.priority) {
          return -1
        }
        if (arg1.priority > arg2.priority) {
          return 1
        }
        return 0
      })
      this.setState({ productList })
    }
  }
  handleSubmit = e => {
    if (e) {
      e.preventDefault()
    }
    const { cityId, areaId, provinceId, productList, id } = this.state // eslint-disable-line
    const { dataList, productDataList } = this.props
    this.props.form.validateFields(
      ['productCode', 'companyId', 'businessCode'],
      (err, values) => {
        if (!err) {
          const newProduct = {
            id,
            cityId,
            areaId,
            provinceId,
            productCode: values.productCode,
            companyId: values.companyId,
            businessCode: values.businessCode,
            productName: productDataList.find(
              i => i.productCode === values.productCode
            ).productName,
            companyName: dataList[0].data.find(
              i => i.companyId === values.companyId
            ).companyName,
            businessName: dataList[1].data.find(
              i => i.businessCode === values.businessCode
            ).businessName,
            propertyType: '',
            priority: productList.length
              ? productList[productList.length - 1].priority
              : 1
          }
          if (areaId) {
            this.props.validateAreaConfig(newProduct, (code, message) => {
              this.setState({
                productList:
                  code === '200' ? [...productList, newProduct] : productList,
                modify: true,
                id: id + 1,
                businessCode: '',
                companyId: '',
                productCode: ''
              })
              if (code === '200') {
                message.success('新增成功')
              } else {
                message.success(message)
              }
            })
          } else {
            this.setState({
              productList: [...productList, newProduct],
              modify: true,
              id: id + 1,
              businessCode: '',
              companyId: '',
              productCode: ''
            })
          }

          this.props.form.resetFields([
            'productCode',
            'companyId',
            'businessCode'
          ])
        }
      }
    )
  }
  handleTableExpand = (cityId, itemIndex, regionIndex, showFlag) => {
    const { channelList } = this.state
    const children = channelList[itemIndex].children[regionIndex].children
    this.setState({ loading: true })
    if (!showFlag) {
      this.props.getListByCity(cityId, data => {
        channelList[itemIndex].children[regionIndex].children = [
          ...children,
          ...data
        ]
        this.setState({ loading: false })
      })
    } else {
      const idx = children.findIndex(i => i.regionName)
      channelList[itemIndex].children[regionIndex].children.splice(idx)
      this.setState({ loading: false })
    }
    channelList[itemIndex].children[regionIndex].showFlag = !showFlag
  }
  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    this.props.form.validateFields(['keyword'], (err, values) => {
      if (!err) {
        const params = {
          pageNum: pageNum || 1,
          pageSize: 5,
          keyword: values.keyword
        }
        this.setState({ pageNum })
        this.props.getChannelList(params, data => {
          this.dealChannelList(data)
        })
      }
    })
  }
  renderBreads() {
    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''} {item.name}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )
  }
  renderForm() {
    const {
      form: { getFieldDecorator }
    } = this.props
    return (
      <Form layout="inline" className={styles.formBoxWy}>
        <FormItem label="关键字">
          {getFieldDecorator('keyword', {})(
            <Input placeholder="请输入关键字" />
          )}
        </FormItem>
        <FormItem style={{ marginLeft: 16 }}>
          <Button type="primary" onClick={e => this.handleSearch(e, 1)}>
            查询
          </Button>
        </FormItem>
      </Form>
    )
  }
  renderTable() {
    const {
      channelList,
      loading,
      visible,
      title,
      productList,
      businessCode,
      companyId,
      productCode // eslint-disable-line
    } = this.state

    const {
      form: { getFieldDecorator },
      dataList,
      productDataList
    } = this.props
    const { pageNum, pageSize, total } = this.props.model.get('pagination')
    const pagination = {
      current: pageNum,
      pageSize,
      total,
      showTotal,
      showQuickJumper: true,
      onChange: pageNum => {
        this.handleSearch(null, pageNum)
      }
    }
    const tableColumn = [
      ...columns,
      {
        title: '操作',
        width: 250,
        render: ({
          id,
          priority,
          businessName,
          companyName,
          productName // eslint-disable-line
        }) => (
          <Fragment>
            {pagePermission('fdc:bm:dataAdmin:change') ? (
              <Fragment>
                <Button
                  type="primary"
                  size="small"
                  style={{ margin: '0 6px' }}
                  disabled={
                    businessName === 'ALL' &&
                    companyName === 'ALL' &&
                    productName === 'FDC'
                  }
                  onClick={() => {
                    this.moveItem(id, priority, 1)
                  }}
                >
                  移除
                </Button>
                <Button
                  type="primary"
                  size="small"
                  style={{ margin: '0 6px' }}
                  onClick={() => {
                    this.moveItem(id, priority, 2)
                  }}
                >
                  上移
                </Button>
                <Button
                  type="primary"
                  size="small"
                  style={{ margin: '0 6px' }}
                  onClick={() => {
                    this.moveItem(id, priority, 3)
                  }}
                >
                  下移
                </Button>
              </Fragment>
            ) : (
              ''
            )}
          </Fragment>
        )
      }
    ]
    const footerBtns = [
      <Fragment>
        {pagePermission('fdc:bm:dataAdmin:change') ? (
          <Fragment>
            <Button key="cancel" onClick={this.handleCancel}>
              取消
            </Button>
            ,
            <Button key="save" type="primary" onClick={this.handleOk}>
              保存
            </Button>
          </Fragment>
        ) : (
          <Fragment>
            <Button key="cancel" onClick={this.handleCancelCB}>
              取消
            </Button>
            ,
            <Button key="save" disabled type="primary" onClick={this.handleOk}>
              保存
            </Button>
          </Fragment>
        )}
      </Fragment>
    ]
    return (
      <Fragment>
        <List
          itemLayout="vertical"
          loading={loading}
          size="small"
          pagination={pagination}
          dataSource={channelList}
          className={styles.parentBoxWy}
          renderItem={(item, itemIndx) => (
            <List key={item.parentId}>
              <Fragment key={item.parentId}>
                {/* 省 */}
                <Row className={styles.middleBoxWy}>
                  <span className={styles.cityTitleWy}>{item.parentName}</span>
                </Row>
                <Row
                  className={styles.middleBoxWy}
                  // style={{ margin: '0 24px' }}
                >
                  {item.children.map((i, regionIndex) => (
                    <Fragment key={i.regionId}>
                      <Row className={styles.regionAloneWy}>
                        {/* 市 */}
                        <Col span="15">{i.regionName}</Col>
                        <Col span="9">
                          <Button
                            type="primary"
                            // size="small"
                            style={{ margin: '0 8px' }}
                            onClick={() =>
                              this.openModel(
                                item.parentName,
                                item.parentId,
                                i.regionName,
                                '',
                                i.regionId,
                                ''
                              )
                            }
                          >
                            配置
                          </Button>
                          <Button
                            type="primary"
                            // size="small"
                            style={{ margin: '0 8px' }}
                            onClick={() =>
                              this.handleTableExpand(
                                i.regionId,
                                itemIndx,
                                regionIndex,
                                i.showFlag
                              )
                            }
                          >
                            {!i.showFlag ? '+' : '-'}
                          </Button>
                        </Col>
                      </Row>
                      {/* 产品 */}
                      <Row
                        // style={{ margin: '0 40px' }}
                        className={styles.regionBg}
                      >
                        {i.children.length ? (
                          i.children.map((j, idx) => (
                            <Fragment key={j.key || j.regionId}>
                              {j.regionName && i.showFlag ? (
                                <Fragment>
                                  {/* 行政区 */}
                                  <Row className={styles.regionWy}>
                                    <Col span="15">{j.regionName}</Col>
                                    <Col span="9">
                                      <Button
                                        type="primary"
                                        size="small"
                                        style={{ margin: '0 8px' }}
                                        onClick={() =>
                                          this.openModel(
                                            item.parentName,
                                            item.parentId,
                                            i.regionName,
                                            j.regionName,
                                            i.regionId,
                                            j.regionId
                                          )
                                        }
                                      >
                                        配置
                                      </Button>
                                    </Col>
                                  </Row>
                                  <Row className={styles.differentCityWy}>
                                    {`${j.children}` ? (
                                      j.children.map((z, n) => (
                                        <Row key={z.key}>
                                          {n + 1}、{z.channelConfigName}
                                        </Row>
                                      ))
                                    ) : (
                                      <div className={styles.noCityWy}>
                                        该城市行政区暂无配置
                                      </div>
                                    )}
                                  </Row>
                                </Fragment>
                              ) : (
                                <Row className={styles.white}>
                                  {idx + 1}、{j.channelConfigName}
                                </Row>
                              )}
                            </Fragment>
                          ))
                        ) : (
                          <div className={styles.noCityWy}>该城市暂无配置</div>
                        )}
                      </Row>
                    </Fragment>
                  ))}
                </Row>
              </Fragment>
            </List>
          )}
        />
        <Modal
          title={title}
          width={900}
          maskClosable={false}
          visible={visible}
          onOk={this.handleOk}
          onCancel={
            pagePermission('fdc:bm:dataAdmin:change')
              ? this.handleCancel
              : this.handleCancelCB
          }
          bodyStyle={{ padding: '8px 16px' }}
          destroyOnClose="true"
          okText="保存"
          footer={footerBtns}
        >
          <Row style={{ marginBottom: 8 }}>
            <Form layout="inline" onSubmit={this.handleSubmit}>
              <FormItem>
                {getFieldDecorator('productCode')(
                  <Select
                    style={{ width: 180 }}
                    placeholder="请选择产品"
                    onChange={this.changeProductCode}
                  >
                    {productDataList.map(i => (
                      <Option
                        key={i.productCode}
                        value={i.productCode}
                        title={i.productName}
                      >
                        {i.productName}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('companyId')(
                  <Select
                    style={{ width: 180 }}
                    placeholder="请选择机构"
                    onChange={this.changeCompanyCode}
                  >
                    {dataList && dataList[0]
                      ? dataList[0].data.map(i => (
                          // eslint-disable-next-line
                          <Option
                            key={i.companyId}
                            value={i.companyId}
                            title={i.companyName}
                          >
                            {i.companyName}
                          </Option>
                        ))
                      : ''}
                  </Select>
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('businessCode')(
                  <Select
                    style={{ width: 180 }}
                    placeholder="请选择业务"
                    onChange={this.changeBusinessCode}
                  >
                    {dataList && dataList[1]
                      ? dataList[1].data.map(i => (
                          // eslint-disable-next-line
                          <Option
                            key={i.businessCode}
                            value={i.businessCode}
                            title={i.businessName}
                          >
                            {i.businessName}
                          </Option>
                        ))
                      : ''}
                  </Select>
                )}
              </FormItem>
              <FormItem>
                {pagePermission('fdc:bm:dataAdmin:change') ? (
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={
                      !(
                        businessCode !== '' &&
                        companyId !== '' &&
                        productCode !== ''
                      )
                    }
                  >
                    新增
                  </Button>
                ) : (
                  ''
                )}
              </FormItem>
            </Form>
          </Row>
          <Table
            columns={tableColumn}
            className={styles.tableOver}
            rowKey="id"
            dataSource={productList}
            // pagination={pagination}
            loading={this.context.loading.includes(actions.GET_PROPERTYS_LIST)}
          />
        </Modal>
      </Fragment>
    )
  }
  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderTable()}
        </div>
      </div>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    modelSelector,
    containerActions
  )
)(DatasourceManage)
