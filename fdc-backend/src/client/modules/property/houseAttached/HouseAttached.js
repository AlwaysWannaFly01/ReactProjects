import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Form,
  Table,
  Breadcrumb,
  Icon,
  Row,
  Col,
  // Input,
  Button,
  Modal,
  Checkbox,
  Message,
  Alert,
  message,
  Select
} from 'antd'
import { parse } from 'qs'
import { pagePermission } from 'client/utils'

import showTotal from 'client/utils/showTotal'
import layout from 'client/utils/layout'
import Immutable from 'immutable'
import router from 'client/router'

import HouseAttachedAdd from './HouseAttached.add'
import HouseAttachedEdit from './HouseAttached.edit'

import styles from './HouseAttached.less'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import { facilityTypeList, columns } from './constant'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const Option = Select.Option
const confirm = Modal.confirm

/**
 * 住宅 附属房屋
 * author: WY
 */
class HouseAttached extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getProjectDetail: PropTypes.func.isRequired,
    getSubHouseType: PropTypes.func.isRequired, // 附属房屋 请求之前的接口 选择框
    getSubHouseList: PropTypes.func.isRequired, // 附属房屋算法列表
    subHouseList: PropTypes.array.isRequired, // 附属房屋算法列表的数据
    exportAttachedHouse: PropTypes.func.isRequired, // 导出
    delAttachedHouse: PropTypes.func.isRequired, // 删除
    getArithmeticType: PropTypes.func.isRequired // 附属房屋 的 计算方法
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    /* eslint-disable */
    const { projectId, pageNum = 1, cityId, cityName } = parse(
      props.location.search.substr(1)
    )
    this.state = {
      projectId,
      indeterminateType: true,
      // 全部选择打勾的状态
      checkedAllStatus: false,
      checkedAllType: false,
      checkedTypeList: [],
      pageNum,
      // 选中table数据
      selectedRowKeys: [],
      // 新增楼盘名称Modal
      addModalVisible: false,
      editModalVisible: false,
      subHouseTypeName: '',
      isOnPropertyName: '',
      id: '',
      arithmeticTypeName: '',
      arithmeticValue: '',
      cityId,
      cityName,
      // subHouseList: []
      item: {}
    }
  }

  componentDidMount() {
    // console.log(this.props.subHouseList)
    const { cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
        // 附属房屋 请求之前的接口 选择框
        this.props.getSubHouseType()
        // 附属房屋 的 计算方法
        this.props.getArithmeticType()
        const { projectId, pageNum } = this.state
        // 获取楼盘详情
        if (projectId) {
          this.props.getProjectDetail(projectId, cityId)
        }
        // 附属房屋算法列表
        const params = {
          cityId,
          pageNum,
          pageSize: 20,
          projectId
        }
        this.props.getSubHouseList(params)
        // console.log(this.props.subHouseList)
        // this.props.getSubHouseList(params, res => {
        //   this.setState({ subHouseList: res.records })
        // })
      }
    }, 100)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location !== nextProps.location) {
      // 清空form
      this.props.form.resetFields()
      // URL参数变更 刷新页面
      const { projectId = '' } = parse(nextProps.location.search.substr(1))
      this.projectId = projectId
      this.initialFetch()
      // 附属房屋算法列表
      const params = {
        cityId: this.cityId || this.state.cityId,
        pageNum,
        pageSize: 20,
        projectId
      }
      this.props.getSubHouseList(params)
      // this.props.getSubHouseList(params, res => {
      //   this.setState({ subHouseList: res.records })
      // })
    }
  }

  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          selectedRowKeys: []
        })
        // 附属房屋算法列表
        const { checkedTypeList, projectId } = this.state
        const params = {
          cityId: this.cityId || this.state.cityId,
          isOnProperties: checkedTypeList.join(','),
          pageNum,
          pageSize: 20,
          projectId,
          subHouseType: values.attachedHouse
        }
        this.props.getSubHouseList(params)
        // this.props.getSubHouseList(params, res => {
        //   this.setState({ subHouseList: res.records })
        // })
      }
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
        that.handleDelete()
      }
    })
  }

  handleDelete = () => {
    const data = {
      cityId: this.cityId || this.state.cityId,
      ids: this.state.selectedRowKeys.join(',')
    }
    this.props.delAttachedHouse(data, () => {
      Message.success('删除成功')
      this.handleSearch(null, 1)
    })
  }

  onCheckAllTypeChange = e => {
    const typeOptions = facilityTypeList
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
    const typeOptions = facilityTypeList
    this.setState({
      checkedTypeList: checkedList,
      indeterminateType:
        !!checkedList.length && checkedList.length < typeOptions.length,
      checkedAllType: checkedList.length === typeOptions.length
    })
  }
  // 新增
  handleAddHouseAttached = () => {
    this.setState({
      addModalVisible: true
    })
  }

  /* 编辑/查看 功能 */
  handleEditProAddr = (
    subHouseTypeName,
    isOnPropertyName,
    id,
    arithmeticTypeName,
    arithmeticValue
  ) => {
    this.setState(
      {
        subHouseTypeName,
        isOnPropertyName,
        id,
        arithmeticTypeName,
        arithmeticValue
      },
      () => {
        if (arithmeticTypeName) {
          this.setState({ editModalVisible: true })
        }
      }
    )
  }
  // 关闭
  handleCloseModal = () => {
    this.setState({
      addModalVisible: false,
      editModalVisible: false,
      arithmeticTypeName: ''
    })
  }

  exportCase = () => {
    const { checkedTypeList, selectedRowKeys, projectId, cityId } = this.state
    const keyword = this.props.form.getFieldValue('keyword')
    // console.log(checkedTypeList, selectedRowKeys)

    const params = {
      cityId,
      facilitiesTypeCode: checkedTypeList.join(','),
      ids: selectedRowKeys.join(','),
      keyword,
      projectId
    }

    const that = this
    this.props.exportAttachedHouse(params, () => {
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
        name: '楼盘附属房屋价格计算方法'
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
    const { subHouseTypeList } = this.props.model

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
    // const facilityTypeList = this.props.model.get('facilityTypeList').toJS()

    return (
      <Form onSubmit={e => this.handleSearch(e, 1)} layout="horizontal">
        <Row style={{ marginTop: 8, marginBottom: 0 }}>
          <FormItem
            label="是否证载"
            labelCol={layout(6, 3)}
            wrapperCol={layout(18, 14)}
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
              label="附属房屋类型"
              labelCol={layout(6, 9)}
              wrapperCol={layout(6, 15)}
            >
              {getFieldDecorator('attachedHouse')(
                <Select placeholder="请选择附属房屋类型" allowClear>
                  {subHouseTypeList.map(item => (
                    <Option key={item.get('code')} value={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
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
            {pagePermission('fdc:hd:residence:base:attachedHouse:add') ? (
              <Button
                type="primary"
                icon="plus"
                style={{ marginRight: 16 }}
                onClick={this.handleAddHouseAttached}
              >
                新增
              </Button>
            ) : null}
            {pagePermission('fdc:hd:residence:base:attachedHouse:delete') ? (
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
                // search: `importType=1212118&projectId=${projectId}`
                search: `importType=${1212118}&projectId=${projectId}&cityId=${cityId}&cityName=${cityName}`
              }}
            >
              {pagePermission('fdc:hd:residence:base:attachedHouse:import') ? (
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
            {pagePermission('fdc:hd:residence:base:attachedHouse:export') ? (
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
    const columnsEdit = [
      {
        title: '附属房屋类型',
        width: 156,
        dataIndex: 'subHouseTypeName',
        render: (
          subHouseTypeName,
          { isOnPropertyName, id, arithmeticTypeName, arithmeticValue }
        ) =>
          pagePermission('fdc:hd:residence:base:attachedHouse:change') ? (
            <a
              onClick={() =>
                this.handleEditProAddr(
                  subHouseTypeName,
                  isOnPropertyName,
                  id,
                  arithmeticTypeName,
                  arithmeticValue
                )
              }
            >
              <div>{subHouseTypeName}</div>
            </a>
          ) : (
            <a>{subHouseTypeName}</a>
          )
      },
      ...columns
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
    // console.log(this.props.subHouseList)
    return (
      <Table
        columns={columnsEdit}
        rowSelection={rowSelection}
        rowKey="id"
        pagination={pagination}
        dataSource={this.props.subHouseList}
        // loading={this.context.loading.includes(actions.GET_PROJECT_FACILITIES)}
        scroll={{ y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  render() {
    const {
      subHouseTypeList,
      subArithmeticList,
      projectDetail: { sysStatus }
    } = this.props.model
    const {
      projectId,
      subHouseTypeName,
      isOnPropertyName,
      id,
      arithmeticTypeName,
      arithmeticValue,
      editModalVisible,
      addModalVisible
    } = this.state
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderHeader()}
          {this.renderForm()}
          {this.renderTable()}
        </div>
        {arithmeticTypeName ? (
          <HouseAttachedEdit
            editModalVisible={editModalVisible}
            onCloseModal={this.handleCloseModal}
            projectId={projectId}
            subHouseTypeName={subHouseTypeName}
            isOnPropertyName={isOnPropertyName}
            arithmeticTypeName={arithmeticTypeName}
            arithmeticValue={arithmeticValue + ''}
            id={id}
            sysStatus={sysStatus}
            // subHouseList={subHouseList}
            onSearch={this.handleSearch}
            subArithmeticList={subArithmeticList}
          />
        ) : (
          ''
        )}
        <HouseAttachedAdd
          addModalVisible={addModalVisible}
          onCloseModal={this.handleCloseModal}
          subHouseTypeList={subHouseTypeList}
          subArithmeticList={subArithmeticList}
          projectId={projectId}
          onSearch={this.handleSearch}
        />
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
)(HouseAttached)
