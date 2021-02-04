import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Immutable from 'immutable'
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
  InputNumber,
  Popover,
  message
} from 'antd'
import { parse } from 'qs'
import { pagePermission } from 'client/utils'
import showTotal from 'client/utils/showTotal'
import layout from 'client/utils/layout'
import router from 'client/router'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './PublicResource.less'


const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const confirm = Modal.confirm

/**
 * @name 公共配套模块
 * @author YJF
 */
class PublicResource extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getFacilityType: PropTypes.func.isRequired,
    getCommonFacilities: PropTypes.func.isRequired,
    commonFacilityList: PropTypes.array.isRequired,
    delCommonFacilities: PropTypes.func.isRequired,
    correlateProject: PropTypes.func.isRequired,
    exportCommonFacilities: PropTypes.func.isRequired,
    getCorrelateProject: PropTypes.func.isRequired,
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    // eslint-disable-next-line
    const { types, keyword = '', pageNum = 1, cityId, cityName } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      // 选中的配套类型 id数组
      checkedTypeList: types ? types.split(',') : [],
      checkedAllType: false,
      indeterminateType: true,
      selectedRowKeys: [],
      exportLoading: false,
      modalVisible: false,
      keyword,
      pageNum,
      cityId,
      cityName,
      correlateProjectData: null
    }
  }

  componentDidMount() {
    // eslint-disable-next-line
    const { keyword, pageNum, checkedTypeList, cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
      this.cityName =
        JSON.parse(sessionStorage.getItem('FDC_CITY_INFO')).cityName || cityName
      if (this.cityId) {
        clearInterval(this.cityIdInterval)

        // 获取配套类型列表
        this.props.getFacilityType()

        const params = {
          pageNum,
          pageSize: 20,
          keyword,
          facilitiesTypeCode: checkedTypeList.join(','),
          cityId: this.cityId
        }
        this.props.getCommonFacilities(params)
      }
    }, 100)
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
    const { checkedTypeList } = this.state
    const keyword = this.props.form.getFieldValue('keyword')
    const params = {
      facilitiesTypeCode: checkedTypeList.join(','),
      keyword,
      pageNum: pageNum || 1,
      pageSize: 20,
      cityId: this.cityId
    }
    this.props.getCommonFacilities(params,res=>{
      if(res.code==='400'){
        Message.error(res.message)
      }
    })

    let types = ''
    if (checkedTypeList.length) {
      types = checkedTypeList.join(',')
    }
    const search = `types=${types}&keyword=${keyword || ''}&pageNum=${pageNum}`
    this.context.router.history.push({
      pathname: this.props.location.pathname,
      search
    })
  }

  handleConfirmDelete = () => {
    const that = this
    confirm({
      title: '删除该公共配套，重名的楼盘配套也会删除，是否确定删除？',
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
    this.props.delCommonFacilities(params, res => {
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
    const { checkedTypeList, selectedRowKeys } = this.state
    const keyword = this.props.form.getFieldValue('keyword')

    const params = {
      cityId: this.cityId,
      facilitiesTypeCode: checkedTypeList.join(','),
      ids: selectedRowKeys.join(','),
      keyword
    }

    const that = this
    this.props.exportCommonFacilities(params, () => {
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

  handleRelateProject = () => {
    // this.state.correlateProjectData = 1
    this.props.getCorrelateProject({ cityId: this.cityId }, res => {
      this.setState({
        correlateProjectData: res
      })
    })
    this.setState({
      modalVisible: true
    })
    this.props.form.resetFields()
  }

  handleCloseModal = () => {
    this.setState({
      modalVisible: false
    })
    // this.props.form.setFieldsValue({ projectDistance: undefined })
  }

  handleValidateProjectDistance = (rule, value, callback) => {
    if (value !== undefined && value !== null && value !== '') {
      if (value <= 0) {
        callback('关联距离应大于0')
      }
      if (value >= 100) {
        callback('关联距离应小于100')
      }
    }
    callback()
  }

  hanldeSubmitProjectDistance = () => {
    const {
      form: { validateFields },
    } = this.props
    validateFields((err, values) => {
    // this.props.form.validateFields(['projectDistance'], (err, values) => {
      delete values.keyword
      if (!err) {
        let params = JSON.parse(JSON.stringify(this.state.correlateProjectData))
        for (let i in params.cityFacilitiesDistances) {
          for (let b in values) {
            if (i === b.slice(0, 4)) {
              if (params.cityFacilitiesDistances[i].children) {
                let item = params.cityFacilitiesDistances[i].children.find(e => String(e.code) === b)
                item.value = values[b]
              }
            }
          }
        }
        this.props.correlateProject(params, res => {
          const { code } = res
          if (+code === 200) {
            this.setState({
              modalVisible: false
            })
            Modal.info({
              title: '提示',
              content: (
                <div>
                  <p>设置关联成功</p>
                </div>
              ),
              onOk() {}
            })
          } else {
            Message.error('设置关联失败')
          }
        })
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
        name: '公共配套'
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
      checkedTypeList,
      checkedAllType,
      indeterminateType,

      exportLoading
    } = this.state

    // 配套列表
    const facilityTypeList = this.props.model.get('facilityTypeList').toJS()
    // 公共配套是否有数据，无数据则隐藏关联楼盘按钮
    const commonFacilityListLen = this.props.commonFacilityList.length

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
        <Row style={{ marginBottom: 16 }}>
          <Link
            to={{
              pathname: router.RES_PUBLIC_RESOURCE_EDIT,
              search: `cityId=${this.cityId}&cityId=${this.cityName}`
            }}
          >
            {pagePermission('fdc:hd:residence:commonMatch:add') ? (
              <Button type="primary" icon="plus" style={{ marginRight: 16 }}>
                新增
              </Button>
            ) : (
              ''
            )}
          </Link>
          {pagePermission('fdc:hd:residence:commonMatch:delete') ? (
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

          <Link
            to={{
              pathname: router.RES_PUBLIC_RESOURCE_IMPORT,
              search: `importType=${1212116}&cityId=${this.cityId}&cityName=${
                this.cityName
              }`
            }}
          >
            {pagePermission('fdc:hd:residence:commonMatch:import') ? (
              <Button type="primary" icon="upload" style={{ marginRight: 16 }}>
                导入
              </Button>
            ) : (
              ''
            )}
          </Link>
          {pagePermission('fdc:hd:residence:commonMatch:export') ? (
            <Button
              type="primary"
              icon="download"
              onClick={this.exportCase}
              loading={exportLoading}
              style={{ marginRight: 16 }}
            >
              导出
            </Button>
          ) : (
            ''
          )}

          {pagePermission('fdc:hd:residence:commonMatch:relation') ? (
            <Button
              type="primary"
              onClick={this.handleRelateProject}
              disabled={commonFacilityListLen <= 0}
            >
              关联楼盘
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
                pathname: router.RES_PUBLIC_RESOURCE_EDIT,
                search: `resourceId=${record.id}&cityId=${
                  this.cityId
                }&cityName=${this.cityName}`
              }}
            >
              <div className={styles.limitName}>{text}</div>
            </Link>
          </Popover>
        )
      },
      {
        title: '录入人',
        width: 150,
        dataIndex: 'creator'
      },
      {
        title: '数据权属',
        width: 200,
        dataIndex: 'ownership'
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
        dataSource={this.props.commonFacilityList}
        loading={this.context.loading.includes(actions.GET_COMMON_FACILITIES)}
        scroll={{ y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  renderModal() {
    const { getFieldDecorator } = this.props.form
    const { modalVisible } = this.state
    if (!this.state.correlateProjectData) {
      return false
    }
    let data = this.state.correlateProjectData.cityFacilitiesDistances
    let list = []
    for (const i in data) {
      list.push(data[i])
    }
    return (
      <Modal
        title="设置各子类关联楼盘的距离"
        visible={modalVisible}
        onCancel={this.handleCloseModal}
        onOk={this.hanldeSubmitProjectDistance}
        maskClosable={false}
        width={570}
      >
        <div  style={{maxHeight: '400px',overflowY: 'auto'}}>
        {
          // eslint-disable-next-line array-callback-return
          list.map((item, i) => {
            return (
              <div key={String(`correlatesList${i}`)} style={{marginBottom:15}}>
                <h3><span  className={styles.formBrick}/>{item.label}</h3>
                <Row>
                  {
                    item.children.map((c, index) => {
                        return (
                          <Col span={12} key={String(`correlate${index}`)}>
                            <FormItem
                              label={c.label}
                              labelCol={layout(10)}
                              wrapperCol={layout(14)}
                              style={{marginBottom:7}}
                              >
                              {getFieldDecorator(String(c.code), {
                                  initialValue: c.value,
                                  rules: [
                                    {
                                      required: true,
                                      message: '请输入关联楼盘距离'
                                    },
                                    {
                                      validator: this.handleValidateProjectDistance
                                    }
                                  ]
                                })(
                                  <InputNumber
                                    placeholder="请输入"
                                    style={{ width: '65px' }}
                                    precision={4}
                                    />
                                )}
                              <span className="ant-form-text" style={{ marginLeft: '10px' }}>km</span>
                            </FormItem>
                          </Col>
                        )
                    })
                  }

                </Row>
              </div>
                )
          })
        }
        </div>
      </Modal>
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
        {this.renderModal()}
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
)(PublicResource)
