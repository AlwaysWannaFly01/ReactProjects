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
import { pagePermission } from 'client/utils'
import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ProjectRent.less'

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
class CaseRentAdd extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    addCaseRent: PropTypes.func.isRequired,
    // getLastMonthCasePrice: PropTypes.func.isRequired,
    getMonthToDetail: PropTypes.func.isRequired, // 根据月份获取案例均价详情 WY
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

  componentDidMount() {
    const { cityId, cityName, projectId } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
        if (projectId) {
          // this.props.getProjectDetail(projectId, this.cityId)
          //this.props.getAllDetail(projectId, this.cityId)
        }
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
        useMonth: moment(date).format('YYYY-MM-01'),
        tag: '0'
      }
      this.props.getMonthToCase(params)
    }
  }

  //住宅案列租金改变获取住宅案例租金涨跌幅
  houseAvgRentChange = value => {
    if (value == 0 || value == '' || value == '-' || value == undefined) {
      this.props.form.setFieldsValue({ houseAvgRentGained: '' })
    } else {
      const { monthToCase } = this.props.model
      const lastMonthHouseAvgRent = monthToCase.get('lastMonthHouseAvgRent')
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
      const { monthToCase } = this.props.model
      const lastMonthHouseAvgRent = monthToCase.get('lastMonthHouseAvgRent')
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
  apartmentRentChange = value => {
    if (value == 0 || value == '' || value == '-' || value == undefined) {
      this.props.form.setFieldsValue({ apartmentAvgRentGained: '' })
    } else {
      const { monthToCase } = this.props.model
      const lastMonthApartmentAvgRent = monthToCase.get(
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
      const { monthToCase } = this.props.model
      const lastMonthApartmentAvgRent = monthToCase.get(
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
      const { monthToCase } = this.props.model
      const lastMonthOccopantAvgRent = monthToCase.get(
        'lastMonthOccopantAvgRent'
      )
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
      const { monthToCase } = this.props.model
      const lastMonthOccopantAvgRent = monthToCase.get(
        'lastMonthOccopantAvgRent'
      )
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

        this.props.addCaseRent(values, result => {
          const { code, message } = result
          if (+code === 200) {
            Message.success('新增成功')
            // this.props.history.goBack()
            this.props.history.push({
              pathname: router.RES_PRO_CASE_RENT_HISTORY,
              search: `projectId=${values.projectId}&activeTabs=3&cityId=${this.state.cityId}&cityName=${this.state.cityName}`
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
        name: '案例租金新增'
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
    const { monthToCase } = this.props.model
    return (
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              当前楼盘&nbsp;
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {monthToCase.get('areaName')} | {monthToCase.get('projectName')}
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
    const { monthToCase } = this.props.model

    if (!monthToCase) {
      return ''
    }

    // console.log(this.props.monthToDetail)
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
            <FormItem {...formItemLayout} label="住宅案例租金(元/月/㎡)">
              {getFieldDecorator('houseAvgRent', {
                initialValue: monthToCase.get('houseAvgRent')
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
                initialValue: monthToCase.get('houseAvgRentGained')
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
                initialValue: monthToCase.get('houseMultiLayerAvgRent')
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
                initialValue: monthToCase.get('houseSmallHighLayerAvgRent')
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
                initialValue: monthToCase.get('houseHighLayerAvgRent')
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
                initialValue: monthToCase.get('houseSuperHighLayerAvgRent')
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
                initialValue: monthToCase.get('apartmentAvgRent')
              })(
                <InputNumber
                  max={1000000000}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  onChange={this.apartmentRentChange.bind(this)}
                />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="涨跌幅(%)">
              {getFieldDecorator('apartmentAvgRentGained', {
                initialValue: monthToCase.get('apartmentAvgRentGained')
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
                initialValue: monthToCase.get('apartmentMultiLayerAvgRent')
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
                initialValue: monthToCase.get('apartmentSmallHighLayerAvgRent')
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
                initialValue: monthToCase.get('apartmentHighLayerAvgRent')
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
                initialValue: monthToCase.get('apartmentSuperHighLayerAvgRent')
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
                initialValue: monthToCase.get('occopantAvgRent')
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
                initialValue: monthToCase.get('occopantAvgRentGained')
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
                initialValue: monthToCase.get('occopantMultiLayerAvgRent')
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
                initialValue: monthToCase.get('occopantSmallHighLayerAvgRent')
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
                initialValue: monthToCase.get('occopantHighLayerAvgRent')
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
                initialValue: monthToCase.get('occopantSuperHighLayerAvgRent')
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
                initialValue: monthToCase.get('villaRent')
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
                initialValue: monthToCase.get('platoonVillaRent')
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
                initialValue: monthToCase.get('singleVillaRent')
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
                initialValue: monthToCase.get('superpositionVillaRent')
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
                initialValue: monthToCase.get('duplexesVillaRent')
              })(
                <InputNumber
                  min={0}
                  precision={2}
                  max={1000000000}
                  placeholder="请输入"
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem label=" " colon={false} {...formItemLayout}>
              {pagePermission('fdc:hd:residence:saleRent:add') ? (
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
)(CaseRentAdd)
