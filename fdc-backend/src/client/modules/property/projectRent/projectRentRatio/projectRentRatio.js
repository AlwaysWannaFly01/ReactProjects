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
  Breadcrumb,
  Icon,
  Modal,
  message,
  Table,
  Popover,
  Spin, Message
} from 'antd'
import { Link } from 'react-router-dom'
import { parse } from 'qs'
import showTotal from 'client/utils/showTotal'
import { pagePermission } from 'client/utils'
import router from 'client/router'
import layout from 'client/utils/layout'
import shallowEqual from 'client/utils/shallowEqual'

import actions, { containerActions } from '../actions'
import { modelSelector } from '../selector'
import '../sagas'
import '../reducer'

import styles from '../ProjectRent.less'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const { MonthPicker } = DatePicker
const confirm = Modal.confirm

/*
 * 楼盘均价 模块
 * author: YJF 2018-08-01
 */
class projectRentRatio extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    fetchAreaDict: PropTypes.func.isRequired,
    fetchCompareData: PropTypes.func.isRequired,
    getRentRatioData: PropTypes.func.isRequired,
    exportRentRatio: PropTypes.func.isRequired
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
      keyWord: keyword ? keyword.trim() : ''
    }
    console.log(params)
    const that = this
    this.props.exportRentRatio(params, () => {
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
    this.props.getRentRatioData(params,res=>{
      if(res.code==='400'){
        Message.error(res.message)
      }
    })
  }

  renderBreads() {
    var activeTabs = '1'
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
        name: '楼盘租售比'
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
              search: `importType=${1212129}&cityId=${this.cityId}&cityName=${
                this.cityName
              }`
            }}
          >
            {pagePermission('fdc:hd:residence:rentalRatio:import') ? (
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
          {pagePermission('fdc:hd:residence:rentalRatio:export') ? (
            <Button onClick={this.exportData} type="primary" icon="download">
              导出
            </Button>
          ) : (
            ''
          )}
        </Row>
      </Form>
    )
  }

  renderTabs() {
    const { cityId, cityName } = this.state
    /* eslint-disable */
    const columns = [
      {
        title: '行政区',
        dataIndex: 'areaName',
        width: 120,
        fixed: 'left'
      },
      {
        title: '楼盘名称',
        width: 150,
        // dataIndex: 'projectName',
        fixed: 'left',
        render: ({ projectName }) => (
          <Popover
            content={<div style={{ maxWidth: '140px' }}>{projectName}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitProjectName}>{projectName}</div>
          </Popover>
        )
      },
      {
        title: '楼盘别名',
        width: 150,
        // dataIndex: 'alias',
        render: ({ alias }) => (
          <Popover
            content={<div style={{ maxWidth: '140px' }}>{alias}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitProjectName}>{alias}</div>
          </Popover>
        )
      },
      {
        title: '月份',
        width: 120,
        render: (useMonth) => {
          if (useMonth) {
            return moment(useMonth).utcOffset(8).format('YYYY-MM')
          }
          return moment(this.props.useMonth)
            .add( -1,'M')
            .format('YYYY-MM')
        },
        dataIndex: 'useMonth'
      },
      {
        title: '住宅租售比（计算)',
        width: 150,
        render: (houseRate, { useMonth, projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRORENT_RENTAL_DETAIL,
                search: `state=1&projectId=${projectId || ''}&weightId=${id ||
                ''}&tag=${tag}&useMonth=${moment(new Date(useMonth)).format(
                  'YYYY-MM-01'
                )}&entry=1&compare=3&activeTabs=3&cityId=${cityId}&cityName=${cityName}`
              }}
            >
              <span>{houseRate || '——'}</span>
            </Link>
          )
        },
        dataIndex: 'houseRate'
      },
      {
        title: '住宅租售比（人工）',
        width: 150,
        render: (houseRateManual, { useMonth, projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRORENT_RENTAL_DETAIL,
                search: `state=1&projectId=${projectId || ''}&weightId=${id ||
                ''}&tag=${tag}&useMonth=${moment(new Date(useMonth)).format(
                  'YYYY-MM-01'
                )}&entry=1&compare=3&activeTabs=3&cityId=${cityId}&cityName=${cityName}`
              }}
            >
              <span>{houseRateManual || '——'}</span>
            </Link>
          )
        },
        dataIndex: 'houseRateManual'
      },
      {
        title: '公寓租售比（计算）',
        width: 150,
        render: (apartmentRate, { useMonth, projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRORENT_RENTAL_DETAIL,
                search: `state=1&projectId=${projectId || ''}&weightId=${id ||
                ''}&tag=${tag}&useMonth=${moment(new Date(useMonth)).format(
                  'YYYY-MM-01'
                )}&entry=1&compare=3&activeTabs=3&cityId=${cityId}&cityName=${cityName}`
              }}
            >
              {apartmentRate ? <span>{apartmentRate}</span> : <span>——</span>}
            </Link>
          )
        },
        dataIndex: 'apartmentRate'
      },
      {
        title: '公寓租售比（人工）',
        width: 150,
        render: (apartmentRateManual, { useMonth, projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRORENT_RENTAL_DETAIL,
                search: `state=1&projectId=${projectId || ''}&weightId=${id ||
                ''}&tag=${tag}&useMonth=${moment(new Date(useMonth)).format(
                  'YYYY-MM-01'
                )}&entry=1&compare=3&activeTabs=3&cityId=${cityId}&cityName=${cityName}`
              }}
            >
              {apartmentRateManual ? (
                <span>{apartmentRateManual}</span>
              ) : (
                <span>——</span>
              )}
            </Link>
          )
        },
        dataIndex: 'apartmentRateManual'
      },
      {
        title: '商住租售比（计算）',
        width: 150,
        render: (occopantRate, { useMonth, projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRORENT_RENTAL_DETAIL,
                search: `state=1&projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${tag}&useMonth=${moment(new Date(useMonth)).format(
                  'YYYY-MM-01'
                )}&entry=1&compare=3&activeTabs=3&cityId=${cityId}&cityName=${cityName}`
              }}
            >
              {occopantRate ? <span>{occopantRate}</span> : <span>——</span>}
            </Link>
          )
        },
        dataIndex: 'occopantRate'
      },
      {
        title: '商住租售比（人工）',
        width: 150,
        render: (occopantRateManual, { useMonth, projectId, id, tag = 1 }) => {
          return (
            <Link
              to={{
                pathname: router.RES_PRORENT_RENTAL_DETAIL,
                search: `projectId=${projectId || ''}&weightId=${id ||
                  ''}&tag=${tag}&useMonth=${moment(new Date(useMonth)).format(
                  'YYYY-MM-01'
                )}&entry=1&compare=3&activeTabs=3&cityId=${cityId}&cityName=${cityName}`
              }}
            >
              {occopantRateManual ? (
                <span>{occopantRateManual}</span>
              ) : (
                <span>——</span>
              )}
            </Link>
          )
        },
        dataIndex: 'occopantRateManual'
      },
      {
        title: '操作',
        width: 100,
        fixed: 'right',
        render: (_, { projectId }) => (
          <Link
            to={{
              pathname: router.RES_PRORENT_RENTAL_HISTORY,
              search: `projectId=${projectId}&activeTabs=3&cityId=${cityId}&cityName=${cityName}`
            }}
          >
            <span>历史</span>
          </Link>
        ),
        dataIndex: 'projectId'
      }
    ]
    const { pageNum, pageSize, total } = this.props.model.get(
      'rentRatioPagination'
    )
    const pagination = {
      current: pageNum,
      pageSize,
      total,
      showTotal,
      showQuickJumper: true,
      onChange: pageNum => {
        this.handleSearch(null, pageNum)
        // this.props.onSearch(null, pageNum)
      }
    }

    return (
      <Spin
        spinning={this.context.loading.includes(actions.GET_RENT_RATIO_DATA)}
      >
        <Table
          spinning={true}
          rowKey={(record, index) => index}
          pagination={pagination}
          columns={columns}
          dataSource={this.props.rentRatioDatas}
          // dataSource={caseDatas}
          scroll={{ x: 1840, y: 420 }}
          className={styles.tableDetailRoom}
        />
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
  connect(
    modelSelector,
    containerActions
  )
)(projectRentRatio)
