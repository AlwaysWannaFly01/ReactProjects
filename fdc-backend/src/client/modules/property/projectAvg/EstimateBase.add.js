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
 * author: WY
 */
class BasePriceDetail extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
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

      loading: false
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
      this.props.getEstimateMonthToWeightDetail(params, () => {
        this.setState({ detailLoading: false })
      })
    }
  }

  handleSubmit = e => {
    if (e) {
      e.preventDefault()
    }
    const { cityId, cityName } = this.state
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.cityId = this.state.cityId
        values.projectId = this.state.projectId
        values.useMonth = moment(values.useMonth).format('YYYY-MM-DD')
        this.setState({
          loading: false
        })

        this.props.addEstimateWeightHistory(values, result => {
          const { code, message } = result
          if (+code === 200) {
            Message.success('新增成功')
            this.props.history.push({
              pathname: router.RES_PRO_ESTIMATE_BASE_HISTORY,
              search: `projectId=${
                values.projectId
              }&activeTabs=5&weightId=${''}&cityId=${cityId}&cityName=${cityName}`
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
        name: '评估基准价新增'
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
                {/* {areaName || this.state.areaNameAdd} |{' '}
                {projectName || this.state.projectNameAdd} */}
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

    const { estimateMonthToWeightDetail } = this.props

    const { tag = '1', loading } = this.state

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
                  disabled={tag === '1'}
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
                  disabled={tag === '1'}
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
                  disabled={tag === '1'}
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
                  disabled={tag === '1'}
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
                  disabled={tag === '1'}
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
                  disabled={tag === '1'}
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
                  disabled={tag === '1'}
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
                  disabled={tag === '1'}
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
                  disabled={tag === '1'}
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
                  disabled={tag === '1'}
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
                  disabled={tag === '1'}
                />
              )}
            </FormItem>
          </Col>
        </Row>
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
)(BasePriceDetail)
