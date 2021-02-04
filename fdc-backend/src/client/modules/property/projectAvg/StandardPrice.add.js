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
  // Input,
  InputNumber,
  Row,
  Col,
  // Select,
  DatePicker,
  Message,
  Collapse,
  Spin
} from 'antd'
import moment from 'moment'
import Immutable from 'immutable'
import { parse } from 'qs'
import router from 'client/router'
import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ProjectAvg.less'

const FormItem = Form.Item
const { MonthPicker } = DatePicker
// const Option = Select.Option
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
 * author: WY
 */
class StandardPriceAdd extends Component {
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
      cityName,
      feedCityId,
      feedProjectId,
      provinceId,
      areaNameAdd,
      projectNameAdd,

      loading: false,
      detailLoading: true
    }
    this.handleUseMonthChange = this.handleUseMonthChange.bind(this)
  }

  componentDidMount() {
    const { cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      // 设置当前月份
      this.currentMonth()
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
      }
      this.handleUseMonthChange(true, this.useMonth)
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  // 案例月份变更 请求 根据月份获取挂牌基准价详情 接口 WY
  handleUseMonthChange = (date, dateString) => {
    this.setState({ detailLoading: true })
    const { cityId } = this.state
    if (date) {
      const params = {
        cityId,
        projectId: this.state.projectId,
        useMonth: dateString
      }
      this.props.getStandardHousePriceDetail(params, () => {
        this.setState({ detailLoading: false })
      })
    }
  }

  handleSubmit = e => {
    if (e) {
      e.preventDefault()
    }
    const { cityId, cityName, projectId } = this.state
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const params = {}
        params.cityId = cityId
        params.projectId = projectId
        params.useMonth = moment(values.useMonth).format('YYYY-MM-DD')
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
          const { code, message } = result
          if (+code === 200) {
            Message.success('新增成功')
            this.props.history.push({
              pathname: router.RES_PRO_STANDARD_PRICE_HISTORY,
              search: `projectId=${projectId}&activeTabs=6&cityId=${cityId}&cityName=${cityName}`
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
    // Can not select days before today and today
    return current > moment().endOf('month')
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
        name: '标准房价格新增'
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
    const { projectDetail } = this.props.model
    const { areaName, projectName } = projectDetail
    return (
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              当前楼盘&nbsp;
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {this.state.areaNameAdd ? this.state.areaNameAdd : areaName} |{' '}
                {this.state.projectNameAdd
                  ? this.state.projectNameAdd
                  : projectName}
              </span>
            </p>
          }
          type="info"
          showIcon
        />
      </div>
    )
  }

  // BeforDataMonth() {
  //   /*默认显示上个月的日期*/
  //   let nowdays = new Date()
  //   let year = nowdays.getFullYear()
  //   let month = nowdays.getMonth()
  //   if (month == 0) {
  //     month = 12
  //     year = year - 1
  //   }
  //   if (month < 10) {
  //     month = '0' + month
  //   }
  //   let firstDay = year + '-' + month + '-' + '01' // 上个月的第一天
  //   return firstDay
  // }

  currentMonth() {
    // 选择当前月份
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    this.userMonth = moment(new Date(`${year}-${month}-01`))
    this.useMonth = `${year}-${month}-01`
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form

    const { standardHousePriceDetail } = this.props
    // console.log(standardHousePriceDetail)
    const {
      avg,
      weight,
      estimateAvg,
      estimateWeight
    } = standardHousePriceDetail
    // console.log(avg, weight, estimateAvg, estimateWeight)
    // console.log(estimateAvg && estimateAvg.projectAvgPrice)

    const { tag = '1', loading } = this.state

    const customPanelStyle = {
      background: '#f7f7f7',
      borderRadius: 4,
      marginBottom: 24,
      border: 0,
      overflow: 'hidden'
    }

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
                initialValue: this.userMonth,
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

        <Collapse
          bordered={false}
          defaultActiveKey={['1']}
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

        {tag === '0' ? (
          <Row className={styles.btnCont}>
            <Button
              type="primary"
              htmlType="submit"
              icon="save"
              loading={loading}
            >
              保存
            </Button>
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
)(StandardPriceAdd)
