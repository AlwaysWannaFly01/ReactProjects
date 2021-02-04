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
import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ProjectRent.less'

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
class CaseRentDetail extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    fetchCaseAvgDetail: PropTypes.func.isRequired,
    saveCaseAvg: PropTypes.func.isRequired,
    saveCaseAvgHistory: PropTypes.func.isRequired,
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
        this.getCasePriceDetail()
      }
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  getCasePriceDetail = () => {
    const { projectId, useMonth } = this.state
    const params = {
      projectId,
      id: this.avgId,
      cityId: this.cityId,
      useMonth,
      tag: '0'
    }
    this.props.fetchCaseAvgDetail(params, data => {
      const { id } = data
      this.avgId = id
    })
  }

  saveCaseAvg = values => {
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
            pathname: router.RES_PRO_PROJECT_RENT,
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
            pathname: router.RES_PRO_PROJECT_RENT,
            search: `areaIds=${areaIds || ''}&keyword=${keyword ||
              ''}&activeTabs=${compare}&pageNum=${1}`
          })
        } else {
          this.props.history.push({
            pathname: router.RES_PRO_CASE_RENT_HISTORY,
            search: `projectId=${values.projectId}&activeTabs=3&cityId=${cityId}&cityName=${cityName}`
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

  // // 根据案例均价变更，计算涨跌幅
  // hanldeProjectAvgPriceBlur = e => {
  //   // 上个月案例均价
  //   const { avgDetail } = this.props.model
  //   const preProjectAvgPrice = avgDetail.get('preProjectAvgPrice')
  //   // 当前输入的案例均价
  //   const projectAvgPrice = e.target.value

  //   // 如果上个月案例均价没值或为0
  //   if (preProjectAvgPrice > 0) {
  //     if (projectAvgPrice > 0) {
  //       let projectGained = (projectAvgPrice / preProjectAvgPrice - 1) * 100
  //       projectGained = projectGained.toFixed(2)
  //       this.props.form.setFieldsValue({ projectGained })
  //     } else {
  //       this.props.form.setFieldsValue({ projectGained: undefined })
  //     }
  //   } else {
  //     this.props.form.setFieldsValue({ projectGained: undefined })
  //   }
  // }

  //住宅案列租金改变获取住宅案例租金涨跌幅
  houseAvgRentChange = value => {
    if (value == 0 || value == '' || value == '-' || value == undefined) {
      this.props.form.setFieldsValue({ houseAvgRentGained: '' })
    } else {
      const { avgDetail } = this.props.model
      const lastMonthHouseAvgRent = avgDetail.get('lastMonthHouseAvgRent')
      if (lastMonthHouseAvgRent) {
        let houseAvgRentGained = (value / lastMonthHouseAvgRent - 1) * 100
        this.props.form.setFieldsValue({ houseAvgRentGained })
        console.log(lastMonthHouseAvgRent, houseAvgRentGained)
      }
    }
  }

  //住宅案例租金涨跌幅改变获取住宅案列租金
  houseAvgRentGainedChange = value => {
    if (value != '-' && value != '') {
      const { avgDetail } = this.props.model
      const lastMonthHouseAvgRent = avgDetail.get('lastMonthHouseAvgRent')
      if (lastMonthHouseAvgRent) {
        if (!value) {
          value = 0
          let houseAvgRent = lastMonthHouseAvgRent * (1 + value / 100)
          this.props.form.setFieldsValue({ houseAvgRent })
        } else {
          let houseAvgRent = lastMonthHouseAvgRent * (1 + value / 100)
          this.props.form.setFieldsValue({ houseAvgRent })
        }
      }
    } else {
      this.props.form.setFieldsValue({ houseAvgRent: '' })
    }
  }

  //公寓案列租金改变获取公寓案例租金涨跌幅
  apartmentAvgRentChange = value => {
    if (value == 0 || value == '' || value == '-' || value == undefined) {
      this.props.form.setFieldsValue({ houseAvgRentGained: '' })
    } else {
      const { avgDetail } = this.props.model
      const lastMonthApartmentAvgRent = avgDetail.get(
        'lastMonthApartmentAvgRent'
      )
      if (lastMonthApartmentAvgRent) {
        let apartmentAvgRentGained =
          (value / lastMonthApartmentAvgRent - 1) * 100
        this.props.form.setFieldsValue({ apartmentAvgRentGained })
        console.log(lastMonthApartmentAvgRent, apartmentAvgRentGained)
      }
    }
  }

  //公寓案例租金涨跌幅改变获取公寓案列租金
  apartmentRentGainedChange = value => {
    if (value != '-' && value != '') {
      const { avgDetail } = this.props.model
      const lastMonthApartmentAvgRent = avgDetail.get(
        'lastMonthApartmentAvgRent'
      )
      if (lastMonthApartmentAvgRent) {
        if (!value) {
          value = 0
          let apartmentAvgRent = lastMonthApartmentAvgRent * (1 + value / 100)
          this.props.form.setFieldsValue({ apartmentAvgRent })
        } else {
          let apartmentAvgRent = lastMonthApartmentAvgRent * (1 + value / 100)
          this.props.form.setFieldsValue({ apartmentAvgRent })
        }
      }
    } else {
      this.props.form.setFieldsValue({ apartmentAvgRent: '' })
    }
  }

  //商住案列租金改变获取商住案例租金涨跌幅
  occopantAvgRentChange = value => {
    if (value == 0 || value == '' || value == '-' || value == undefined) {
      this.props.form.setFieldsValue({ occopantAvgRentGained: '' })
    } else {
      const { avgDetail } = this.props.model
      const lastMonthOccopantAvgRent = avgDetail.get('lastMonthOccopantAvgRent')
      if (lastMonthOccopantAvgRent) {
        let occopantAvgRentGained = (value / lastMonthOccopantAvgRent - 1) * 100
        this.props.form.setFieldsValue({ occopantAvgRentGained })
        console.log(lastMonthOccopantAvgRent, occopantAvgRentGained)
      }
    }
  }

  //商住案例租金涨跌幅改变获取商住案列租金
  occopantAvgRentGainedChange = value => {
    if (value != '-' && value != '') {
      const { avgDetail } = this.props.model
      const lastMonthOccopantAvgRent = avgDetail.get('lastMonthOccopantAvgRent')
      if (lastMonthOccopantAvgRent) {
        if (!value) {
          value = 0
          let occopantAvgRent = lastMonthOccopantAvgRent * (1 + value / 100)
          this.props.form.setFieldsValue({ occopantAvgRent })
        } else {
          let occopantAvgRent = lastMonthOccopantAvgRent * (1 + value / 100)
          this.props.form.setFieldsValue({ occopantAvgRent })
        }
      }
    } else {
      this.props.form.setFieldsValue({ occopantAvgRent: '' })
    }
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
        path: '',
        name: '案例租金详情'
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
    const { avgDetail } = this.props.model
    console.log(avgDetail.toJS())
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
            <FormItem {...formItemLayout} label="住宅案例租金(元/月/㎡)">
              {getFieldDecorator('houseAvgRent', {
                initialValue: avgDetail.get('houseAvgRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  onChange={this.houseAvgRentChange.bind(this)}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="涨跌幅(%)">
              {getFieldDecorator('houseAvgRentGained', {
                initialValue: avgDetail.get('houseAvgRentGained')
              })(
                <InputNumber
                  min={-99}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  step={0.01}
                  precision={2}
                  onChange={this.houseAvgRentGainedChange.bind(this)}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅多层案例租金(元/月/㎡)">
              {getFieldDecorator('houseMultiLayerAvgRent', {
                initialValue: avgDetail.get('houseMultiLayerAvgRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅小高层案例租金(元/月/㎡)">
              {getFieldDecorator('houseSmallHighLayerAvgRent', {
                initialValue: avgDetail.get('houseSmallHighLayerAvgRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅高层案例租金(元/月/㎡)">
              {getFieldDecorator('houseHighLayerAvgRent', {
                initialValue: avgDetail.get('houseHighLayerAvgRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="住宅超高层案例租金(元/月/㎡)">
              {getFieldDecorator('houseSuperHighLayerAvgRent', {
                initialValue: avgDetail.get('houseSuperHighLayerAvgRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓案例租金(元/月/㎡)">
              {getFieldDecorator('apartmentAvgRent', {
                initialValue: avgDetail.get('apartmentAvgRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  onChange={this.apartmentAvgRentChange.bind(this)}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="涨跌幅(%)">
              {getFieldDecorator('apartmentAvgRentGained', {
                initialValue: avgDetail.get('apartmentAvgRentGained')
              })(
                <InputNumber
                  min={-99}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  step={0.01}
                  precision={2}
                  onChange={this.apartmentRentGainedChange.bind(this)}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓多层案例租金(元/月/㎡)">
              {getFieldDecorator('apartmentMultiLayerAvgRent', {
                initialValue: avgDetail.get('apartmentMultiLayerAvgRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓小高层案例租金(元/月/㎡)">
              {getFieldDecorator('apartmentSmallHighLayerAvgRent', {
                initialValue: avgDetail.get('apartmentSmallHighLayerAvgRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓高层案例租金(元/月/㎡)">
              {getFieldDecorator('apartmentHighLayerAvgRent', {
                initialValue: avgDetail.get('apartmentHighLayerAvgRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="公寓超高层案例租金(元/月/㎡)">
              {getFieldDecorator('apartmentSuperHighLayerAvgRent', {
                initialValue: avgDetail.get('apartmentSuperHighLayerAvgRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住案例租金(元/月/㎡)">
              {getFieldDecorator('occopantAvgRent', {
                initialValue: avgDetail.get('occopantAvgRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  onChange={this.occopantAvgRentChange.bind(this)}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="涨跌幅(%)">
              {getFieldDecorator('occopantAvgRentGained', {
                initialValue: avgDetail.get('occopantAvgRentGained')
              })(
                <InputNumber
                  min={-99}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                  step={0.01}
                  precision={2}
                  onChange={this.occopantAvgRentGainedChange.bind(this)}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住多层案例租金(元/月/㎡)">
              {getFieldDecorator('occopantMultiLayerAvgRent', {
                initialValue: avgDetail.get('occopantMultiLayerAvgRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住小高层案例租金(元/月/㎡)">
              {getFieldDecorator('occopantSmallHighLayerAvgRent', {
                initialValue: avgDetail.get('occopantSmallHighLayerAvgRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住高层案例租金(元/月/㎡)">
              {getFieldDecorator('occopantHighLayerAvgRent', {
                initialValue: avgDetail.get('occopantHighLayerAvgRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="商住超高层案例租金(元/月/㎡)">
              {getFieldDecorator('occopantSuperHighLayerAvgRent', {
                initialValue: avgDetail.get('occopantSuperHighLayerAvgRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="别墅（元/月/㎡）">
              {getFieldDecorator('villaRent', {
                initialValue: avgDetail.get('villaRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="联排别墅（元/月/㎡）">
              {getFieldDecorator('platoonVillaRent', {
                initialValue: avgDetail.get('platoonVillaRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="独幢别墅（元/月/㎡）">
              {getFieldDecorator('singleVillaRent', {
                initialValue: avgDetail.get('singleVillaRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="叠加别墅（元/月/㎡）">
              {getFieldDecorator('superpositionVillaRent', {
                initialValue: avgDetail.get('superpositionVillaRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="双拼别墅（元/月/㎡）">
              {getFieldDecorator('duplexesVillaRent', {
                initialValue: avgDetail.get('duplexesVillaRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row className={styles.btnCont}>
          <Col span={10}>
            {pagePermission('fdc:hd:residence:saleRent:change') ? (
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
)(CaseRentDetail)
