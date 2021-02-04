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
  Input,
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
 * 案例均价详情
 * 1.看对比/案例均价列表页进入 2.历史表中进入
 * author: YJF
 */
class CasePriceDetail extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    fetchCaseAvgDetail: PropTypes.func.isRequired,
    saveCaseAvg: PropTypes.func.isRequired,
    saveCaseAvgHistory: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getCasePriceDetailHistory: PropTypes.func.isRequired,
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
      avgId,
      tag,
      useMonth,
      entry,
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
    this.avgId = avgId

    this.state = {
      projectId,
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
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      if (this.cityId) {
        clearInterval(this.cityIdInterval)

        // 获取案例均价详情 entry = 1 / 历史表查看 entry = 2
        if (entry === '1') {
          this.getCasePriceDetail()
        } else if (entry === '2') {
          this.getCasePriceDetailHistory()
        }
      }
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  getCasePriceDetail = () => {
    const { projectId, tag, useMonth } = this.state
    const params = {
      projectId,
      id: this.avgId,
      cityId: this.cityId,
      useMonth,
      tag
    }
    this.props.fetchCaseAvgDetail(params, data => {
      const { id } = data
      this.avgId = id
      this.setState({ detailLoading: false })
    })
  }

  getCasePriceDetailHistory = () => {
    const params = {
      cityId: this.cityId,
      avgId: this.avgId
    }
    this.props.getCasePriceDetailHistory(params, () => {
      this.setState({ detailLoading: false })
    })
  }

  saveCaseAvg = values => {
    const {
      areaIds,
      keyword,
      state,
      id,
      cityId,
      feedProjectId,
      provinceId,
      compare
    } = this.state
    values.id = this.avgId
    values.cityId = this.cityId
    values.projectId = this.state.projectId
    values.useMonth = moment(values.useMonth).format('YYYY-MM-DD HH:mm:ss')
    this.props.saveCaseAvg(values, result => {
      const { code, msg } = result
      this.setState({
        loading: false
      })
      if (+code === 200) {
        Message.success('保存成功')
        if (state) {
          this.context.router.history.push({
            pathname: router.FEEDBACK_PROPERTY_PVG_REPLY,
            search: `?id=${id}&cityId=${cityId}&projectId=${feedProjectId}&provinceId=${provinceId}&state=${state}`
          })
        } else {
          // this.props.history.goBack()
          this.props.history.push({
            pathname: router.RES_PRO_PROJECT_AVG,
            search: `areaIds=${areaIds || ''}&keyword=${keyword ||
              ''}&activeTabs=${compare}&pageNum=${1}`
          })
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

  saveCaseAvgHistory = values => {
    const { areaIds, keyword, entry, cityId, cityName, compare } = this.state
    values.id = this.avgId
    values.cityId = this.cityId
    values.projectId = this.state.projectId
    values.useMonth = moment(values.useMonth).format('YYYY-MM-DD HH:mm:ss')
    this.setState({
      loading: false
    })
    this.props.saveCaseAvgHistory(values, result => {
      const { code, msg } = result
      if (+code === 200) {
        Message.success('保存成功')
        // wy change 2019/5/7 1.如果从基准房价历史数据页过来的（entry === '1'）2.如果从基准房价页过来的（entry === '2'）
        // this.props.history.goBack()
        if (entry === '1') {
          this.props.history.push({
            pathname: router.RES_PRO_PROJECT_AVG,
            search: `areaIds=${areaIds || ''}&keyword=${keyword ||
              ''}&activeTabs=${compare}&pageNum=${1}`
          })
        } else {
          this.props.history.push({
            pathname: router.RES_PRO_CASE_PRICE_HISTORY,
            search: `projectId=${
              values.projectId
            }&activeTabs=${compare}&cityId=${cityId}&cityName=${cityName}`
          })
          // this.props.history.goBack()
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
        delete values.projectReferencePrice
        const { entry } = this.state
        if (entry === '1') {
          this.saveCaseAvg(values)
        } else if (entry === '2') {
          this.saveCaseAvgHistory(values)
        }
      }
    })
  }

  // 根据案例均价变更，计算涨跌幅
  hanldeProjectAvgPriceBlur = value => {
    // 上个月案例均价
    const { avgDetail } = this.props.model
    const preProjectAvgPrice = avgDetail.get('preProjectAvgPrice')
    // 当前输入的案例均价
    // const projectAvgPrice = e.target.value

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
    const { avgDetail } = this.props.model
    const preProjectAvgPrice = avgDetail.get('preProjectAvgPrice')
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
        name: '挂牌案例均价详情'
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
    // debugger
    const { avgDetail } = this.props.model
    if (!avgDetail) {
      return ''
    }
    return (
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              当前楼盘&nbsp;
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {avgDetail.get('areaName')} | {avgDetail.get('projectName')}
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
    const { loading } = this.state

    const { avgDetail } = this.props.model
    if (!avgDetail) {
      return ''
    }
    // 案例均价参考值显示
    let content = ''
    const projectReferencePrice = avgDetail.get('projectReferencePrice')
    const caseCount = avgDetail.get('caseCount')
    if (projectReferencePrice !== undefined && projectReferencePrice !== null) {
      content = `案例条数:${caseCount ||
        0}; 案例均价:${projectReferencePrice}元/㎡`
    }

    return (
      <Form onSubmit={this.handleSubmit}>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="案例月份">
              {getFieldDecorator('useMonth', {
                initialValue: avgDetail.get('useMonth')
                  ? moment(avgDetail.get('useMonth'))
                  : undefined
              })(<DatePicker disabled style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="挂牌案例均价(元/㎡)">
              {getFieldDecorator('projectAvgPrice', {
                initialValue: avgDetail.get('projectAvgPrice')
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
                initialValue: avgDetail.get('projectGained')
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
            <FormItem label="只反调差的案例均价" {...formItemLayout}>
              {getFieldDecorator('inverseDiffAvgPrice', {
                initialValue: avgDetail.get('inverseDiffAvgPrice')
              })(<Input disabled style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem label="挂牌案例均价值参考" {...formItemLayout}>
              {getFieldDecorator('projectReferencePrice', {
                initialValue: avgDetail.get('projectReferencePrice')
              })(<Input disabled style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="低层挂牌案例均价(元/㎡)">
              {getFieldDecorator('lowLayerPrice', {
                initialValue: avgDetail.get('lowLayerPrice')
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
            <FormItem {...formItemLayout} label="多层挂牌案例均价(元/㎡)">
              {getFieldDecorator('multiLayerPrice', {
                initialValue: avgDetail.get('multiLayerPrice')
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
            <FormItem {...formItemLayout} label="小高层挂牌案例均价(元/㎡)">
              {getFieldDecorator('smallHighLayerPrice', {
                initialValue: avgDetail.get('smallHighLayerPrice')
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
            <FormItem {...formItemLayout} label="高层挂牌案例均价(元/㎡)">
              {getFieldDecorator('highLayerPrice', {
                initialValue: avgDetail.get('highLayerPrice')
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
            <FormItem {...formItemLayout} label="超高层挂牌案例均价(元/㎡)">
              {getFieldDecorator('superHighLayerPrice', {
                initialValue: avgDetail.get('superHighLayerPrice')
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
                initialValue: avgDetail.get('villaPrice')
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
                initialValue: avgDetail.get('platoonVillaPrice')
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
                initialValue: avgDetail.get('singleVillaPrice')
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
                initialValue: avgDetail.get('superpositionVillaPrice')
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
                initialValue: avgDetail.get('duplexesVillaPrice')
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
)(CasePriceDetail)
