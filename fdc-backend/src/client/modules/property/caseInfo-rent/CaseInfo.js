import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import moment from 'moment'
import { compose } from 'redux'
import {
  Breadcrumb,
  Icon,
  Form,
  Checkbox,
  Button,
  Table,
  Input,
  Row,
  Col,
  Popconfirm,
  Message,
  Popover,
  Modal,
  Spin,
  message
} from 'antd'
import Immutable from 'immutable'
import { parse } from 'qs'
import { pagePermission } from 'client/utils'
import shallowEqual from 'client/utils/shallowEqual'
import showTotal from 'client/utils/showTotal'
import layout from 'client/utils/layout'
import router from 'client/router'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import CaseRangePicker2 from './CaseRangePicker2'

import styles from './CaseInfo.less'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const confirm = Modal.confirm

/*
 * 住宅-租金案例数据列表
 */
/* eslint-disable */
class CaseInfoRent extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    getAreaList: PropTypes.func.isRequired,
    getCaseTypeList: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    fetchCaseList: PropTypes.func.isRequired,
    clearCaseList: PropTypes.func.isRequired,
    caseList: PropTypes.array.isRequired,
    deleteCases: PropTypes.func.isRequired,
    deleteAllCases: PropTypes.func.isRequired,
    exportCase: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    const {
      areaIds,
      caseTypeCodes,
      caseHappenDateStart: caseHappenDateStartS,
      caseHappenDateEnd: caseHappenDateEndS,
      pageNum = 1,
      keyword,
      cityId,
      cityName
    } = parse(props.location.search.substr(1))

    const checkedRegionList = areaIds ? areaIds.split(',').filter(i => i) : []
    const checkedCaseTypeList = caseTypeCodes
      ? caseTypeCodes.split(',').filter(i => i)
      : []
    // 案例开始日期
    const caseHappenDateStart = caseHappenDateStartS
      ? moment(caseHappenDateStartS)
      : moment().add(-7, 'days')
    const caseHappenDateEnd = caseHappenDateEndS
      ? moment(caseHappenDateEndS)
      : moment()

    this.state = {
      // 选中的行政区范围 id数组
      checkedRegionList,
      checkedAllRegion: false,
      indeterminateRegion: true,

      // 案例类型
      checkedCaseTypeList,
      checkedAllCaseType: false,
      indeterminateCaseType: true,

      // 选中table数据
      selectedRowKeys: [],
      selectedRows: [],

      // 案例起始日期
      caseHappenDateStart,
      caseHappenDateEnd,

      keyword,
      pageNum,

      // 一键删除Loading
      deleteAllCasesLoading: false,
      cityId,
      cityName
    }
  }

  componentDidMount() {
    let {
      checkedRegionList,
      checkedCaseTypeList,
      caseHappenDateStart,
      caseHappenDateEnd,
      keyword,
      cityId,
      cityName
    } = this.state
    caseHappenDateStart = caseHappenDateStart.format('YYYY-MM-DD')
    caseHappenDateEnd = caseHappenDateEnd.format('YYYY-MM-DD')

    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
      this.cityName =
        JSON.parse(sessionStorage.getItem('FDC_CITY_INFO')).cityName || cityName
      if (this.cityId) {
        clearInterval(this.cityIdInterval)

        // 获取行政区数据
        this.props.getAreaList(this.cityId)
        // 获取案例类型数据
        this.props.getCaseTypeList()
        // 查询列表
        const qry = {
          areaIds: checkedRegionList.join(','),
          caseTypeCodes: checkedCaseTypeList.join(','),
          caseHappenDateStart,
          caseHappenDateEnd,
          keyword,
          cityId: this.cityId,
          pageNum: 1,
          pageSize: 20
        }
        this.props.fetchCaseList(qry,res=>{
          if(res.code==='400'){
            Message.error(res.message)
          }
        })
      }
    }, 100)
  }

  componentWillReceiveProps(nextProps) {
    // 点击左边的菜单栏, 回到默认查询条件
    if (
      !shallowEqual(this.props.location, nextProps.location) &&
      nextProps.location.search === ''
    ) {
      this.props.form.resetFields()

      const caseHappenDateStart = moment()
        // .add(-6, 'months')
        .add(-7, 'days')
      const caseHappenDateEnd = moment()
      this.setState(
        {
          checkedRegionList: [],
          checkedAllRegion: false,
          indeterminateRegion: true,

          checkedCaseTypeList: [],
          checkedAllCaseType: false,
          indeterminateCaseType: true,

          selectedRowKeys: [],
          selectedRows: [],

          caseHappenDateStart,
          caseHappenDateEnd,

          keyword: undefined,
          pageNum: 1
        },
        () => {
          // 清除查询条件
          sessionStorage.removeItem('CASE_INFO_RENT_SEARCH')
          // 初始化案例日期
          this.caseDate.initialDate(caseHappenDateStart, caseHappenDateEnd)
          // 查询列表
          const qry = {
            caseHappenDateStart: caseHappenDateStart.format('YYYY-MM-DD'),
            caseHappenDateEnd: caseHappenDateEnd.format('YYYY-MM-DD'),
            cityId: this.cityId,
            pageNum: 1,
            pageSize: 20
          }
          this.props.fetchCaseList(qry,res=>{
            if(res.code==='400'){
              Message.error(res.message)
            }
          })
        }
      )
    }
  }

  onCaseDateRef = ref => {
    this.caseDate = ref
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

  onCheckAllCaseTypeChange = e => {
    const caseTypeOptions = this.props.model.get('caseTypeList').toJS()
    const caseTypeOptionsValue = []
    caseTypeOptions.forEach(item => {
      caseTypeOptionsValue.push(item.value)
    })
    this.setState({
      checkedCaseTypeList: e.target.checked ? caseTypeOptionsValue : [],
      indeterminateCaseType: false,
      checkedAllCaseType: e.target.checked
    })
  }

  onCheckCaseTypeChange = checkedList => {
    const caseTypesOptions = this.props.model.get('caseTypeList').toJS()
    this.setState({
      checkedCaseTypeList: checkedList,
      indeterminateCaseType:
        !!checkedList.length && checkedList.length < caseTypesOptions.length,
      checkedAllCaseType: checkedList.length === caseTypesOptions.length
    })
  }

  handleConfirmDelete = () => {
    const that = this
    confirm({
      title: '您是否确定删除?',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        that.handleBatchDel()
      }
    })
  }

  // 删除案例
  handleBatchDel = () => {
    const ids = this.state.selectedRowKeys.join(',')
    const cityId = this.cityId
    this.props.deleteCases(ids, cityId, res => {
      const { code, message } = res
      if (+code === 200) {
        Message.success('删除成功')
        this.handleSearch(null, 1)
      } else {
        Message.error(message)
      }
    })
  }

  handleDeleteAllCases = () => {
    const { checkedRegionList, checkedCaseTypeList } = this.state

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({
          deleteAllCasesLoading: true
        })
        const data = Object.assign({}, values)
        // 案例日期手动必填👀
        const { caseDate, keyword } = data
        // 案例日期结束日期 - 减1天用于后端计算🌶️
        if (caseDate) {
          const delParams = {
            areaIds: checkedRegionList.join(','),
            caseTypeCodes: checkedCaseTypeList.join(','),
            caseHappenDateStart: caseDate.startDate.format('YYYY-MM-DD'),
            caseHappenDateEnd: caseDate.endDate.format('YYYY-MM-DD'),
            keyword: keyword ? keyword.trim() : keyword,
            cityId: this.cityId
          }

          // console.log(delParams)
          this.props.deleteAllCases(delParams, res => {
            this.setState({
              deleteAllCasesLoading: false
            })
            const { code, message } = res
            if (+code === 200) {
              Message.success('一键删除成功')
              this.handleSearch(null, 1)
            } else {
              Message.error(message)
            }
          })
        }
      }
    })
  }

  exportCase = () => {
    const {
      checkedRegionList,
      checkedCaseTypeList,
      selectedRowKeys
    } = this.state
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const data = Object.assign({}, values)
        // 案例日期手动必填👀
        const { caseDate, keyword } = data
        if (caseDate) {
          const exportParams = {
            areaIds: checkedRegionList.join(','),
            caseTypeCodes: checkedCaseTypeList.join(','),
            caseHappenDateStart: caseDate.startDate.format('YYYY-MM-DD'),
            caseHappenDateEnd: caseDate.endDate.format('YYYY-MM-DD'),
            keyword: !!keyword ? keyword.trim() : '',
            cityId: this.cityId,
            ids: selectedRowKeys.join(',')
          }

          // console.log(formData)
          const that = this
          this.props.exportCase(exportParams, () => {
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
      }
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

  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    // 重新查询后，清空勾选的数
    this.setState({
      selectedRowKeys: [],
      selectedRows: []
    })

    const { checkedRegionList, checkedCaseTypeList } = this.state
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const data = Object.assign({}, values)
        // 案例日期手动必填👀
        const { caseDate, keyword } = data
        // 案例日期结束日期 - 减1天用于后端计算🌶️

        if (caseDate) {
          const caseHappenDateStart = caseDate.startDate.format('YYYY-MM-DD')
          const caseHappenDateEnd = caseDate.endDate.format('YYYY-MM-DD')
          const keywordS = keyword ? keyword.trim() : ''
          const pageNumS = pageNum || 1

          const formData = {
            areaIds: checkedRegionList.join(','),
            caseTypeCodes: checkedCaseTypeList.join(','),
            caseHappenDateStart,
            caseHappenDateEnd,
            keyword: keywordS,
            cityId: this.cityId,
            pageNum: pageNumS,
            pageSize: 20
          }
          // console.log(formData)
          this.props.fetchCaseList(formData,res=>{
            if(res.code==='400'){
              Message.error(res.message)
            }
          })

          // 保存查询条件到sessionStorage
          // 行政区&案例类型&案例日期&导入日期&关键字&pageNum
          const areaIds = checkedRegionList.join(',')
          const caseTypeCodes = checkedCaseTypeList.join(',')

          let caseInfoSearch = `areaIds=${areaIds}&caseTypeCodes=${caseTypeCodes}&caseHappenDateStart=${caseHappenDateStart}&caseHappenDateEnd=${caseHappenDateEnd}&keyword=${keywordS ||
            ''}&pageNum=${pageNumS}`
          this.context.router.history.push({
            pathname: this.props.location.pathname,
            search: caseInfoSearch
          })
          sessionStorage.setItem('CASE_INFO_RENT_SEARCH', caseInfoSearch)
        }
      }
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
        name: '租金案例数据',
        icon: ''
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

      checkedCaseTypeList,
      checkedAllCaseType,
      indeterminateCaseType,

      caseHappenDateStart,
      caseHappenDateEnd,

      keyword
    } = this.state

    // 行政区列表
    const areaList = this.props.model.get('areaList').toJS()
    const caseTypeList = this.props.model.get('caseTypeList').toJS()

    return (
      <Form onSubmit={e => this.handleSearch(e, 1)} layout="horizontal">
        <Row style={{ marginBottom: 0 }}>
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
        <Row style={{ marginBottom: 0 }}>
          <FormItem
            label="案例类型"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
            style={{ marginBottom: 0 }}
          >
            <Checkbox
              indeterminate={indeterminateCaseType}
              checked={checkedAllCaseType}
              onChange={this.onCheckAllCaseTypeChange}
            >
              全部
            </Checkbox>
            <CheckboxGroup
              options={caseTypeList}
              value={checkedCaseTypeList}
              onChange={this.onCheckCaseTypeChange}
            />
          </FormItem>
        </Row>
        <Row style={{ marginBottom: 8 }}>
          <FormItem
            label={<span className={styles.isRequired}>案例日期:</span>}
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
            style={{ marginBottom: 0 }}
            colon={false}
          >
            {getFieldDecorator('caseDate')(
              <CaseRangePicker2
                startDate={caseHappenDateStart}
                endDate={caseHappenDateEnd}
                onCaseDateRef={this.onCaseDateRef}
              />
            )}
          </FormItem>
        </Row>
        <Row>
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
              htmlType="submit"
              type="primary"
              icon="search"
              style={{ marginLeft: 16, marginTop: 4 }}
            >
              查询
            </Button>
          </Col>
        </Row>
        <Row style={{ marginBottom: 16 }}>
          <Link
            to={{
              pathname: router.RES_RENT_CASEINFO_EDIT,
              search: `cityId=${this.cityId}&cityName=${this.cityName}`
            }}
          >
            {pagePermission('fdc:hd:residence:rental:add') ? (
              <Button type="primary" icon="plus" style={{ marginRight: 16 }}>
                新增
              </Button>
            ) : (
              ''
            )}
          </Link>
          {pagePermission('fdc:hd:residence:rental:delete') ? (
            <Button
              type="danger"
              icon="delete"
              style={{ marginRight: 16 }}
              disabled={!this.state.selectedRowKeys.length}
              onClick={this.handleConfirmDelete}
            >
              删除
            </Button>
          ) : (
            ''
          )}

          {pagePermission('fdc:hd:residence:rental:allDelete') ? (
            <Popconfirm
              title="你将删除所有数据，确定一键删除？"
              onConfirm={() => this.handleDeleteAllCases()}
            >
              <Button type="danger" icon="delete" style={{ marginRight: 16 }}>
                一键删除
              </Button>
            </Popconfirm>
          ) : (
            ''
          )}

          <Link
            to={{
              pathname: router.RES_RENT_CASEINFO_IMPORT,
              search: `importType=${1212113}&cityId=${this.cityId}&cityName=${
                this.cityName
              }`
            }}
          >
            {pagePermission('fdc:hd:residence:rental:import') ? (
              <Button type="primary" icon="upload" style={{ marginRight: 16 }}>
                导入
              </Button>
            ) : (
              ''
            )}
          </Link>
          {pagePermission('fdc:hd:residence:rental:export') ? (
            <Button type="primary" icon="download" onClick={this.exportCase}>
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
    const { cityId, cityName } = this.state
    const columns = [
      {
        title: '行政区',
        width: 100,
        // dataIndex: 'areaName'
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
        width: 212,
        render: (text, record) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{text}</div>}
            title={false}
            placement="topLeft"
          >
            <Link
              to={{
                pathname: router.RES_RENT_CASEINFO_EDIT,
                search: `caseId=${record.id}&cityId=${this.cityId}&cityName=${this.cityName}`
              }}
            >
              <div className={styles.limitProjectName}>{text}</div>
            </Link>
          </Popover>
        ),
        dataIndex: 'projectName'
      },
      {
        title: '案例用途',
        width: 160,
        dataIndex: 'usageName'
      },
      {
        title: '案例面积',
        width: 150,
        dataIndex: 'houseArea'
      },
      {
        title: '案例单价',
        width: 150,
        dataIndex: 'unitprice'
      },
      {
        title: '反调差标准价',
        width: 150,
        dataIndex: 'inverseDiffStandardPrice'
      },
      {
        title: '反调差均价',
        width: 150,
        dataIndex: 'inverseDiffAvgPrice'
      },
      {
        title: '案例类型',
        width: 150,
        dataIndex: 'caseTypeName'
      },
      {
        title: '案例日期',
        width: 160,
        render: timespan => (
          <span>{timespan ? moment(timespan).format('YYYY-MM-DD') : ''}</span>
        ),
        dataIndex: 'caseHappenDate'
      },
      {
        title: '装修',
        width: 120,
        dataIndex: 'decoration'
      },
      {
        title: '建筑类型',
        width: 150,
        dataIndex: 'buildingTypeName'
      },
      {
        title: '录入人',
        width: 160,
        dataIndex: 'creator'
      },
      {
        title: '数据权属',
        width: 150,
        // dataIndex: 'ownership'
        render: ({ ownership }) => (
          <div>
            <Popover
              content={<div style={{ maxWidth: '200px' }}>{ownership}</div>}
              title={false}
              placement="topLeft"
            >
              <div className={styles.limitOwership}>{ownership}</div>
            </Popover>
          </div>
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

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectedRows
        })
      }
    }

    return (
      <Table
        pagination={pagination}
        rowSelection={rowSelection}
        columns={columns}
        rowKey="id"
        scroll={{ x: 2000, y: 420 }}
        loading={this.context.loading.includes(actions.FETCH_CASE_LIST)}
        dataSource={this.props.caseList}
        className={styles.defineTable}
      />
    )
  }

  render() {
    return (
      <Spin spinning={this.state.deleteAllCasesLoading}>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderTable()}
        </div>
      </Spin>
    )
  }
}

export default compose(
  Form.create(),
  connect(modelSelector, containerActions)
)(CaseInfoRent)
