import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import moment from 'moment'
import Immutable from 'immutable'
import {
  Form,
  Row,
  Col,
  Checkbox,
  DatePicker,
  Input,
  Button,
  Tabs,
  Breadcrumb,
  Icon,
  Spin,
  Modal,
  message, Message
} from 'antd'
import { Link } from 'react-router-dom'
import { parse } from 'qs'
import { pagePermission } from 'client/utils'
import router from 'client/router'
import layout from 'client/utils/layout'
import shallowEqual from 'client/utils/shallowEqual'

import ProjectRentCompare from './ProjectRent.compare'
import ProjectRentBase from './ProjectRent.base'
import ProjectRentCase from './ProjectRent.case'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ProjectRent.less'

const FormItem = Form.Item
const TabPane = Tabs.TabPane
const CheckboxGroup = Checkbox.Group
const { MonthPicker } = DatePicker
const confirm = Modal.confirm

/*
 * 楼盘均价 模块
 * author: YJF 2018-08-01
 */
class ProjectRent extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    fetchAreaDict: PropTypes.func.isRequired,
    fetchCompareData: PropTypes.func.isRequired,
    fetchBaseData: PropTypes.func.isRequired,
    fetchCaseData: PropTypes.func.isRequired,
    exportHouseCaseAvg: PropTypes.func.isRequired,
    getRentRateCorrection: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)

    /* eslint-disable */
    const {
      areaIds = '',
      activeTabs = '1',
      keyword,
      pageNum = 1,
      cityId,
      cityName
    } = parse(props.location.search.substr(1))

    this.state = {
      // 选中的行政区范围 id数组
      checkedRegionList: areaIds ? areaIds.split(',') : [],
      checkedAllRegion: false,
      indeterminateRegion: true,
      correctionModalVisible: false,
      submitBtnLoading: false,
      rentRateCorrectionValue: null,
      // 激活的tab
      activeTabs,
      keyword,
      pageNum,
      cityId,
      cityName
    }
    // 传递给列表使用，用于查询基准房价详情
    this.useMonth = null
  }

  componentDidMount() {
    const { cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
      this.cityName =
        JSON.parse(sessionStorage.getItem('FDC_CITY_INFO')).cityName || cityName
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
        // 获取行政区列表
        this.props.fetchAreaDict(this.cityId)
        // 设置默认估价月份
        this.setDefaultUserMonth()
        // 默认查询看对比Tab
        this.handleSearch(null, this.state.pageNum)
      }
    }, 100)
  }

  componentWillReceiveProps(nextProps) {
    // 点击菜单栏，初始化查询条件
    if (
      nextProps.location.search === '' &&
      !shallowEqual(this.props.location, nextProps.location)
    ) {
      this.setState(
        {
          checkedRegionList: [],
          keyword: '',
          activeTabs: '1'
        },
        () => {
          const params = {
            cityId: this.cityId,
            pageNum: 1,
            pageSize: 20,
            useMonth: this.userMonth.format('YYYY-MM-DD HH:mm:ss')
          }
          this.props.form.setFieldsValue({
            useMonth: this.userMonth,
            keyword: ''
          })
          this.props.fetchCompareData(params)
        }
      )
    }
  }

  onCheckAllRegionChange = e => {
    const regionOptions = this.props.model.get('areaList').toJS()
    const regionOptionsValue = []
    regionOptions.forEach(item => {
      regionOptionsValue.push(item.value)
    })
    this.setState({
      checkedRegionList: e.target.checked ? regionOptionsValue : [],
      indeterminateRegion: false,
      checkedAllRegion: e.target.checked
    })
  }

  onCheckRegionChange = checkedList => {
    const regionOptions = this.props.model.get('areaList').toJS()
    this.setState({
      checkedRegionList: checkedList,
      indeterminateRegion:
        !!checkedList.length && checkedList.length < regionOptions.length,
      checkedAllRegion: checkedList.length === regionOptions.length
    })
  }

  setDefaultUserMonth = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    this.userMonth = moment(new Date(`${year}-${month}-01`))
    this.useMonth = `${year}-${month}-01`
  }

  disabledDate = current => {
    // Can not select days before today and today
    return current > moment().endOf('day')
  }

  // 导出
  exportData = () => {
    const { userMonth, keyword } = this.props.form.getFieldsValue([
      'userMonth',
      'keyword'
    ])
    const params = {
      cityId: this.cityId,
      areaIds: this.state.checkedRegionList.join(','),
      useMonth: moment(userMonth).format('YYYY-MM-DD HH:mm:ss'),
      keyWord: !!keyword ? keyword.trim() : ''
    }
    console.log(params)
    const that = this
    this.props.exportHouseCaseAvg(params, () => {
      confirm({
        title: '导出提示',
        content: (
          <div>
            <p>系统正在导出Excel,请耐心等待...</p>
            <p>
              <Icon type="info-circle" />
              <i style={{ marginLeft: 8 }} />
              可跳转导出任务页查看
            </p>
          </div>
        ),
        okText: '跳转',
        onOk() {
          that.goExportTask()
        },
        onCancel() {}
      })
    })
  }

  goExportTask = () => {
    if (pagePermission('fdc:hd:export:check')) {
      this.props.history.push({
        pathname: router.RES_EXPORT_TASK,
        search: 'type=1'
      })
    } else {
      message.warning('没有导出任务页权限，请联系管理员')
    }
  }

  // Tab切换事件
  handleChangeTabs = key => {
    this.setState(
      {
        activeTabs: key
      },
      () => {
        this.handleSearch(null, 1)
      }
    )
  }

  // table查询
  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    const { checkedRegionList, activeTabs } = this.state
    const { userMonth, keyword = '' } = this.props.form.getFieldsValue([
      'userMonth',
      'keyword'
    ])
    const params = {
      cityId: this.cityId,
      areaIds: checkedRegionList.join(','),
      pageNum,
      pageSize: 20,
      useMonth: moment(userMonth).format('YYYY-MM-DD HH:mm:ss'),
      keyWord: keyword ? keyword.trim() : ''
    }
    this.useMonth = moment(userMonth).format('YYYY-MM-DD')
    switch (activeTabs) {
      case '1':
        this.props.fetchCompareData(params,res=>{
          if(res.code==='400'){
            Message.error(res.message)
          }
        })
        break
      case '2':
        this.props.fetchBaseData(params)
        break
      case '3':
        this.props.fetchCaseData(params)
        break
      default:
        break
    }
    // 保存查询条件
    // 行政区&关键字&激活的tab
    const areaIds = checkedRegionList.join(',')
    this.context.router.history.push({
      pathname: this.props.location.pathname,
      search: `areaIds=${areaIds}&keyword=${keyword}&activeTabs=${activeTabs}&pageNum=${pageNum}`
    })
  }
  //填充修正值
  paddingCorrection = () => {
    this.props.getRentRateCorrection({ cityId: this.cityId }, result => {
      const { code, data } = result
      if (+code === 200) {
        this.setState({
          correctionModalVisible: true,
          rentRateCorrectionValue: data
        })
      }
      this.props.form.setFieldsValue({ rentRateCorrectionValue: data })
    })
  }
  paddingCorrectionSubmit = () => {
    if (!this.state.rentRateCorrectionValue) {
      return
    }
    if (
      !/^(0(\.\d{1,2})|(\.0{1,2})?)$/.test(this.state.rentRateCorrectionValue)
    ) {
      return
    }
    this.props.setRentRateCorrection(
      {
        cityId: this.cityId,
        rentRateCorrection: this.state.rentRateCorrectionValue
      },
      result => {
        const { code, data } = result
        if (+code === 200) {
          this.setState({
            correctionModalVisible: false
          })
          message.success('编辑成功')
        }
      }
    )
  }
  paddingCorrectionCloseModal = () => {
    this.setState({
      correctionModalVisible: false
    })
  }
  correctionInput = e => {
    this.setState({
      rentRateCorrectionValue: e.target.value
    })
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
        name: '楼盘租金'
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

    const {
      checkedRegionList,
      checkedAllRegion,
      indeterminateRegion,
      keyword
    } = this.state

    // 行政区列表
    const areaList = this.props.model.get('areaList').toJS()

    return (
      <Form>
        <Row>
          <FormItem
            label="行政区"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
          >
            <Checkbox
              indeterminate={indeterminateRegion}
              checked={checkedAllRegion}
              onChange={this.onCheckAllRegionChange}
            >
              全部
            </Checkbox>
            <CheckboxGroup
              options={areaList}
              value={checkedRegionList}
              onChange={this.onCheckRegionChange}
            />
          </FormItem>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem
              label="月份"
              labelCol={layout(6, 8)}
              wrapperCol={layout(6, 16)}
            >
              {getFieldDecorator('userMonth', {
                initialValue: this.userMonth
              })(
                <MonthPicker
                  monthCellContentRender={date => (
                    <span>{date.format('MM')}</span>
                  )}
                  disabledDate={this.disabledDate}
                  allowClear={false}
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label="关键字"
              labelCol={layout(6, 6)}
              wrapperCol={layout(6, 18)}
            >
              {getFieldDecorator('keyword', {
                initialValue: keyword
              })(<Input placeholder="请输入关键字" maxLength={100} />)}
            </FormItem>
          </Col>
          <Col span={2}>
            <Button
              style={{ marginLeft: 16, marginTop: 4 }}
              type="primary"
              onClick={e => this.handleSearch(e, 1)}
              icon="search"
            >
              查询
            </Button>
          </Col>
        </Row>
        <Row style={{ marginBottom: 16 }}>
          <Link
            to={{
              pathname: router.RES_PRORENT_IMPORT,
              search: `importType=${1212119}&cityId=${this.cityId}&cityName=${
                this.cityName
              }`
            }}
          >
            {pagePermission('fdc:hd:residence:saleRent:import') ? (
              // {pagePermission('fdc:hd:residence:saleRent:import') ? (
              <Button
                type="primary"
                onClick={this.toImport}
                icon="upload"
                style={{ marginRight: 16 }}
              >
                导入
              </Button>
            ) : (
              ''
            )}
          </Link>
          {pagePermission('fdc:hd:residence:saleRent:export') ? (
            // {pagePermission('fdc:hd:residence:saleRent:export') ? (
            <Button
              onClick={this.exportData}
              type="primary"
              icon="download"
              style={{ marginRight: 16 }}
            >
              导出
            </Button>
          ) : (
            ''
          )}
          <Link
            to={{
              pathname: router.RES_PRORENT_RENTAL,
              search: `importType=${1212129}&cityId=${this.cityId}&cityName=${
                this.cityName
              }`
            }}
          >
            {pagePermission('fdc:hd:residence:rentalRatio') ? (
              <Button style={{ marginRight: 16 }}>楼盘租售比</Button>
            ) : (
              ''
            )}
          </Link>

          <span>
            {pagePermission('fdc:hd:residence:saleRent:rentRateCorrection') ? (
              <Button
                style={{ marginRight: 16 }}
                onClick={this.paddingCorrection}
              >
                填充修正值
              </Button>
            ) : (
              ''
            )}
          </span>
          <Modal
            title="修改填充修正值"
            visible={this.state.correctionModalVisible}
            onOk={this.paddingCorrectionSubmit}
            onCancel={this.paddingCorrectionCloseModal}
            confirmLoading={this.state.submitBtnLoading}
            maskClosable={false}
          >
            <Form>
              <FormItem
                label="城市"
                labelCol={layout(6, 6)}
                wrapperCol={layout(18, 16)}
              >
                {getFieldDecorator('cityName', {})(<div>{this.cityName}</div>)}
              </FormItem>

              <FormItem
                label="填充修正值"
                labelCol={layout(6, 6)}
                wrapperCol={layout(18, 16)}
              >
                {getFieldDecorator('rentRateCorrectionValue', {
                  initialValue: this.state.rentRateCorrectionValue,
                  rules: [
                    {
                      required: true,
                      message: '填充修正值不能为空!'
                    },
                    {
                      pattern: new RegExp(/^(0(\.\d{1,2})|(\.0{1,2})?)$/, 'g'),
                      message: '请填写（0，1）之间的数值，最多两位小数'
                    }
                  ]
                })(
                  <Input
                    type="text"
                    placeholder="请输入填充修正值"
                    onChange={this.correctionInput}
                  />
                )}
              </FormItem>
            </Form>
          </Modal>
        </Row>
      </Form>
    )
  }

  renderTabs() {
    const { activeTabs } = this.state
    const areaIds = this.state.checkedRegionList.join(',')
    const { keyword = '' } = this.props.form.getFieldsValue(['keyword'])
    return (
      <Spin spinning={this.context.loading.includes(actions.GET_DATA_LIST)}>
        <Tabs activeKey={activeTabs} onChange={this.handleChangeTabs}>
          <TabPane tab="只看对比" key="1">
            {/* <ProjectRentCompare
              onSearch={this.handleSearch}
              useMonth={this.useMonth}
              cityId={this.cityId}
              cityName={this.cityName}
            /> */}
          </TabPane>
          <TabPane tab="只看案例租金" key="3">
            {/* <ProjectRentCase
              onSearch={this.handleSearch}
              useMonth={this.useMonth}
              cityId={this.cityId}
              cityName={this.cityName}
              areaIds={areaIds}
              keyword={keyword}
            /> */}
          </TabPane>
          <TabPane tab="只看基准租金" key="2">
            {/* <ProjectRentBase
              onSearch={this.handleSearch}
              useMonth={this.useMonth}
              cityId={this.cityId}
              cityName={this.cityName}
              areaIds={areaIds}
              keyword={keyword}
            /> */}
          </TabPane>
        </Tabs>
        {
          <div>
            {
              {
                '1': (
                  <ProjectRentCompare
                    onSearch={this.handleSearch}
                    useMonth={this.useMonth}
                    cityId={this.cityId}
                    cityName={this.cityName}
                  />
                ),
                '2': (
                  <ProjectRentBase
                    onSearch={this.handleSearch}
                    useMonth={this.useMonth}
                    cityId={this.cityId}
                    cityName={this.cityName}
                    areaIds={areaIds}
                    keyword={keyword}
                  />
                ),
                '3': (
                  <ProjectRentCase
                    onSearch={this.handleSearch}
                    useMonth={this.useMonth}
                    cityId={this.cityId}
                    cityName={this.cityName}
                    areaIds={areaIds}
                    keyword={keyword}
                  />
                )
              }[activeTabs]
            }
          </div>
        }
      </Spin>
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderTabs()}
        </div>
      </div>
    )
  }
}

export default compose(
  Form.create(),
  connect(modelSelector, containerActions)
)(ProjectRent)
