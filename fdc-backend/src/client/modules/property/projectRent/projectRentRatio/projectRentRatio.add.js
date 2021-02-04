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
  Message
} from 'antd'
import { parse } from 'qs'
import router from 'client/router'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { containerActions } from '../actions'
import { modelSelector } from '../selector'
import '../sagas'
import '../reducer'

import styles from '../ProjectRent.less'

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
 * 案例均价 新增
 * author: YJF
 */
class projectRentRatioAdd extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    addRentRatio: PropTypes.func.isRequired,
    getMonthToRentRatio: PropTypes.func.isRequired,
    // getLastMonthCasePrice: PropTypes.func.isRequired,
    monthToDetail: PropTypes.object.isRequired, // 根据月份获取案例均价详情 WY
    updateVisitCities: PropTypes.func.isRequired,
    getAllDetail: PropTypes.func.isRequired // wy change 楼盘没有权限
  }

  constructor(props) {
    super(props)

    /* eslint-disable */
    const { projectId, cityId, cityName, activeTabs } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      projectId,
      activeTabs,
      loading: false,
      cityId,
      cityName
    }

    this.handleUseMonthChange = this.handleUseMonthChange.bind(this)

    // console.log(this.state)
  }
  componentWillUnmount() {
    clearTimeout(this.cityIdInterval)
    clearInterval(this.cityIdInterval)
  }

  componentDidMount() {
    const { cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
      }
      // 根据月份获取案例均价详情 WY
      this.handleUseMonthChange(moment(this.BeforDataMonth()))
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  // 案例月份变更 1.根据案例均价，计算涨跌幅 2.根据涨跌幅度，计算案例均价
  // 3.月份的改变，请求‘根据月份获取案例均价详情’接口WY
  handleUseMonthChange = date => {
    const { cityId } = this.state
    if (date) {
      const params = {
        projectId: this.state.projectId,
        cityId,
        useMonth: moment(date).format('YYYY-MM-01')
      }
      this.props.getMonthToRentRatio(params)
    }
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

        this.props.addRentRatio(values, result => {
          const { code, message } = result
          if (+code === 200) {
            Message.success('新增成功')
            // this.props.history.goBack()
            this.props.history.push({
              pathname: router.RES_PRORENT_RENTAL_HISTORY,
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
        path: router.RES_PRORENT_RENTAL,
        name: '楼盘租售比',
        search: `importType=1212129&cityId=${this.state.cityId}&cityName=${this.state.cityName}`,
      },
      {
        key: 4,
        path: '',
        name: '楼盘租售比新增'
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
    const { MonthToRentRatioDtail } = this.props.model
    return (
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              当前楼盘&nbsp;
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {MonthToRentRatioDtail.get('areaName')} |{' '}
                {MonthToRentRatioDtail.get('projectName')}
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
    let month = nowdays.getMonth()+1
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
    const { MonthToRentRatioDtail } = this.props.model

    if (!MonthToRentRatioDtail) {
      return ''
    }

    // console.log(this.props.monthToDetail)
    return (
      <Form onSubmit={this.handleSubmit}>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="月份">
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
            <FormItem {...formItemLayout} label="住宅租售比（计算）">
              {getFieldDecorator('houseRate', {
                initialValue: MonthToRentRatioDtail.get('houseRate')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅租售比（人工）">
              {getFieldDecorator('houseRateManual', {
                initialValue: MonthToRentRatioDtail.get('houseRateManual')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅多层租售比（计算）">
              {getFieldDecorator('houseMultiLayerRate', {
                initialValue: MonthToRentRatioDtail.get('houseMultiLayerRate')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅多层租售比（人工）">
              {getFieldDecorator('houseMultiLayerRateManual', {
                initialValue: MonthToRentRatioDtail.get(
                  'houseMultiLayerRateManual'
                )
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅小高层租售比（计算）">
              {getFieldDecorator('houseSmallHighLayerRate', {
                initialValue: MonthToRentRatioDtail.get(
                  'houseSmallHighLayerRate'
                )
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅小高层租售比（人工）">
              {getFieldDecorator('houseSmallHighLayerRateManual', {
                initialValue: MonthToRentRatioDtail.get(
                  'houseSmallHighLayerRateManual'
                )
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅高层租售比（计算）">
              {getFieldDecorator('houseHighLayerRate', {
                initialValue: MonthToRentRatioDtail.get('houseHighLayerRate')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅高层租售比（人工）">
              {getFieldDecorator('houseHighLayerRateManual', {
                initialValue: MonthToRentRatioDtail.get(
                  'houseHighLayerRateManual'
                )
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅超高层租售比（计算）">
              {getFieldDecorator('houseSuperHighLayerRate', {
                initialValue: MonthToRentRatioDtail.get(
                  'houseSuperHighLayerRate'
                )
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅超高层租售比（人工）">
              {getFieldDecorator('houseSuperHighLayerRateManual', {
                initialValue: MonthToRentRatioDtail.get(
                  'houseSuperHighLayerRateManual'
                )
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓租售比（计算）">
              {getFieldDecorator('apartmentRate', {
                initialValue: MonthToRentRatioDtail.get('apartmentRate')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓租售比（人工）">
              {getFieldDecorator('apartmentRateManual', {
                initialValue: MonthToRentRatioDtail.get('apartmentRateManual')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓多层租售比（计算）">
              {getFieldDecorator('apartmentMultiLayerRate', {
                initialValue: MonthToRentRatioDtail.get(
                  'apartmentMultiLayerRate'
                )
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓多层租售比（人工）">
              {getFieldDecorator('apartmentMultiLayerRateManual', {
                initialValue: MonthToRentRatioDtail.get(
                  'apartmentMultiLayerRateManual'
                )
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓小高层租售比（计算）">
              {getFieldDecorator('apartmentSmallHighLayerRate', {
                initialValue: MonthToRentRatioDtail.get(
                  'apartmentSmallHighLayerRate'
                )
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓小高层租售比（人工）">
              {getFieldDecorator('apartmentSmallHighLayerRateManual', {
                initialValue: MonthToRentRatioDtail.get(
                  'apartmentSmallHighLayerRateManual'
                )
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓高层租售比（计算）">
              {getFieldDecorator('apartmentHighLayerRate', {
                initialValue: MonthToRentRatioDtail.get(
                  'apartmentHighLayerRate'
                )
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓高层租售比（人工）">
              {getFieldDecorator('apartmentHighLayerRateManual', {
                initialValue: MonthToRentRatioDtail.get(
                  'apartmentHighLayerRateManual'
                )
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓超高层租售比（计算）">
              {getFieldDecorator('apartmentSuperHighLayerRate', {
                initialValue: MonthToRentRatioDtail.get(
                  'apartmentSuperHighLayerRate'
                )
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓超高层租售比（人工）">
              {getFieldDecorator('apartmentSuperHighLayerRateManual', {
                initialValue: MonthToRentRatioDtail.get(
                  'apartmentSuperHighLayerRateManual'
                )
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住租售比（计算）">
              {getFieldDecorator('occopantRate', {
                initialValue: MonthToRentRatioDtail.get('occopantRate')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住租售比（人工）">
              {getFieldDecorator('occopantRateManual', {
                initialValue: MonthToRentRatioDtail.get('occopantRateManual')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={6}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住多层租售比（计算）">
              {getFieldDecorator('occopantMultiLayerRate', {
                initialValue: MonthToRentRatioDtail.get(
                  'occopantMultiLayerRate'
                )
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={6}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住多层租售比（人工）">
              {getFieldDecorator('occopantMultiLayerRateManual', {
                initialValue: MonthToRentRatioDtail.get(
                  'occopantMultiLayerRateManual'
                )
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={6}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住小高层租售比（计算）">
              {getFieldDecorator('occopantSmallHighLayerRate', {
                initialValue: MonthToRentRatioDtail.get(
                  'occopantSmallHighLayerRate'
                )
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={6}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住小高层租售比（人工）">
              {getFieldDecorator('occopantSmallHighLayerRateManual', {
                initialValue: MonthToRentRatioDtail.get(
                  'occopantSmallHighLayerRateManual'
                )
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={6}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住高层租售比（计算）">
              {getFieldDecorator('occopantHighLayerRate', {
                initialValue: MonthToRentRatioDtail.get('occopantHighLayerRate')
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={6}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住高层租售比（人工）">
              {getFieldDecorator('occopantHighLayerRateManual', {
                initialValue: MonthToRentRatioDtail.get(
                  'occopantHighLayerRateManual'
                )
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={6}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住超高层租售比（计算）">
              {getFieldDecorator('occopantSuperHighLayerRate', {
                initialValue: MonthToRentRatioDtail.get(
                  'occopantSuperHighLayerRate'
                )
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={6}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住超高层租售比（人工）">
              {getFieldDecorator('occopantSuperHighLayerRateManual', {
                initialValue: MonthToRentRatioDtail.get(
                  'occopantSuperHighLayerRateManual'
                )
              })(
                <InputNumber
                  min={0}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  precision={6}
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
)(projectRentRatioAdd)
