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
import styles from './AreaRental.less'
import { Link } from 'react-router-dom'

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
 * 区域租售比详情
 * 1.区域租售比列表点击进入 2.历史表中进入
 * author: YJF
 */
class AreaRentalDetailCom extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    areaRentalDetail: PropTypes.object.isRequired,
    saveAreaRental: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    fetchAreaRentalDetail: PropTypes.func.isRequired,
    getAreaRentalDetail: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    /* eslint-disable */
    const {
      avgId,
      entry,
      state,
      id,
      areaId,
      cityId,
      cityName, //wy change
      areaName,
      type,
      useMonth
    } = parse(props.location.search.substr(1))
    this.avgId = avgId

    this.state = {
      avgId,
      entry,
      state,
      id,
      areaId,
      cityId,
      cityName, //wy change
      areaName,
      loading: false,
      type,
      useMonth,
      titleName: '区域租售比详情'
    }
  }

  componentDidMount() {
    const { type, cityId, areaId, id, useMonth } = this.state
    this.setState({
      loading: true
    })
    if (type === 'add') {
      this.handleUseMonthChange(moment(this.BeforDataMonth()))
    } else {
      if (id != 'null') {
        var params = {
          areaId,
          id,
          cityId,
          useMonth
        }
      } else {
        var params = {
          areaId,
          cityId,
          useMonth
        }
      }
      console.log(params)
      this.props.getAreaRentalDetail(params, () => {
        this.setState({
          loading: false
        })
      })
    }
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

  goExportTask = () => {
    if (pagePermission('fdc:ds:export:check')) {
      this.props.history.push({
        pathname: router.DATA_EXPORT_TASK,
        search: 'type=2'
      })
    } else {
      message.warning('没有导出任务页权限，请联系管理员')
    }
  }

  saveAreaRental = values => {
    this.setState({
      loading: true
    })
    // values.type = this.state.type
    if (this.state.type === 'detail') {
      values.id = this.avgId
    }
    values.cityId = this.state.cityId
    values.areaId = this.state.areaId
    values.useMonth = moment(values.useMonth).format('YYYY-MM-DD HH:mm:ss')
    this.props.saveAreaRental(values, (message, code) => {
      this.setState({
        loading: false
      })
      if (+code === 200) {
        Message.success('保存成功')
        // this.context.router.history.push({
        //   pathname: router.FEEDBACK_PROPERTY_PVG_REPLY,
        //   search: `?id=${id}&cityId=${cityId}&projectId=${feedProjectId}&provinceId=${provinceId}&state=${state}`
        // })
        this.props.history.goBack()
        this.setState({
          loading: false
        })
      } else {
        Message.error(msg)
        this.setState({
          loading: false
        })
      }
    })
  }

  // 通过月份改变获取相应月份的数据详情
  handleUseMonthChange = date => {
    const { cityId, areaId } = this.state
    if (date) {
      const params = {
        areaId,
        cityId,
        useMonth: moment(date).format('YYYY-MM-01')
      }
      console.log(params)
      this.props.fetchAreaRentalDetail(params, () => {
        this.setState({
          loading: false
        })
      })
    }
  }

  // 点击提交表单
  handleSubmit = e => {
    if (e) {
      e.preventDefault()
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.saveAreaRental(values)
      }
    })
  }

  renderBreads() {
    const { type } = this.state
    const bread = {
      key: 2,
      path: '',
      name: type == 'add' ? '新增区域租售比' : '区域租售比详情'
    }
    const breadList = [
      {
        key: 1,
        path: '/data/area-rental',
        name: '区域租售比',
        icon: 'appstore'
      }
    ]
    breadList.push(bread)
    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.path ? (
              <Link to={{ pathname: item.path, search: item.search }}>
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
    var areaRentalDetail = this.props.areaRentalDetail
    // const { cityName, areaName } = this.state
    return (
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              当前区域&nbsp;
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {areaRentalDetail.cityName} | {areaRentalDetail.areaName}
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
    const monthFormat = 'YYYY-MM-01'
    const { MonthPicker } = DatePicker
    const { getFieldDecorator } = this.props.form
    const { loading, type, useMonth } = this.state
    var areaRentalDetail = this.props.areaRentalDetail
    // if (!areaRentalDetail) {
    //   return <span>错误!!!!!!</span>
    // }
    return (
      <Spin spinning={loading} delay={500}>
        <Form onSubmit={this.handleSubmit}>
          <Row>
            <Col span={10}>
              <FormItem {...formItemLayout} label="月份">
                {getFieldDecorator('useMonth', {
                  rules: [
                    {
                      required: true,
                      message: '请选择估价月份'
                    }
                  ],
                  initialValue:
                    type === 'add'
                      ? moment(this.BeforDataMonth())
                      : moment(useMonth),
                  onChange: this.handleUseMonthChange.bind(this)
                })(
                  <MonthPicker
                    disabledDate={this.disabledDate}
                    allowClear={false}
                    format={monthFormat}
                    disabled={type == 'add' ? false : true}
                    style={{ width: '100%' }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={10}>
              <FormItem {...formItemLayout} label="住宅租售比(计算)">
                {getFieldDecorator('houseRate', {
                  initialValue: areaRentalDetail.houseRate || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
                    precision={6}
                    style={{ width: '100%' }}
                    placeholder="请输入"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="住宅租售比(人工)">
                {getFieldDecorator('houseRateManual', {
                  initialValue: areaRentalDetail.houseRateManual || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
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
              <FormItem {...formItemLayout} label="住宅多层租售比(计算)">
                {getFieldDecorator('houseMultiLayerRate', {
                  initialValue: areaRentalDetail.houseMultiLayerRate || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
                    precision={6}
                    style={{ width: '100%' }}
                    placeholder="请输入"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="住宅多层租售比(人工)">
                {getFieldDecorator('houseMultiLayerRateManual', {
                  initialValue: areaRentalDetail.houseMultiLayerRateManual || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
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
              <FormItem {...formItemLayout} label="住宅小高层租售比(计算)">
                {getFieldDecorator('houseSmallHighLayerRate', {
                  initialValue: areaRentalDetail.houseSmallHighLayerRate || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
                    precision={6}
                    style={{ width: '100%' }}
                    placeholder="请输入"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="住宅小高层租售比(人工)">
                {getFieldDecorator('houseSmallHighLayerRateManual', {
                  initialValue:
                    areaRentalDetail.houseSmallHighLayerRateManual || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
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
              <FormItem {...formItemLayout} label="住宅高层租售比(计算)">
                {getFieldDecorator('houseHighLayerRate', {
                  initialValue: areaRentalDetail.houseHighLayerRate || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
                    precision={6}
                    style={{ width: '100%' }}
                    placeholder="请输入"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="住宅高层租售比(人工)">
                {getFieldDecorator('houseHighLayerRateManual', {
                  initialValue: areaRentalDetail.houseHighLayerRateManual || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
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
              <FormItem {...formItemLayout} label="住宅超高层租售比(计算)">
                {getFieldDecorator('houseSuperHighLayerRate', {
                  initialValue: areaRentalDetail.houseSuperHighLayerRate || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
                    precision={6}
                    style={{ width: '100%' }}
                    placeholder="请输入"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="住宅超高层租售比(人工)">
                {getFieldDecorator('houseSuperHighLayerRateManual', {
                  initialValue:
                    areaRentalDetail.houseSuperHighLayerRateManual || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
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
              <FormItem {...formItemLayout} label="公寓租售比(计算)">
                {getFieldDecorator('apartmentRate', {
                  initialValue: areaRentalDetail.apartmentRate || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
                    precision={6}
                    style={{ width: '100%' }}
                    placeholder="请输入"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="公寓租售比(人工)">
                {getFieldDecorator('apartmentRateManual', {
                  initialValue: areaRentalDetail.apartmentRateManual || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
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
              <FormItem {...formItemLayout} label="公寓多层租售比(计算)">
                {getFieldDecorator('apartmentMultiLayerRate', {
                  initialValue: areaRentalDetail.apartmentMultiLayerRate || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
                    precision={6}
                    style={{ width: '100%' }}
                    placeholder="请输入"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="公寓多层租售比(人工)">
                {getFieldDecorator('apartmentMultiLayerRateManual', {
                  initialValue:
                    areaRentalDetail.apartmentMultiLayerRateManual || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
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
              <FormItem {...formItemLayout} label="公寓小高层租售比(计算)">
                {getFieldDecorator('apartmentSmallHighLayerRate', {
                  initialValue:
                    areaRentalDetail.apartmentSmallHighLayerRate || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
                    precision={6}
                    style={{ width: '100%' }}
                    placeholder="请输入"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="公寓小高层租售比(人工)">
                {getFieldDecorator('apartmentSmallHighLayerRateManual', {
                  initialValue:
                    areaRentalDetail.apartmentSmallHighLayerRateManual || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
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
              <FormItem {...formItemLayout} label="公寓高层租售比(计算)">
                {getFieldDecorator('apartmentHighLayerRate', {
                  initialValue: areaRentalDetail.apartmentHighLayerRate || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
                    precision={6}
                    style={{ width: '100%' }}
                    placeholder="请输入"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="公寓高层租售比(人工)">
                {getFieldDecorator('apartmentHighLayerRateManual', {
                  initialValue:
                    areaRentalDetail.apartmentHighLayerRateManual || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
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
              <FormItem {...formItemLayout} label="公寓超高层租售比(计算)">
                {getFieldDecorator('apartmentSuperHighLayerRate', {
                  initialValue:
                    areaRentalDetail.apartmentSuperHighLayerRate || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
                    precision={6}
                    style={{ width: '100%' }}
                    placeholder="请输入"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="公寓超高层租售比(人工)">
                {getFieldDecorator('apartmentSuperHighLayerRateManual', {
                  initialValue:
                    areaRentalDetail.apartmentSuperHighLayerRateManual || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
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
              <FormItem {...formItemLayout} label="商住租售比(计算)">
                {getFieldDecorator('occopantRate', {
                  initialValue: areaRentalDetail.occopantRate || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
                    precision={6}
                    style={{ width: '100%' }}
                    placeholder="请输入"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="商住租售比(人工)">
                {getFieldDecorator('occopantRateManual', {
                  initialValue: areaRentalDetail.occopantRateManual || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
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
              <FormItem {...formItemLayout} label="商住多层租售比(计算)">
                {getFieldDecorator('occopantMultiLayerRate', {
                  initialValue: areaRentalDetail.occopantMultiLayerRate || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
                    precision={6}
                    style={{ width: '100%' }}
                    placeholder="请输入"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="商住多层租售比(人工)">
                {getFieldDecorator('occopantMultiLayerRateManual', {
                  initialValue:
                    areaRentalDetail.occopantMultiLayerRateManual || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
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
              <FormItem {...formItemLayout} label="商住小高层租售比(计算)">
                {getFieldDecorator('occopantSmallHighLayerRate', {
                  initialValue:
                    areaRentalDetail.occopantSmallHighLayerRate || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
                    precision={6}
                    style={{ width: '100%' }}
                    placeholder="请输入"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="商住小高层租售比(人工)">
                {getFieldDecorator('occopantSmallHighLayerRateManual', {
                  initialValue:
                    areaRentalDetail.occopantSmallHighLayerRateManual || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
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
              <FormItem {...formItemLayout} label="商住高层租售比(计算)">
                {getFieldDecorator('occopantHighLayerRate', {
                  initialValue: areaRentalDetail.occopantHighLayerRate || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
                    precision={6}
                    style={{ width: '100%' }}
                    placeholder="请输入"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="商住高层租售比(人工)">
                {getFieldDecorator('occopantHighLayerRateManual', {
                  initialValue:
                    areaRentalDetail.occopantHighLayerRateManual || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
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
              <FormItem {...formItemLayout} label="商住超高层租售比(计算)">
                {getFieldDecorator('occopantSuperHighLayerRate', {
                  initialValue:
                    areaRentalDetail.occopantSuperHighLayerRate || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
                    precision={6}
                    style={{ width: '100%' }}
                    placeholder="请输入"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="商住超高层租售比(人工)">
                {getFieldDecorator('occopantSuperHighLayerRateManual', {
                  initialValue:
                    areaRentalDetail.occopantSuperHighLayerRateManual || ''
                })(
                  <InputNumber
                    max={100}
                    min={0}
                    step={0.01}
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
              <FormItem label=" " colon={false} {...formItemLayout}>
                {pagePermission('fdc:ds:regionalRental:change')&&this.state.type === 'detail' ? (
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
                {pagePermission('fdc:ds:regionalRental:add')&&this.state.type !== 'detail' ? (
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
      </Spin>
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderProjectInfo()}
          {/* <Spin spinning={this.state.loading} delay={500}> */}
          {this.renderForm()}
          {/* </Spin> */}
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
)(AreaRentalDetailCom)
