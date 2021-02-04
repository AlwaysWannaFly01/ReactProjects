import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import {
  Form,
  Table,
  Breadcrumb,
  Icon,
  Row,
  Col,
  Input,
  Button,
  Modal,
  Checkbox,
  Message,
  Alert,
  Popover,
  message, Select
} from 'antd'
import { parse } from 'qs'

import showTotal from 'client/utils/showTotal'
import layout from 'client/utils/layout'
import router from 'client/router'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ProjectResource.less'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const confirm = Modal.confirm
const Option = Select.Option
/**
 * @name 楼盘配套模块
 * @author YJF
 */
class ProjectResource extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    prjectFacilityList: PropTypes.array.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getFacilityType: PropTypes.func.isRequired,
    getProjectFacilities: PropTypes.func.isRequired,
    getProjectDetail: PropTypes.func.isRequired,
    delProjectFacilities: PropTypes.func.isRequired,
    exportProjectFacilities: PropTypes.func.isRequired,
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
      types,
      keyword = '',
      pageNum = 1,
      projectId,
      cityId = '',
      cityName = ''
    } = parse(props.location.search.substr(1))

    this.state = {
      // 选中的配套类型 id数组
      checkedTypeList: types ? types.split(',') : [],
      checkedAllType: false,
      indeterminateType: true,

      selectedRowKeys: [],

      keyword,
      pageNum,
      projectId,
      cityId,
      cityName
    }
    // console.log(this.state)
  }

  componentDidMount() {
    const { cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      this.cityName =
        JSON.parse(sessionStorage.getItem('FDC_CITY_INFO')).cityName || '北京市'
      if (this.cityId) {
        clearInterval(this.cityIdInterval)

        // 获取配套类型列表
        this.props.getFacilityType()

        const { keyword, pageNum, checkedTypeList, projectId } = this.state
        // 获取楼盘详情
        if (projectId) {
          this.props.getProjectDetail(projectId, this.cityId)
        }

        const params = {
          pageNum,
          pageSize: 20,
          keyword,
          facilitiesTypeCode: checkedTypeList.join(','),
          cityId: this.cityId,
          projectId
        }
        this.props.getProjectFacilities(params)
      }
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  onCheckAllTypeChange = e => {
    const typeOptions = this.props.model.get('facilityTypeList').toJS()
    const typeOptionsValue = []
    typeOptions.forEach(item => {
      typeOptionsValue.push(item.value)
    })
    this.setState({
      checkedTypeList: e.target.checked ? typeOptionsValue : [],
      indeterminateType: false,
      checkedAllType: e.target.checked
    })
  }

  onCheckTypeChange = checkedList => {
    const typeOptions = this.props.model.get('facilityTypeList').toJS()
    this.setState({
      checkedTypeList: checkedList,
      indeterminateType:
        !!checkedList.length && checkedList.length < typeOptions.length,
      checkedAllType: checkedList.length === typeOptions.length
    })
  }

  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    // 重新查询后，清空勾选的数
    this.setState({
      selectedRowKeys: []
    })
    const { checkedTypeList, projectId } = this.state
    const keyword = this.props.form.getFieldValue('keyword')
    const sourceTypeCode = this.props.form.getFieldValue('sourceTypeCode')
    
    const params = {
      facilitiesTypeCode: checkedTypeList.join(','),
      keyword,
      sourceTypeCodes:sourceTypeCode,
      pageNum: pageNum || 1,
      pageSize: 20,
      cityId: this.cityId,
      projectId
    }
    this.props.getProjectFacilities(params,res=>{
      if(res.code==='400'){
        Message.error(res.message)
      }
    })

    let types = ''
    if (checkedTypeList.length) {
      types = checkedTypeList.join(',')
    }
    const search = `projectId=${projectId}&types=${types}&keyword=${keyword ||
      ''}&pageNum=${pageNum}`
    this.context.router.history.push({
      pathname: this.props.location.pathname,
      search
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

  handleBatchDel = () => {
    const params = {
      cityId: this.cityId,
      ids: this.state.selectedRowKeys.join(',')
    }
    this.props.delProjectFacilities(params, res => {
      const { code, message } = res
      if (+code === 200) {
        Message.success('删除成功')
        this.handleSearch(null, 1)
      } else {
        Message.error(message)
      }
    })
  }

  exportCase = () => {
    const { checkedTypeList, selectedRowKeys, projectId } = this.state
    const keyword = this.props.form.getFieldValue('keyword')

    const params = {
      cityId: this.cityId,
      facilitiesTypeCode: checkedTypeList.join(','),
      ids: selectedRowKeys.join(','),
      keyword,
      projectId
    }

    const that = this
    this.props.exportProjectFacilities(params, () => {
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

  renderBreads() {
    const {
      areaId,
      areaName,
      id,
      projectName,
      sysStatus
    } = this.props.model.get('projectDetail')
    const { cityId, cityName } = this.state

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
        name: '住宅基础数据'
      },
      {
        key: 3,
        path: router.RES_BASEINFO,
        name: areaName,
        search: `areaId=${areaId}&cityId=${cityId}&cityName=${cityName}`
      },
      {
        key: 4,
        path: router.RES_BASEINFO_ADD,
        name:
          projectName && projectName.length > 10
            ? `${projectName.substr(0, 10)}...`
            : projectName,
        search: `projectId=${id}&status=${sysStatus}&cityId=${cityId}&cityName=${cityName}`
      },
      {
        key: 6,
        path: '',
        name: '楼盘配套'
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

  renderHeader() {
    const {
      projectDetail: { areaName, projectName, sysStatus }
    } = this.props.model

    return (
      <div style={{ marginTop: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              <span
                style={{
                  fontWeight: 600,
                  color: sysStatus === 1 ? '#33CABB' : '#FF0000'
                }}
              >
                {areaName} | {projectName}
              </span>
            </p>
          }
        />
      </div>
    )
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form

    const {
      checkedTypeList,
      checkedAllType,
      indeterminateType,

      projectId,
      cityId,
      cityName
    } = this.state

    // 楼盘状态
    const {
      projectDetail: { sysStatus }
    } = this.props.model

    // 配套列表
    const facilityTypeList = this.props.model.get('facilityTypeList').toJS()

    return (
      <Form onSubmit={e => this.handleSearch(e, 1)} layout="horizontal">
        <Row style={{ marginTop: 8, marginBottom: 0 }}>
          <FormItem
            label="配套类型"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
            style={{ marginBottom: 0 }}
          >
            <Checkbox
              indeterminate={indeterminateType}
              checked={checkedAllType}
              onChange={this.onCheckAllTypeChange}
            >
              全部
            </Checkbox>
            <CheckboxGroup
              options={facilityTypeList}
              value={checkedTypeList}
              onChange={this.onCheckTypeChange}
            />
          </FormItem>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label="来源类型"
              labelCol={layout(6, 6)}
              wrapperCol={layout(6, 18)}
              style={{marginBottom: 8}}
            >
              {getFieldDecorator('sourceTypeCode',{
                initialValue: ''
              })(
                <Select placeholder="请选择">
                  <Option  value={''}>
                    全部
                  </Option>
                  <Option  value={'1'}>
                    楼盘配套自增
                  </Option>
                  <Option  value={'2'}>
                    公共配套关联
                  </Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label="关键字"
              labelCol={layout(6, 6)}
              wrapperCol={layout(6, 18)}
            >
              {getFieldDecorator('keyword', {
                initialValue: this.state.keyword
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
        {sysStatus === 1 ? (
          <Row style={{ marginBottom: 16 }}>
            <Link
              to={{
                pathname: router.RES_PROJECT_RESOURCE_EDIT,
                search: `projectId=${projectId}&cityId=${cityId}&cityName=${cityName}`
              }}
            >
              {pagePermission('fdc:hd:residence:base:realMatch:add') ? (
                <Button type="primary" icon="plus" style={{ marginRight: 16 }}>
                  新增
                </Button>
              ) : null}
            </Link>
            {pagePermission('fdc:hd:residence:base:realMatch:delete') ? (
              <Button
                type="danger"
                icon="delete"
                style={{ marginRight: 16 }}
                disabled={!this.state.selectedRowKeys.length}
                onClick={this.handleConfirmDelete}
              >
                删除
              </Button>
            ) : null}

            <Link
              to={{
                pathname: router.RES_BASEINFO_IMPORT,
                // search: `importType=1212115&projectId=${projectId}`
                search: `importType=${1212115}&projectId=${projectId}&cityId=${cityId}&cityName=${cityName}`
              }}
            >
              {pagePermission('fdc:hd:residence:base:realMatch:import') ? (
                <Button
                  type="primary"
                  icon="upload"
                  style={{ marginRight: 16 }}
                >
                  导入
                </Button>
              ) : (
                ''
              )}
            </Link>
            {pagePermission('fdc:hd:residence:base:realMatch:export') ? (
              <Button
                type="primary"
                icon="download"
                onClick={this.exportCase}
                style={{ marginRight: 16 }}
              >
                导出
              </Button>
            ) : (
              ''
            )}
          </Row>
        ) : null}
      </Form>
    )
  }

  renderTable() {
    const { cityId, cityName } = this.state
    const columns = [
      {
        title: '配套类型',
        width: 120,
        dataIndex: 'facilitiesType'
      },
      {
        title: '配套子类',
        width: 160,
        dataIndex: 'facilities'
      },
      {
        title: '配套名称',
        width: 150,
        dataIndex: 'facilitiesName',
        render: (text, record) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{text}</div>}
            title={false}
            placement="topLeft"
          >
            <Link
              to={{
                pathname: router.RES_PROJECT_RESOURCE_EDIT,
                search: `projectId=${this.state.projectId}&resourceId=${
                  record.id
                }&cityId=${cityId}&cityName=${cityName}`
              }}
            >
              <div className={styles.limitName}>{text}</div>
            </Link>
          </Popover>
        )
      },
      {
        title: '配套等级',
        width: 100,
        dataIndex: 'facilitiesClass'
      },
      {
        title: '是否内部',
        width: 100,
        dataIndex: 'isInternal'
      },
      {
        title: '与楼盘距离',
        width: 100,
        dataIndex: 'distance'
      },
      {
        title: '录入人',
        width: 150,
        dataIndex: 'creator'
      },
      {
        title: '来源类型',
        width: 150,
        render: ({ sourceTypeCode }) => (
          <span>{sourceTypeCode===1?'楼盘配套自增':(sourceTypeCode===2?'公共配套关联':'')}</span>
        )
      },
      {
        title: '数据权属',
        width: 200,
        dataIndex: 'ownership',
        render: text => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{text}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitOwnership}>{text}</div>
          </Popover>
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
      onChange: selectedRowKeys => {
        this.setState({
          selectedRowKeys
        })
      }
    }

    return (
      <Table
        columns={columns}
        rowSelection={rowSelection}
        rowKey="id"
        pagination={pagination}
        dataSource={this.props.prjectFacilityList}
        loading={this.context.loading.includes(actions.GET_PROJECT_FACILITIES)}
        scroll={{ y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderHeader()}
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
)(ProjectResource)
