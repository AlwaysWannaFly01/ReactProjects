import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Immutable from 'immutable'
import {
  Form,
  Breadcrumb,
  Icon,
  Row,
  Col,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Message
} from 'antd'
import { parse } from 'qs'
import moment from 'moment'
import { pagePermission } from 'client/utils'
import formatString from 'client/utils/formatString'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './CaseInfo.less'

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
 * @name 长租公寓-案例数据新增/编辑
 * @author YJF
 */
class CaseInfoEdit extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getAreaList: PropTypes.func.isRequired,
    initialFetch: PropTypes.func.isRequired,
    addRentApartCase: PropTypes.func.isRequired,
    getCaseDetail: PropTypes.func.isRequired,
    editRentApartCase: PropTypes.func.isRequired,
    clearCaseDetail: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    const { caseId = '', cityId = '', cityName } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      caseId,
      cityId,
      cityName
    }
  }

  componentDidMount() {
    const { caseId, cityId, cityName } = this.state
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
        // 获取字典表数据
        this.props.initialFetch()

        // 获取行政区数据
        this.props.getAreaList(this.cityId)

        if (caseId) {
          this.props.getCaseDetail(caseId, this.cityId)
        }
      }
    }, 100)
  }

  componentWillUnmount() {
    this.props.form.resetFields()
    this.props.clearCaseDetail()
  }

  handleSubmit = e => {
    if (e) {
      e.preventDefault()
    }
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { caseId } = this.state
        const params = Object.assign({}, values)
        params.cityId = this.cityId
        params.caseHappenDate = params.caseHappenDate.format('YYYY-MM-DD')

        if (params.projectLatLng) {
          const [longitude, latitude] = params.projectLatLng
            .replace(/，/gi, ',')
            .split(',')
          params.longitude = longitude
          params.latitude = latitude
        }
        delete params.projectLatLng

        if (caseId) {
          params.id = caseId
          delete params.ownership
          delete params.creator

          this.props.editRentApartCase(params, res => {
            const { code, message } = res
            if (+code === 200) {
              Message.success('编辑成功')
              this.props.history.goBack()
            } else {
              Message.error(message)
            }
          })
        } else {
          this.props.addRentApartCase(params, res => {
            const { code, message } = res
            if (+code === 200) {
              this.props.history.goBack()
              Message.success('新增成功')
            } else {
              Message.success(message)
            }
          })
        }
      }
    })
  }

  /* eslint-disable */
  handleValidateProjectLatLng = (_, value, callback) => {
    if (value) {
      let projectLatLng = value.replace(/，/gi, ',')
      projectLatLng = projectLatLng.split(',')
      const longitude = projectLatLng[0] || ''
      const latitude = projectLatLng[1] || ''

      var reg = /^[0-9]+([.]{1}[0-9]+){0,1}$/
      if (longitude !== '') {
        if (!reg.test(longitude)) {
          callback('经度必须为正整数')
        }
        if (longitude <= 0) {
          callback('经度应大于0')
        }
        if (longitude > 180) {
          callback('经度应小于等于180')
        }
      }

      if (latitude !== '') {
        if (!reg.test(latitude)) {
          callback('纬度必须为正整数')
        }
        if (latitude <= 0) {
          callback('纬度应大于0')
        }
        if (latitude > 180) {
          callback('纬度应小于等于180')
        }
      }
    }
    callback()
  }

  stripNum = (num, precision = 14) => {
    if (num !== null && num !== undefined) {
      return +parseFloat(num.toPrecision(precision))
    }
  }

  renderBreads() {
    const { caseId } = this.state

    const breadList = [
      {
        key: 1,
        path: '',
        name: '长租公寓',
        icon: 'appstore'
      },
      {
        key: 2,
        path: '',
        name: '案例数据'
      },
      {
        key: 3,
        path: '',
        name: caseId ? '案例编辑' : '案例新增'
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
    const { caseId } = this.state

    const { getFieldDecorator } = this.props.form

    // 行政区列表
    const {
      areaList,
      buildingTypes,
      houseTypes,
      orientationTypes,
      payTypes,
      rentTypes,

      caseDetail
    } = this.props.model

    let projectLatLng
    // 经度
    let longitude = caseDetail.get('longitude')
    // 纬度
    let latitude = caseDetail.get('latitude')
    if (longitude) {
      longitude = this.stripNum(longitude)
      projectLatLng = `${longitude}`
    }
    if (latitude) {
      latitude = this.stripNum(latitude)
      if (longitude) {
        longitude = this.stripNum(longitude)
        projectLatLng = `${longitude},${latitude}`
      } else {
        projectLatLng = `,${latitude}`
      }
    }

    return (
      <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }}>
        {caseId ? (
          <Row>
            <Col span={10}>
              <FormItem {...formItemLayout} label="数据权属">
                {getFieldDecorator('ownership', {
                  initialValue: caseId ? caseDetail.get('ownership') : undefined
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="录入人">
                {getFieldDecorator('creator', {
                  initialValue: caseId ? caseDetail.get('creator') : undefined
                })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
        ) : null}
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="行政区">
              {getFieldDecorator('areaId', {
                rules: [
                  {
                    required: true,
                    message: '请选择行政区'
                  }
                ],
                initialValue: caseId
                  ? formatString(caseDetail.get('areaId'))
                  : undefined
              })(
                <Select placeholder="请选择">
                  {areaList.map(item => (
                    <Option value={item.get('value')} key={item.get('value')}>
                      {item.get('label')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="项目坐标">
              {getFieldDecorator('projectLatLng', {
                rules: [
                  {
                    validator: this.handleValidateProjectLatLng
                  }
                ],
                initialValue: projectLatLng
              })(<Input placeholder="请输入经度，纬度(以,隔开)" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="项目名称">
              {getFieldDecorator('projectName', {
                rules: [
                  {
                    required: true,
                    message: '请输入项目名称'
                  },
                  {
                    whitespace: true,
                    message: '请输入项目名称'
                  },
                  {
                    max: 100,
                    message: '最大长度100'
                  }
                ],
                initialValue: caseId ? caseDetail.get('projectName') : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="项目地址">
              {getFieldDecorator('address', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入地址'
                  },
                  {
                    max: 200,
                    message: '最大长度200'
                  }
                ],
                initialValue: caseId ? caseDetail.get('address') : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="租金范围">
              {getFieldDecorator('rentRange', {
                rules: [
                  {
                    required: true,
                    message: '请输入租金范围'
                  },
                  {
                    whitespace: true,
                    message: '请输入租金范围'
                  },
                  {
                    max: 50,
                    message: '最大长度50'
                  }
                ],
                initialValue: caseId ? caseDetail.get('rentRange') : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="楼栋名称">
              {getFieldDecorator('buildingName', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入'
                  },
                  {
                    max: 50,
                    message: '最大长度50'
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('buildingName')
                  : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="建筑面积范围">
              {getFieldDecorator('houseAreaRange', {
                rules: [
                  {
                    required: true,
                    message: '请输入建筑面积范围'
                  },
                  {
                    whitespace: true,
                    message: '请输入建筑面积范围'
                  },
                  {
                    max: 50,
                    message: '最大长度50'
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('houseAreaRange')
                  : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="房号名称">
              {getFieldDecorator('houseName', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入房号名称'
                  },
                  {
                    max: 50,
                    message: '最大长度50'
                  }
                ],
                initialValue: caseId ? caseDetail.get('houseName') : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="案例日期">
              {getFieldDecorator('caseHappenDate', {
                rules: [
                  {
                    required: true,
                    message: '请选择案例日期'
                  }
                ],
                initialValue: caseId
                  ? moment(caseDetail.get('caseHappenDate'))
                  : undefined
              })(<DatePicker placeholder="请选择" style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="出租方式">
              {getFieldDecorator('rentTypeCode', {
                initialValue: caseId
                  ? formatString(caseDetail.get('rentTypeCode'))
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {rentTypes.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="押付方式">
              {getFieldDecorator('payTypeCode', {
                initialValue: caseId
                  ? formatString(caseDetail.get('payTypeCode'))
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {payTypes.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="楼层范围">
              {getFieldDecorator('floorRange', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入楼层范围'
                  },
                  {
                    max: 50,
                    message: '最大长度50'
                  }
                ],
                initialValue: caseId ? caseDetail.get('floorRange') : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="楼栋地上总层数">
              {getFieldDecorator('totalFloorNum', {
                initialValue: caseId
                  ? caseDetail.get('totalFloorNum')
                  : undefined
              })(
                <InputNumber
                  placeholder="请输入"
                  min={1}
                  style={{ width: '100%' }}
                  precision={0}
                  max={2147483647}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="朝向">
              {getFieldDecorator('orientationCode', {
                initialValue: caseId
                  ? formatString(caseDetail.get('orientationCode'))
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {orientationTypes.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="建筑类型">
              {getFieldDecorator('buildingTypeCode', {
                initialValue: caseId
                  ? formatString(caseDetail.get('buildingTypeCode'))
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {buildingTypes.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="户型种类">
              {getFieldDecorator('houseTypeCategory', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入户型种类'
                  },
                  {
                    max: 50,
                    message: '最大长度50'
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('houseTypeCategory')
                  : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="户型">
              {getFieldDecorator('houseTypeCode', {
                initialValue: caseId
                  ? formatString(caseDetail.get('houseTypeCode'))
                  : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  allowClear
                >
                  {houseTypes.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="建筑年代">
              {getFieldDecorator('buildDate', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入建筑年代'
                  },
                  {
                    max: 20,
                    message: '最大长度20'
                  }
                ],
                initialValue: caseId ? caseDetail.get('buildDate') : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="装修风格">
              {getFieldDecorator('decorationStyle', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入装修风格'
                  },
                  {
                    max: 20,
                    message: '最大长度20'
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('decorationStyle')
                  : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="最短租期">
              {getFieldDecorator('shortestTenancy', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入最短租期'
                  },
                  {
                    max: 20,
                    message: '最大长度20'
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('shortestTenancy')
                  : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="交租时间">
              {getFieldDecorator('taxesDate', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入交租时间'
                  },
                  {
                    max: 20,
                    message: '最大长度20'
                  }
                ],
                initialValue: caseId ? caseDetail.get('taxesDate') : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="交付标准">
              {getFieldDecorator('deliveryStandard', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入交租时间'
                  },
                  {
                    max: 20,
                    message: '最大长度20'
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('deliveryStandard')
                  : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="房客要求">
              {getFieldDecorator('tenantDemand', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入房客要求'
                  },
                  {
                    max: 20,
                    message: '最大长度20'
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('tenantDemand')
                  : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="最多同住人数">
              {getFieldDecorator('maxTenantNum', {
                initialValue: caseId
                  ? caseDetail.get('maxTenantNum')
                  : undefined
              })(
                <InputNumber
                  placeholder="请输入"
                  max={2147483647}
                  min={1}
                  style={{ width: '100%' }}
                  precision={0}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="是否接待境外人士">
              {getFieldDecorator('isRentForeigner', {
                initialValue: caseId
                  ? formatString(caseDetail.get('isRentForeigner'))
                  : undefined
              })(
                <Select placeholder="请选择" allowClear>
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓配套">
              {getFieldDecorator('apartmentFacilities', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入公寓配套'
                  },
                  {
                    max: 100,
                    message: '最大长度100'
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('apartmentFacilities')
                  : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="房屋特色">
              {getFieldDecorator('houseFeature', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入房屋特色'
                  },
                  {
                    max: 200,
                    message: '最大长度200'
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('houseFeature')
                  : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓特色">
              {getFieldDecorator('apartmentFeature', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入公寓特色'
                  },
                  {
                    max: 500,
                    message: '最大长度500'
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('apartmentFeature')
                  : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="特色服务">
              {getFieldDecorator('serviceFeature', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入特色服务'
                  },
                  {
                    max: 100,
                    message: '最大长度100'
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('serviceFeature')
                  : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="租户公约">
              {getFieldDecorator('tenantTreaty', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入租户公约'
                  },
                  {
                    max: 500,
                    message: '最大长度500'
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('tenantTreaty')
                  : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="交通情况">
              {getFieldDecorator('trafficCondition', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入交通情况'
                  },
                  {
                    max: 100,
                    message: '最大长度100'
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('trafficCondition')
                  : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="周边配套">
              {getFieldDecorator('circumFacilities', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入周边配套'
                  },
                  {
                    max: 500,
                    message: '最大长度500'
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('circumFacilities')
                  : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="房间描述">
              {getFieldDecorator('houseDescription', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入房间描述'
                  },
                  {
                    max: 100,
                    message: '最大长度100'
                  }
                ],
                initialValue: caseId
                  ? caseDetail.get('houseDescription')
                  : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="房间标签">
              {getFieldDecorator('houseTag', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入房间标签'
                  },
                  {
                    max: 100,
                    message: '最大长度100'
                  }
                ],
                initialValue: caseId ? caseDetail.get('houseTag') : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="案例来源">
              {getFieldDecorator('dataSource', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入案例来源'
                  },
                  {
                    max: 100,
                    message: '最大长度100'
                  }
                ],
                initialValue: caseId ? caseDetail.get('dataSource') : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="案例链接">
              {getFieldDecorator('sourceLink', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入案例链接'
                  },
                  {
                    max: 200,
                    message: '最大长度200'
                  }
                ],
                initialValue: caseId ? caseDetail.get('sourceLink') : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row style={{ marginBottom: 16 }}>
          <Col span={10}>
            <FormItem {...formItemLayout} label="来源电话">
              {getFieldDecorator('sourcePhone', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入来源电话'
                  },
                  {
                    max: 50,
                    message: '最大长度50'
                  }
                ],
                initialValue: caseId ? caseDetail.get('sourcePhone') : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="备注">
              {getFieldDecorator('remark', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入备注'
                  },
                  {
                    max: 255,
                    message: '最大长度255'
                  }
                ],
                initialValue: caseId ? caseDetail.get('remark') : undefined
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row className={styles.btnCont}>
          {caseId ? (
            <Fragment>
              {pagePermission('fdc:hd:longRental:caseData:change') ? (
                <Button type="primary" htmlType="submit" icon="save">
                  保存
                </Button>
              ) : (
                ''
              )}
            </Fragment>
          ) : (
            <Fragment>
              {pagePermission('fdc:hd:longRental:caseData:add') ? (
                <Button type="primary" htmlType="submit" icon="save">
                  保存
                </Button>
              ) : (
                ''
              )}
            </Fragment>
          )}
        </Row>
      </Form>
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>{this.renderForm()}</div>
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
)(CaseInfoEdit)
