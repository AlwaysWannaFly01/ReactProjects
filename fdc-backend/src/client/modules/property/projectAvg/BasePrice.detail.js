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
  Input,
  InputNumber,
  Row,
  Col,
  Select,
  DatePicker,
  Message,
  Spin
} from 'antd'
import moment from 'moment'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import { parse } from 'qs'
import router from 'client/router'
import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ProjectAvg.less'

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
 * 挂牌基准价详情
 * 1.当月的数据可以编辑 2.历史月份的数据不可以编辑
 * 是否历史数据标志 tag 0:否 1:是
 * 0当月及当月以后不可编辑，1历史数据可编辑   autho:WY
 * author: YJF
 */
class BasePriceDetail extends Component {
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
      projectId = '',
      weightId = '',
      tag,
      useMonth,
      state,
      id,
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
    // 挂牌基准价id,每次进入此页面由后端判断生成
    this.weightId = weightId

    this.state = {
      // 楼盘id
      projectId,
      // 月份
      useMonth,
      // 是否历史数据标志
      tag,
      state,
      id,
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
      compare,
      detailLoading: true
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
        // 获取挂牌基准价详情
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

  getBasePriceDetail = () => {
    const { projectId, useMonth, tag } = this.state
    const params = {
      id: this.weightId,
      cityId: this.cityId,
      projectId,
      useMonth,
      tag
    }
    this.props.queryBasePriceDetail(params, data => {
      const { id } = data
      this.weightId = id
      this.setState({ detailLoading: false })
    })
  }

  saveBasePriceDetail = values => {
    const { state, id, feedCityId, feedProjectId, provinceId } = this.state
    values.id = this.weightId
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
            search: `?id=${id}&cityId=${feedCityId}&projectId=${feedProjectId}&provinceId=${provinceId}&state=${state}`
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
      id,
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
        // wy change 2019/5/7 1.如果从挂牌基准价历史数据页过来的（tag=1）2.如果从挂牌基准价页过来的（tag=0）
        if (entry === '1') {
          // console.log(111)
          if (state) {
            // console.log(3)
            this.context.router.history.push({
              pathname: router.FEEDBACK_PROPERTY_PVG_REPLY,
              search: `?id=${id}&cityId=${feedCityId}&projectId=${feedProjectId}&provinceId=${provinceId}&state=${state}`
            })
          } else {
            // console.log(4)
            this.props.history.push({
              pathname: router.RES_PRO_PROJECT_AVG,
              search: `areaIds=${areaIds || ''}&keyword=${keyword ||
                ''}&activeTabs=${compare}&pageNum=${1}`
            })
          }

          // this.props.history.goBack()
        } else {
          this.props.history.push({
            pathname: router.RES_PRO_BASE_PRICE_HISTORY,
            search: `projectId=${
              values.projectId
            }&activeTabs=${compare}&weightId=${''}&cityId=${
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
          // 从挂牌基准价入口进入  反馈中心那边进来
          // this.saveBasePriceDetail(values)
          this.addBaseHistory(values)
        } else if (entry === '2') {
          // 从历史挂牌基准价入口进入
          this.addBaseHistory(values)
        }
      }
    })
  }

  // 根据基准房价变更，计算涨跌幅
  hanldeProjectAvgPriceBlur = value => {
    // 上个月基准房价
    const { basePriceDetail } = this.props.model
    const preProjectAvgPrice = basePriceDetail.get('preProjectAvgPrice')
    // 当前输入的基准房价
    // const projectAvgPrice = e.target.value

    // 如果上个月基准房价没值或为0
    if (preProjectAvgPrice > 0) {
      if (value > 0) {
        let projectGained = (value / preProjectAvgPrice - 1) * 100
        projectGained = projectGained.toFixed(2)
        this.props.form.setFieldsValue({ projectGained })
      } else {
        this.props.form.setFieldsValue({ projectGained: undefined })
      }
    } else {
      this.props.form.setFieldsValue({ projectGained: undefined })
    }
  }

  // 根据涨跌幅，计算基准房价
  hanldeProjectGainedPriceBlur = value => {
    // 上个月基准房价
    const { basePriceDetail } = this.props.model
    const preProjectAvgPrice = basePriceDetail.get('preProjectAvgPrice')
    // 当前输入的涨跌幅
    // const projectGained = e.target.value

    if (preProjectAvgPrice > 0) {
      if (value > -100) {
        const projectAvgPrice = (value / 100 + 1) * preProjectAvgPrice
        this.props.form.setFieldsValue({ projectAvgPrice })
      } else {
        this.props.form.setFieldsValue({ projectAvgPrice: undefined })
      }
    }
    // else {
    //   this.props.form.setFieldsValue({ projectAvgPrice: undefined })
    // }
  }

  renderBreads() {
    const breadList = [
      {
        key: 1,
        path: '',
        name: '住宅',
        icon: 'home'
      },
      {
        key: 2,
        path: '',
        name: '楼盘价格'
      },
      {
        key: 3,
        path: '',
        name: '挂牌基准价详情'
      }
    ]

    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.name}
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
        {/* <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="涨跌幅(%)">
              {getFieldDecorator('projectGained', {
                initialValue: basePriceDetail.get('projectGained')
              })(
                <InputNumber
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  onBlur={this.hanldeProjectGainedPriceBlur}
                />
              )}
            </FormItem>
          </Col>
        </Row> */}
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="挂牌基准价(元/㎡)">
              {getFieldDecorator('projectAvgPrice', {
                initialValue: basePriceDetail.get('projectAvgPrice')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="挂牌基准价"
                  style={{ width: '100%' }}
                  precision={0}
                  disabled={timeIudge === '0'}
                  onChange={this.hanldeProjectAvgPriceBlur}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="涨跌幅(%)">
              {getFieldDecorator('projectGained', {
                initialValue: basePriceDetail.get('projectGained')
              })(
                <InputNumber
                  precision={2}
                  min={-99}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  onChange={this.hanldeProjectGainedPriceBlur}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="挂牌基准价价格来源">
              {getFieldDecorator('projectPriceTypeCode', {
                initialValue: basePriceDetail.get('projectPriceTypeCode')
                  ? `${basePriceDetail.get('projectPriceTypeCode')}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                  disabled={timeIudge === '0'}
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
        {/*<Row>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem {...formItemLayout} label="挂牌基准价调差初始值">*/}
        {/*      {getFieldDecorator('projectBaseAvgPrice', {*/}
        {/*        initialValue: basePriceDetail.get('projectBaseAvgPrice')*/}
        {/*      })(*/}
        {/*        <InputNumber*/}
        {/*          min={0}*/}
        {/*          max={1000000000}*/}
        {/*          placeholder="调差初始值"*/}
        {/*          style={{ width: '100%' }}*/}
        {/*          precision={0}*/}
        {/*          disabled={timeIudge === '0'}*/}
        {/*        />*/}
        {/*      )}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem {...formItemLayout} label="挂牌基准价调差初始值价格来源">*/}
        {/*      {getFieldDecorator('projectBaseAvgPriceTypeCode', {*/}
        {/*        initialValue: basePriceDetail.get('projectBaseAvgPriceTypeCode')*/}
        {/*          ? `${basePriceDetail.get('projectBaseAvgPriceTypeCode')}`*/}
        {/*          : undefined*/}
        {/*      })(*/}
        {/*        <Select*/}
        {/*          style={{ width: '100%' }}*/}
        {/*          placeholder="请选择"*/}
        {/*          allowClear*/}
        {/*          disabled={timeIudge === '0'}*/}
        {/*        >*/}
        {/*          {priceSourceList.map(option => (*/}
        {/*            <Option key={option.get('code')} value={option.get('code')}>*/}
        {/*              {option.get('name')}*/}
        {/*            </Option>*/}
        {/*          ))}*/}
        {/*        </Select>*/}
        {/*      )}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*</Row>*/}
        {/*<Row>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem {...formItemLayout} label="挂牌基准价调差初始值时间">*/}
        {/*      {getFieldDecorator('projectBaseAvgPriceTime', {*/}
        {/*        initialValue: basePriceDetail.get('projectBaseAvgPriceTime')*/}
        {/*          ? moment(basePriceDetail.get('projectBaseAvgPriceTime'))*/}
        {/*          : undefined*/}
        {/*      })(<DatePicker style={{ width: '100%' }} disabled />)}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem {...formItemLayout} label="挂牌基准价调差初始值人">*/}
        {/*      {getFieldDecorator('projectBaseAvgPriceSaveUser', {*/}
        {/*        initialValue: basePriceDetail.get('projectBaseAvgPriceSaveUser')*/}
        {/*      })(<Input disabled />)}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*</Row>*/}
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="低层挂牌基准价(元/㎡)">
              {getFieldDecorator('lowLayerPrice', {
                initialValue: basePriceDetail.get('lowLayerPrice')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="低层挂牌基准价"
                  style={{ width: '100%' }}
                  precision={0}
                  disabled={timeIudge === '0'}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="低层挂牌基准价价格来源">
              {getFieldDecorator('lowLayerPriceTypeCode', {
                initialValue: basePriceDetail.get('lowLayerPriceTypeCode')
                  ? `${basePriceDetail.get('lowLayerPriceTypeCode')}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                  disabled={timeIudge === '0'}
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
        {/*<Row>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem {...formItemLayout} label="低层挂牌基准价调差初始值">*/}
        {/*      {getFieldDecorator('lowLayerBasePrice', {*/}
        {/*        initialValue: basePriceDetail.get('lowLayerBasePrice')*/}
        {/*      })(*/}
        {/*        <InputNumber*/}
        {/*          min={0}*/}
        {/*          max={1000000000}*/}
        {/*          placeholder="挂牌基准价调差初始值"*/}
        {/*          style={{ width: '100%' }}*/}
        {/*          precision={0}*/}
        {/*          disabled={timeIudge === '0'}*/}
        {/*        />*/}
        {/*      )}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem*/}
        {/*      {...formItemLayout}*/}
        {/*      label="低层挂牌基准价调差初始值价格来源"*/}
        {/*    >*/}
        {/*      {getFieldDecorator('lowLayerBasePriceTypeCode', {*/}
        {/*        initialValue: basePriceDetail.get('lowLayerBasePriceTypeCode')*/}
        {/*          ? `${basePriceDetail.get('lowLayerBasePriceTypeCode')}`*/}
        {/*          : undefined*/}
        {/*      })(*/}
        {/*        <Select*/}
        {/*          style={{ width: '100%' }}*/}
        {/*          placeholder="请选择"*/}
        {/*          allowClear*/}
        {/*          disabled={timeIudge === '0'}*/}
        {/*        >*/}
        {/*          {priceSourceList.map(option => (*/}
        {/*            <Option key={option.get('code')} value={option.get('code')}>*/}
        {/*              {option.get('name')}*/}
        {/*            </Option>*/}
        {/*          ))}*/}
        {/*        </Select>*/}
        {/*      )}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*</Row>*/}
        {/*<Row>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem {...formItemLayout} label="低层挂牌基准价调差初始值时间">*/}
        {/*      {getFieldDecorator('lowLayerBasePriceTime', {*/}
        {/*        initialValue: basePriceDetail.get('lowLayerBasePriceTime')*/}
        {/*          ? moment(basePriceDetail.get('lowLayerBasePriceTime'))*/}
        {/*          : undefined*/}
        {/*      })(<DatePicker style={{ width: '100%' }} disabled />)}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem {...formItemLayout} label="低层挂牌基准价调差初始值人">*/}
        {/*      {getFieldDecorator('lowLayerBasePriceSaveUser', {*/}
        {/*        initialValue: basePriceDetail.get('lowLayerBasePriceSaveUser')*/}
        {/*      })(<Input disabled style={{ width: '100%' }} />)}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*</Row>*/}
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="多层挂牌基准价(元/㎡)">
              {getFieldDecorator('multiLayerPrice', {
                initialValue: basePriceDetail.get('multiLayerPrice')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="多层挂牌基准价"
                  style={{ width: '100%' }}
                  precision={0}
                  disabled={timeIudge === '0'}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="多层挂牌基准价价格来源">
              {getFieldDecorator('multiLayerPriceTypeCode', {
                initialValue: basePriceDetail.get('multiLayerPriceTypeCode')
                  ? `${basePriceDetail.get('multiLayerPriceTypeCode')}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                  disabled={timeIudge === '0'}
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
        {/*<Row>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem {...formItemLayout} label="多层挂牌基准价调差初始值">*/}
        {/*      {getFieldDecorator('multiLayerBasePrice', {*/}
        {/*        initialValue: basePriceDetail.get('multiLayerBasePrice')*/}
        {/*          ? basePriceDetail.get('multiLayerBasePrice')*/}
        {/*          : undefined*/}
        {/*      })(*/}
        {/*        <InputNumber*/}
        {/*          min={0}*/}
        {/*          max={1000000000}*/}
        {/*          placeholder="挂牌基准价调差初始值"*/}
        {/*          style={{ width: '100%' }}*/}
        {/*          precision={0}*/}
        {/*          disabled={timeIudge === '0'}*/}
        {/*        />*/}
        {/*      )}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem*/}
        {/*      {...formItemLayout}*/}
        {/*      label="多层挂牌基准价调差初始值价格来源"*/}
        {/*    >*/}
        {/*      {getFieldDecorator('multiLayerBasePriceTypeCode', {*/}
        {/*        initialValue: basePriceDetail.get('multiLayerBasePriceTypeCode')*/}
        {/*          ? `${basePriceDetail.get('multiLayerBasePriceTypeCode')}`*/}
        {/*          : undefined*/}
        {/*      })(*/}
        {/*        <Select*/}
        {/*          style={{ width: '100%' }}*/}
        {/*          placeholder="请选择"*/}
        {/*          allowClear*/}
        {/*          disabled={timeIudge === '0'}*/}
        {/*        >*/}
        {/*          {priceSourceList.map(option => (*/}
        {/*            <Option key={option.get('code')} value={option.get('code')}>*/}
        {/*              {option.get('name')}*/}
        {/*            </Option>*/}
        {/*          ))}*/}
        {/*        </Select>*/}
        {/*      )}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*</Row>*/}
        {/*<Row>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem {...formItemLayout} label="多层挂牌基准价调差初始值时间">*/}
        {/*      {getFieldDecorator('multiLayerBasePriceTime', {*/}
        {/*        initialValue: basePriceDetail.get('multiLayerBasePriceTime')*/}
        {/*          ? moment(basePriceDetail.get('multiLayerBasePriceTime'))*/}
        {/*          : undefined*/}
        {/*      })(<DatePicker style={{ width: '100%' }} disabled />)}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem {...formItemLayout} label="多层挂牌基准价调差初始值人">*/}
        {/*      {getFieldDecorator('multiLayerBasePriceSaveUser', {*/}
        {/*        initialValue: basePriceDetail.get('multiLayerBasePriceSaveUser')*/}
        {/*      })(<Input disabled style={{ width: '100%' }} />)}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*</Row>*/}
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="小高层挂牌基准价(元/㎡)">
              {getFieldDecorator('smallHighLayerPrice', {
                initialValue: basePriceDetail.get('smallHighLayerPrice')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="小高层挂牌基准价"
                  style={{ width: '100%' }}
                  precision={0}
                  disabled={timeIudge === '0'}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="小高层挂牌基准价价格来源">
              {getFieldDecorator('smallHighLayerPriceTypeCode', {
                initialValue: basePriceDetail.get('smallHighLayerPriceTypeCode')
                  ? `${basePriceDetail.get('smallHighLayerPriceTypeCode')}`
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
        {/*<Row>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem {...formItemLayout} label="小高层挂牌基准价调差初始值">*/}
        {/*      {getFieldDecorator('smallHighLayerBasePrice', {*/}
        {/*        initialValue: basePriceDetail.get('smallHighLayerBasePrice')*/}
        {/*      })(*/}
        {/*        <InputNumber*/}
        {/*          min={0}*/}
        {/*          max={1000000000}*/}
        {/*          placeholder="挂牌基准价调差初始值"*/}
        {/*          style={{ width: '100%' }}*/}
        {/*          precision={0}*/}
        {/*          disabled={timeIudge === '0'}*/}
        {/*        />*/}
        {/*      )}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem*/}
        {/*      {...formItemLayout}*/}
        {/*      label="小高层挂牌基准价调差初始值价格来源"*/}
        {/*    >*/}
        {/*      {getFieldDecorator('smallHighLayerBasePriceTypeCode', {*/}
        {/*        initialValue: basePriceDetail.get(*/}
        {/*          'smallHighLayerBasePriceTypeCode'*/}
        {/*        )*/}
        {/*          ? `${basePriceDetail.get('smallHighLayerBasePriceTypeCode')}`*/}
        {/*          : undefined*/}
        {/*      })(*/}
        {/*        <Select*/}
        {/*          style={{ width: '100%' }}*/}
        {/*          placeholder="请选择"*/}
        {/*          allowClear*/}
        {/*          disabled={timeIudge === '0'}*/}
        {/*        >*/}
        {/*          {priceSourceList.map(option => (*/}
        {/*            <Option key={option.get('code')} value={option.get('code')}>*/}
        {/*              {option.get('name')}*/}
        {/*            </Option>*/}
        {/*          ))}*/}
        {/*        </Select>*/}
        {/*      )}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*</Row>*/}
        {/*<Row>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem*/}
        {/*      {...formItemLayout}*/}
        {/*      label="小高层挂牌基准价调差初始值时间"*/}
        {/*    >*/}
        {/*      {getFieldDecorator('smallHighLayerBasePriceTime', {*/}
        {/*        initialValue: basePriceDetail.get('smallHighLayerBasePriceTime')*/}
        {/*          ? moment(basePriceDetail.get('smallHighLayerBasePriceTime'))*/}
        {/*          : undefined*/}
        {/*      })(<DatePicker style={{ width: '100%' }} disabled />)}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem {...formItemLayout} label="小高层挂牌基准价调差初始值人">*/}
        {/*      {getFieldDecorator('smallHighLayerBasePriceSaveUser', {*/}
        {/*        initialValue: basePriceDetail.get(*/}
        {/*          'smallHighLayerBasePriceSaveUser'*/}
        {/*        )*/}
        {/*      })(<Input disabled style={{ width: '100%' }} />)}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*</Row>*/}
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="高层挂牌基准价(元/㎡)">
              {getFieldDecorator('highLayerPrice', {
                initialValue: basePriceDetail.get('highLayerPrice')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="高层挂牌基准价"
                  style={{ width: '100%' }}
                  precision={0}
                  disabled={timeIudge === '0'}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="高层挂牌基准价价格来源">
              {getFieldDecorator('highLayerPriceTypeCode', {
                initialValue: basePriceDetail.get('highLayerPriceTypeCode')
                  ? `${basePriceDetail.get('highLayerPriceTypeCode')}`
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
        {/*<Row>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem {...formItemLayout} label="高层挂牌基准价调差初始值">*/}
        {/*      {getFieldDecorator('highLayerBasePrice', {*/}
        {/*        initialValue: basePriceDetail.get('highLayerBasePrice')*/}
        {/*      })(*/}
        {/*        <InputNumber*/}
        {/*          min={0}*/}
        {/*          max={1000000000}*/}
        {/*          placeholder="挂牌基准价调差初始值"*/}
        {/*          style={{ width: '100%' }}*/}
        {/*          precision={0}*/}
        {/*          disabled={timeIudge === '0'}*/}
        {/*        />*/}
        {/*      )}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem*/}
        {/*      {...formItemLayout}*/}
        {/*      label="高层挂牌基准价调差初始值价格来源"*/}
        {/*    >*/}
        {/*      {getFieldDecorator('highLayerBasePriceTypeCode', {*/}
        {/*        initialValue: basePriceDetail.get('highLayerBasePriceTypeCode')*/}
        {/*          ? `${basePriceDetail.get('highLayerBasePriceTypeCode')}`*/}
        {/*          : undefined*/}
        {/*      })(*/}
        {/*        <Select*/}
        {/*          style={{ width: '100%' }}*/}
        {/*          placeholder="请选择"*/}
        {/*          allowClear*/}
        {/*          disabled={timeIudge === '0'}*/}
        {/*        >*/}
        {/*          {priceSourceList.map(option => (*/}
        {/*            <Option key={option.get('code')} value={option.get('code')}>*/}
        {/*              {option.get('name')}*/}
        {/*            </Option>*/}
        {/*          ))}*/}
        {/*        </Select>*/}
        {/*      )}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*</Row>*/}
        {/*<Row>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem {...formItemLayout} label="高层挂牌基准价调差初始值时间">*/}
        {/*      {getFieldDecorator('highLayerBasePriceTime', {*/}
        {/*        initialValue: basePriceDetail.get('highLayerBasePriceTime')*/}
        {/*          ? moment(basePriceDetail.get('highLayerBasePriceTime'))*/}
        {/*          : undefined*/}
        {/*      })(<DatePicker style={{ width: '100%' }} disabled />)}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem {...formItemLayout} label="高层挂牌基准价调差初始值人">*/}
        {/*      {getFieldDecorator('highLayerBasePriceSaveUser', {*/}
        {/*        initialValue: basePriceDetail.get('highLayerBasePriceSaveUser')*/}
        {/*      })(<Input disabled style={{ width: '100%' }} />)}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*</Row>*/}
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="超高层挂牌基准价(元/㎡)">
              {getFieldDecorator('superHighLayerPrice', {
                initialValue: basePriceDetail.get('superHighLayerPrice')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="超高层挂牌基准价"
                  style={{ width: '100%' }}
                  precision={0}
                  disabled={timeIudge === '0'}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="超高层挂牌基准价价格来源">
              {getFieldDecorator('superHighLayerPriceTypeCode', {
                initialValue: basePriceDetail.get('superHighLayerPriceTypeCode')
                  ? `${basePriceDetail.get('superHighLayerPriceTypeCode')}`
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                  disabled={timeIudge === '0'}
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
        {/*<Row>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem {...formItemLayout} label="超高层挂牌基准价调差初始值">*/}
        {/*      {getFieldDecorator('superHighLayerBasePrice', {*/}
        {/*        initialValue: basePriceDetail.get('superHighLayerBasePrice')*/}
        {/*      })(*/}
        {/*        <InputNumber*/}
        {/*          min={0}*/}
        {/*          max={1000000000}*/}
        {/*          placeholder="挂牌基准价调差初始值"*/}
        {/*          style={{ width: '100%' }}*/}
        {/*          precision={0}*/}
        {/*          disabled={timeIudge === '0'}*/}
        {/*        />*/}
        {/*      )}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem*/}
        {/*      {...formItemLayout}*/}
        {/*      label="超高层挂牌基准价调差初始值价格来源"*/}
        {/*    >*/}
        {/*      {getFieldDecorator('superHighLayerBasePriceTypeCode', {*/}
        {/*        initialValue: basePriceDetail.get(*/}
        {/*          'superHighLayerBasePriceTypeCode'*/}
        {/*        )*/}
        {/*          ? `${basePriceDetail.get('superHighLayerBasePriceTypeCode')}`*/}
        {/*          : undefined*/}
        {/*      })(*/}
        {/*        <Select*/}
        {/*          style={{ width: '100%' }}*/}
        {/*          placeholder="请选择"*/}
        {/*          allowClear*/}
        {/*          disabled={timeIudge === '0'}*/}
        {/*        >*/}
        {/*          {priceSourceList.map(option => (*/}
        {/*            <Option key={option.get('code')} value={option.get('code')}>*/}
        {/*              {option.get('name')}*/}
        {/*            </Option>*/}
        {/*          ))}*/}
        {/*        </Select>*/}
        {/*      )}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*</Row>*/}
        {/*<Row>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem*/}
        {/*      {...formItemLayout}*/}
        {/*      label="超高层挂牌基准价调差初始值时间"*/}
        {/*    >*/}
        {/*      {getFieldDecorator('superHighLayerBasePriceTime', {*/}
        {/*        initialValue: basePriceDetail.get('superHighLayerBasePriceTime')*/}
        {/*          ? moment(basePriceDetail.get('superHighLayerBasePriceTime'))*/}
        {/*          : undefined*/}
        {/*      })(<DatePicker style={{ width: '100%' }} disabled />)}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*  <Col span={10}>*/}
        {/*    <FormItem {...formItemLayout} label="超高层挂牌基准价调差初始值人">*/}
        {/*      {getFieldDecorator('superHighLayerBasePriceSaveUser', {*/}
        {/*        initialValue: basePriceDetail.get(*/}
        {/*          'superHighLayerBasePriceSaveUser'*/}
        {/*        )*/}
        {/*      })(<Input disabled style={{ width: '100%' }} />)}*/}
        {/*    </FormItem>*/}
        {/*  </Col>*/}
        {/*</Row>*/}
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="别墅(元/㎡)">
              {getFieldDecorator('villaPrice', {
                initialValue: basePriceDetail.get('villaPrice')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="别墅"
                  style={{ width: '100%' }}
                  precision={0}
                  disabled={timeIudge === '0'}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="联排别墅(元/㎡)">
              {getFieldDecorator('platoonVillaPrice', {
                initialValue: basePriceDetail.get('platoonVillaPrice')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="联排别墅"
                  style={{ width: '100%' }}
                  precision={0}
                  disabled={timeIudge === '0'}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="独幢别墅(元/㎡)">
              {getFieldDecorator('singleVillaPrice', {
                initialValue: basePriceDetail.get('singleVillaPrice')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="独幢别墅"
                  style={{ width: '100%' }}
                  precision={0}
                  disabled={timeIudge === '0'}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="叠加别墅(元/㎡)">
              {getFieldDecorator('superpositionVillaPrice', {
                initialValue: basePriceDetail.get('superpositionVillaPrice')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="叠加别墅"
                  style={{ width: '100%' }}
                  precision={0}
                  disabled={timeIudge === '0'}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row style={{ marginBottom: 16 }}>
          <Col span={10}>
            <FormItem {...formItemLayout} label="双拼别墅(元/㎡)">
              {getFieldDecorator('duplexesVillaPrice', {
                initialValue: basePriceDetail.get('duplexesVillaPrice')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="双拼别墅"
                  style={{ width: '100%' }}
                  precision={0}
                  disabled={timeIudge === '0'}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        {timeIudge === '1' ? (
          <Row className={styles.btnCont}>
            {pagePermission('fdc:hd:residence:average:change') ? (
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
      <Spin spinning={this.state.detailLoading}>
        <div>
          {this.renderBreads()}
          <div className={styles.container}>
            {this.renderProjectInfo()}
            {this.renderForm()}
          </div>
        </div>
      </Spin>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    modelSelector,
    containerActions
  )
)(BasePriceDetail)
