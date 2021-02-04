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
  Collapse,
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
const { Panel } = Collapse

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
 * 标准房价格详情
 * 1.当月的数据可以编辑 2.历史月份的数据不可以编辑
 * 是否历史数据标志 tag 0:否 1:是
 * 0当月及当月以后不可编辑，1历史数据可编辑   autho:WY
 * author: wy
 */
class StandardPriceDetail extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    addStandardHousePriceHistory: PropTypes.func.isRequired,
    getStandardHousePriceDetail: PropTypes.func.isRequired, // 根据评估月份获取标准房价格详情 WY
    standardHousePriceDetail: PropTypes.object.isRequired, // 根据评估月份获取标准房价格详情 WY
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
      compare,
      activePanel
    } = parse(props.location.search.substr(1))
    this.state = {
      // 楼盘id
      projectId,
      // 月份
      useMonth,
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
      activePanel,
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
    this.props.getStandardHousePriceDetail(params, () => {
      this.setState({ detailLoading: false })
    })
  }

  addBaseHistory = values => {
    const {
      areaIds,
      keyword,
      projectId,
      compare,
      entry,
      cityId,
      cityName
    } = this.state
    const params = {}
    params.cityId = this.cityId
    params.projectId = projectId
    params.useMonth = moment(values.useMonth).format('YYYY-MM-01')
    params.avg = {
      projectAvgPrice: values.avgProjectAvgPrice,
      lowLayerPrice: values.avgLowLayerPrice,
      multiLayerPrice: values.avgMultiLayerPrice,
      smallHighLayerPrice: values.avgSmallHighLayerPrice,
      highLayerPrice: values.avgHighLayerPrice,
      superHighLayerPrice: values.avgSuperHighLayerPrice,
      villaPrice: values.avgVillaPrice,
      platoonVillaPrice: values.avgPlatoonVillaPrice,
      singleVillaPrice: values.avgSingleVillaPrice,
      superpositionVillaPrice: values.avgSuperpositionVillaPrice,
      duplexesVillaPrice: values.avgDuplexesVillaPrice
    }
    params.weight = {
      projectAvgPrice: values.weightProjectAvgPrice,
      lowLayerPrice: values.weightLowLayerPrice,
      multiLayerPrice: values.weightMultiLayerPrice,
      smallHighLayerPrice: values.weightSmallHighLayerPrice,
      highLayerPrice: values.weightHighLayerPrice,
      superHighLayerPrice: values.weightSuperHighLayerPrice,
      villaPrice: values.weightVillaPrice,
      platoonVillaPrice: values.weightPlatoonVillaPrice,
      singleVillaPrice: values.weightSingleVillaPrice,
      superpositionVillaPrice: values.weightSuperpositionVillaPrice,
      duplexesVillaPrice: values.weightDuplexesVillaPrice
    }
    params.estimateAvg = {
      projectAvgPrice: values.estimateAvgProjectAvgPrice,
      lowLayerPrice: values.estimateAvgLowLayerPrice,
      multiLayerPrice: values.estimateAvgMultiLayerPrice,
      smallHighLayerPrice: values.estimateAvgSmallHighLayerPrice,
      highLayerPrice: values.estimateAvgHighLayerPrice,
      superHighLayerPrice: values.estimateAvgSuperHighLayerPrice,
      villaPrice: values.estimateAvgVillaPrice,
      platoonVillaPrice: values.estimateAvgPlatoonVillaPrice,
      singleVillaPrice: values.estimateAvgSingleVillaPrice,
      superpositionVillaPrice: values.estimateAvgSuperpositionVillaPrice,
      duplexesVillaPrice: values.estimateAvgDuplexesVillaPrice
    }
    params.estimateWeight = {
      projectAvgPrice: values.estimateWeightProjectAvgPrice,
      lowLayerPrice: values.estimateWeightLowLayerPrice,
      multiLayerPrice: values.estimateWeightMultiLayerPrice,
      smallHighLayerPrice: values.estimateWeightSmallHighLayerPrice,
      highLayerPrice: values.estimateWeightHighLayerPrice,
      superHighLayerPrice: values.estimateWeightSuperHighLayerPrice,
      villaPrice: values.estimateWeightVillaPrice,
      platoonVillaPrice: values.estimateWeightPlatoonVillaPrice,
      singleVillaPrice: values.estimateWeightSingleVillaPrice,
      superpositionVillaPrice: values.estimateWeightSuperpositionVillaPrice,
      duplexesVillaPrice: values.estimateWeightDuplexesVillaPrice
    }

    this.setState({
      loading: false
    })
    this.props.addStandardHousePriceHistory(params, result => {
      const { code, msg } = result
      if (+code === 200) {
        Message.success('保存成功')
        // wy change 2019/11/25 1.如果从标准房均价历史数据页过来的（entry=1）2.如果从标准房均价页过来的（entry=0）
        if (entry === '1') {
          this.props.history.push({
            pathname: router.RES_PRO_PROJECT_AVG,
            search: `areaIds=${areaIds || ''}&keyword=${keyword ||
              ''}&activeTabs=${compare}&pageNum=${1}`
          })
        } else {
          this.props.history.push({
            pathname: router.RES_PRO_STANDARD_PRICE_HISTORY,
            search: `projectId=${projectId}&activeTabs=${compare}&cityId=${cityId}&cityName=${cityName}`
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
      }
    })
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
        name: '标准房价格详情'
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
    const { standardHousePriceDetail } = this.props
    const { areaName, projectName } = standardHousePriceDetail
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

    const { standardHousePriceDetail } = this.props
    const {
      avg,
      weight,
      estimateAvg,
      estimateWeight
    } = standardHousePriceDetail

    const { loading, useMonth, timeIudge, activePanel } = this.state

    const customPanelStyle = {
      background: '#f7f7f7',
      borderRadius: 4,
      marginBottom: 24,
      border: 0,
      overflow: 'hidden'
    }
    // const activePanel = 4
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

        <Collapse
          bordered={false}
          defaultActiveKey={[activePanel]}
          expandIcon={({ isActive }) => (
            <Icon
              type="caret-right"
              style={{ color: '#33CABB' }}
              rotate={isActive ? 90 : 0}
            />
          )}
        >
          {/* 第一个折叠面板 */}
          <Panel header="标准房挂牌案例均价" key="1" style={customPanelStyle}>
            <Row>
              <Col span={10}>
                <FormItem {...formItemLayout} label="标准房挂牌案例均价(元/㎡)">
                  {getFieldDecorator('avgProjectAvgPrice', {
                    initialValue: avg && avg.projectAvgPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="标准房挂牌案例均价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>

              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="低层标准房挂牌案例均价(元/㎡)"
                >
                  {getFieldDecorator('avgLowLayerPrice', {
                    initialValue: avg && avg.lowLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="低层标准房挂牌案例均价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="多层标准房挂牌案例均价(元/㎡)"
                >
                  {getFieldDecorator('avgMultiLayerPrice', {
                    initialValue: avg && avg.multiLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="多层标准房挂牌案例均价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>

              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="小高层标准房挂牌案例均价(元/㎡)"
                >
                  {getFieldDecorator('avgSmallHighLayerPrice', {
                    initialValue: avg && avg.smallHighLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="小高层标准房挂牌案例均价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="高层标准房挂牌案例均价(元/㎡)"
                >
                  {getFieldDecorator('avgHighLayerPrice', {
                    initialValue: avg && avg.highLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="高层标准房挂牌案例均价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>

              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="超高层标准房挂牌案例均价(元/㎡)"
                >
                  {getFieldDecorator('avgSuperHighLayerPrice', {
                    initialValue: avg && avg.superHighLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="超高层标准房挂牌案例均价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span={10}>
                <FormItem {...formItemLayout} label="别墅(元/㎡)">
                  {getFieldDecorator('avgVillaPrice', {
                    initialValue: avg && avg.villaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem {...formItemLayout} label="联排别墅(元/㎡)">
                  {getFieldDecorator('avgPlatoonVillaPrice', {
                    initialValue: avg && avg.platoonVillaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="联排别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={10}>
                <FormItem {...formItemLayout} label="独幢别墅(元/㎡)">
                  {getFieldDecorator('avgSingleVillaPrice', {
                    initialValue: avg && avg.singleVillaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="独幢别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem {...formItemLayout} label="叠加别墅(元/㎡)">
                  {getFieldDecorator('avgSuperpositionVillaPrice', {
                    initialValue: avg && avg.superpositionVillaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="叠加别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ marginBottom: 16 }}>
              <Col span={10}>
                <FormItem {...formItemLayout} label="双拼别墅(元/㎡)">
                  {getFieldDecorator('avgDuplexesVillaPrice', {
                    initialValue: avg && avg.duplexesVillaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="双拼别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Panel>

          {/* 第二个折叠面板 */}
          <Panel header="标准房挂牌基准价" key="2" style={customPanelStyle}>
            <Row>
              <Col span={10}>
                <FormItem {...formItemLayout} label="标准房挂牌基准价(元/㎡)">
                  {getFieldDecorator('weightProjectAvgPrice', {
                    initialValue: weight && weight.projectAvgPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="标准房挂牌基准价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>

              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="低层标准房挂牌基准价(元/㎡)"
                >
                  {getFieldDecorator('weightLowLayerPrice', {
                    initialValue: weight && weight.lowLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="低层标准房挂牌基准价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="多层标准房挂牌基准价(元/㎡)"
                >
                  {getFieldDecorator('weightMultiLayerPrice', {
                    initialValue: weight && weight.multiLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="多层标准房挂牌基准价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>

              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="小高层标准房挂牌基准价(元/㎡)"
                >
                  {getFieldDecorator('weightSmallHighLayerPrice', {
                    initialValue: weight && weight.smallHighLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="小高层标准房挂牌基准价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="高层标准房挂牌基准价(元/㎡)"
                >
                  {getFieldDecorator('weightHighLayerPrice', {
                    initialValue: weight && weight.highLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="高层标准房挂牌基准价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>

              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="超高层标准房挂牌基准价(元/㎡)"
                >
                  {getFieldDecorator('weightSuperHighLayerPrice', {
                    initialValue: weight && weight.superHighLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="超高层标准房挂牌基准价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span={10}>
                <FormItem {...formItemLayout} label="别墅(元/㎡)">
                  {getFieldDecorator('weightVillaPrice', {
                    initialValue: weight && weight.villaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem {...formItemLayout} label="联排别墅(元/㎡)">
                  {getFieldDecorator('weightPlatoonVillaPrice', {
                    initialValue: weight && weight.platoonVillaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="联排别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={10}>
                <FormItem {...formItemLayout} label="独幢别墅(元/㎡)">
                  {getFieldDecorator('weightSingleVillaPrice', {
                    initialValue: weight && weight.singleVillaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="独幢别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem {...formItemLayout} label="叠加别墅(元/㎡)">
                  {getFieldDecorator('weightSuperpositionVillaPrice', {
                    initialValue: weight && weight.superpositionVillaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="叠加别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ marginBottom: 16 }}>
              <Col span={10}>
                <FormItem {...formItemLayout} label="双拼别墅(元/㎡)">
                  {getFieldDecorator('weightDuplexesVillaPrice', {
                    initialValue: weight && weight.duplexesVillaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="双拼别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Panel>

          {/* 第三个折叠面板 */}
          <Panel header="标准房评估案例均价" key="3" style={customPanelStyle}>
            <Row>
              <Col span={10}>
                <FormItem {...formItemLayout} label="标准房评估案例均价(元/㎡)">
                  {getFieldDecorator('estimateAvgProjectAvgPrice', {
                    initialValue: estimateAvg && estimateAvg.projectAvgPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="标准房评估案例均价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>

              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="低层标准房评估案例均价(元/㎡)"
                >
                  {getFieldDecorator('estimateAvgLowLayerPrice', {
                    initialValue: estimateAvg && estimateAvg.lowLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="低层标准房评估案例均价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="多层标准房评估案例均价(元/㎡)"
                >
                  {getFieldDecorator('estimateAvgMultiLayerPrice', {
                    initialValue: estimateAvg && estimateAvg.multiLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="多层标准房评估案例均价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>

              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="小高层标准房评估案例均价(元/㎡)"
                >
                  {getFieldDecorator('estimateAvgSmallHighLayerPrice', {
                    initialValue: estimateAvg && estimateAvg.smallHighLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="小高层标准房评估案例均价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="高层标准房评估案例均价(元/㎡)"
                >
                  {getFieldDecorator('estimateAvgHighLayerPrice', {
                    initialValue: estimateAvg && estimateAvg.highLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="高层标准房评估案例均价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>

              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="超高层标准房评估案例均价(元/㎡)"
                >
                  {getFieldDecorator('estimateAvgSuperHighLayerPrice', {
                    initialValue: estimateAvg && estimateAvg.superHighLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="超高层标准房评估案例均价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span={10}>
                <FormItem {...formItemLayout} label="别墅(元/㎡)">
                  {getFieldDecorator('estimateAvgVillaPrice', {
                    initialValue: estimateAvg && estimateAvg.villaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem {...formItemLayout} label="联排别墅(元/㎡)">
                  {getFieldDecorator('estimateAvgPlatoonVillaPrice', {
                    initialValue: estimateAvg && estimateAvg.platoonVillaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="联排别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={10}>
                <FormItem {...formItemLayout} label="独幢别墅(元/㎡)">
                  {getFieldDecorator('estimateAvgSingleVillaPrice', {
                    initialValue: estimateAvg && estimateAvg.singleVillaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="独幢别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem {...formItemLayout} label="叠加别墅(元/㎡)">
                  {getFieldDecorator('estimateAvgSuperpositionVillaPrice', {
                    initialValue:
                      estimateAvg && estimateAvg.superpositionVillaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="叠加别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ marginBottom: 16 }}>
              <Col span={10}>
                <FormItem {...formItemLayout} label="双拼别墅(元/㎡)">
                  {getFieldDecorator('estimateAvgDuplexesVillaPrice', {
                    initialValue: estimateAvg && estimateAvg.duplexesVillaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="双拼别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Panel>

          {/* 第四个折叠面板 */}
          <Panel header="标准房评估基准价" key="4" style={customPanelStyle}>
            <Row>
              <Col span={10}>
                <FormItem {...formItemLayout} label="标准房评估基准价(元/㎡)">
                  {getFieldDecorator('estimateWeightProjectAvgPrice', {
                    initialValue:
                      estimateWeight && estimateWeight.projectAvgPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="标准房评估基准价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>

              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="低层标准房评估基准价(元/㎡)"
                >
                  {getFieldDecorator('estimateWeightLowLayerPrice', {
                    initialValue: estimateWeight && estimateWeight.lowLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="低层标准房评估基准价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="多层标准房评估基准价(元/㎡)"
                >
                  {getFieldDecorator('estimateWeightMultiLayerPrice', {
                    initialValue:
                      estimateWeight && estimateWeight.multiLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="多层标准房评估基准价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>

              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="小高层标准房评估基准价(元/㎡)"
                >
                  {getFieldDecorator('estimateWeightSmallHighLayerPrice', {
                    initialValue:
                      estimateWeight && estimateWeight.smallHighLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="小高层标准房评估基准价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="高层标准房评估基准价(元/㎡)"
                >
                  {getFieldDecorator('estimateWeightHighLayerPrice', {
                    initialValue:
                      estimateWeight && estimateWeight.highLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="高层标准房评估基准价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem
                  {...formItemLayout}
                  label="超高层标准房评估基准价(元/㎡)"
                >
                  {getFieldDecorator('estimateWeightSuperHighLayerPrice', {
                    initialValue:
                      estimateWeight && estimateWeight.superHighLayerPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="超高层标准房评估基准价"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span={10}>
                <FormItem {...formItemLayout} label="别墅(元/㎡)">
                  {getFieldDecorator('estimateWeightVillaPrice', {
                    initialValue: estimateWeight && estimateWeight.villaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem {...formItemLayout} label="联排别墅(元/㎡)">
                  {getFieldDecorator('estimateWeightPlatoonVillaPrice', {
                    initialValue:
                      estimateWeight && estimateWeight.platoonVillaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="联排别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={10}>
                <FormItem {...formItemLayout} label="独幢别墅(元/㎡)">
                  {getFieldDecorator('estimateWeightSingleVillaPrice', {
                    initialValue:
                      estimateWeight && estimateWeight.singleVillaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="独幢别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem {...formItemLayout} label="叠加别墅(元/㎡)">
                  {getFieldDecorator('estimateWeightSuperpositionVillaPrice', {
                    initialValue:
                      estimateWeight && estimateWeight.superpositionVillaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="叠加别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ marginBottom: 16 }}>
              <Col span={10}>
                <FormItem {...formItemLayout} label="双拼别墅(元/㎡)">
                  {getFieldDecorator('estimateWeightDuplexesVillaPrice', {
                    initialValue:
                      estimateWeight && estimateWeight.duplexesVillaPrice
                  })(
                    <InputNumber
                      min={0}
                      max={1000000000}
                      placeholder="双拼别墅"
                      style={{ width: '100%' }}
                      precision={0}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Panel>
        </Collapse>

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
          <div className={styles.container} style={{ marginBottom: '40px' }}>
            {this.renderProjectInfo()}
            <div className={styles.collapseBottom}>{this.renderForm()}</div>
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
)(StandardPriceDetail)
