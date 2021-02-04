import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Form, Row, Col, Input, InputNumber } from 'antd'
import Immutable from 'immutable'

import { modelSelector } from './selector'

const FormItem = Form.Item
const { TextArea } = Input

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
* 楼栋新增 / 编辑 楼栋地址
*/
class BuildInfoAddSecond extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    onAddSecondRef: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    buildId: PropTypes.string.isRequired,
    defaultCity: PropTypes.object.isRequired,
    buildStatus: PropTypes.any.isRequired
  }

  constructor(props) {
    super(props)

    props.onAddSecondRef(this)
  }

  componentDidMount() {
    this.initBMap()
  }

  componentWillReceiveProps(nextProps) {
    const oldBuildDetail = this.props.model.get('buildDetail')
    const newBuildDetail = nextProps.model.get('buildDetail')
    if (oldBuildDetail !== newBuildDetail) {
      this.markMap(newBuildDetail)
    }
  }

  // 初始化地图
  initBMap = () => {
    const { cityName = '深圳市' } = this.props.defaultCity
    this.cityName = cityName
    const BMap = window.BMap

    const map = new BMap.Map('map')
    this.map = map
    map.disableDoubleClickZoom()
    if (!this.props.buildId) {
      map.centerAndZoom(cityName, 15)
    }

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
      // 如果是已删除楼栋
      if (this.props.buildStatus) {
        const { lng, lat } = e.point
        this.props.form.setFieldsValue({ longitude: lng })
        this.props.form.setFieldsValue({ latitude: lat })

        // 地图标点
        map.clearOverlays()
        const point = new BMap.Point(lng, lat)
        const marker = new BMap.Marker(point)
        map.addOverlay(marker)
      }
    })

    const buildDetail = this.props.model.get('buildDetail')
    this.markMap(buildDetail)
  }

  markMap = buildDetail => {
    const BMap = window.BMap
    const { longitude, latitude } = buildDetail
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

  submitSecond = () =>
    new Promise((resolve, reject) => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          resolve(values)
        } else {
          /* eslint-disable */
          reject('2')
        }
      })
    })

  handleValidateLongtitude = (rule, value, callback) => {
    // if (value && value <= 0) {
    if (value !== undefined && value !== null && value <= 0) {
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

  handleLngLatBlur = () => {
    const { longitude, latitude } = this.props.form.getFieldsValue([
      'longitude',
      'latitude'
    ])
    if (longitude > 0 && latitude > 0) {
      const data = {
        longitude,
        latitude
      }
      this.markMap(data)
    }
  }

  stripNum = (num, precision = 14) => {
    if (num !== null && num !== undefined) {
      return +parseFloat(num.toPrecision(precision))
    }
  }

  // 楼栋地址
  render() {
    const {
      form: { getFieldDecorator },
      buildId,
      buildStatus
    } = this.props
    const buildDetail = this.props.model.get('buildDetail')
    // console.log(buildDetail.toJS(), 333)

    return (
      <Form>
        <Row>
          <Col span={8}>
            <FormItem label="门牌号(地址)" {...formItemLayout}>
              {getFieldDecorator('roomAddress', {
                rules: [
                  {
                    max: 200,
                    message: '最大长度200'
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('roomAddress')
                  : undefined
              })(
                <TextArea
                  disabled={!buildStatus}
                  // maxLength="200"
                  autosize={{ maxRows: 4 }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="经度" {...formItemLayout}>
              {getFieldDecorator('longitude', {
                rules: [
                  {
                    validator: this.handleValidateLongtitude
                  }
                ],
                initialValue: buildId
                  ? this.stripNum(buildDetail.get('longitude'))
                  : undefined
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  // precision={14}
                  placeholder="请输入经度"
                  max={180}
                  // min={0}
                  onBlur={this.handleLngLatBlur}
                  disabled={!buildStatus}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="纬度" {...formItemLayout}>
              {getFieldDecorator('latitude', {
                rules: [
                  {
                    validator: this.handleValidateLatitude
                  }
                ],
                initialValue: buildId
                  ? this.stripNum(buildDetail.get('latitude'))
                  : undefined
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  // precision={14}
                  placeholder="请输入纬度"
                  max={90}
                  // min={0}
                  onBlur={this.handleLngLatBlur}
                  disabled={!buildStatus}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <div
            id="map"
            style={{ width: '100%', height: '500px', marginBottom: 24 }}
          />
        </Row>
      </Form>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    modelSelector,
    null
  )
)(BuildInfoAddSecond)
