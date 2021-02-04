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
import Immutable from 'immutable'
import { Link } from 'react-router-dom'
import { pagePermission } from 'client/utils'
import moment from 'moment'
import router from 'client/router'
import { containerActions } from '../actions'
import { modelSelector } from '../selector'
import '../sagas'
import '../reducer'

import styles from '../ProjectRent.less'

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
class projectRentRatioDetail extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    getRentRatioDetail: PropTypes.func.isRequired,
    saveRentRatioDetail: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    // getCasePriceDetailHistory: PropTypes.func.isRequired,
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
      activeTabs,
      projectId,
      tag,
      useMonth,
      entry,
      state,
      id,
      cityId,
      cityName, //wy change,
      weightId,
      feedProjectId,
      provinceId,
      areaIds,
      keyword,
      compare
    } = parse(props.location.search.substr(1))
    this.avgId = weightId

    this.state = {
      activeTabs,
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
      compare
    }
  }

  componentDidMount() {
    const { cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
        // 获取案例均价详情 entry = 1 / 历史表查看 entry = 2
        this.fetchRentRatioDetail()
      }
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  fetchRentRatioDetail = () => {
    const { projectId, useMonth } = this.state
    const params = {
      projectId,
      id: this.avgId,
      cityId: this.cityId,
      useMonth,
      tag: '0'
    }
    this.props.getRentRatioDetail(params, data => {
      const { id } = data
      this.avgId = id
    })
  }

  saveRentRatioDetail = values => {
    // console.log(2)
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
    this.props.saveRentRatioDetail(values, result => {
      const { code, msg } = result
      this.setState({
        loading: false
      })
      if (+code === 200) {
        Message.success('保存成功')
        if (state) {
          this.context.router.history.push({
            pathname: router.RES_PRORENT_RENTAL,
            search: `?importType=1212129&cityId=${cityId}&projectId=${values.projectId||''}&state=${state}`
          })
        } else {
          // this.props.history.goBack()
          this.props.history.push({
            pathname: router.RES_PRORENT_RENTAL_HISTORY,
            search: `?cityId=${cityId}&projectId=${values.projectId || ''}&activeTabs=${compare}&pageNum=${1}`
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

  handleSubmit = e => {
    if (e) {
      e.preventDefault()
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.saveRentRatioDetail(values)
      }
    })
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
        name: '楼盘租售比'
      },
      {
        key: 4,
        path: '',
        name: '楼盘租售比详情'
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
    const { RentRatioDetail } = this.props.model
    console.log(RentRatioDetail.toJS())
    return (
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              当前楼盘&nbsp;
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {RentRatioDetail.get('areaName')} |{' '}
                {RentRatioDetail.get('projectName')}
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
    const { RentRatioDetail } = this.props.model
    return (
      <Form onSubmit={this.handleSubmit}>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="案例月份">
              {getFieldDecorator('useMonth', {
                initialValue: RentRatioDetail.get('useMonth')
                  ? moment(RentRatioDetail.get('useMonth'))
                  : undefined
              })(<DatePicker disabled style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅租售比（计算）">
              {getFieldDecorator('houseRate', {
                initialValue: RentRatioDetail.get('houseRate')
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
                initialValue: RentRatioDetail.get('houseRateManual')
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
                initialValue: RentRatioDetail.get('houseMultiLayerRate')
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
                initialValue: RentRatioDetail.get('houseMultiLayerRateManual')
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
                initialValue: RentRatioDetail.get('houseSmallHighLayerRate')
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
                initialValue: RentRatioDetail.get(
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
                initialValue: RentRatioDetail.get('houseHighLayerRate')
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
                initialValue: RentRatioDetail.get('houseHighLayerRateManual')
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
                initialValue: RentRatioDetail.get('houseSuperHighLayerRate')
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
                initialValue: RentRatioDetail.get(
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
                initialValue: RentRatioDetail.get('apartmentRate')
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
                initialValue: RentRatioDetail.get('apartmentRateManual')
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
                initialValue: RentRatioDetail.get('apartmentMultiLayerRate')
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
                initialValue: RentRatioDetail.get(
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
                initialValue: RentRatioDetail.get('apartmentSmallHighLayerRate')
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
                initialValue: RentRatioDetail.get(
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
                initialValue: RentRatioDetail.get('apartmentHighLayerRate')
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
                initialValue: RentRatioDetail.get(
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
                initialValue: RentRatioDetail.get('apartmentSuperHighLayerRate')
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
                initialValue: RentRatioDetail.get(
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
                initialValue: RentRatioDetail.get('occopantRate')
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
                initialValue: RentRatioDetail.get('occopantRateManual')
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
                initialValue: RentRatioDetail.get('occopantMultiLayerRate')
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
                initialValue: RentRatioDetail.get(
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
                initialValue: RentRatioDetail.get('occopantSmallHighLayerRate')
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
                initialValue: RentRatioDetail.get(
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
                initialValue: RentRatioDetail.get('occopantHighLayerRate')
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
                initialValue: RentRatioDetail.get('occopantHighLayerRateManual')
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
                initialValue: RentRatioDetail.get('occopantSuperHighLayerRate')
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
                initialValue: RentRatioDetail.get(
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
        <Row className={styles.btnCont}>
          <Col span={10}>
            {pagePermission('fdc:hd:residence:rentalRatio:change') ? (
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
)(projectRentRatioDetail)
