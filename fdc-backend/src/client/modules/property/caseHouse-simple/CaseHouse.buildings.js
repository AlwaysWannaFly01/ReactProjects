import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  Breadcrumb,
  Icon,
  Form,
  Button,
  Input,
  Table,
  Modal,
  Row,
  Col,
  Select,
  // AutoComplete,
  Message,
  Switch,
  Popover
} from 'antd'
import Immutable from 'immutable'
import { parse } from 'qs'
import moment from 'moment'
import showTotal from 'client/utils/showTotal'
import { pagePermission } from 'client/utils'
import layout from 'client/utils/layout'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './CaseInfo.less'
import { breadList, columns, columnsPop } from './constant.js'

const FormItem = Form.Item
const { Option } = Select
// const Options = AutoComplete.Option
const confirm = Modal.confirm

/*
 * 样本楼盘列表 / 新增
 */
class CaseHouseSampleBuildings extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getCaseDetail: PropTypes.func.isRequired,
    getSampleList: PropTypes.func.isRequired,
    getProjectList: PropTypes.func.isRequired,
    sampleList: PropTypes.array.isRequired,
    sampleListInBase: PropTypes.array.isRequired,
    getAreaList: PropTypes.func.isRequired,
    getSampleListInBase: PropTypes.func.isRequired,
    deleteSamples: PropTypes.func.isRequired,
    addSamples: PropTypes.func.isRequired,
    relateSample: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    // eslint-disable-next-line
    const { caseId, cityId, areaId, cityName } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      caseId,
      cityId,
      areaId,
      // 基础下的样本楼盘
      selectedRowKeysBuildings: [],
      selectedRowKeysPop: [],
      visible: false,
      // projectList: [],
      initAreaId: areaId,
      cityName
    }
  }

  componentDidMount() {
    const { caseId, cityId, cityName } = this.state
    // console.log(cityId)
    this.props.getCaseDetail(caseId, cityId)
    this.props.getSampleListInBase(caseId, cityId)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  onSelectChangePop = selectedRowKeysPop => {
    this.setState({ selectedRowKeysPop })
  }
  onRadioRegionChange = areaId => {
    this.setState({ areaId })
  }

  handleSearchProject = keyword => {
    const { areaId, cityId } = this.state
    // console.log(cityId)
    const qry = {
      areaIds: areaId,
      cityId,
      keyword,
      pageNum: 1,
      pageSize: 15
    }
    this.props.getProjectList(qry)
  }

  changeRelate = (relationStatus, projectId) => {
    const { caseId, cityId } = this.state
    const qrys = {
      baseProjectId: caseId,
      cityId,
      isRelation: relationStatus === 1 ? 0 : 1,
      projectIds: [projectId]
    }
    this.props.relateSample(qrys, code => {
      if (+code === 200) {
        if (!relationStatus) {
          Message.success('关联成功')
        } else {
          Message.success('取消关联成功')
        }
        this.props.getSampleListInBase(caseId, cityId)
      } else {
        Message.error('关联失败')
      }
    })
  }

  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    // 重新查询后，清空勾选的数
    this.setState({
      selectedRowKeysBuildings: [],
      selectedRowKeysPop: []
    })

    const { cityId, caseId } = this.state
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const data = Object.assign({}, values)
        const formData = {
          areaId: data.selectArea,
          keyword: data.productId,
          cityId,
          baseProjectId: caseId,
          pageNum: pageNum || 1,
          pageSize: 10
        }
        this.props.getSampleList(formData)
      }
    })
  }

  handleConfirmDelete = () => {
    const $this = this
    confirm({
      title: '将删除所勾选的样本楼盘，是否确定?',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        $this.handleBatchDel()
      },
      onCancel() {
        $this.setState({
          selectedRowKeysBuildings: []
        })
      }
    })
  }

  // 删除样本楼盘
  handleBatchDel = () => {
    const { caseId, cityId, selectedRowKeysBuildings } = this.state
    const ids = selectedRowKeysBuildings.join(',')
    this.props.deleteSamples(ids, cityId, code => {
      this.setState(
        {
          selectedRowKeysBuildings: []
        },
        () => {
          if (+code === 200) {
            Message.success('删除成功')
            this.props.getSampleListInBase(caseId, cityId)
          } else {
            Message.error('删除失败')
          }
        }
      )
    })
  }

  showModal = () => {
    const { caseId, cityId, areaId } = this.state
    const qry = {
      areaId,
      cityId,
      baseProjectId: caseId,
      pageNum: 1,
      pageSize: 10
    }
    this.props.getSampleList(qry)
    this.props.getAreaList(this.state.cityId)

    this.setState({
      visible: true
    })
  }

  handleOk = () => {
    const { caseId, cityId, selectedRowKeysPop } = this.state
    const qry = {
      baseProjectId: caseId,
      cityId,
      projectIds: selectedRowKeysPop
    }
    this.props.addSamples(qry, code => {
      if (+code === 200) {
        Message.success('添加成功')
        this.handleCancel()
        this.props.getSampleListInBase(caseId, cityId)
      } else {
        Message.error('请勾选需要关联的样本楼盘')
      }
    })
  }

  handleCancel = () => {
    this.props.form.resetFields(['selectArea', 'productId'])
    this.setState({
      visible: false,
      selectedRowKeysPop: [],
      areaId: this.state.initAreaId
    })
  }

  renderBreads() {
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
    const caseDetail = this.props.model.get('caseDetail').toJS()
    return (
      <div>
        <div>
          <span className={styles.formBrick} />
          <span className={styles.formTitle}>基础楼盘详情</span>
        </div>
        <div>
          <div className={styles.formContent}>
            <div className={styles.formPiece}>
              <span>楼盘名称：</span>
              <span>
                <Popover
                  content={
                    <div style={{ maxWidth: '200px' }}>
                      {caseDetail.projectName}
                    </div>
                  }
                >
                  <div className={styles.limitTitle}>
                    {caseDetail.projectName}
                  </div>
                </Popover>
              </span>
            </div>
            <div className={styles.formPiece}>
              <span>是否活跃楼盘：</span>
              <span>{caseDetail.isActive === 1 ? '是' : '否'}</span>
            </div>
            <div className={styles.formPiece}>
              <span>主建筑类型：</span>
              <span>{caseDetail.buildingTypeName}</span>
            </div>
          </div>
          <div className={styles.formContent}>
            <div className={styles.formPiece}>
              <span>挂牌基准价初始值：</span>
              <span>{caseDetail.projectBaseAvgPrice}</span>
            </div>
            <div className={styles.formPiece}>
              <span>竣工日期：</span>
              <span>
                {caseDetail.deliveryDate
                  ? moment(caseDetail.deliveryDate).format('YYYY-MM-DD')
                  : ''}
              </span>
            </div>
            <div className={styles.formPiece}>
              <span>楼盘地址：</span>
              <span>
                <Popover
                  content={
                    <div style={{ maxWidth: '200px' }}>
                      {caseDetail.address}
                    </div>
                  }
                >
                  <div className={styles.limitTitle}>{caseDetail.address}</div>
                </Popover>
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderTable() {
    const { sampleListInBase } = this.props

    const { selectedRowKeysBuildings } = this.state
    const selectionWaysBuildings = {
      selectedRowKeys: selectedRowKeysBuildings,
      onChange: selectedRowKeysBuildings => {
        this.setState({
          selectedRowKeysBuildings
        })
      }
    }
    const columnTab = [
      ...columns,
      {
        title: '关联操作',
        width: 90,
        dataIndex: 'relationStatus',
        fixed: 'right',
        render: (relationStatus, { projectId }) => (
          <Switch
            checked={!!relationStatus}
            disabled={!pagePermission('fdc:hd:residence:sampleSale:relation')}
            onClick={() => this.changeRelate(relationStatus, projectId)}
          />
        )
      }
    ]
    return (
      <Table
        pagination={false}
        rowSelection={selectionWaysBuildings}
        columns={columnTab}
        rowKey="id"
        scroll={{ x: 2000, y: 500 }}
        loading={this.context.loading.includes(actions.GET_SAMPLE_LIST)}
        dataSource={sampleListInBase}
        className={styles.defineTable}
      />
    )
  }

  renderPop() {
    const {
      form: { getFieldDecorator },
      sampleList
    } = this.props
    // 行政区列表
    const areaList = this.props.model.get('areaList').toJS()
    const areaLists = [
      {
        key: '',
        label: '全市',
        value: ''
      },
      ...areaList
    ]

    // S分页
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
    // E分页
    const { selectedRowKeysPop } = this.state
    const selectionWaysPop = {
      selectedRowKeys: selectedRowKeysPop,
      onChange: this.onSelectChangePop
    }
    // const children = projectList.map(item => (
    //   <Options key={item.id} value={item.projectName}>
    //     {item.projectName}
    //   </Options>
    // ))
    return (
      <div className={styles.popButtonBox}>
        <div className={styles.popButton}>
          {pagePermission('fdc:hd:residence:sampleSale:add') ? (
            <Button type="primary" onClick={this.showModal}>
              新增
            </Button>
          ) : (
            ''
          )}

          <Modal
            title="新增样本楼盘"
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            maskClosable={false}
            width={1300}
            bodyStyle={{ padding: '16px 24px' }}
          >
            <Row className={styles.Row}>
              <Col span={8}>
                <FormItem
                  label="行政区"
                  labelCol={layout(10, 10)}
                  wrapperCol={layout(14, 14)}
                >
                  {getFieldDecorator('selectArea', {
                    initialValue: this.state.areaId,
                    onChange: this.onRadioRegionChange
                  })(
                    <Select
                      placeholder="请选择行政区"
                      allowClear
                      className={styles.vw9}
                    >
                      {areaLists.map(item => (
                        <Option key={item.key} value={item.value}>
                          {item.label}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label="样本楼盘名称"
                  labelCol={layout(10, 10)}
                  wrapperCol={layout(14, 14)}
                >
                  {/* {getFieldDecorator('productId')(
                    <AutoComplete
                      onSearch={this.handleSearchProject}
                      placeholder="请输入样本楼盘名称"
                    >
                      {children}
                    </AutoComplete>
                  )} */}
                  {getFieldDecorator('productId')(
                    <Input
                      className={styles.vw9}
                      placeholder="请输入样本楼盘名称"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label="主建筑类型"
                  labelCol={layout(10, 10)}
                  wrapperCol={layout(14, 14)}
                >
                  {getFieldDecorator('keyword')(
                    <Input className={styles.vw9} placeholder="" disabled />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row className={styles.Row}>
              <Col span={8}>
                <FormItem
                  label="竣工日期范围"
                  labelCol={layout(10, 10)}
                  wrapperCol={layout(14, 14)}
                >
                  {getFieldDecorator('typeCode')(
                    <Input className={styles.vw9} placeholder="" disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label="挂牌基准价调差初始值范围"
                  labelCol={layout(10, 10)}
                  wrapperCol={layout(14, 14)}
                >
                  {getFieldDecorator('keyword')(
                    <Input className={styles.vw9} placeholder="" disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label="距离"
                  labelCol={layout(10, 10)}
                  wrapperCol={layout(14, 14)}
                >
                  {getFieldDecorator('distance')(
                    <Input className={styles.vw9} placeholder="" disabled />
                  )}
                </FormItem>
              </Col>
            </Row>
            <div className={styles.searchButton}>
              <Button
                type="primary"
                icon="search"
                onClick={e => this.handleSearch(e, 1)}
              >
                查询
              </Button>
            </div>
            <div>
              <Table
                pagination={pagination}
                rowSelection={selectionWaysPop}
                columns={columnsPop}
                rowKey="projectId"
                scroll={{ x: 2000 }}
                loading={this.context.loading.includes(actions.GET_SAMPLE_LIST)}
                dataSource={sampleList}
                className={styles.defineTable}
              />
            </div>
          </Modal>
        </div>
        <div className={styles.popButton}>
          {pagePermission('fdc:hd:residence:sampleSale:delete') ? (
            <Button
              type="danger"
              onClick={this.handleConfirmDelete}
              disabled={this.state.selectedRowKeysBuildings.length === 0}
            >
              删除
            </Button>
          ) : (
            ''
          )}
        </div>
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          <div className={styles.addPop}>{this.renderPop()}</div>
          {this.renderTable()}
        </div>
        {/* <div className={styles.addPop}>{this.renderPop()}</div> */}
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
)(CaseHouseSampleBuildings)
