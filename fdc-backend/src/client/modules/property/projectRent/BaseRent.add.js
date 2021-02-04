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
 * author: WY
 */
class BaseRentDetail extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    getPriceSource: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    queryBasePriceDetail: PropTypes.func.isRequired,
    // saveBasePriceDetail: PropTypes.func.isRequired,
    addBaseHistory: PropTypes.func.isRequired,
    getMonthToBase: PropTypes.func.isRequired, // 根据月份获取基准租金详情 WY
    // monthToBase: PropTypes.object.isRequired, //  根据月份获取基准租金详情 WY
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
      id,
      cityId,
      feedCityId,
      feedProjectId,
      provinceId,
      cityName,
      areaNameAdd,
      projectNameAdd
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
      id,
      cityId,
      cityName,
      feedCityId,
      feedProjectId,
      provinceId,
      areaNameAdd,
      projectNameAdd,

      loading: false
    }
    this.handleUseMonthChange = this.handleUseMonthChange.bind(this)
  }

  componentDidMount() {
    const { cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
        // 获取来源列表
        this.props.getPriceSource()
        // 获取基准租金详情
        //this.getBasePriceDetail()
      }
      this.handleUseMonthChange(moment(this.BeforDataMonth()))
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  //住宅案列租金改变获取住宅案例租金涨跌幅
  houseAvgRentChange = value => {
    if (value == 0 || value == '' || value == '-' || value == undefined) {
      this.props.form.setFieldsValue({ houseAvgRentGained: '' })
    } else {
      const { monthToBase } = this.props.model
      const lastMonthHouseAvgRent = monthToBase.get('lastMonthHouseAvgRent')
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
      const { monthToBase } = this.props.model
      const lastMonthHouseAvgRent = monthToBase.get('lastMonthHouseAvgRent')
      if (lastMonthHouseAvgRent) {
        if (!value) {
          value = 0
          let houseAvgRent = lastMonthHouseAvgRent * (1 + value / 100)
          this.props.form.setFieldsValue({ houseAvgRent })
          console.log(value, houseAvgRent)
        } else {
          let houseAvgRent = lastMonthHouseAvgRent * (1 + value / 100)
          this.props.form.setFieldsValue({ houseAvgRent })
          console.log(value, houseAvgRent)
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
      const { monthToBase } = this.props.model
      const lastMonthApartmentAvgRent = monthToBase.get(
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
      const { monthToBase } = this.props.model
      const lastMonthApartmentAvgRent = monthToBase.get(
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
      const { monthToBase } = this.props.model
      const lastMonthOccopantAvgRent = monthToBase.get(
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
      const { monthToBase } = this.props.model
      const lastMonthOccopantAvgRent = monthToBase.get(
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

  // 案例月份变更 请求 根据月份获取基准租金详情 接口 WY
  handleUseMonthChange = date => {
    const { cityId } = this.state
    if (date) {
      const params = {
        tag: '0',
        cityId,
        projectId: this.state.projectId,
        useMonth: moment(date).format('YYYY-MM-01')
      }
      console.log(params)
      this.props.getMonthToBase(params)
    }
  }

  handleSubmit = e => {
    if (e) {
      e.preventDefault()
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.cityId = this.state.cityId
        values.projectId = this.state.projectId
        values.useMonth = moment(values.useMonth).format('YYYY-MM-DD HH:mm:ss')
        this.setState({
          loading: false
        })

        this.props.addBaseHistory(values, result => {
          const { code, message } = result
          if (+code === 200) {
            Message.success('新增成功')
            // this.props.history.goBack()
            this.props.history.push({
              pathname: router.RES_PRO_BASE_RENT_HISTORY,
              search: `projectId=${
                values.projectId
              }&activeTabs=2&weightId=${''}&cityId=${
                this.state.cityId
              }&cityName=${this.state.cityName}`
            })
          } else {
            Message.error(message)
          }
          this.setState({
            loading: false
          })
        })
      }
    })
  }

  disabledDate = current => {
    // const Idx = new Date().getMonth() - 1   //显示当月的月份
    const Idx = new Date().getMonth()
    return (
      current &&
      current >=
        moment()
          .set('month', Idx)
          .startOf('day')
    )
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
        name: '基准租金新增'
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
    const { projectDetail } = this.props.model
    const { areaName, monthToBase } = projectDetail
    return (
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              当前楼盘&nbsp;
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {/* {areaName || this.state.areaNameAdd} |{' '}
                {projectName || this.state.projectNameAdd} */}
                {this.state.areaNameAdd ? this.state.areaNameAdd : areaName} |{' '}
                {this.state.projectNameAdd
                  ? this.state.projectNameAdd
                  : monthToBase}
              </span>
            </p>
          }
          type="info"
          showIcon
        />
      </div>
    )
  }

  BeforDataMonth() {
    /*默认显示上个月的日期*/
    let nowdays = new Date()
    let year = nowdays.getFullYear()
    let month = nowdays.getMonth() + 1
    if (month == 0) {
      month = 12
      year = year - 1
      // year = year - 1 显示上个月
    }
    if (month < 10) {
      month = '0' + month
    }
    let firstDay = year + '-' + month + '-' + '01' //上个月的第一天
    return firstDay
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form
    const { priceSourceList, monthToBase } = this.props.model
    console.log(monthToBase.toJS())
    // console.log(monthToBase.projectBaseAvgPriceTypeCode)
    // console.log(`${monthToBase.projectBaseAvgPriceTypeCode}`)

    const { tag = '1', loading, useMonth } = this.state

    return (
      <Form onSubmit={this.handleSubmit}>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="估价月份">
              {getFieldDecorator('useMonth', {
                rules: [
                  {
                    required: true,
                    message: '请选择估价月份'
                  }
                ],
                initialValue: moment(this.BeforDataMonth()),
                onChange: this.handleUseMonthChange
              })(
                <MonthPicker
                  disabledDate={this.disabledDate}
                  allowClear={false}
                  style={{ width: '100%' }}
                  format="YYYY-MM-01"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅基准租金(元/月/㎡)">
              {getFieldDecorator('houseAvgRent', {
                initialValue: monthToBase.get('houseAvgRent')
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
                initialValue: monthToBase.get('houseRentTypeCode')
                  ? `${monthToBase.get('houseRentTypeCode')}`
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
                initialValue: monthToBase.get('houseAvgRentGained')
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
                initialValue: monthToBase.get('houseMultiLayerAvgRent')
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
                initialValue: monthToBase.get('houseMultiLayerRentTypeCode')
                  ? `${monthToBase.get('houseMultiLayerRentTypeCode')}`
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
                initialValue: monthToBase.get('houseSmallHighLayerAvgRent')
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
                initialValue: monthToBase.get('houseSmallHighLayerRentTypeCode')
                  ? `${monthToBase.get('houseSmallHighLayerRentTypeCode')}`
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
                initialValue: monthToBase.get('houseHighLayerAvgRent')
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
                initialValue: monthToBase.get('houseHighLayerRentTypeCode')
                  ? `${monthToBase.get('houseHighLayerRentTypeCode')}`
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
                initialValue: monthToBase.get('houseSuperHighLayerAvgRent')
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
                initialValue: monthToBase.get('houseSuperHighLayerRentTypeCode')
                  ? `${monthToBase.get('houseSuperHighLayerRentTypeCode')}`
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
                initialValue: monthToBase.get('apartmentAvgRent')
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
                initialValue: monthToBase.get('apartmentRentTypeCode')
                  ? `${monthToBase.get('apartmentRentTypeCode')}`
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
                initialValue: monthToBase.get('apartmentAvgRentGained')
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
                initialValue: monthToBase.get('apartmentMultiLayerAvgRent')
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
                initialValue: monthToBase.get('apartmentMultiLayerRentTypeCode')
                  ? `${monthToBase.get('apartmentMultiLayerRentTypeCode')}`
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
                initialValue: monthToBase.get('apartmentSmallHighLayerAvgRent')
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
                initialValue: monthToBase.get(
                  'apartmentSmallHighLayerRentTypeCode'
                )
                  ? `${monthToBase.get('apartmentSmallHighLayerRentTypeCode')}`
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
                initialValue: monthToBase.get('apartmentHighLayerAvgRent')
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
                initialValue: monthToBase.get('apartmentHighLayerRentTypeCode')
                  ? `${monthToBase.get('apartmentHighLayerRentTypeCode')}`
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
                initialValue: monthToBase.get('apartmentSuperHighLayerAvgRent')
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
                initialValue: monthToBase.get(
                  'apartmentSuperHighLayerRentTypeCode'
                )
                  ? `${monthToBase.get('apartmentSuperHighLayerRentTypeCode')}`
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
                initialValue: monthToBase.get('occopantAvgRent')
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
                initialValue: monthToBase.get('occopantRentTypeCode')
                  ? `${monthToBase.get('occopantRentTypeCode')}`
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
                initialValue: monthToBase.get('occopantAvgRentGained')
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
                initialValue: monthToBase.get('occopantMultiLayerAvgRent')
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
                initialValue: monthToBase.get('occopantMultiLayerRentTypeCode')
                  ? `${monthToBase.get('occopantMultiLayerRentTypeCode')}`
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
                initialValue: monthToBase.get('occopantSmallHighLayerAvgRent')
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
                initialValue: monthToBase.get(
                  'occopantSmallHighLayerRentTypeCode'
                )
                  ? `${monthToBase.get('occopantSmallHighLayerRentTypeCode')}`
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
                initialValue: monthToBase.get('occopantHighLayerAvgRent')
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
                initialValue: monthToBase.get('occopantHighLayerRentTypeCode')
                  ? `${monthToBase.get('occopantHighLayerRentTypeCode')}`
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
                initialValue: monthToBase.get('occopantSuperHighLayerAvgRent')
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
                initialValue: monthToBase.get(
                  'occopantSuperHighLayerRentTypeCode'
                )
                  ? `${monthToBase.get('occopantSuperHighLayerRentTypeCode')}`
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
                initialValue: monthToBase.get('villaRent')
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
                initialValue: monthToBase.get('platoonVillaRent')
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
                initialValue: monthToBase.get('singleVillaRent')
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
                initialValue: monthToBase.get('superpositionVillaRent')
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
                initialValue: monthToBase.get('duplexesVillaRent')
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
        {tag === '0' ? (
          <Row className={styles.btnCont}>
            {pagePermission('fdc:hd:residence:saleRent:add') ? (
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
