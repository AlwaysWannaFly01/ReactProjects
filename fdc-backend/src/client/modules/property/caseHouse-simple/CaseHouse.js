import React, { Component, Fragment } from 'react'
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
  Message,
  Popover,
  Modal,
  Spin,
  Select,
  Popconfirm
} from 'antd'
import Immutable from 'immutable'
import { parse } from 'qs'
import { pagePermission } from 'client/utils'
import shallowEqual from 'client/utils/shallowEqual'
import showTotal from 'client/utils/showTotal'
// import ProjectSelect from 'client/components/project-select'
import layout from 'client/utils/layout'
import router from 'client/router'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './CaseInfo.less'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const confirm = Modal.confirm
const { Option } = Select
// const Options = AutoComplete.Option

/*
 * 住宅-样本楼盘数据列表
 */
class CaseHouseSample extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    getAreaList: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    fetchCaseList: PropTypes.func.isRequired,
    caseList: PropTypes.array.isRequired,
    deleteCases: PropTypes.func.isRequired,
    addCase: PropTypes.func.isRequired,
    getProjectPop: PropTypes.func.isRequired,
    exportCase: PropTypes.func.isRequired,
    isActiveProject: PropTypes.func.isRequired,
    newHouseList: PropTypes.array.isRequired,
    autoRelated: PropTypes.func.isRequired,
    autoRelatedStatus: PropTypes.func.isRequired
    // onChange: PropTypes.func
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    // eslint-disable-next-line
    const { areaIds, keyword, cityId, cityName } = parse(
      props.location.search.substr(1)
    )

    const checkedRegionList = areaIds ? areaIds.split(',').filter(i => i) : []

    this.state = {
      // 选中的行政区范围 id数组
      checkedRegionList,
      checkedAllRegion: false,
      indeterminateRegion: true,

      // 选中table数据
      selectedRowKeys: [],

      keyword,

      // 一键删除Loading
      deleteAllCasesLoading: false,
      visible: false,
      areaId: '',
      projectId: '',
      // 自动填充
      // projectList: [],
      activeFlag: '',
      nameFlag: false, // 新增弹窗联动
      cityId,
      cityName,
      flagBtn: false
    }
  }

  componentDidMount() {
    // eslint-disable-next-line
    const { checkedRegionList, keyword, cityId, cityName } = this.state

    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
      this.cityName =
        JSON.parse(sessionStorage.getItem('FDC_CITY_INFO')).cityName || cityName
      if (this.cityId) {
        clearInterval(this.cityIdInterval)

        // 获取行政区数据
        this.props.getAreaList(this.cityId)
        // 查询列表
        const qry = {
          areaIds: checkedRegionList.join(','),
          keyword,
          cityId: this.cityId,
          pageNum: 1,
          pageSize: 20
        }
        this.props.fetchCaseList(qry)
        this.props.autoRelatedStatus(this.cityId, err => {
          const { data } = err
          if (data === 0) {
            this.setState({ flagBtn: true })
          } else {
            this.setState({ flagBtn: false })
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

      this.setState(
        {
          checkedRegionList: [],
          checkedAllRegion: false,
          indeterminateRegion: true,

          selectedRowKeys: [],

          keyword: undefined
        },
        () => {
          // 清除查询条件
          sessionStorage.removeItem('CASE_INFO_SAMPLE_SEARCH')

          // 查询列表
          const qry = {
            cityId: this.cityId,
            pageNum: 1,
            pageSize: 20
          }
          this.props.fetchCaseList(qry)
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

  onRadioRegionChange = areaId => {
    this.setState({ areaId }, () => {
      this.setState({ nameFlag: !!areaId, projectId: '', activeFlag: '' })
      this.props.form.resetFields(['projectId', 'isFlag'])
      this.handleSearchProject()
    })
  }

  onSelect = projectId => {
    this.props.isActiveProject(projectId, this.cityId, data => {
      this.setState({
        projectId,
        activeFlag: data === 1 ? '是' : '否'
      })
    })
  }

  handleSearchProject = keyword => {
    const { areaId } = this.state
    const qry = {
      areaIds: areaId,
      cityId: this.cityId,
      keyword,
      pageNum: 1,
      pageSize: 15,
      statuses: 1
    }
    this.props.getProjectPop(qry)
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

  // 删除样本楼盘
  handleBatchDel = () => {
    const ids = this.state.selectedRowKeys.join(',')
    const cityId = this.cityId
    this.props.deleteCases(ids, cityId, data => {
      if (data.code === '200') {
        Message.success('删除成功')
        this.handleSearch(null, 1)
      } else {
        Message.error('删除失败')
      }
    })
  }

  exportCase = () => {
    const { checkedRegionList, selectedRowKeys } = this.state
    const { keyword } = this.props.form.getFieldsValue(['keyword'])
    const exportParams = {
      areaIds: checkedRegionList.join(','),
      keyword: keyword ? keyword.trim() : keyword,
      cityId: this.cityId,
      ids: selectedRowKeys.join(',')
    }
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

  handleOk = () => {
    this.props.form.validateFields(['projectId', 'areaId'], (err, values) => {
      if (!err) {
        const paramsEditData = {
          cityId: this.cityId,
          id: values.projectId
        }
        this.props.addCase(paramsEditData, (code, message) => {
          if (+code === 200) {
            Message.success('添加成功')
            this.handleSearch(null, 1)
            this.handleCancel()
          } else {
            Message.error(message)
          }
        })
      }
    })
  }

  openModal = () => {
    this.setState({
      visible: true
    })
  }

  handleCancel = () => {
    this.props.form.resetFields(['projectId', 'areaId', 'isFlag'])
    this.setState({
      visible: false,
      projectId: '',
      activeFlag: '',
      areaId: '',
      nameFlag: false
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
    const { checkedRegionList } = this.state
    this.props.form.validateFieldsAndScroll(
      ['checkedRegionList', 'keyword'],
      (err, values) => {
        if (!err) {
          const data = Object.assign({}, values)
          const formData = {
            areaIds: checkedRegionList.join(','),
            keyword: data.keyword ? data.keyword.trim() : '',
            cityId: this.cityId,
            pageNum: pageNum || 1,
            pageSize: 20
          }
          this.props.fetchCaseList(formData)
        }
      }
    )
  }
  // 每个季度点击一次
  handleAutoRelated = () => {
    this.props.autoRelated(this.cityId, err => {
      const { code, message } = err
      if (code === '200') {
        Message.success('一键自动关联成功')
        this.setState({ flagBtn: true })
      } else {
        Message.warning(message)
      }
    })
  }

  autoConfirm = () => {
    this.handleAutoRelated()
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
        name: '基础楼盘列表',
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
    const {
      form: { getFieldDecorator },
      newHouseList
    } = this.props

    const {
      checkedRegionList,
      checkedAllRegion,
      indeterminateRegion,
      visible,
      keyword,
      areaId,
      projectId,
      activeFlag,
      nameFlag
    } = this.state
    // console.log(this.state.flagBtn)
    // 行政区列表
    const areaList = this.props.model.get('areaList').toJS()
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
        <Row>
          <Col span={8}>
            <FormItem
              label="楼盘名称"
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
          {pagePermission('fdc:hd:residence:sampleSale:add') ? (
            <Button
              type="primary"
              icon="plus"
              // style={{ marginRight: 16 }}
              onClick={this.openModal}
            >
              新增
            </Button>
          ) : (
            ''
          )}

          <Modal
            title="新增非活跃楼盘"
            visible={visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            width={420}
            maskClosable={false}
          >
            <Form onSubmit={e => this.handleSearch(e, 1)} layout="horizontal">
              <FormItem
                label="行政区"
                labelCol={layout(6, 6)}
                wrapperCol={layout(18, 18)}
              >
                {getFieldDecorator('areaId', {
                  initialValue: areaId,
                  rules: [{ required: true, message: '请选择行政区' }],
                  onChange: this.onRadioRegionChange
                })(
                  <Select placeholder="请选择行政区" allowClear>
                    {areaList.map(item => (
                      <Option key={item.key} value={item.value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
              <FormItem
                label="楼盘名称"
                labelCol={layout(6, 6)}
                wrapperCol={layout(18, 18)}
              >
                {getFieldDecorator('projectId', {
                  rules: [{ required: true, message: '请输入楼盘名称' }]
                })(
                  <Select
                    showSearch
                    onChange={this.onSelect}
                    onSearch={this.handleSearchProject}
                    placeholder="请输入楼盘名称"
                    disabled={!nameFlag}
                    filterOption={false}
                  >
                    {newHouseList.map(item => (
                      <Option key={item.id} value={item.id}>
                        {item.projectName}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
              <FormItem
                label="是否活跃楼盘"
                labelCol={layout(6, 6)}
                wrapperCol={layout(18, 18)}
              >
                {getFieldDecorator('isFlag', {
                  initialValue: projectId ? activeFlag : ''
                })(<Input disabled />)}
              </FormItem>
            </Form>
          </Modal>
          <Link
            to={{
              pathname: router.RES_SAMPLE_CASEHOUSE_IMPORT,
              search: `importType=${1212117}&cityId=${this.cityId}&cityName=${
                this.cityName
              }`
            }}
          >
            {pagePermission('fdc:hd:residence:sampleSale:import') ? (
              <Button
                type="primary"
                icon="upload"
                style={{ marginRight: 16, marginLeft: 16 }}
              >
                导入
              </Button>
            ) : (
              ''
            )}
          </Link>
          {pagePermission('fdc:hd:residence:sampleSale:export') ? (
            <Button type="primary" icon="download" onClick={this.exportCase}>
              导出
            </Button>
          ) : (
            ''
          )}

          {pagePermission('fdc:hd:residence:sampleSale:delete') ? (
            <Button
              type="danger"
              icon="delete"
              style={{ marginLeft: 16 }}
              disabled={!this.state.selectedRowKeys.length}
              onClick={this.handleConfirmDelete}
            >
              删除
            </Button>
          ) : (
            ''
          )}
          {this.state.flagBtn ? (
            <Fragment>
              {pagePermission('fdc:hd:residence:sampleSale:autoRelated') ? (
                <Button
                  icon="pushpin"
                  disabled={this.state.flagBtn}
                  style={{ marginLeft: 16 }}
                >
                  一键自动关联
                </Button>
              ) : (
                ''
              )}
            </Fragment>
          ) : (
            <Fragment>
              {pagePermission('fdc:hd:residence:sampleSale:autoRelated') ? (
                <Popconfirm
                  title="是否确定点击“一键自动关联”按钮"
                  onConfirm={this.autoConfirm}
                  onCancel={this.autoCancel}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    icon="pushpin"
                    disabled={this.state.flagBtn}
                    // onClick={this.handleAutoRelated}
                    style={{ marginLeft: 16 }}
                  >
                    一键自动关联
                  </Button>
                </Popconfirm>
              ) : (
                ''
              )}
            </Fragment>
          )}
        </Row>
      </Form>
    )
  }

  renderTable() {
    const columns = [
      {
        title: '行政区',
        width: 100,
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
        title: '片区',
        width: 160,
        dataIndex: 'subAreaName'
      },
      {
        title: '楼盘名称',
        width: 212,
        render: text => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{text}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitProjectName}>{text}</div>
          </Popover>
        ),
        dataIndex: 'projectName'
      },
      {
        title: '是否活跃楼盘',
        width: 130,
        dataIndex: 'isActive',
        render: isActive => (isActive === 1 ? '是' : '否')
      },
      {
        title: '挂牌基准价调差初始值',
        width: 160,
        dataIndex: 'projectBaseAvgPrice'
      },
      {
        title: '主建筑类型',
        width: 150,
        dataIndex: 'buildingTypeName'
      },
      {
        title: '竣工日期',
        width: 160,
        render: deliveryDate => (
          <span>
            {deliveryDate ? moment(deliveryDate).format('YYYY-MM-DD') : ''}
          </span>
        ),
        dataIndex: 'deliveryDate'
      },
      {
        title: '楼盘地址',
        width: 200,
        dataIndex: 'address',
        render: text => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{text}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitProjectName}>{text}</div>
          </Popover>
        )
      },
      {
        title: '样本楼盘数量',
        width: 150,
        dataIndex: 'sampleProjectNumber',
        render: (sampleProjectNumber, { cityId, id, areaId }) => (
          <Link
            to={{
              pathname: router.RES_QUANITY_OF_SAMPLE_BUILDINGS,
              search: `?caseId=${id}&cityId=${cityId}&areaId=${areaId}&cityName=${
                this.cityName
              }`
            }}
          >
            {sampleProjectNumber}
          </Link>
        )
      },
      {
        title: '最近关联时间',
        width: 160,
        render: lateDate => (
          <span>{lateDate ? moment(lateDate).format('YYYY-MM-DD') : ''}</span>
        ),
        dataIndex: 'lateDate'
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
        pagination={pagination}
        rowSelection={rowSelection}
        columns={columns}
        rowKey="id"
        scroll={{ x: '1600px', y: 420 }}
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
  connect(
    modelSelector,
    containerActions
  )
)(CaseHouseSample)
