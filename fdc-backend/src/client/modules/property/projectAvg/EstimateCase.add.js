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
import router from 'client/router'
import moment from 'moment'

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
    sm: { span: 10 }
  },
  wrapperCol: {
    xs: { span: 6 },
    sm: { span: 14 }
  }
}

/*
 * 评估案例均价 新增
 * author: wy
 */
class CasePriceAdd extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    addEstimateAvgHistory: PropTypes.func.isRequired,
    getLastMonthCasePrice: PropTypes.func.isRequired,
    getEstimateMonthToDetail: PropTypes.func.isRequired, // 根据月份获取案例均价详情 WY
    estimateMonthToDetail: PropTypes.object.isRequired, // 根据月份获取案例均价详情 WY
    updateVisitCities: PropTypes.func.isRequired,
    getAllDetail: PropTypes.func.isRequired // wy change 楼盘没有权限
    // fetchCaseAvgDetail: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    /* eslint-disable */
    const { projectId = '', cityId, cityName } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      projectId,

      loading: false,
      cityId,
      cityName,
      detailLoading: true
    }

    this.handleUseMonthChange = this.handleUseMonthChange.bind(this)

    // console.log(this.state)
  }

  componentDidMount() {
    const { cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      if (this.cityId) {
        clearInterval(this.cityIdInterval)

        // 获取楼盘详情 change wy 没有楼盘详情 2019/6/3
        const { projectId } = this.state
        if (projectId) {
          // this.props.getProjectDetail(projectId, this.cityId)
          this.props.getAllDetail(projectId, this.cityId)
        }

        // 根据当前案例月份获取上个月的案例均价
        // 默认上个月的日期
        this.getLastMonthCasePrice(this.getPreMonth(new Date()))
      }
      // 根据月份获取案例均价详情 WY
      this.handleUseMonthChange(
        moment(this.BeforDataMonth()),
        this.cityId,
        true
      )

      // this.getCasePriceDetail()
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  getPreMonth = date => {
    var date = moment(date).format('YYYY-MM-01')
    var arr = date.split('-')
    var year = arr[0] //获取当前日期的年份
    var month = arr[1] //获取当前日期的月份
    var days = new Date(year, month, 0)
    days = days.getDate() //获取当前日期中月的天数
    var year2 = year
    var month2 = parseInt(month) - 1
    if (month2 == 0) {
      //如果是1月份，则取上一年的12月份
      year2 = parseInt(year2) - 1
      month2 = 12
    }
    if (month2 < 10) {
      month2 = '0' + month2 //月份填补成2位。
    }
    var t2 = year2 + '-' + month2 + '-' + '01'
    return t2
  }

  // getCasePriceDetail = () => {
  //   const { projectId, tag, useMonth } = this.state
  //   const params = {
  //     projectId,
  //     id: this.avgId,
  //     cityId: this.cityId,
  //     useMonth,
  //     tag
  //   }
  //   this.props.fetchCaseAvgDetail(params, data => {
  //     const { id } = data
  //     this.avgId = id
  //   })
  // }

  getLastMonthCasePrice = date => {
    const { cityId, projectId } = this.state
    const params = {
      cityId,
      projectId,
      useMonth: date
    }
    this.props.getLastMonthCasePrice(params, () => {})
  }

  // 案例月份变更 1.根据案例均价，计算涨跌幅 2.根据涨跌幅度，计算案例均价
  // 3.月份的改变，请求‘根据月份获取案例均价详情’接口WY
  handleUseMonthChange = (date, cityId, flag) => {
    this.setState({ detailLoading: true })
    const { projectId } = this.state
    // 上个月案例均价
    const params = {
      cityId: this.state.cityId || cityId,
      projectId,
      useMonth: moment(date).format('YYYY-MM-01')
    }
    // if (!flag) {
    //   this.props.getLastMonthCasePrice(params, lastMonthCasePrive => {
    //     if (lastMonthCasePrive) {
    //       // 1.获取案例均价 和  2.涨跌幅
    //       const {
    //         projectAvgPrice,
    //         projectGained
    //       } = this.props.form.getFieldsValue([
    //         'projectAvgPrice',
    //         'projectGained'
    //       ])
    //       // 如果案例均价有值，则计算涨跌幅
    //       if (projectAvgPrice) {
    //         let projectGained = (projectAvgPrice / lastMonthCasePrive - 1) * 100
    //         projectGained = projectGained.toFixed(2)
    //         this.props.form.setFieldsValue({ projectGained })
    //         return
    //       }
    //       if (projectGained) {
    //         const projectAvgPrice =
    //           (projectGained / 100 + 1) * lastMonthCasePrive
    //         this.props.form.setFieldsValue({ projectAvgPrice })
    //       }
    //     }
    //   })
    // }
    // 根据月份获取案例均价详情 WY
    this.props.getEstimateMonthToDetail(params, () => {
      this.setState({ detailLoading: false })
    })
  }

  // 根据案例均价变更，计算涨跌幅
  hanldeProjectAvgPriceBlur = value => {
    // 上个月案例均价
    const { preProjectAvgPrice } = this.props.estimateMonthToDetail
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
    const { preProjectAvgPrice } = this.props.estimateMonthToDetail
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

  handleSubmit = e => {
    if (e) {
      e.preventDefault()
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.cityId = this.cityId
        values.projectId = this.state.projectId
        values.useMonth = moment(values.useMonth).format('YYYY-MM-DD HH:mm:ss')
        delete values.projectReferencePrice
        this.setState({
          loading: false
        })
        this.props.addEstimateAvgHistory(values, result => {
          const { code, message } = result
          if (+code === 200) {
            Message.success('新增成功')
            // this.props.history.goBack()
            this.props.history.push({
              pathname: router.RES_PRO_ESTIMATE_CASE_HISTORY,
              search: `projectId=${values.projectId}&activeTabs=3&cityId=${
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
    const Idx = new Date().getMonth() - 1
    return (
      current &&
      current >=
        moment()
          .set('month', Idx)
          .startOf('day')
    )
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
        name: '评估案例均价新增'
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
    return (
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              当前楼盘&nbsp;
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {projectDetail.get('areaName')} |{' '}
                {projectDetail.get('projectName')}
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
    let month = nowdays.getMonth()
    if (month == 0) {
      month = 12
      year = year - 1
    }
    if (month < 10) {
      month = '0' + month
    }
    let firstDay = year + '-' + month + '-' + '01' //上个月的第一天
    return firstDay
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form
    const { loading } = this.state
    const { estimateMonthToDetail } = this.props
    // // 案例均价参考值显示
    // let content = ''
    // const projectReferencePrice = avgDetail.get('projectReferencePrice')
    // const caseCount = avgDetail.get('caseCount')
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
                rules: [
                  {
                    required: true,
                    message: '请选择案例月份'
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
            <FormItem label="评估案例均价值参考" {...formItemLayout}>
              {getFieldDecorator('projectReferencePrice', {
                initialValue: estimateMonthToDetail.projectReferencePrice
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
              <Button
                type="primary"
                loading={loading}
                htmlType="submit"
                icon="save"
              >
                保存
              </Button>
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
)(CasePriceAdd)
