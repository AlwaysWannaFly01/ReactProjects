import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  Breadcrumb,
  Icon,
  Alert,
  Form,
  Row,
  Col,
  Button,
  DatePicker,
  InputNumber,
  Message,
  Spin
} from 'antd'
import { parse } from 'qs'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import moment from 'moment'
import router from 'client/router'
import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ProjectAvg.less'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    xs: { span: 6 },
    sm: { span: 10 }
  },
  wrapperCol: {
    xs: { span: 6 },
    sm: { span: 14 }
  }
}

/*
 * 评估案例均价详情
 * 1.看对比/案例均价列表页进入 2.历史表中进入
 * author: wy
 */
class EstimateCaseDetail extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    getEstimateMonthToDetail: PropTypes.func.isRequired,
    estimateMonthToDetail: PropTypes.object.isRequired, // 根据月份获取案例均价详情 WY
    addEstimateAvgHistory: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
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
      projectId,
      tag,
      useMonth,
      entry,
      weightId,
      state,
      id,
      cityId,
      cityName, //wy change
      feedProjectId,
      provinceId,
      areaIds,
      keyword,
      compare
    } = parse(props.location.search.substr(1))

    this.state = {
      projectId,
      weightId,
      useMonth,
      entry,
      tag,
      state,
      id,
      cityId,
      feedProjectId,
      provinceId,
      loading: false,
      cityName,
      areaIds,
      keyword,
      compare,
      detailLoading: true
    }
  }

  componentDidMount() {
    const { entry, cityId, cityName } = this.state
    this.cityId = sessionStorage.getItem('FDC_CITY')
    // 设置当前月份
    this.currentMonth()
    if (this.cityId) {
      this.getEstimateCasePriceDetail()
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  currentMonth() {
    // 选择当前月份
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()
    this.userMonth = moment(new Date(`${year}-${month}-01`))
    this.useMonth = `${year}-${month}-01`
  }

  getEstimateCasePriceDetail = () => {
    // debugger
    const { projectId, useMonth, entry } = this.state
    let useMonthType = ''
    if (entry === '3') {
      useMonthType = moment(useMonth)
        .subtract(1, 'months')
        .format('YYYY-MM-DD')
    } else {
      useMonthType = useMonth
    }
    const params = {
      projectId,
      cityId: this.cityId,
      useMonth: useMonthType
    }
    this.props.getEstimateMonthToDetail(params, () => {
      this.setState({ detailLoading: false })
    })
  }

  saveCaseAvg = values => {
    const {
      areaIds,
      keyword,
      entry,
      weightId,
      projectId,
      cityId,
      cityName,
      compare
    } = this.state

    values.cityId = this.cityId
    values.projectId = projectId
    values.useMonth = moment(values.useMonth).format('YYYY-MM-DD HH:mm:ss')
    this.props.addEstimateAvgHistory(values, result => {
      const { code, message } = result
      this.setState({
        loading: false
      })
      if (+code === 200) {
        Message.success('保存成功')
        // debugger
        // 从案例均价页进入
        if (entry === '2') {
          // 历史页进入
          this.props.history.push({
            pathname: router.RES_PRO_ESTIMATE_CASE_HISTORY,
            search: `projectId=${projectId}&activeTabs=${4}&weightId=${weightId}&cityId=${cityId}&cityName=${cityName}`
          })
          this.setState({
            loading: false
          })
        } else {
          this.props.history.push({
            pathname: router.RES_PRO_PROJECT_AVG,
            search: `areaIds=${areaIds || ''}&keyword=${keyword ||
              ''}&activeTabs=${compare}&pageNum=${1}`
          })
        }
      } else {
        Message.error(message)
        this.setState({
          loading: false
        })
      }
    })
  }

  handleSubmit = e => {
    if (e) {
      e.preventDefault()
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        delete values.projectReferencePrice
        this.saveCaseAvg(values)
      }
    })
  }

  // 根据案例均价变更，计算涨跌幅
  hanldeProjectAvgPriceBlur = value => {
    // 上个月案例均价
    const { estimateMonthToDetail } = this.props
    const preProjectAvgPrice = estimateMonthToDetail.preProjectAvgPrice
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
    const { estimateMonthToDetail } = this.props
    const preProjectAvgPrice = estimateMonthToDetail.preProjectAvgPrice
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
        name: '评估案例均价详情'
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
    const { estimateMonthToDetail } = this.props
    return (
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              当前楼盘&nbsp;
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {estimateMonthToDetail.areaName} |{' '}
                {estimateMonthToDetail.projectName}
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
    const { estimateMonthToDetail } = this.props
    const { loading } = this.state
    // console.log(estimateMonthToDetail)

    // const { estimateMonthToDetail } = this.props.model

    // 案例均价参考值显示
    // let content = ''
    // const projectReferencePrice = estimateMonthToDetail.get('projectReferencePrice')
    // const caseCount = estimateMonthToDetail.get('caseCount')
    // if (projectReferencePrice !== undefined && projectReferencePrice !== null) {
    //   content = `案例条数:${caseCount ||
    //     0}; 案例均价:${projectReferencePrice}元/㎡`
    // }

    return (
      <Form onSubmit={this.handleSubmit}>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="案例月份">
              {getFieldDecorator('useMonth', {
                initialValue: estimateMonthToDetail.useMonth
                  ? moment(estimateMonthToDetail.useMonth)
                  : undefined
              })(<DatePicker disabled style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="评估案例均价(元/㎡)">
              {getFieldDecorator('projectAvgPrice', {
                initialValue: estimateMonthToDetail.projectAvgPrice
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  onChange={this.hanldeProjectAvgPriceBlur}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="涨跌幅(%)">
              {getFieldDecorator('projectGained', {
                initialValue: estimateMonthToDetail.projectGained
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
          {/* <Col span={10}>
            <FormItem label="挂牌案例均价值参考" {...formItemLayout}>
              {getFieldDecorator('projectReferencePrice', {
                initialValue: estimateMonthToDetail.get('projectReferencePrice')
              })(<Input disabled style={{ width: '100%' }} />)}
            </FormItem>
          </Col> */}
          <Col span={10}>
            <FormItem {...formItemLayout} label="低层评估案例均价(元/㎡)">
              {getFieldDecorator('lowLayerPrice', {
                initialValue: estimateMonthToDetail.lowLayerPrice
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>

          <Col span={10}>
            <FormItem {...formItemLayout} label="多层评估案例均价(元/㎡)">
              {getFieldDecorator('multiLayerPrice', {
                initialValue: estimateMonthToDetail.multiLayerPrice
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="小高层评估案例均价(元/㎡)">
              {getFieldDecorator('smallHighLayerPrice', {
                initialValue: estimateMonthToDetail.smallHighLayerPrice
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>

          <Col span={10}>
            <FormItem {...formItemLayout} label="高层评估案例均价(元/㎡)">
              {getFieldDecorator('highLayerPrice', {
                initialValue: estimateMonthToDetail.highLayerPrice
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="超高层评估案例均价(元/㎡)">
              {getFieldDecorator('superHighLayerPrice', {
                initialValue: estimateMonthToDetail.superHighLayerPrice
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>

          <Col span={10}>
            <FormItem {...formItemLayout} label="别墅(元/㎡)">
              {getFieldDecorator('villaPrice', {
                initialValue: estimateMonthToDetail.villaPrice
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="联排别墅(元/㎡)">
              {getFieldDecorator('platoonVillaPrice', {
                initialValue: estimateMonthToDetail.platoonVillaPrice
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>

          <Col span={10}>
            <FormItem {...formItemLayout} label="独幢别墅(元/㎡)">
              {getFieldDecorator('singleVillaPrice', {
                initialValue: estimateMonthToDetail.singleVillaPrice
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="叠加别墅(元/㎡)">
              {getFieldDecorator('superpositionVillaPrice', {
                initialValue: estimateMonthToDetail.superpositionVillaPrice
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>

          <Col span={10}>
            <FormItem {...formItemLayout} label="双拼别墅(元/㎡)">
              {getFieldDecorator('duplexesVillaPrice', {
                initialValue: estimateMonthToDetail.duplexesVillaPrice
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem label=" " colon={false} {...formItemLayout}>
              {pagePermission('fdc:hd:residence:average:change') ? (
                <Button
                  type="primary"
                  loading={loading}
                  htmlType="submit"
                  icon="save"
                >
                  保存
                </Button>
              ) : (
                ''
              )}
            </FormItem>
          </Col>
        </Row>
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
)(EstimateCaseDetail)
