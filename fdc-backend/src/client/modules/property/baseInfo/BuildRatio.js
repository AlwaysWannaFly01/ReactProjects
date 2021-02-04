import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Immutable from 'immutable'
import moment from 'moment'
import { pagePermission } from 'client/utils'
import showTotal from 'client/utils/showTotal'
import {
  Table,
  Form,
  Row,
  Col,
  Input,
  Button,
  Checkbox,
  Message,
  Icon,
  Breadcrumb,
  Popover,
  Modal,
  DatePicker
} from 'antd'
import { parse } from 'qs'

import router from 'client/router'
import layout from 'client/utils/layout'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './BaseInfo.less'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const confirm = Modal.confirm
const { MonthPicker } = DatePicker

/**
 * 住宅 建筑物类型比值
 * author: wy
 */
class BuildRatio extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    getBuildRateList: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    buildRateList: PropTypes.array.isRequired,
    getAloneArea: PropTypes.func.isRequired,
    aloneArea: PropTypes.array.isRequired,
    exportRate: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    // eslint-disable-next-line
    const { cityId = '', cityName = '', keyword } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      value: [], // 月份

      // 选中的行政区范围 id数组
      checkedRegionList: [],
      checkedAllRegion: false,
      indeterminateRegion: true,

      cityId,
      cityName,

      // 选中table数据
      selectedRowKeys: [],
      // selectedRows: [],

      keyword
      // pageNum,

      // restoreBtnLoading: false
    }
  }

  componentDidMount() {
    const { cityId, cityName } = this.state
    this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
    this.cityName =
      JSON.parse(sessionStorage.getItem('FDC_CITY_INFO'))&&JSON.parse(sessionStorage.getItem('FDC_CITY_INFO')).cityName?JSON.parse(sessionStorage.getItem('FDC_CITY_INFO')).cityName:cityName
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
    this.handleSearch(null, 1)
    this.props.getAloneArea(this.cityId)
    // 设置默认估价月份
    this.setDefaultUserMonth()
  }

  onCheckAllRegionChange = e => {
    const { aloneArea } = this.props
    const regionOptionsValue = []
    aloneArea.forEach(item => {
      regionOptionsValue.push(item.value)
    })
    this.setState({
      checkedRegionList: e.target.checked ? regionOptionsValue : [],
      indeterminateRegion: false,
      checkedAllRegion: e.target.checked
    })
  }

  onCheckRegionChange = checkedList => {
    const { aloneArea } = this.props
    this.setState({
      checkedRegionList: checkedList,
      indeterminateRegion:
        !!checkedList.length && checkedList.length < aloneArea.length,
      checkedAllRegion: checkedList.length === aloneArea.length
    })
  }

  setDefaultUserMonth = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    this.userMonth = moment(new Date(`${year}-${month}-01`))
    this.useMonth = `${year}-${month}-01`
  }
  /* eslint-disable */
  disabledDate = current => {
    // Can not select days before today and today
    return current > moment().endOf('month')
  }

  exportRate = () => {
    const { checkedRegionList, selectedRowKeys, value } = this.state
    const { pageNum } = this.props.model.get('pagination')
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const data = Object.assign({}, values)
        const { keyword } = data
        const exportParams = {
          areaIds: checkedRegionList.join(','),
          cityId: this.cityId,
          ids: selectedRowKeys.join(','),
          keyword: keyword ? keyword.trim() : keyword,
          pageNum,
          pageSize: 20,
          useMonth: moment(value).format('YYYY-MM-01')
        }

        const that = this
        this.props.exportRate(exportParams, data => {
          if (data.code == 200) {
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
          } else {
            Message.error(data.message)
          }
        })
      }
    })
  }

  handleChange = value => {
    this.setState({ value })
  }

  goExportTask = () => {
    if (pagePermission('fdc:hd:export:check')) {
      this.props.history.push({
        pathname: router.RES_EXPORT_TASK,
        search: 'type=1'
      })
    } else {
      Message.warning('没有导出任务页权限，请联系管理员')
    }
  }

  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    this.setState({
      selectedRowKeys: []
    })
    const { checkedRegionList, value } = this.state

    const keyword = this.props.form.getFieldValue('keyword')
    const searchBaseInfo = {
      cityId: this.cityId,
      useMonth: moment(value).format('YYYY-MM-01'),
      keyword: keyword ? keyword.trim() : '',
      pageNum,
      pageSize: 20
    }
    if (checkedRegionList.length) {
      searchBaseInfo.areaIds = checkedRegionList.join(',')
    }

    this.props.getBuildRateList(searchBaseInfo)
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
        path: router.RES_BASEINFO,
        name: '住宅基础数据',
        icon: ''
      },
      {
        key: 3,
        path: '',
        name: '建筑物类型比值',
        icon: ''
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

    return (
      <Form>
        <Row style={{ marginBottom: 8 }}>
          <FormItem
            label="行政区"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
            style={{ marginBottom: 0 }}
          >
            <Checkbox
              indeterminate={indeterminateRegion}
              checked={checkedAllRegion}
              onChange={this.onCheckAllRegionChange}
            >
              全部
            </Checkbox>
            <CheckboxGroup
              options={this.props.aloneArea}
              value={checkedRegionList}
              onChange={this.onCheckRegionChange}
            />
          </FormItem>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem
              label="估价月份"
              labelCol={layout(6, 8)}
              wrapperCol={layout(6, 16)}
            >
              {getFieldDecorator('useMonth', {
                initialValue: this.userMonth
              })(
                <MonthPicker
                  disabledDate={this.disabledDate}
                  allowClear={false}
                  style={{ width: '100%' }}
                  onChange={this.handleChange}
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
            {/* fdc:hd:residence:base:buildRatio:check */}
            {pagePermission('fdc:hd:residence:base:buildRatio:check') ? (
              <Button
                style={{ marginLeft: 16, marginTop: 4 }}
                type="primary"
                onClick={e => this.handleSearch(e, 1)}
                icon="search"
              >
                查询
              </Button>
            ) : (
              ''
            )}
          </Col>
        </Row>
        <Row>
          <Link
            to={{
              pathname: router.RES_BASEINFO_IMPORT,
              search: `importType=${1212121}&cityId=${this.cityId}&cityName=${
                this.cityName
              }`
            }}
          >
            {/* fdc:hd:residence:base:buildRatio:import */}
            {pagePermission('fdc:hd:residence:base:buildRatio:import') ? (
              <Button style={{ marginRight: 16 }} icon="upload" type="primary">
                导入
              </Button>
            ) : (
              ''
            )}
          </Link>
          {/* fdc:hd:residence:base:buildRatio:export */}
          {pagePermission('fdc:hd:residence:base:buildRatio:export') ? (
            <Button
              style={{ marginRight: 16 }}
              icon="download"
              type="primary"
              onClick={this.exportRate}
            >
              导出
            </Button>
          ) : (
            ''
          )}
        </Row>
      </Form>
    )
  }

  renderTable() {
    const columns = [
      {
        title: '行政区',
        width: 120,
        render: ({ areaName }) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{areaName}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitAreaName}>{areaName}</div>
          </Popover>
        )
      },
      {
        title: '楼盘名称',
        width: 280,
        render: ({ projectName }) => (
          <Fragment>
            <Popover
              content={<div style={{ maxWidth: '200px' }}>{projectName}</div>}
              title={false}
              placement="topLeft"
            >
              <div className={styles.limitProjectName}>{projectName}</div>
            </Popover>
          </Fragment>
        )
      },
      {
        title: '楼盘别名',
        width: 180,
        render: ({ projectAlias }) => (
          <Fragment>
            <Popover
              content={<div style={{ maxWidth: '200px' }}>{projectAlias}</div>}
              title={false}
              placement="topLeft"
            >
              <div className={styles.limitProjectAlias}>{projectAlias}</div>
            </Popover>
          </Fragment>
        )
      },
      {
        title: '月份',
        width: 100,
        render: date => {
          if (!date) return null
          return moment(date).format('YYYY-MM')
        },
        dataIndex: 'useMonth'
      },
      {
        title: '低层比值',
        width: 100,
        dataIndex: 'lowLayerRate'
      },
      {
        title: '多层比值',
        width: 100,
        dataIndex: 'multiLayerRate'
      },
      {
        title: '小高层比值',
        width: 100,
        dataIndex: 'smallHighLayerRate'
      },
      {
        title: '高层比值',
        width: 100,
        dataIndex: 'highLayerRate'
      },
      {
        title: '超高层比值',
        width: 100,
        dataIndex: 'superHighLayerRate'
      }
    ]

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: selectedRowKeys => {
        this.setState({
          selectedRowKeys
        })
      }
    }

    const { pageNum, pageSize, total } = this.props.model.get('pagination')
    const pagination = {
      current: pageNum,
      pageSize,
      total,
      showTotal,
      showQuickJumper: true,
      onChange: pageNum => {
        this.handleSearch(null, pageNum)
      }
    }
    return (
      <Table
        rowKey={record => record.projectId}
        style={{ marginTop: 16 }}
        columns={columns}
        dataSource={this.props.buildRateList}
        rowSelection={rowSelection}
        pagination={pagination}
        loading={this.context.loading.includes(actions.GET_BUILD_RATE_LIST)}
        scroll={{ x: 1700, y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderTable()}
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
)(BuildRatio)
