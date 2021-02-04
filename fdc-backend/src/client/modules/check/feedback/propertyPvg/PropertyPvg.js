import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import Immutable from 'immutable'
import { Link } from 'react-router-dom'
import router from 'client/router'
import { Breadcrumb, Icon, Form, Row, Col, Checkbox, Button, Table } from 'antd'
import { parse } from 'qs'
import { getSession, removeSession } from 'client/utils/assist'
import layout from 'client/utils/layout'
import CityRange from 'client/components/city-range'
import showTotal from 'client/utils/showTotal'
import { pagePermission } from 'client/utils'
import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './reducer'
import './sagas'
import {
  breadList,
  dealStatusList,
  productSourceList,
  tableColumns
} from './content'

import styles from './PropertyPvg.less'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group

/**
 * @description 数据审核-楼盘均价模块
 * @author WY
 */

class PropertyPvg extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getPropertyPvgList: PropTypes.func.isRequired,
    propertyPvgList: PropTypes.array.isRequired,
    sourceProduct: PropTypes.array.isRequired,
    getSourceProduct: PropTypes.func.isRequired,
    cityList: PropTypes.instanceOf(Immutable.List).isRequired
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }
  constructor(props) {
    super(props)
    const { statuses } = parse(props.location.search.substr(1))
    let initialStatuses = []
    if (statuses) {
      initialStatuses = statuses.split(',')
    }
    this.state = {
      // 城市范围
      cityValues: [],
      // 处理状态 （选中）
      checkedAllStatusList: statuses !== undefined ? initialStatuses : ['2001'],
      halfStatus: true,
      checkedAllStatus: false,
      // 来源产品
      checkedAllProductList: [],
      halfProduct: true,
      checkedAllProduct: false,
      // 来源机构
      checkedAllCompanyList: [],
      halfCompany: true,
      checkedAllCompany: false
    }
    this.handleSearch(null, 1)
  }
  componentDidMount() {
    if (getSession('replyState')) {
      removeSession('replyState')
    }
    this.props.getSourceProduct()
    this.props.getPropertyPvgList({ pageNum: 1, pageSize: 20 })
  }
  // 来源产品 (全选)
  onCheckAllProductChange = e => {
    const productOptionsValue = productSourceList.map(i => i.value)
    this.setState({
      checkedAllProductList: e.target.checked ? productOptionsValue : [],
      halfProduct: false,
      checkedAllProduct: e.target.checked
    })
  }
  onCheckProductChange = e => {
    this.setState({
      checkedAllProductList: e,
      halfProduct: !!e.length && e.length < productSourceList.length,
      checkedAllProduct: e.length === productSourceList.length
    })
  }
  // 来源机构
  onCheckAllCompanyChange = e => {
    const productOptionsValue = this.props.sourceProduct.map(i => i.value)
    this.setState({
      checkedAllCompanyList: e.target.checked ? productOptionsValue : [],
      halfCompany: false,
      checkedAllCompany: e.target.checked
    })
  }
  onCheckCompanyChange = e => {
    this.setState({
      checkedAllCompanyList: e,
      halfCompany: !!e.length && e.length < this.props.sourceProduct.length,
      checkedAllCompany: e.length === this.props.sourceProduct.length
    })
  }
  // 处理类型 (全选)
  onCheckAllStatusChange = e => {
    const statusOptionsValue = dealStatusList.map(i => i.value)
    this.setState({
      checkedAllStatusList: e.target.checked ? statusOptionsValue : [],
      halfStatus: false,
      checkedAllStatus: e.target.checked
    })
  }
  onCheckStatusChange = e => {
    this.setState({
      checkedAllStatusList: e,
      halfStatus: !!e.length && e.length < dealStatusList.length,
      checkedAllStatus: e.length === dealStatusList.length
    })
  }
  handleFindAllCityIds = cityValues => {
    const cityIds = []
    if (cityValues instanceof Array) {
      cityValues.forEach(item => {
        const itemArr = item ? item.split('-') : []
        if (itemArr.length === 2) {
          const provinceId = itemArr[0]
          this.props.cityList.forEach(item => {
            if (item.get('provinceId') === +provinceId) {
              cityIds.push(item.get('id'))
            }
          })
        }
        if (itemArr.length === 3) {
          cityIds.push(itemArr[1])
        }
      })
    }
    return cityIds
  }
  // 搜索
  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    const {
      cityValues,
      checkedAllStatusList,
      checkedAllProductList,
      checkedAllCompanyList
    } = this.state
    const params = {
      pageNum: pageNum || 1,
      pageSize: 20,
      cityIds: this.handleFindAllCityIds(cityValues).join(','),
      dealStatuses: checkedAllStatusList.join(','),
      productIds: checkedAllProductList.join(','),
      companyIds: checkedAllCompanyList.join(',')
    }
    this.props.getPropertyPvgList(params)
  }
  // 城市范围变更事件
  // value.length > 1 则重置行政区和片区
  // value.item长度为2:省份 3.城市
  handleCityRangeChange = value => {
    this.setState({
      cityValues: value
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
    const { getFieldDecorator } = this.props.form
    const {
      cityValues,
      halfStatus,
      checkedAllStatus,
      checkedAllStatusList,
      halfProduct,
      checkedAllProduct,
      checkedAllProductList,
      checkedAllCompanyList,
      halfCompany,
      checkedAllCompany
    } = this.state
    return (
      <Form
        style={{
          marginTop: 8
        }}
        onSubmit={e => this.handleSearch(e, 1)}
      >
        <Row>
          <Col span={8}>
            <FormItem
              label="城市范围"
              labelCol={layout(6, 6)}
              wrapperCol={layout(6, 18)}
              style={{
                marginBottom: 4
              }}
            >
              {getFieldDecorator('cities', {
                initialValue: cityValues
              })(<CityRange onCityRangeChange={this.handleCityRangeChange} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <FormItem
            label="处理状态"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
            style={{
              marginBottom: 4
            }}
          >
            <Checkbox
              indeterminate={halfStatus}
              checked={checkedAllStatus}
              onChange={this.onCheckAllStatusChange}
            >
              全部
            </Checkbox>
            <CheckboxGroup
              options={dealStatusList}
              value={checkedAllStatusList}
              onChange={this.onCheckStatusChange}
            />
          </FormItem>
        </Row>
        <Row>
          <FormItem
            label="来源产品"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
            style={{
              marginBottom: 4
            }}
          >
            <Checkbox
              indeterminate={halfProduct}
              checked={checkedAllProduct}
              onChange={this.onCheckAllProductChange}
            >
              全部
            </Checkbox>
            <CheckboxGroup
              options={productSourceList}
              value={checkedAllProductList}
              onChange={this.onCheckProductChange}
            />
          </FormItem>
        </Row>
        <Row>
          <FormItem
            label="来源机构"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
            style={{
              marginBottom: 4
            }}
          >
            <Checkbox
              indeterminate={halfCompany}
              checked={checkedAllCompany}
              onChange={this.onCheckAllCompanyChange}
            >
              全部
            </Checkbox>
            <CheckboxGroup
              options={this.props.sourceProduct}
              value={checkedAllCompanyList}
              onChange={this.onCheckCompanyChange}
            />
          </FormItem>
        </Row>
        <Row
          style={{
            marginBottom: 16
          }}
        >
          <Button
            htmlType="submit"
            type="primary"
            icon="search"
            style={{
              marginRight: 16
            }}
          >
            查询
          </Button>
        </Row>
      </Form>
    )
  }
  renderTable() {
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
    const columns = [
      ...tableColumns,
      {
        title: '操作',
        width: 100,
        render: ({
          id,
          cityId,
          projectId,
          dealingState // eslint-disable-line
        }) => (
          <Fragment>
            {pagePermission('fdc:dc:feedbackCenter:saleAvgPrice:deal') ? (
              <Link
                to={{
                  pathname: router.FEEDBACK_PROPERTY_PVG_REPLY,
                  search: `?id=${id}&cityId=${cityId}&projectId=${projectId}&provinceId=${
                    this.props.propertyPvgList[0].provinceId
                  }&state=${dealingState}`
                }}
              >
                <Button type="primary" style={{ margin: '0 8px' }}>
                  处理
                </Button>
              </Link>
            ) : (
              <Button type="primary" disabled style={{ margin: '0 8px' }}>
                处理
              </Button>
            )}
          </Fragment>
        )
      }
    ]
    return (
      <Table
        columns={columns}
        rowKey="id"
        dataSource={this.props.propertyPvgList}
        pagination={pagination}
        loading={this.context.loading.includes(actions.GET_PROPERTY_PVG_LIST)}
        className={styles.defineTable}
      />
    )
  }
  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()} {this.renderTable()}
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
)(PropertyPvg)
