import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import router from 'client/router'
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
  Message,
  Select,
  InputNumber,
  Tooltip
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

import styles from './ProjectSet.less'
import { columns, timeExplain } from './constant.js'
// import moment = require('moment');

const FormItem = Form.Item
const { Option } = Select
const confirm = Modal.confirm

/*
 * 住宅-住宅基础数据-楼盘集合-集合楼盘详情
 */
class ProjectSetDetail extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getSetDetail: PropTypes.func.isRequired,
    getSetProjectList: PropTypes.func.isRequired, // 集合楼盘详情页表格
    selectProjectList: PropTypes.array.isRequired,
    // getProjectList: PropTypes.func.isRequired,
    // sampleList: PropTypes.array.isRequired,
    getSetPopList: PropTypes.func.isRequired, // 新增弹窗表格
    setPopList: PropTypes.array.isRequired,
    // getAreaList: PropTypes.func.isRequired,
    // getSampleListInBase: PropTypes.func.isRequired,
    deleteSamples: PropTypes.func.isRequired,
    addSamples: PropTypes.func.isRequired, // 弹窗里面的确定按钮
    updateSet: PropTypes.func.isRequired, // 6. 修改集合
    // relateSample: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    // eslint-disable-next-line
    const { setId, cityId, areaId, cityName } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      setId,
      cityId,
      areaId,
      // 基础下的样本楼盘
      selectedRowKeysBuildings: [],
      selectedRowKeysPop: [],
      visible: false,
      // 起始年份
      dateList: [],
      updateVisible: false, // 更改集合
      cityName
    }
  }

  componentDidMount() {
    const { setId, cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.props.getSetDetail(setId)
      if (cityId) {
        clearInterval(this.cityIdInterval)

        this.handleSetProject(null, 1)
      }
      // 起始年份
      const dateList = []
      for (let i = 1970; i < 2031; i += 1) {
        dateList.push(i)
      }
      this.setState({ dateList })
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  onSelectChangePop = selectedRowKeysPop => {
    this.setState({ selectedRowKeysPop })
  }

  onStartChange = value => {
    console.log(value)
  }

  onEndChange = value => {
    console.log(value)
  }
  // 底下的表格
  handleSetProject = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    // 重新查询后，清空勾选的数
    this.setState({
      selectedRowKeysBuildings: [],
      selectedRowKeysPop: []
    })
    const { areaId, cityId, setId } = this.state
    const paramsSet = {
      areaId,
      cityId,
      pageNum: pageNum || 1,
      pageSize: 20,
      setId
    }
    this.props.getSetProjectList(paramsSet)
  }
  // 新增 弹窗的表格
  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    // 重新查询后，清空勾选的数
    this.setState({
      selectedRowKeysBuildings: [],
      selectedRowKeysPop: []
    })

    const { areaId, cityId } = this.state
    this.props.form.validateFieldsAndScroll(['keyWords'], (err, values) => {
      if (!err) {
        const formData = {
          areaId,
          keyword: values.keyWords,
          cityId,
          // setId,
          pageNum: pageNum || 1,
          pageSize: 20
        }
        this.props.getSetPopList(formData)
      }
    })
  }

  handleConfirmDelete = () => {
    const $this = this
    confirm({
      title: '所选中的楼盘，您是否确定剔除?',
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

  // 6. 修改集合
  handleUpdate = () => {
    this.setState({ updateVisible: true })
  }

  handleUpdateOk = () => {
    const { cityId, setId } = this.state
    this.props.form.validateFields(
      [
        'setName',
        'timeStartData',
        'timeEndData',
        'priceStartRegion',
        'priceEndRegion'
      ],
      (err, values) => {
        if (!err) {
          const startDate = values.timeStartData

          const endDate = values.timeEndData
          const params = {
            cityId,
            id: setId,
            endDate,
            startDate,
            projectPriceDown: values.priceStartRegion,
            projectPriceUp: values.priceEndRegion,
            projectSetName: values.setName
          }
          this.props.updateSet(params, (code, msg) => {
            if (code === '200') {
              Message.success('修改成功!')
              this.handleSetProject(null, 1)
              this.handleUpdateCancel() // 表格
              this.props.getSetDetail(setId) // 详情
            } else {
              Message.error(msg)
            }
          })
        }
      }
    )
  }

  handleUpdateCancel = () => {
    this.setState({
      updateVisible: false
    })
    this.props.form.resetFields([
      'setName',
      'timeStartData',
      'timeEndData',
      'priceStartRegion',
      'priceEndRegion'
    ])
  }

  // 集合内剔除楼盘
  handleBatchDel = () => {
    const { cityId, setId, selectedRowKeysBuildings } = this.state
    const ids = selectedRowKeysBuildings
    const paramsDel = {
      cityId,
      projectIds: ids,
      projectSetId: setId
    }
    this.props.deleteSamples(paramsDel, code => {
      this.setState(
        {
          selectedRowKeysBuildings: []
        },
        () => {
          if (+code === 200) {
            Message.success('删除成功')
            this.handleSetProject(null, 1)
          } else {
            Message.error('删除失败')
          }
        }
      )
    })
  }

  showDrawer = () => {
    const { cityId, areaId } = this.state
    const qry = {
      areaId,
      cityId,
      pageNum: 1,
      pageSize: 20
    }
    this.props.getSetPopList(qry)
    this.setState({
      visible: true
    })
  }

  handleOk = () => {
    const { setId, cityId, selectedRowKeysPop } = this.state
    const qry = {
      cityId,
      projectIds: selectedRowKeysPop,
      projectSetId: setId
    }
    this.props.addSamples(qry, (code, message) => {
      if (+code === 200) {
        Message.success('添加成功')
        this.handleCancel()
        this.handleSetProject(null, 1)
      } else {
        Message.error(message)
      }
    })
  }

  handleCancel = () => {
    this.props.form.resetFields(['keyWords'])
    this.setState({
      visible: false,
      selectedRowKeysPop: []
    })
  }

  renderBreads() {
    const { cityId, cityName } = this.state
    /* 面包屑 */
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
        path: router.RES_PROJECT_SET,
        search: `cityId=${cityId}&cityName=${cityName}`,
        name: '楼盘集合'
      },
      {
        key: 4,
        path: '',
        name: '集合楼盘详情'
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
    const setDetail = this.props.model.get('setDetail').toJS()

    // const startTime =
    //   setDetail.projectDeliveryStartDate &&
    //   setDetail.projectDeliveryStartDate.split('-', 1)
    // const endTime =
    //   setDetail.projectDeliveryEndDate &&
    //   setDetail.projectDeliveryEndDate.split('-', 1)

    return (
      <div>
        <div>
          <span className={styles.formBrick} />
          <span className={styles.formTitle}>
            {setDetail.projectSetName}
            {/* {setDetail.areaName}
            {setDetail.projectUsageCodeName}
            {startTime}~{endTime}年{setDetail.projectSetTypeName} */}
          </span>
        </div>
        <div>
          <div className={styles.formContent}>
            <div className={styles.formPiece}>
              <span>集合类型：</span>
              <span>{setDetail.projectSetTypeName}</span>
            </div>
            <div className={styles.formPiece}>
              <span>行政区：</span>
              <span>{setDetail.areaName}</span>
            </div>
            <div className={styles.formPiece}>
              <span>片区：</span>
              <span>{setDetail.subAreaName}</span>
            </div>
          </div>
          <div className={styles.formContent}>
            <div className={styles.formPiece}>
              <span>主用途类型：</span>
              <span>{setDetail.projectUsageCodeName}</span>
            </div>
            <div className={styles.formPiece}>
              <span>竣工日期区间：</span>
              <span>{setDetail.projectDeliveryDateRange}</span>
            </div>
            <div className={styles.formPiece}>
              <span>价格区间：</span>
              <span>{setDetail.projectPriceRange}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderTable() {
    const { selectProjectList } = this.props

    const { selectedRowKeysBuildings } = this.state
    const selectionWaysBuildings = {
      selectedRowKeys: selectedRowKeysBuildings,
      onChange: selectedRowKeysBuildings => {
        this.setState({
          selectedRowKeysBuildings
        })
      }
    }

    const { pageNum, pageSize, total } = this.props.model.get('paginationDown')
    const pagination = {
      current: pageNum,
      pageSize,
      total,
      showTotal,
      showQuickJumper: true,
      onChange: pageNum => {
        this.handleSetProject(null, pageNum)
      }
    }

    return (
      <Table
        pagination={pagination}
        rowSelection={selectionWaysBuildings}
        columns={columns}
        rowKey="id"
        scroll={{ x: 900, y: 500 }}
        loading={this.context.loading.includes(actions.GET_SET_PROJECT_LIST)}
        dataSource={selectProjectList}
        className={styles.defineTable}
      />
    )
  }
  // 新增弹窗
  renderPop() {
    const { getFieldDecorator } = this.props.form
    const { dateList } = this.state
    const setDetail = this.props.model.get('setDetail').toJS()

    let startTime = null
    if (setDetail.projectDeliveryStartDate) {
      startTime = moment(setDetail.projectDeliveryStartDate).format('YYYY')
    }

    let endTime = null
    if (setDetail.projectDeliveryEndDate) {
      endTime = moment(setDetail.projectDeliveryEndDate).format('YYYY')
    }

    // console.log(startTime, endTime)
    // console.log(moment(startTime).format('YYYY'))
    return (
      <div className={styles.popButtonBox}>
        <div className={styles.popButton}>
          {pagePermission('fdc:hd:residence:base:projectSet:addSetProject') ? (
            <Button type="primary" onClick={this.showDrawer}>
              新增
            </Button>
          ) : (
            ''
          )}
        </div>

        <div className={styles.popButton}>
          {pagePermission(
            'fdc:hd:residence:base:projectSet:deleteSetProject'
          ) ? (
            <Button
              type="danger"
              onClick={this.handleConfirmDelete}
              disabled={!this.state.selectedRowKeysBuildings.length}
            >
              剔除
            </Button>
          ) : (
            ''
          )}
        </div>

        <div>
          {pagePermission('fdc:hd:residence:base:projectSet:changeSetRule') ? (
            <Button type="danger" onClick={this.handleUpdate}>
              更改集合规则
            </Button>
          ) : (
            ''
          )}
          <Modal
            title="更改集合规则"
            visible={this.state.updateVisible}
            maskClosable={false}
            onOk={this.handleUpdateOk}
            onCancel={this.handleUpdateCancel}
          >
            <Form layout="horizontal">
              <FormItem
                label="名称"
                labelCol={layout(7, 7)}
                wrapperCol={layout(17, 17)}
              >
                {getFieldDecorator('setName', {
                  rules: [
                    { required: true, message: '请输入集合名称' },
                    {
                      max: 50,
                      message: '最大长度50'
                    }
                  ],
                  initialValue: setDetail.projectSetName
                })(<Input placeholder="请输入集合名称" />)}
              </FormItem>
              <FormItem
                label="竣工日期区间"
                labelCol={layout(7, 7)}
                wrapperCol={layout(5, 5)}
              >
                {getFieldDecorator('timeData', {
                  rules: [{ required: true }]
                })(
                  <div style={{ width: '260px' }}>
                    {getFieldDecorator('timeStartData', {
                      initialValue: startTime
                    })(
                      <Select
                        showSearch
                        allowClear
                        style={{ width: 94 }}
                        placeholder="起始年份"
                        onChange={this.onStartChange}
                      >
                        {dateList.map(item => (
                          <Option key={item} value={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                    )}
                    <span style={{ margin: '0 4px', fontSize: '20px' }}>~</span>
                    {getFieldDecorator('timeEndData', {
                      initialValue: endTime
                    })(
                      <Select
                        showSearch
                        allowClear
                        style={{ width: 94 }}
                        placeholder="结束年份"
                        onChange={this.onEndChange}
                      >
                        {dateList.map(item => (
                          <Option key={item} value={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                    )}
                    <span style={{ margin: '0 10px', fontSize: '14px' }}>
                      <Tooltip placement="topLeft" title={timeExplain}>
                        <Icon type="question-circle" />
                      </Tooltip>
                    </span>
                  </div>
                )}
              </FormItem>
              <FormItem
                className={styles.cssStar}
                label="价格区间"
                labelCol={layout(7, 7)}
                wrapperCol={layout(5, 5)}
              >
                {getFieldDecorator('priceRegion')(
                  <div style={{ width: '260px' }}>
                    {getFieldDecorator('priceStartRegion', {
                      initialValue: setDetail.projectPriceDown
                    })(
                      <InputNumber
                        min={1}
                        max={1000000000}
                        precision={0}
                        placeholder="起始价格"
                        onChange={this.onStartPrice}
                      />
                    )}
                    <span style={{ margin: '0 10px', fontSize: '20px' }}>
                      ~
                    </span>
                    {getFieldDecorator('priceEndRegion', {
                      initialValue: setDetail.projectPriceUp
                    })(
                      <InputNumber
                        min={1}
                        max={1000000000}
                        precision={0}
                        placeholder="结束价格"
                        onChange={this.onEndPrice}
                      />
                    )}
                    <span style={{ margin: '0 10px', fontSize: '14px' }}>
                      <Tooltip placement="topLeft" title={timeExplain}>
                        <Icon type="question-circle" />
                      </Tooltip>
                    </span>
                  </div>
                )}
              </FormItem>
            </Form>
          </Modal>
        </div>
      </div>
    )
  }

  render() {
    const {
      form: { getFieldDecorator },
      setPopList
    } = this.props
    // S分页
    const { pageNum, pageSize, total } = this.props.model.get('paginationPop')
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
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          <div className={styles.addPop}>{this.renderPop()}</div>
          {this.renderTable()}
        </div>
        <div className={styles.drawerBox}>
          <Modal
            title="该行政区未归入集合的楼盘"
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            maskClosable={false}
            width={1100}
            footer={null}
            bodyStyle={{ padding: '16px 24px' }}
          >
            <Row className={styles.Row}>
              <Col span={8}>
                <FormItem
                  label="楼盘名称"
                  labelCol={layout(10, 10)}
                  wrapperCol={layout(14, 14)}
                >
                  {getFieldDecorator('keyWords')(
                    <Input placeholder="请输入关键字" />
                  )}
                </FormItem>
              </Col>
              <Col span={6} style={{ margin: '4px 0 0 20px' }}>
                <Button
                  type="primary"
                  icon="search"
                  onClick={e => this.handleSearch(e, 1)}
                >
                  查询
                </Button>
              </Col>
            </Row>
            <div>
              <Table
                pagination={pagination}
                rowSelection={selectionWaysPop}
                columns={columns}
                rowKey="id"
                scroll={{ x: 900, y: 400 }}
                loading={this.context.loading.includes(
                  actions.GET_SET_POP_LIST
                )}
                dataSource={setPopList}
                className={styles.defineTable}
              />
            </div>
            <div className={styles.btnBackOut}>
              <div className={styles.btnBackInner}>
                <Button
                  style={{ marginRight: '20px' }}
                  onClick={this.handleCancel}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  onClick={this.handleOk}
                  disabled={this.state.selectedRowKeysPop.length === 0}
                >
                  确定
                </Button>
              </div>
            </div>
          </Modal>
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
)(ProjectSetDetail)
