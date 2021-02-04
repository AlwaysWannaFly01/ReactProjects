import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import PropTypes from 'prop-types'
import {
  Form,
  Breadcrumb,
  Icon,
  Row,
  Col,
  Input,
  Select,
  Button,
  InputNumber,
  Message
} from 'antd'
import { parse } from 'qs'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import formatString from 'client/utils/formatString'
import router from 'client/router'

import { containerActions } from './actions'
import './sagas'
import './reducer'
import { modelSelector } from './selector'

import styles from './PublicResource.less'

const FormItem = Form.Item
const Option = Select.Option

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

/**
 * @name 公共配套新增/编辑模块
 * @author YJF
 */
class PublicResourceEdit extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    defaultCity: PropTypes.object.isRequired,
    getCommonFacilitiesDetail: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getFacilityType: PropTypes.func.isRequired,
    addCommonFacility: PropTypes.func.isRequired,
    editCommonFacility: PropTypes.func.isRequired,
    getFacilitiesSubTypeCode: PropTypes.func.isRequired,
    clearFacilitiesSubTypeCode: PropTypes.func.isRequired,
    clearCommonFacilitiesDetail: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    const { resourceId = '', cityId = '', cityName } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      resourceId,
      cityId,
      cityName
    }
  }

  componentDidMount() {
    const { resourceId, cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      if (this.cityId) {
        clearInterval(this.cityIdInterval)

        this.props.getFacilityType()

        this.initBMap()

        if (resourceId) {
          const params = {
            cityId: this.cityId,
            id: resourceId
          }
          this.props.getCommonFacilitiesDetail(params, () => {
            this.markMap()
          })
        }
      }
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  componentWillUnmount() {
    // 清除 配套子类数据
    this.props.clearFacilitiesSubTypeCode()
    // 清除详情数据
    this.props.clearCommonFacilitiesDetail()
  }

  // 初始化地图
  initBMap = () => {
    const { cityName = '深圳市' } = this.props.defaultCity
    this.cityName = cityName
    const BMap = window.BMap
    const map = new BMap.Map('map')
    this.map = map
    map.disableDoubleClickZoom()
    // if (!this.props.projectId) {
    map.centerAndZoom(cityName, 15)
    // }
    // 添加带有定位的导航控件
    const navigationControl = new BMap.NavigationControl({
      // 靠左上角位置
      anchor: 'BMAP_ANCHOR_TOP_LEFT',
      // LARGE类型
      type: 'BMAP_NAVIGATION_CONTROL_LARGE',
      // 启用显示定位
      enableGeolocation: false
    })
    map.addControl(navigationControl)

    // 添加定位控件
    const geolocationControl = new BMap.GeolocationControl()
    map.addControl(geolocationControl)

    // 添加地图类型控件
    /* eslint-disable */
    const mapTypeControl = new BMap.MapTypeControl({
      mapTypes: [
        BMAP_NORMAL_MAP,
        BMAP_PERSPECTIVE_MAP,
        BMAP_SATELLITE_MAP,
        BMAP_HYBRID_MAP
      ]
    })
    map.addControl(mapTypeControl)

    // 开启鼠标滚轮缩放
    map.enableScrollWheelZoom(true)

    map.addEventListener('click', e => {
      const { lng, lat } = e.point
      // console.log(lng, lat)
      this.props.form.setFieldsValue({ longitude: lng })
      this.props.form.setFieldsValue({ latitude: lat })

      // 地图标点
      map.clearOverlays()
      const point = new BMap.Point(lng, lat)
      const marker = new BMap.Marker(point)
      map.addOverlay(marker)
    })

    // const { facilityDetail } = this.props.model
    // this.markMap(facilityDetail)
  }

  markMap = (long, lat) => {
    const { facilityDetail } = this.props.model
    const BMap = window.BMap
    const longitude = facilityDetail.get('longitude') || long
    const latitude = facilityDetail.get('latitude') || lat
    this.map.clearOverlays()
    if (longitude && latitude) {
      const point = new BMap.Point(longitude, latitude)
      const marker = new BMap.Marker(point)
      this.map.addOverlay(marker)
      this.map.centerAndZoom(point, 15)
    } else {
      this.map.centerAndZoom(this.cityName, 15)
    }
  }

  handleTypeChange = value => {
    this.props.getFacilitiesSubTypeCode(value)
    // 配套类型变更则重置配套子类
    this.props.form.setFieldsValue({
      facilitiesCode: undefined
    })
  }

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { resourceId } = this.state
        values.cityId = this.cityId
        if (resourceId) {
          values.id = resourceId
          delete values.creator
          delete values.ownership
          this.props.editCommonFacility(values, res => {
            const { code, message } = res
            if (+code === 200) {
              Message.success('编辑成功')
              // this.props.history.goBack() change wy
              this.props.history.push({
                pathname: router.RES_PUBLIC_RESOURCE
              })
            } else {
              Message.error(message)
            }
          })
        } else {
          this.props.addCommonFacility(values, res => {
            const { code, message } = res
            if (+code === 200) {
              // this.props.history.goBack() change wy
              Message.success('新增成功')
              this.props.history.push({
                pathname: router.RES_PUBLIC_RESOURCE
              })
            } else {
              Message.error(message)
            }
          })
        }
      }
    })
  }

  goBack = () => {
    this.props.history.push({
      pathname: router.RES_PUBLIC_RESOURCE
    })
  }

  handleValidateLongtitude = (rule, value, callback) => {
    if (value && value <= 0) {
      callback('经度应大于0')
    }
    callback()
  }

  handleValidateLatitude = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('纬度应大于0')
    }
    callback()
  }

  stripNum = (num, precision = 14) => {
    if (num !== null && num !== undefined) {
      return +parseFloat(num.toPrecision(precision))
    }
  }

  handleLngLatBlur = () => {
    const { longitude, latitude } = this.props.form.getFieldsValue([
      'longitude',
      'latitude'
    ])
    if (longitude > 0 && latitude > 0) {
      this.markMap(longitude, latitude)
    }
  }

  renderBreads() {
    const { resourceId } = this.state
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
        name: '公共配套'
      },
      {
        key: 3,
        path: '',
        name: resourceId ? '公共配套编辑' : '公共配套新增'
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

  renderForm() {
    const { getFieldDecorator } = this.props.form

    const { resourceId } = this.state

    const {
      facilityDetail,
      facilityTypeList,
      facilitySubTypeList
    } = this.props.model

    return (
      <Form style={{ marginTop: 8 }}>
        {resourceId ? (
          <Row>
            <Col span={10}>
              <FormItem {...formItemLayout} label="数据权属">
                {getFieldDecorator('ownership', {
                  initialValue: resourceId
                    ? facilityDetail.get('ownership')
                    : undefined
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="录入人">
                {getFieldDecorator('creator', {
                  initialValue: resourceId
                    ? facilityDetail.get('creator')
                    : undefined
                })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
        ) : null}
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="配套类型">
              {getFieldDecorator('facilitiesTypeCode', {
                rules: [
                  {
                    required: true,
                    message: '请选择配套类型'
                  }
                ],
                onChange: this.handleTypeChange,
                initialValue: resourceId
                  ? formatString(facilityDetail.get('facilitiesTypeCode'))
                  : undefined
              })(
                <Select placeholder="请选择">
                  {facilityTypeList.map(item => (
                    <Option value={item.get('value')} key={item.get('value')}>
                      {item.get('label')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="配套子类">
              {getFieldDecorator('facilitiesCode', {
                rules: [
                  {
                    required: true,
                    message: '请选择配套子类'
                  }
                ],
                initialValue: resourceId
                  ? formatString(facilityDetail.get('facilitiesCode'))
                  : undefined
              })(
                <Select placeholder="请选择">
                  {facilitySubTypeList.map(item => (
                    <Option key={item.get('code')} value={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="配套名称">
              {getFieldDecorator('facilitiesName', {
                rules: [
                  {
                    required: true,
                    message: '请输入配套名称'
                  },
                  {
                    whitespace: true,
                    message: '请输入配套名称'
                  },
                  {
                    max: 1000,
                    message: '最大长度为1000'
                  }
                ],
                initialValue: resourceId
                  ? facilityDetail.get('facilitiesName')
                  : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="配套经度">
              {getFieldDecorator('longitude', {
                rules: [
                  {
                    required: true,
                    message: '请输入配套经度'
                  },
                  {
                    validator: this.handleValidateLongtitude
                  }
                ],
                initialValue: resourceId
                  ? this.stripNum(facilityDetail.get('longitude'))
                  : undefined
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入配套经度"
                  max={180}
                  onBlur={this.handleLngLatBlur}
                  // precision={14}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="配套纬度">
              {getFieldDecorator('latitude', {
                rules: [
                  {
                    required: true,
                    message: '请输入配套纬度'
                  },
                  {
                    validator: this.handleValidateLatitude
                  }
                ],
                initialValue: resourceId
                  ? this.stripNum(facilityDetail.get('latitude'))
                  : undefined
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入配套纬度"
                  max={90}
                  onBlur={this.handleLngLatBlur}
                  // precision={14}
                />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }

  renderMap() {
    return (
      <Row>
        <div
          id="map"
          style={{ width: '100%', height: '360px', marginBottom: 24 }}
        />
      </Row>
    )
  }

  renderBtns() {
    const { resourceId } = this.state
    return (
      <Row>
        {resourceId ? (
          <Fragment>
            {pagePermission('fdc:hd:residence:commonMatch:change') ? (
              <Button type="primary" icon="save" onClick={this.handleSubmit}>
                保存
              </Button>
            ) : (
              ''
            )}
          </Fragment>
        ) : (
          <Fragment>
            {pagePermission('fdc:hd:residence:commonMatch:add') ? (
              <Button type="primary" icon="save" onClick={this.handleSubmit}>
                保存
              </Button>
            ) : (
              ''
            )}
          </Fragment>
        )}

        <Button
          style={{ marginLeft: 16 }}
          // onClick={() => this.props.history.goBack()}
          onClick={this.goBack}
        >
          返回
        </Button>
      </Row>
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderMap()}
          {this.renderBtns()}
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
)(PublicResourceEdit)
