import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  Breadcrumb,
  Icon,
  Alert,
  Form,
  Button,
  InputNumber,
  Row,
  Col,
  Select,
  DatePicker,
  Message
} from 'antd'
import moment from 'moment'
import Immutable from 'immutable'
import { Link } from 'react-router-dom'
import { pagePermission } from 'client/utils'
import { parse } from 'qs'
import router from 'client/router'
import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ProjectRent.less'

const FormItem = Form.Item
const { MonthPicker } = DatePicker
const Option = Select.Option

const formItemLayout = {
  labelCol: {
    xs: { span: 6 },
    sm: { span: 12 }
  },
  wrapperCol: {
    xs: { span: 6 },
    sm: { span: 10 }
  }
}

/*
 * 基准租金详情
 * 1.当月的数据可以编辑 2.历史月份的数据不可以编辑
 * 是否历史数据标志 tag 0:否 1:是
 * 0当月及当月以后不可编辑，1历史数据可编辑   autho:WY
 * author: YJF
 */
class BaseRentDetail extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    getPriceSource: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    queryBasePriceDetail: PropTypes.func.isRequired,
    saveBasePriceDetail: PropTypes.func.isRequired,
    addBaseHistory: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }
  constructor(props) {
    super(props)

    /* eslint-disable */
    const {
      activeTabs,
      projectId = '',
      weightId = '',
      tag,
      useMonth,
      state,
      cityId, // before
      cityName, //wy change
      feedCityId,
      feedProjectId,
      provinceId,
      entry,
      areaNameAdd,
      projectNameAdd,
      areaIds,
      keyword,
      compare
    } = parse(props.location.search.substr(1))
    // 基准租金id,每次进入此页面由后端判断生成
    this.weightId = weightId

    this.state = {
      activeTabs,
      // 楼盘id
      projectId,
      // 月份
      useMonth,
      // 是否历史数据标志
      tag,
      state,
      cityId,
      feedCityId,
      feedProjectId,
      provinceId,
      entry,
      timeIudge: '', // 判断时间是否为历史时间，历史时间为1，可编辑
      loading: false,
      cityName,
      areaNameAdd,
      projectNameAdd,
      areaIds,
      keyword,
      compare
    }
  }

  componentDidMount() {
    // console.log(this.state.state)
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
        // 获取来源列表
        this.props.getPriceSource()
        // 获取基准租金详情
        this.getBasePriceDetail()
      }
    }, 100)
    // 判断时间是否为历史时间，历史时间为1，可编辑 WY
    const { useMonth, cityId, cityName } = this.state
    if (new Date(useMonth).getFullYear() >= new Date().getFullYear()) {
      if (new Date(useMonth).getMonth() > new Date().getMonth()) {
        this.setState({ timeIudge: '0' })
      }
    }
    // console.log(this.state.timeIudge)
    if (new Date(useMonth).getFullYear() <= new Date().getFullYear()) {
      // if (new Date(useMonth).getMonth() <= new Date().getMonth()) {
      this.setState({ timeIudge: '1' })
      // }
    }
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  //住宅案列租金改变获取住宅案例租金涨跌幅
  houseAvgRentChange = value => {
    if (value == 0 || value == '' || value == '-' || value == undefined) {
      this.props.form.setFieldsValue({ houseAvgRentGained: '' })
    } else {
      const { basePriceDetail } = this.props.model
      const lastMonthHouseAvgRent = basePriceDetail.get('lastMonthHouseAvgRent')
      if (lastMonthHouseAvgRent) {
        let houseAvgRentGained = (value / lastMonthHouseAvgRent - 1) * 100
        this.props.form.setFieldsValue({ houseAvgRentGained })
        console.log(lastMonthHouseAvgRent, houseAvgRentGained)
      }
    }
  }

  //住宅案例租金涨跌幅改变获取住宅案列租金
  houseAvgRentGainedChange = value => {
    if (value != '-' && value != '') {
      const { basePriceDetail } = this.props.model
      const lastMonthHouseAvgRent = basePriceDetail.get('lastMonthHouseAvgRent')
      if (lastMonthHouseAvgRent) {
        if (!value) {
          value = 0
          let houseAvgRent = lastMonthHouseAvgRent * (1 + value / 100)
          this.props.form.setFieldsValue({ houseAvgRent })
        } else {
          let houseAvgRent = lastMonthHouseAvgRent * (1 + value / 100)
          this.props.form.setFieldsValue({ houseAvgRent })
        }
      }
    } else {
      this.props.form.setFieldsValue({ houseAvgRent: '' })
    }
  }

  //公寓案列租金改变获取公寓案例租金涨跌幅
  apartmentRentChange = value => {
    if (value == 0 || value == '' || value == '-' || value == undefined) {
      this.props.form.setFieldsValue({ apartmentAvgRentGained: '' })
    } else {
      const { basePriceDetail } = this.props.model
      const lastMonthApartmentAvgRent = basePriceDetail.get(
        'lastMonthApartmentAvgRent'
      )
      if (lastMonthApartmentAvgRent) {
        let apartmentAvgRentGained =
          (value / lastMonthApartmentAvgRent - 1) * 100
        this.props.form.setFieldsValue({ apartmentAvgRentGained })
        console.log(lastMonthApartmentAvgRent, apartmentAvgRentGained)
      }
    }
  }

  //公寓案例租金涨跌幅改变获取公寓案列租金
  apartmentRentGainedChange = value => {
    if (value != '-' && value != '') {
      const { basePriceDetail } = this.props.model
      const lastMonthApartmentAvgRent = basePriceDetail.get(
        'lastMonthApartmentAvgRent'
      )
      if (lastMonthApartmentAvgRent) {
        if (!value) {
          value = 0
          let apartmentAvgRent = lastMonthApartmentAvgRent * (1 + value / 100)
          this.props.form.setFieldsValue({ apartmentAvgRent })
        } else {
          let apartmentAvgRent = lastMonthApartmentAvgRent * (1 + value / 100)
          this.props.form.setFieldsValue({ apartmentAvgRent })
        }
      }
    } else {
      this.props.form.setFieldsValue({ apartmentAvgRent: '' })
    }
  }

  //商住案列租金改变获取商住案例租金涨跌幅
  occopantAvgRentChange = value => {
    if (value == 0 || value == '' || value == '-' || value == undefined) {
      this.props.form.setFieldsValue({ occopantAvgRentGained: '' })
    } else {
      const { basePriceDetail } = this.props.model
      const lastMonthOccopantAvgRent = basePriceDetail.get(
        'lastMonthOccopantAvgRent'
      )
      if (lastMonthOccopantAvgRent) {
        let occopantAvgRentGained = (value / lastMonthOccopantAvgRent - 1) * 100
        this.props.form.setFieldsValue({ occopantAvgRentGained })
        console.log(lastMonthOccopantAvgRent, occopantAvgRentGained)
      }
    }
  }

  //商住案例租金涨跌幅改变获取商住案列租金
  occopantAvgRentGainedChange = value => {
    if (value != '-' && value != '') {
      const { basePriceDetail } = this.props.model
      const lastMonthOccopantAvgRent = basePriceDetail.get(
        'lastMonthOccopantAvgRent'
      )
      if (lastMonthOccopantAvgRent) {
        if (!value) {
          value = 0
          let occopantAvgRent = lastMonthOccopantAvgRent * (1 + value / 100)
          this.props.form.setFieldsValue({ occopantAvgRent })
        } else {
          let occopantAvgRent = lastMonthOccopantAvgRent * (1 + value / 100)
          this.props.form.setFieldsValue({ occopantAvgRent })
        }
      }
    } else {
      this.props.form.setFieldsValue({ occopantAvgRent: '' })
    }
  }

  getBasePriceDetail = () => {
    const { projectId, useMonth, tag } = this.state
    const params = {
      cityId: this.cityId,
      projectId,
      useMonth,
      tag
    }
    this.props.queryBasePriceDetail(params)
  }

  saveBasePriceDetail = values => {
    const { state, feedCityId, feedProjectId, provinceId } = this.state
    values.cityId = this.cityId
    this.props.saveBasePriceDetail(values, result => {
      const { code, msg } = result
      this.setState({
        loading: false
      })
      if (+code === 200) {
        Message.success('保存成功')
        // console.log(state)
        if (state) {
          this.context.router.history.push({
            pathname: router.FEEDBACK_PROPERTY_PVG_REPLY,
            search: `?cityId=${feedCityId}&projectId=${feedProjectId}&provinceId=${provinceId}&state=${state}`
          })
        } else {
          this.props.history.goBack()
          // this.props.history.push({
          //   pathname: router.RES_PRO_BASE_PRICE_HISTORY,
          //   search: `projectId=${feedProjectId}&activeTabs=2&weightId=${
          //     values.id
          //   }&cityId=${this.state.cityId}&cityName=${this.state.cityName}`
          // })
          this.setState({
            loading: false
          })
        }
      } else {
        Message.error(msg)
        this.setState({
          loading: false
        })
      }
    })
  }

  addBaseHistory = values => {
    const {
      areaIds,
      keyword,
      compare,
      entry,
      state,
      feedCityId,
      feedProjectId,
      provinceId
    } = this.state
    // console.log(tag)
    values.cityId = this.cityId
    values.projectId = this.state.projectId
    values.useMonth = moment(values.useMonth).format('YYYY-MM-01 HH:mm:ss')
    this.setState({
      loading: false
    })
    this.props.addBaseHistory(values, result => {
      const { code, msg } = result
      if (+code === 200) {
        Message.success('保存成功')
        // this.props.history.goBack()
        // wy change 2019/5/7 1.如果从基准租金历史数据页过来的（tag=1）2.如果从基准租金页过来的（tag=0）
        if (entry === '1') {
          // console.log(111)
          if (state) {
            // console.log(3)
            this.context.router.history.push({
              pathname: router.FEEDBACK_PROPERTY_PVG_REPLY,
              search: `?cityId=${feedCityId}&projectId=${feedProjectId}&provinceId=${provinceId}&state=${state}`
            })
          } else {
            // console.log(4)
            this.props.history.push({
              pathname: router.RES_PRO_PROJECT_RENT,
              search: `areaIds=${areaIds || ''}&keyword=${keyword ||
                ''}&activeTabs=${compare}&pageNum=${1}`
            })
          }

          // this.props.history.goBack()
        } else {
          console.log(222)
          this.props.history.push({
            pathname: router.RES_PRO_BASE_RENT_HISTORY,
            search: `projectId=${
              values.projectId
            }&activeTabs=2&weightId=${''}&cityId=${
              this.state.cityId
            }&cityName=${this.state.cityName}`
          })
        }
      } else {
        Message.error(msg)
      }
      this.setState({
        loading: false
      })
    })
  }

  handleSubmit = e => {
    if (e) {
      e.preventDefault()
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { entry } = this.state
        if (entry === '1') {
          // 从基准租金入口进入  反馈中心那边进来
          // this.saveBasePriceDetail(values)
          this.addBaseHistory(values)
        } else if (entry === '2') {
          // 从历史基准租金入口进入
          this.addBaseHistory(values)
        }
      }
    })
  }

  renderBreads() {
    const { activeTabs } = this.state
    const breadList = [
      {
        key: 1,
        path: '',
        name: '住宅',
        icon: 'home'
      },
      {
        key: 2,
        path: router.RES_PRO_PROJECT_RENT,
        search: `activeTabs=${activeTabs}`,
        name: '楼盘租金'
      },
      {
        key: 3,
        path: '',
        name: '基准租金详情'
      }
    ]

    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.path ? (
              <Link
                to={{
                  pathname: item.path,
                  search: item.search
                }}
              >
                {item.name}
              </Link>
            ) : (
              item.name
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )
  }

  renderProjectInfo() {
    const { basePriceDetail } = this.props.model
    const { areaName, projectName } = basePriceDetail

    const { areaNameAdd, projectNameAdd } = this.state
    return (
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              当前楼盘&nbsp;
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {areaNameAdd ? areaNameAdd : areaName} |{' '}
                {projectNameAdd ? projectNameAdd : projectName}
              </span>
            </p>
          }
          type="info"
          showIcon
        />
      </div>
    )
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form

    const { priceSourceList, basePriceDetail } = this.props.model

    const { tag = '1', loading, useMonth, timeIudge } = this.state
    return (
      <Form onSubmit={this.handleSubmit}>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="估价月份">
              {getFieldDecorator('useMonth', {
                initialValue: moment(useMonth)
              })(
                <MonthPicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-01"
                  disabled
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅基准租金(元/月/㎡)">
              {getFieldDecorator('houseAvgRent', {
                initialValue: basePriceDetail.get('houseAvgRent')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={2}
                  onChange={this.houseAvgRentChange.bind(this)}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅基准租金价格来源">
              {getFieldDecorator('houseRentTypeCode', {
                initialValue: basePriceDetail.get('houseRentTypeCode')
                  ? `${basePriceDetail.get('houseRentTypeCode')}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {priceSourceList.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="涨跌幅(%)">
              {getFieldDecorator('houseAvgRentGained', {
                initialValue: basePriceDetail.get('houseAvgRentGained')
              })(
                <InputNumber
                  min={-99}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  step={0.01}
                  precision={2}
                  onChange={this.houseAvgRentGainedChange.bind(this)}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10} />
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅多层基准租金(元/月/㎡)">
              {getFieldDecorator('houseMultiLayerAvgRent', {
                initialValue: basePriceDetail.get('houseMultiLayerAvgRent')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅多层基准租金价格来源">
              {getFieldDecorator('houseMultiLayerRentTypeCode', {
                initialValue: basePriceDetail.get('houseMultiLayerRentTypeCode')
                  ? `${basePriceDetail.get('houseMultiLayerRentTypeCode')}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {priceSourceList.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅小高层基准租金(元/月/㎡)">
              {getFieldDecorator('houseSmallHighLayerAvgRent', {
                initialValue: basePriceDetail.get('houseSmallHighLayerAvgRent')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅小高层基准租金价格来源">
              {getFieldDecorator('houseSmallHighLayerRentTypeCode', {
                initialValue: basePriceDetail.get(
                  'houseSmallHighLayerRentTypeCode'
                )
                  ? `${basePriceDetail.get('houseSmallHighLayerRentTypeCode')}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {priceSourceList.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅高层基准租金(元/月/㎡)">
              {getFieldDecorator('houseHighLayerAvgRent', {
                initialValue: basePriceDetail.get('houseHighLayerAvgRent')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅高层基准租金价格来源">
              {getFieldDecorator('houseHighLayerRentTypeCode', {
                initialValue: basePriceDetail.get('houseHighLayerRentTypeCode')
                  ? `${basePriceDetail.get('houseHighLayerRentTypeCode')}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {priceSourceList.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅超高层基准租金(元/月/㎡)">
              {getFieldDecorator('houseSuperHighLayerAvgRent', {
                initialValue: basePriceDetail.get('houseSuperHighLayerAvgRent')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅超高层基准租金价格来源">
              {getFieldDecorator('houseSuperHighLayerRentTypeCode', {
                initialValue: basePriceDetail.get(
                  'houseSuperHighLayerRentTypeCode'
                )
                  ? `${basePriceDetail.get('houseSuperHighLayerRentTypeCode')}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {priceSourceList.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓基准租金(元/月/㎡)">
              {getFieldDecorator('apartmentAvgRent', {
                initialValue: basePriceDetail.get('apartmentAvgRent')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={2}
                  onChange={this.apartmentRentChange.bind(this)}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓基准租金价格来源">
              {getFieldDecorator('apartmentRentTypeCode', {
                initialValue: basePriceDetail.get('apartmentRentTypeCode')
                  ? `${basePriceDetail.get('apartmentRentTypeCode')}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {priceSourceList.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="涨跌幅(%)">
              {getFieldDecorator('apartmentAvgRentGained', {
                initialValue: basePriceDetail.get('apartmentAvgRentGained')
              })(
                <InputNumber
                  min={-99}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  step={0.01}
                  precision={2}
                  onChange={this.apartmentRentGainedChange.bind(this)}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10} />
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓多层基准租金(元/月/㎡)">
              {getFieldDecorator('apartmentMultiLayerAvgRent', {
                initialValue: basePriceDetail.get('apartmentMultiLayerAvgRent')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓多层基准租金价格来源">
              {getFieldDecorator('apartmentMultiLayerRentTypeCode', {
                initialValue: basePriceDetail.get(
                  'apartmentMultiLayerRentTypeCode'
                )
                  ? `${basePriceDetail.get('apartmentMultiLayerRentTypeCode')}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {priceSourceList.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓小高层基准租金(元/月/㎡)">
              {getFieldDecorator('apartmentSmallHighLayerAvgRent', {
                initialValue: basePriceDetail.get(
                  'apartmentSmallHighLayerAvgRent'
                )
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓小高层基准租金价格来源">
              {getFieldDecorator('apartmentSmallHighLayerRentTypeCode', {
                initialValue: basePriceDetail.get(
                  'apartmentSmallHighLayerRentTypeCode'
                )
                  ? `${basePriceDetail.get(
                      'apartmentSmallHighLayerRentTypeCode'
                    )}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {priceSourceList.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓高层基准租金(元/月/㎡)">
              {getFieldDecorator('apartmentHighLayerAvgRent', {
                initialValue: basePriceDetail.get('apartmentHighLayerAvgRent')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓高层基准租金价格来源">
              {getFieldDecorator('apartmentHighLayerRentTypeCode', {
                initialValue: basePriceDetail.get(
                  'apartmentHighLayerRentTypeCode'
                )
                  ? `${basePriceDetail.get('apartmentHighLayerRentTypeCode')}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {priceSourceList.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓超高层基准租金(元/月/㎡)">
              {getFieldDecorator('apartmentSuperHighLayerAvgRent', {
                initialValue: basePriceDetail.get(
                  'apartmentSuperHighLayerAvgRent'
                )
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓超高层基准租金价格来源">
              {getFieldDecorator('apartmentSuperHighLayerRentTypeCode', {
                initialValue: basePriceDetail.get(
                  'apartmentSuperHighLayerRentTypeCode'
                )
                  ? `${basePriceDetail.get(
                      'apartmentSuperHighLayerRentTypeCode'
                    )}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {priceSourceList.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住基准租金(元/月/㎡)">
              {getFieldDecorator('occopantAvgRent', {
                initialValue: basePriceDetail.get('occopantAvgRent')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={2}
                  onChange={this.occopantAvgRentChange.bind(this)}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住基准租金价格来源">
              {getFieldDecorator('occopantRentTypeCode', {
                initialValue: basePriceDetail.get('occopantRentTypeCode')
                  ? `${basePriceDetail.get('occopantRentTypeCode')}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {priceSourceList.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="涨跌幅(%)">
              {getFieldDecorator('occopantAvgRentGained', {
                initialValue: basePriceDetail.get('occopantAvgRentGained')
              })(
                <InputNumber
                  min={-99}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  step={0.01}
                  precision={2}
                  onChange={this.occopantAvgRentGainedChange.bind(this)}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10} />
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住多层基准租金(元/月/㎡)">
              {getFieldDecorator('occopantMultiLayerAvgRent', {
                initialValue: basePriceDetail.get('occopantMultiLayerAvgRent')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住多层基准租金价格来源">
              {getFieldDecorator('occopantMultiLayerRentTypeCode', {
                initialValue: basePriceDetail.get(
                  'occopantMultiLayerRentTypeCode'
                )
                  ? `${basePriceDetail.get('occopantMultiLayerRentTypeCode')}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {priceSourceList.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住小高层基准租金(元/月/㎡)">
              {getFieldDecorator('occopantSmallHighLayerAvgRent', {
                initialValue: basePriceDetail.get(
                  'occopantSmallHighLayerAvgRent'
                )
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住小高层基准租金价格来源">
              {getFieldDecorator('occopantSmallHighLayerRentTypeCode', {
                initialValue: basePriceDetail.get(
                  'occopantSmallHighLayerRentTypeCode'
                )
                  ? `${basePriceDetail.get(
                      'occopantSmallHighLayerRentTypeCode'
                    )}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {priceSourceList.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住高层基准租金(元/月/㎡)">
              {getFieldDecorator('occopantHighLayerAvgRent', {
                initialValue: basePriceDetail.get('occopantHighLayerAvgRent')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住高层基准租金价格来源">
              {getFieldDecorator('occopantHighLayerRentTypeCode', {
                initialValue: basePriceDetail.get(
                  'occopantHighLayerRentTypeCode'
                )
                  ? `${basePriceDetail.get('occopantHighLayerRentTypeCode')}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {priceSourceList.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住超高层基准租金(元/月/㎡)">
              {getFieldDecorator('occopantSuperHighLayerAvgRent', {
                initialValue: basePriceDetail.get(
                  'occopantSuperHighLayerAvgRent'
                )
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住超高层基准租金价格来源">
              {getFieldDecorator('occopantSuperHighLayerRentTypeCode', {
                initialValue: basePriceDetail.get(
                  'occopantSuperHighLayerRentTypeCode'
                )
                  ? `${basePriceDetail.get(
                      'occopantSuperHighLayerRentTypeCode'
                    )}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {priceSourceList.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="别墅（元/月/㎡）">
              {getFieldDecorator('villaRent', {
                initialValue: basePriceDetail.get('villaRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="联排别墅（元/月/㎡）">
              {getFieldDecorator('platoonVillaRent', {
                initialValue: basePriceDetail.get('platoonVillaRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="独幢别墅（元/月/㎡）">
              {getFieldDecorator('singleVillaRent', {
                initialValue: basePriceDetail.get('singleVillaRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="叠加别墅（元/月/㎡）">
              {getFieldDecorator('superpositionVillaRent', {
                initialValue: basePriceDetail.get('superpositionVillaRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="双拼别墅（元/月/㎡）">
              {getFieldDecorator('duplexesVillaRent', {
                initialValue: basePriceDetail.get('duplexesVillaRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        {timeIudge === '1' ? (
          <Row className={styles.btnCont}>
            <Col span={10}>
              {pagePermission('fdc:hd:residence:saleRent:change') ? (
                <Button
                  type="primary"
                  htmlType="submit"
                  icon="save"
                  loading={loading}
                >
                  保存
                </Button>
              ) : (
                ''
              )}
            </Col>
          </Row>
        ) : null}
      </Form>
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderProjectInfo()}
          {this.renderForm()}
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
)(BaseRentDetail)
