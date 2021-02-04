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
  DatePicker,
  Message,
  Divider,
  Icon,
  Breadcrumb,
  InputNumber,
  Modal
} from 'antd'
import { parse } from 'qs'

import router from 'client/router'
import layout from 'client/utils/layout'
// import shallowEqual from 'client/utils/shallowEqual'
// import wrapAuthButton from 'client/utils/auth/authButton'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'
import { breadList, columns } from './constant'

import styles from './ResRating.less'
import ResRatingHistoryEdit from './ResRating.newEdit'
const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const { MonthPicker } = DatePicker
const confirm = Modal.confirm

const projectOptions = [
  {
    label: '正式楼盘',
    value: '1'
  },
  {
    label: '已删除楼盘',
    value: '0'
  }
]

/**
 * 住宅 楼盘评级结果
 * author: WY
 */
class ResRating extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    // location: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getAreaList: PropTypes.func.isRequired,
    getEstateRatingSearch: PropTypes.func.isRequired,
    estateRatingList: PropTypes.array.isRequired,
    exportRatingResult: PropTypes.func.isRequired,
    getRatingRuleDetail: PropTypes.func.isRequired,
    editRatingResult: PropTypes.func.isRequired
    // ratingRuleDetail: PropTypes.object.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  /* eslint-disable */
  constructor(props) {
    super(props)
    // eslint-disable-next-line
    const { areaIds, keyword, cityId, cityName = '', statuses } = parse(
      props.location.search.substr(1)
    )

    // const checkedRegionList = areaIds ? areaIds.split(',').filter(i => i) : []
    let initialStatuses = []
    if (statuses) {
      initialStatuses = statuses.split(',')
    }

    this.state = {
      // 选中的筛选范围 id数组
      checkedProjectList: statuses !== undefined ? initialStatuses : ['1'],
      indeterminateProject: true,
      checkedAllProject: false,
      // 选中的行政区范围 id数组
      checkedRegionList: [],
      checkedAllRegion: false,
      indeterminateRegion: true,
      // 行政区id
      restoreBtnLoading: false,
      keyword,
      projectName:'',
      projectId:'',
      cityId,
      cityName,
      changeVisible: false, // 修改弹窗
      ratingRecord: {},
      totalScroll: '', // 计算总得分
      grade: '',
      weightDetail: {}, // 权重详情数据
      editData: {},
    }
  }

  componentDidMount() {
    // eslint-disable-next-line
    const {
      checkedProjectList,
      checkedRegionList,
      keyword,
      cityId
    } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
        // 获取行政区列表
        this.props.getAreaList(this.cityId)
        // 设置默认估价月份
        this.setDefaultUserMonth()
        const qry = {
          keyword,
          cityId: this.cityId,
          pageNum: 1,
          pageSize: 20,
          useMonth: this.userMonth.format('YYYY-MM-DD HH:mm:ss')
        }
        if (checkedRegionList.length) {
          qry.areaIds = checkedRegionList.join(',')
        }
        if (checkedProjectList.length) {
          qry.statuses = checkedProjectList.join(',')
        }
        this.props.getEstateRatingSearch(qry)
      }
    }, 100)
  }

  setDefaultUserMonth = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    this.userMonth = moment(new Date(`${year}-${month}-01`))
  }

  onCheckAllProjectChange = e => {
    const projectOptionsValue = []
    projectOptions.forEach(item => {
      projectOptionsValue.push(item.value)
    })
    this.setState({
      checkedProjectList: e.target.checked ? projectOptionsValue : [],
      indeterminateProject: false,
      checkedAllProject: e.target.checked
    })
  }

  onCheckProjectChange = checkedList => {
    this.setState({
      checkedProjectList: checkedList,
      indeterminateProject:
        !!checkedList.length && checkedList.length < projectOptions.length,
      checkedAllProject: checkedList.length === projectOptions.length
    })
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
  }

  disabledDate = current => {
    // Can not select days before today and today
    return current > moment().endOf('month')
  }

  // 导出评级结果
  exportRatingResult = () => {
    const { checkedRegionList, checkedProjectList } = this.state
    this.props.form.validateFieldsAndScroll(
      ['userMonth', 'keyword'],
      (err, values) => {
        if (!err) {
          const { userMonth, keyword } = values
          const exportParams = {
            keyword: keyword ? keyword.trim() : '',
            useMonth: moment(userMonth).format('YYYY-MM-DD HH:mm:ss'),
            cityId: this.cityId
          }
          if (checkedRegionList) {
            exportParams.areaIds = checkedRegionList.join(',')
          }
          if (checkedProjectList) {
            exportParams.statuses = checkedProjectList.join(',')
          }
          const that = this
          this.props.exportRatingResult(exportParams, res => {
            const { code, message } = res
            if (+code === 200) {
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
              Message.error(message)
            }
          })
        }
      }
    )
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
    const { checkedRegionList, checkedProjectList } = this.state
    this.props.form.validateFields(['userMonth', 'keyword'], (err, values) => {
      if (!err) {
        const { userMonth, keyword } = values
        const qry = {
          areaIds: checkedRegionList.join(','),
          keyword,
          cityId: this.cityId,
          pageNum,
          pageSize: 20,
          useMonth: moment(userMonth).format('YYYY-MM-DD HH:mm:ss')
        }
        if (checkedProjectList.length) {
          qry.statuses = checkedProjectList.join(',')
        }
        this.props.getEstateRatingSearch(qry,res => {
          if(res.code!=='200'){
            Message.error(res.message)
          }
        })
      }
    })
  }

  handleRatingChange = record => {
    const { locationScore, priceScore, deliveryDateScore } = record
    this.props.getRatingRuleDetail({ cityId: this.cityId }, data => {
      // const {
      //   deliveryDateStardardDetail: { deliveryDateWeight },
      //   locationStardardDetail: { locationWeight },
      //   priceStardardDetail: { priceWeight }
      // } = data
      const { projectName, projectId } = record
      this.setState({ weightDetail: data,editData:record,projectName,projectId })
      this.setState({
        changeVisible: true
      })
      // // 计算总得分
      // let totalScroll = ''
      // if (!locationScore || !priceScore || !deliveryDateScore) {
      //   totalScroll = ''
      // } else {
      //   totalScroll = +(
      //     (locationScore * locationWeight) / 100 +
      //     (priceScore * priceWeight) / 100 +
      //     (deliveryDateScore * deliveryDateWeight) / 100
      //   ).toFixed(2)
      // }
      //
      // // 计算楼盘等级
      // this.grade(totalScroll)
      // this.setState({ totalScroll })
    })
  }

  grade = totalScroll => {
    // 计算楼盘等级
    let grade = ''
    if (totalScroll >= 8.5 && totalScroll <= 10) {
      grade = 'A'
    } else if (totalScroll >= 7.5 && totalScroll < 8.5) {
      grade = 'B'
    } else if (totalScroll >= 6 && totalScroll < 7.5) {
      grade = 'C'
    } else if (totalScroll > 0 && totalScroll < 6) {
      grade = 'D'
    } else {
      grade = ''
    }
    this.setState({ grade })
  }

  // 区位得分
  locationChange = value => {
    const { weightDetail } = this.state
    const {
      deliveryDateStardardDetail: { deliveryDateWeight },
      locationStardardDetail: { locationWeight },
      priceStardardDetail: { priceWeight }
    } = weightDetail
    // 计算总得分
    const { priceScore, deliveryDateScore } = this.props.form.getFieldsValue()

    let totalScroll = ''
    if (!value || !priceScore || !deliveryDateScore) {
      totalScroll = ''
    } else {
      totalScroll = +(
        (value * locationWeight) / 100 +
        (priceScore * priceWeight) / 100 +
        (deliveryDateScore * deliveryDateWeight) / 100
      ).toFixed(2)
    }
    // 计算楼盘等级
    this.grade(totalScroll)
    this.setState({ totalScroll })
  }

  // 价格得分
  priceChange = value => {
    const { weightDetail } = this.state
    const {
      deliveryDateStardardDetail: { deliveryDateWeight },
      locationStardardDetail: { locationWeight },
      priceStardardDetail: { priceWeight }
    } = weightDetail
    // 计算总得分
    const {
      locationScore,
      deliveryDateScore
    } = this.props.form.getFieldsValue()

    let totalScroll = ''
    if (!locationScore || !value || !deliveryDateScore) {
      totalScroll = ''
    } else {
      totalScroll = +(
        (locationScore * locationWeight) / 100 +
        (value * priceWeight) / 100 +
        (deliveryDateScore * deliveryDateWeight) / 100
      ).toFixed(2)
    }
    // 计算楼盘等级
    this.grade(totalScroll)
    this.setState({ totalScroll })
  }

  // 竣工日期得分
  deliveryChange = value => {
    const { weightDetail } = this.state
    const {
      deliveryDateStardardDetail: { deliveryDateWeight },
      locationStardardDetail: { locationWeight },
      priceStardardDetail: { priceWeight }
    } = weightDetail
    // 计算总得分
    const { locationScore, priceScore } = this.props.form.getFieldsValue()

    let totalScroll = ''
    if (!locationScore || !priceScore || !value) {
      totalScroll = ''
    } else {
      totalScroll = +(
        (locationScore * locationWeight) / 100 +
        (priceScore * priceWeight) / 100 +
        (value * deliveryDateWeight) / 100
      ).toFixed(2)
    }
    // 计算楼盘等级
    this.grade(totalScroll)
    this.setState({ totalScroll })
  }

  handleChangeOk = e => {
    const { ratingRecord } = this.state
    const { useMonth } = ratingRecord
    this.props.form.validateFieldsAndScroll(
      [
        'locationScore',
        'priceScore',
        'deliveryDateScore',
        'totalScore',
        'grade'
      ],
      (err, values) => {
        if (!err) {
          values.cityId = this.cityId
          values.id = ratingRecord.id
          values.projectId = ratingRecord.projectId
          values.useMonth = moment(useMonth).format('YYYY-MM-DD HH:mm:ss')

          this.props.editRatingResult(values, res => {
            const { code, message } = res
            if (+code === 200) {
              Message.success('修改成功')
              this.handleSearch(null, 1)
              this.handleChangeCancel()
            } else {
              Message.success(message)
            }
          })
        }
      }
    )
  }

  handleChangeCancel = () => {
    this.props.form.resetFields()
    this.setState({
      changeVisible: false,
      editData: {},
    })
  }

  renderBreads() {
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
      checkedAllProject,
      indeterminateProject,
      checkedProjectList,

      checkedRegionList,
      checkedAllRegion,
      indeterminateRegion,
      keyword,
      cityId,
      cityName
    } = this.state

    // 行政区列表
    const areaList = this.props.model.get('areaList').toJS()

    return (
      <Form>
        <Row style={{ marginBottom: 0 }}>
          <FormItem
            label="筛选范围"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
            style={{ marginBottom: 0 }}
          >
            <Checkbox
              indeterminate={indeterminateProject}
              checked={checkedAllProject}
              onChange={this.onCheckAllProjectChange}
            >
              全部
            </Checkbox>
            <CheckboxGroup
              options={projectOptions}
              value={checkedProjectList}
              onChange={this.onCheckProjectChange}
            />
          </FormItem>
        </Row>
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
        <Row>
          <Link
            to={{
              pathname: router.RES_BASEINFO_IMPORT,
              search: `importType=${1212131}&cityId=${this.cityId}&cityName=${
                this.state.cityName
              }`
            }}
          >
            {pagePermission('fdc:hd:residence:base:ratingResult:import') ? (
              <Button style={{ marginRight: 16 }} icon="upload" type="primary">
                导入
              </Button>
            ) : (
              ''
            )}
          </Link>

          {pagePermission('fdc:hd:residence:base:ratingResult:export') ? (
            <Button
              type="primary"
              icon="download"
              onClick={this.exportRatingResult}
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
    const columnsMerge = [
      ...columns,
      {
        title: '操作',
        width: 133,
        fixed: 'right',
        render: (_, record) => (
          <Fragment>
            <Fragment>
              {pagePermission('fdc:hd:residence:base:ratingResult:change') ? (
                <a onClick={() => this.handleRatingChange(record)}>修改</a>
              ) : (
                <a>修改</a>
              )}
              <Divider type="vertical" />
            </Fragment>
            <Fragment>
              <Link
                to={{
                  pathname: router.RES_RATING_HISTORY,
                  search: `?projectId=${record.projectId}&areaName=${
                    record.areaName
                  }&cityId=${this.state.cityId}&projectName=${
                    record.projectName
                  }&cityName=${this.state.cityName}`
                }}
              >
                历史
              </Link>
            </Fragment>
          </Fragment>
        )
      }
    ]

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
        rowKey={(record, index) => index}
        style={{ marginTop: 16 }}
        columns={columnsMerge}
        dataSource={this.props.estateRatingList}
        pagination={pagination}
        loading={this.context.loading.includes(actions.GET_RATING_RULE_SEARCH)}
        scroll={{ x: '3700px', y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { ratingRecord, totalScroll, grade } = this.state
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderTable()}
        </div>
        <div>
          <ResRatingHistoryEdit
            modalVisible={this.state.changeVisible}
            modalCancel={this.handleChangeCancel}
            editData={this.state.editData}
            isAdd={false}
            onSearch={this.handleSearch}
            projectName={this.state.projectName}
            projectId={this.state.projectId}
            cityId={this.state.cityId}
            weightDetail={this.state.weightDetail}
          />
         
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
)(ResRating)
