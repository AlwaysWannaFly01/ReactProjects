import {
  Alert,
  Breadcrumb,
  Button,
  Checkbox,
  Col,
  Form,
  Icon,
  Input,
  Popconfirm,
  message,
  Message, Modal, Popover,
  Row, Table
} from 'antd'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { modelSelector } from './selector'
import actions, { containerActions } from './actions'
import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { parse } from 'qs'
import moment from 'moment'
import './sagas'
import './reducer'
import styles from '../caseLosure/BaseInfo.less'
import { Link } from 'react-router-dom'
import router from 'client/router'
import layout from 'client/utils/layout'
import shallowEqual from 'client/utils/shallowEqual'
import { pagePermission } from 'client/utils'
import showTotal from 'client/utils/showTotal'
import CaseRangePicker2 from './CaseRangePicker2'
import Immutable from 'immutable'
const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const confirm = Modal.confirm
/**
 * 住宅 楼盘列表
 * author: YJF
 */
class CaseLosure extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getAreaList: PropTypes.func.isRequired,
    getClosureCaseTypeList: PropTypes.func.isRequired,
    getEndReasonCode:  PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }
  
  /* eslint-disable */
  constructor(props) {
    super(props)
    const {
      areaIds,
      caseTypeCodes,
      pageNum = 1,
      keyword,
      cityId,
      cityName,
      caseHappenDateStart: caseHappenDateStartS,
      caseHappenDateEnd: caseHappenDateEndS,
      endReasonCodes,
    } = parse(props.location.search.substr(1))
    // 案例开始日期
    const caseHappenDateStart = caseHappenDateStartS
      ? moment(caseHappenDateStartS)
      : moment().add(-1, 'month')
    const caseHappenDateEnd = caseHappenDateEndS
      ? moment(caseHappenDateEndS)
      : moment()
    const checkedCaseTypeList = caseTypeCodes
      ? caseTypeCodes.split(',').filter(i => i)
      : []
    const checkedEndReasonCodesList = endReasonCodes
      ? endReasonCodes.split(',').filter(i => i)
      : []
    
    this.state = {
      checkedRegionList: [],
      checkedAllRegion: false,
      indeterminateRegion: true,
      checkedCaseTypeList,
      indeterminateCaseType: true,
      checkedAllCaseType: false,
      keyword: null,
      // 案例类型
      case_type_indeterminate: true,
      case_type_checkAll: false,
      //售卖状态
      selling_state_checkedList: [],
      selling_state_indeterminate: true,
      selling_state_checkAll: false,
      // 案例起始日期
      caseHappenDateStart,
      caseHappenDateEnd,
      pageNum,
      // 选中table数据
      selectedRowKeys: [],
      selectedRows: [],
      checkedEndReasonCodesList
    }
    
  }
  componentWillMount() {
  
  }
  
  componentDidMount() {
    let {
      checkedRegionList,
      checkedCaseTypeList,
      caseHappenDateStart,
      caseHappenDateEnd,
      keyword,
      cityId,
      cityName,
      checkedEndReasonCodesList
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
        this.props.getClosureCaseTypeList()
        this.props.getEndReasonCode()
        // 查询列表
        const qry = {
          areaIds: checkedRegionList.join(','),
          caseTypeCodes: checkedCaseTypeList.join(','),
          caseHappenDateStart,
          caseHappenDateEnd,
          keyword,
          cityId: this.cityId,
          pageNum: 1,
          pageSize: 20,
          endReasonCodes:checkedEndReasonCodesList
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
      .add(-1, 'months')
      const caseHappenDateEnd = moment()
      this.setState(
        {
          checkedRegionList: [],
          checkedAllRegion: false,
          indeterminateRegion: true,
          // 案例类型
          checkedCaseTypeList: [],
          case_type_indeterminate: true,
          case_type_checkAll: false,
          //售卖状态
          selling_state_checkedList: [],
          selling_state_indeterminate: true,
          selling_state_checkAll: false,
          caseHappenDateStart,
          caseHappenDateEnd,
          selectedRowKeys: [],
          selectedRows: [],
          keyword: null,
          pageNum: 1
        },
        () => {
          // 清除查询条件
          // sessionStorage.removeItem('CASE_INFO_RENT_SEARCH')
          // 初始化案例日期
          this.caseDate.initialDate(caseHappenDateStart, caseHappenDateEnd)
        }
      )
    }
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
        const { caseDate, keyword, exportDate } = data
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
          
          if (exportDate) {
            delParams.createTimeStart = exportDate.startDate.format(
                'YYYY-MM-DD'
            )
            delParams.createTimeEnd = exportDate.endDate.format('YYYY-MM-DD')
          }
          // console.log(delParams)
          this.props.deleteAllCases(delParams, res => {
            const { code, message } = res
            this.setState({
              deleteAllCasesLoading: false
            })
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
      selling_state_checkedList,
      selectedRowKeys
    } = this.state
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const data = Object.assign({}, values)
        // 案例日期手动必填👀
        const { caseDate, keyword, exportDate } = data
        if (caseDate) {
          const exportParams = {
            areaIds: checkedRegionList.join(','),
            caseTypeCodes: checkedCaseTypeList.join(','),
            endReasonCodes: selling_state_checkedList.join(','),
            caseHappenDateStart: caseDate.startDate.format('YYYY-MM-DD'),
            caseHappenDateEnd: caseDate.endDate.format('YYYY-MM-DD'),
            keyword: keyword ? keyword.trim() : keyword,
            cityId: this.cityId,
            ids: selectedRowKeys.join(',')
          }
          
          if (exportDate) {
            exportParams.createTimeStart = exportDate.startDate.format(
                'YYYY-MM-DD'
            )
            exportParams.createTimeEnd = exportDate.endDate.format('YYYY-MM-DD')
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
  
  onCaseDateRef = ref => {
    this.caseDate = ref
  }
  
  caseTypeOnChange = checkedList => {
    const closureCaseTypeList  = this.props.model.get('closureCaseTypeList').toJS()
    this.setState({
      checkedCaseTypeList: checkedList,
      case_type_indeterminate:
        !!checkedList.length && checkedList.length < closureCaseTypeList.length,
      case_type_checkAll: checkedList.length === closureCaseTypeList.length
    })
  };
  
  caseTypeOnCheckAllChange = e => {
    const closureCaseTypeList  = this.props.model.get('closureCaseTypeList').toJS()
    const regionOptionsValue = []
    closureCaseTypeList.forEach(item => {
      regionOptionsValue.push(item.value)
    })
    this.setState({
      checkedCaseTypeList: e.target.checked ? regionOptionsValue : [],
      case_type_indeterminate: false,
      case_type_checkAll: e.target.checked
    })
  };
  sellingStateOnChange = checkedList => {
    const endReasonCode = this.props.model.get('endReasonCode').toJS()
    this.setState({
      selling_state_checkedList: checkedList,
      selling_state_indeterminate:
        !!checkedList.length && checkedList.length < endReasonCode.length,
      selling_state_checkAll: checkedList.length === endReasonCode.length
    })
  };
  
  sellingStateOnCheckAllChange = e => {
    const endReasonCode = this.props.model.get('endReasonCode').toJS()
    const regionOptionsValue = []
    endReasonCode.forEach(item => {
      regionOptionsValue.push(item.value)
    })
    this.setState({
      selling_state_checkedList: e.target.checked ? regionOptionsValue : [],
      selling_state_indeterminate: false,
      selling_state_checkAll: e.target.checked
    })
  };
  
  onCheckAllRegionChange = e => {
    const regionOptions = this.props.model.get('areaList').toJS()
    const regionOptionsValue = []
    regionOptions.forEach(item => {
      regionOptionsValue.push(item.value)
    })
    debugger
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
  
  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    // 重新查询后，清空勾选的数
    this.setState({
      selectedRowKeys: [],
      selectedRows: []
    })
    
    const { checkedRegionList,checkedCaseTypeList,selling_state_checkedList } = this.state
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
            pageSize: 20,
            endReasonCodes:selling_state_checkedList.join(','),
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
          const endReasonCodes = selling_state_checkedList.join(',')
          let caseInfoSearch = `areaIds=${areaIds}&caseTypeCodes=${caseTypeCodes}&caseHappenDateStart=${caseHappenDateStart}&caseHappenDateEnd=${caseHappenDateEnd}&keyword=${keywordS ||
          ''}&pageNum=${pageNumS}&endReasonCodes=${endReasonCodes}`
          this.context.router.history.push({
            pathname: this.props.location.pathname,
            search: caseInfoSearch
          })
          sessionStorage.setItem('CASE_HOUSING_RENT_SEARCH', caseInfoSearch)
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
        name: '法拍案例数据',
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
      keyword,
      indeterminateCaseType,
      checkedAllCaseType,
      checkedCaseTypeList,
      caseHappenDateStart,
      caseHappenDateEnd
    } = this.state
    
    const closureCaseTypeList  = this.props.model.get('closureCaseTypeList').toJS()
    const endReasonCode = this.props.model.get('endReasonCode').toJS()
    
    console.log("closureCaseTypeList",closureCaseTypeList)
    // 行政区列表
    const areaList = this.props.model.get('areaList').toJS()
    return (
      <Form>
        <Row>
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
              indeterminate={this.state.case_type_indeterminate}
              onChange={this.caseTypeOnCheckAllChange}
              checked={this.state.case_type_checkAll}
            >
              全部
            </Checkbox>
          <CheckboxGroup
            options={closureCaseTypeList}
            value={checkedCaseTypeList}
            onChange={this.caseTypeOnChange}
          />
          </FormItem>
        </Row>
        
        <Row style={{ marginBottom: 0 }}>
          <FormItem
            label="售卖状态"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
            style={{ marginBottom: 0 }}
          >
            <Checkbox
              indeterminate={this.state.selling_state_indeterminate}
              onChange={this.sellingStateOnCheckAllChange}
              checked={this.state.selling_state_checkAll}
            >
              全部
            </Checkbox>
            <CheckboxGroup
              options={endReasonCode}
              value={this.state.selling_state_checkedList}
              onChange={this.sellingStateOnChange}
            />
          </FormItem>
        </Row>
  
        <Row style={{ marginBottom: 0 }}>
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
                initialValue: keyword,
              })(<Input placeholder="请输入关键字" maxLength={100} />)}
            </FormItem>
          </Col>
          <Col span={2}>
            {pagePermission('fdc:hd:residence:foreclosureCase:check') ? (
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
        <Row style={{ marginBottom: 16 }}>
          <Link
            to={{
              pathname: router.RES_CASE_LOSURE_ADD,
              search: `cityId=${this.cityId}&cityName=${this.cityName}`
            }}
          >
            {pagePermission('fdc:hd:residence:foreclosureCase:add') ? (
              <Button type="primary" icon="plus" style={{ marginRight: 16 }}>
                新增
              </Button>
            ) : (
              ''
            )}
          </Link>
          {pagePermission('fdc:hd:residence:foreclosureCase:delete') ? (
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
    
          {pagePermission('fdc:hd:residence:foreclosureCase:allDelete') ? (
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
              pathname: router.RES_LOSURE_CASEINFO_IMPORT,
              search: `importType=${1212134}&cityId=${this.cityId}&cityName=${
                this.cityName
              }`
            }}
          >
            {pagePermission('fdc:hd:residence:foreclosureCase:import') ? (
              <Button type="primary" icon="upload" style={{ marginRight: 16 }}>
                导入
              </Button>
            ) : (
              ''
            )}
          </Link>
          {pagePermission('fdc:hd:residence:foreclosureCase:export') ? (
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
            <div className={styles.limitAreaName}>{areaName ? areaName.slice(0.5) : '——'}</div>
          </Popover>
        )
      },
      {
        title: '楼盘名称',
        width: 212,
        render: (projectName, record) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{projectName}</div>}
            title={false}
            placement="topLeft"
          >
            <Link
              to={{
                pathname: router.RES_CASE_LOSURE_ADD,
                search: `caseId=${record.id}&cityId=${this.cityId}&cityName=${this.cityName}`
              }}
            >
              <div className={styles.limitProjectName}>{projectName || '——'}</div>
            </Link>
          </Popover>
        ),
        dataIndex: 'projectName'
      },
      {
        title: '案例日期',
        width: 160,
        dataIndex: 'caseHappenDate',
        render: timespan => (
          <span>{timespan ? moment(timespan).format('YYYY-MM-DD') : '——'}</span>
        ),
      },
      {
        title: '案例类型',
        width: 150,
        render:  ({caseTypeName}) => (
            <span>{caseTypeName || '——'}</span>
        ),
        // dataIndex: 'caseTypeName'
      },
      {
        title: '售卖状态',
        width: 150,
        render:  ({endReasonName}) => (
            <span>{endReasonName || '——'}</span>
        ),
        // dataIndex: 'endReasonName'
      },
      {
        title: '案例用途',
        width: 150,
        render:  ({usageName}) => (
            <span>{usageName || '——'}</span>
        ),
        // dataIndex: 'usageName'
      },
      {
        title: '建筑面积',
        width: 150,
        render:  ({houseArea}) => (
            <span>{houseArea || '——'}</span>
        ),
        // dataIndex: 'houseArea'
      },
      {
        title: '法拍成交单价',
        width: 160,
        render:  ({unitprice}) => (
            <span>{unitprice || '——'}</span>
        ),
        // dataIndex: 'unitprice'
      },
      {
        title: '法拍评估单价',
        width: 120,
        render:  ({estimateUnitprice}) => (
            <span>{estimateUnitprice || '——'}</span>
        ),
        // dataIndex: 'estimateUnitprice'
      },
      {
        title: '开拍时间',
        width: 150,
        dataIndex: 'openDate',
        render: timespan => (
          <span>{timespan ? moment(timespan).format('YYYY-MM-DD') : '——'}</span>
        ),
      },
      {
        title: '录入人',
        width: 160,
        render:  ({creator}) => (
            <span>{creator || '——'}</span>
        ),
        // dataIndex: 'creator'
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
              <div className={styles.limitOwership}>{ownership ||  '——'}</div>
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
)(CaseLosure)
