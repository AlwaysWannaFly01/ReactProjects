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
 * 评估基准价详情
 * 1.当月的数据可以编辑 2.历史月份的数据不可以编辑
 * 是否历史数据标志 tag 0:否 1:是
 * 0当月及当月以后不可编辑，1历史数据可编辑   autho:WY
 * author: wy
 */
class EstimateBaseDetail extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,

    // queryBasePriceDetail: PropTypes.func.isRequired,
    // saveBasePriceDetail: PropTypes.func.isRequired,
    // addBaseHistory: PropTypes.func.isRequired,

    getEstimateMonthToWeightDetail: PropTypes.func.isRequired, // 根据月份获取挂牌基准价详情 WY
    estimateMonthToWeightDetail: PropTypes.object.isRequired, // 根据月份获取挂牌基准价详情 WY
    addEstimateWeightHistory: PropTypes.func.isRequired,
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
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
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
    const { projectId, useMonth } = this.state
    const params = {
      cityId: this.cityId,
      projectId,
      useMonth
    }
    this.props.getEstimateMonthToWeightDetail(params, () => {
      this.setState({ detailLoading: false })
    })
  }

  // saveBasePriceDetail = values => {
  //   const { state, id, feedCityId, feedProjectId, provinceId } = this.state
  //   values.id = this.weightId
  //   values.cityId = this.cityId
  //   this.props.saveBasePriceDetail(values, result => {
  //     const { code, msg } = result
  //     this.setState({
  //       loading: false
  //     })
  //     if (+code === 200) {
  //       Message.success('保存成功')
  //       // console.log(state)
  //       if (state) {
  //         this.context.router.history.push({
  //           pathname: router.FEEDBACK_PROPERTY_PVG_REPLY,
  //           search: `?id=${id}&cityId=${feedCityId}&projectId=${feedProjectId}&provinceId=${provinceId}&state=${state}`
  //         })
  //       } else {
  //         this.props.history.goBack()
  //         // this.props.history.push({
  //         //   pathname: router.RES_PRO_BASE_PRICE_HISTORY,
  //         //   search: `projectId=${feedProjectId}&activeTabs=2&weightId=${
  //         //     values.id
  //         //   }&cityId=${this.state.cityId}&cityName=${this.state.cityName}`
  //         // })
  //         this.setState({
  //           loading: false
  //         })
  //       }
  //     } else {
  //       Message.error(msg)
  //       this.setState({
  //         loading: false
  //       })
  //     }
  //   })
  // }

  addBaseHistory = values => {
    const { areaIds, keyword, compare, entry, cityId, cityName } = this.state
    values.cityId = this.cityId
    values.projectId = this.state.projectId
    values.useMonth = moment(values.useMonth).format('YYYY-MM-01 HH:mm:ss')
    this.setState({
      loading: false
    })
    this.props.addEstimateWeightHistory(values, result => {
      const { code, msg } = result
      if (+code === 200) {
        Message.success('保存成功')
        // this.props.history.goBack()
        // wy change 2019/5/7 1.如果从挂牌基准价历史数据页过来的（tag=1）2.如果从挂牌基准价页过来的（tag=0）
        if (entry === '1') {
          this.props.history.push({
            pathname: router.RES_PRO_PROJECT_AVG,
            search: `areaIds=${areaIds || ''}&keyword=${keyword ||
              ''}&activeTabs=${compare}&pageNum=${1}`
          })
        } else {
          this.props.history.push({
            pathname: router.RES_PRO_ESTIMATE_BASE_HISTORY,
            search: `projectId=${
              values.projectId
            }&activeTabs=${compare}&cityId=${cityId}&cityName=${cityName}`
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
        this.addBaseHistory(values)
        // const { entry } = this.state
        // if (entry === '1') {
        //   // 从挂牌基准价入口进入  反馈中心那边进来
        //   // this.saveBasePriceDetail(values)
        //   this.addBaseHistory(values)
        // } else if (entry === '2') {
        //   // 从历史挂牌基准价入口进入
        //   this.addBaseHistory(values)
        // }
      }
    })
  }

  // 根据案例均价变更，计算涨跌幅
  hanldeProjectAvgPriceBlur = value => {
    // 上个月案例均价
    const { estimateMonthToWeightDetail } = this.props
    const preProjectAvgPrice = estimateMonthToWeightDetail.preProjectAvgPrice
    // 当前输入的案例均价
    // const projectAvgPrice = e.target.value
    // debugger
    // 如果上个月案例均价没值或为0
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

  // 根据涨跌幅，计算案例均价
  hanldeProjectGainedPriceBlur = value => {
    // 上个月案例均价
    const { estimateMonthToWeightDetail } = this.props
    const preProjectAvgPrice = estimateMonthToWeightDetail.preProjectAvgPrice
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
        name: '评估基准价详情'
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
    const { estimateMonthToWeightDetail } = this.props
    const { areaName, projectName } = estimateMonthToWeightDetail

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
    const { estimateMonthToWeightDetail } = this.props

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
            <FormItem {...formItemLayout} label="评估基准价(元/㎡)">
              {getFieldDecorator('projectAvgPrice', {
                initialValue: estimateMonthToWeightDetail.projectAvgPrice
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="评估基准价"
                  style={{ width: '100%' }}
                  precision={0}
                  disabled={timeIudge === '0'}
                  onChange={this.hanldeProjectAvgPriceBlur}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="涨跌幅(%)">
              {getFieldDecorator('projectGained', {
                initialValue: estimateMonthToWeightDetail.projectGained
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
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="低层评估基准价(元/㎡)">
              {getFieldDecorator('lowLayerPrice', {
                initialValue: estimateMonthToWeightDetail.lowLayerPrice
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="低层评估基准价"
                  style={{ width: '100%' }}
                  precision={0}
                  disabled={timeIudge === '0'}
                />
              )}
            </FormItem>
          </Col>

          <Col span={10}>
            <FormItem {...formItemLayout} label="多层评估基准价(元/㎡)">
              {getFieldDecorator('multiLayerPrice', {
                initialValue: estimateMonthToWeightDetail.multiLayerPrice
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="多层评估基准价"
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
            <FormItem {...formItemLayout} label="小高层评估基准价(元/㎡)">
              {getFieldDecorator('smallHighLayerPrice', {
                initialValue: estimateMonthToWeightDetail.smallHighLayerPrice
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="小高层评估基准价"
                  style={{ width: '100%' }}
                  precision={0}
                  disabled={timeIudge === '0'}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="高层评估基准价(元/㎡)">
              {getFieldDecorator('highLayerPrice', {
                initialValue: estimateMonthToWeightDetail.highLayerPrice
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="高层评估基准价"
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
            <FormItem {...formItemLayout} label="超高层评估基准价(元/㎡)">
              {getFieldDecorator('superHighLayerPrice', {
                initialValue: estimateMonthToWeightDetail.superHighLayerPrice
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="超高层评估基准价"
                  style={{ width: '100%' }}
                  precision={0}
                  disabled={timeIudge === '0'}
                />
              )}
            </FormItem>
          </Col>

          <Col span={10}>
            <FormItem {...formItemLayout} label="别墅(元/㎡)">
              {getFieldDecorator('villaPrice', {
                initialValue: estimateMonthToWeightDetail.villaPrice
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
        </Row>

        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="联排别墅(元/㎡)">
              {getFieldDecorator('platoonVillaPrice', {
                initialValue: estimateMonthToWeightDetail.platoonVillaPrice
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

          <Col span={10}>
            <FormItem {...formItemLayout} label="独幢别墅(元/㎡)">
              {getFieldDecorator('singleVillaPrice', {
                initialValue: estimateMonthToWeightDetail.singleVillaPrice
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
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="叠加别墅(元/㎡)">
              {getFieldDecorator('superpositionVillaPrice', {
                initialValue:
                  estimateMonthToWeightDetail.superpositionVillaPrice
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
          <Col span={10}>
            <FormItem {...formItemLayout} label="双拼别墅(元/㎡)">
              {getFieldDecorator('duplexesVillaPrice', {
                initialValue: estimateMonthToWeightDetail.duplexesVillaPrice
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
)(EstimateBaseDetail)
