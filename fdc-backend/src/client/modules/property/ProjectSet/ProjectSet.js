import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
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
  InputNumber,
  Tooltip
} from 'antd'
import Immutable from 'immutable'
// import moment from 'moment'
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

import { setList, usageList } from './constant'

import styles from './ProjectSet.less'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const confirm = Modal.confirm
const { Option } = Select
// const Options = AutoComplete.Option

/*
 * 住宅-住宅基础数据-楼盘集合
 */
class ProjectSet extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    // history: PropTypes.object.isRequired,
    getAreaList: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    fetchProjectSet: PropTypes.func.isRequired,
    getUpArea: PropTypes.func.isRequired,
    getSubAreas: PropTypes.func.isRequired,
    // upAreaList: PropTypes.array.isRequired,
    projectSetList: PropTypes.array.isRequired,
    deleteCases: PropTypes.func.isRequired,
    addCase: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired
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

      // 集合类型
      indeterminateSet: true,
      checkedAllSet: false,
      checkedSetList: [],

      // 主用途类型
      indeterminateUsage: true,
      checkedAllUsage: false,
      checkedUsageList: [],

      // 选中table数据
      selectedRowKeys: [],
      keyword,
      // 集合类型
      // setType: '',
      // 片区类型
      subAreaNames: [],
      // 集合类型下的 行政区类型
      areaListBySetType: [],
      setProjectSetType: '',
      // 起始年份
      dateList: [],

      // 一键删除Loading
      deleteAllCasesLoading: false,
      visible: false,
      cityId,
      cityName
    }
  }

  componentDidMount() {
    // eslint-disable-next-line
    const { checkedRegionList, keyword, cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
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
        this.props.fetchProjectSet(qry)
        this.props.getUpArea({ cityId }, data => {
          let areaListBySetType = []
          areaListBySetType = data.map(({ id, areaName, projectSetType }) => ({
            key: id,
            label: areaName,
            value: `${id}`,
            projectSetType
          }))
          this.setState({ areaListBySetType })
        })
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
          this.props.fetchProjectSet(qry)
        }
      )
    }
  }

  onProjectSelectRef = ref => {
    this.projectSelectRef = ref
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

  onStartChange = value => {
    console.log(value)
  }

  onEndChange = value => {
    console.log(value)
  }

  // S 集合类型
  onCheckSetChange = checkedList => {
    this.setState({
      checkedSetList: checkedList,
      indeterminateSet:
        !!checkedList.length && checkedList.length < setList.length,
      checkedAllSet: checkedList.length === setList.length
    })
  }

  onCheckAllSetChange = e => {
    const setListValue = []
    setList.forEach(item => {
      setListValue.push(item.value)
    })
    this.setState({
      checkedSetList: e.target.checked ? setListValue : [],
      indeterminateSet: false,
      checkedAllSet: e.target.checked
    })
  }
  // E 集合类型
  // S 主用途类型
  onCheckUsageChange = checkedList => {
    this.setState({
      checkedUsageList: checkedList,
      indeterminateUsage:
        !!checkedList.length && checkedList.length < usageList.length,
      checkedAllUsage: checkedList.length === usageList.length
    })
  }

  onCheckAllUsageChange = e => {
    const usageListValue = []
    usageList.forEach(item => {
      usageListValue.push(item.value)
    })
    this.setState({
      checkedUsageList: e.target.checked ? usageListValue : [],
      indeterminateUsage: false,
      checkedAllUsage: e.target.checked
    })
  }
  // E 主用途类型

  // S 选择 集合类型
  onSelect = areaById => {
    const { areaListBySetType } = this.state
    areaListBySetType.forEach(item => {
      if (areaById === item.value) {
        this.setState({ setProjectSetType: item.projectSetType })
      }
    })

    this.props.form.resetFields(['subName'])
    this.props.getSubAreas(areaById, data => {
      let subAreaNames = []
      subAreaNames = data.map(({ id, subAreaName }) => ({
        key: id,
        label: subAreaName,
        value: `${id}`
      }))
      this.setState({ subAreaNames })
    })
  }
  // E 选择 集合类型

  handleConfirmDelete = () => {
    const that = this
    confirm({
      title: '删除楼盘集合，集合内的所有楼盘将会清空!',
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

  // 验证竣工日期区间只有一个必填就好
  handleStartValidator = (rule, val, callback) => {
    const { getFieldValue } = this.props.form
    if (getFieldValue('timeStartData') > getFieldValue('timeEndData')) {
      callback('起始年份不能大于结束年份！')
    }
    callback()
  }

  handleSearchNew = () => {
    // debugger
    // eslint-disable-next-line
    this.props.form.validateFields(
      [
        'setType',
        'areaName',
        'subName',
        'usageType',
        'timeStartData',
        'timeEndData',
        'priceStartRegion',
        'priceEndRegion',
        'setName'
      ],
      (err, values) => {
        if (!err) {
          const startDate = values.timeStartData

          const endDate = values.timeEndData

          const paramsEditData = {
            areaId: +values.areaName,
            cityId: +this.cityId,
            endDate,
            startDate,
            projectPriceDown: values.priceStartRegion,
            projectPriceUp: values.priceEndRegion,
            projectSetName: values.setName,
            projectSetType: this.state.setProjectSetType,
            projectUsageCode: values.usageType,
            subareaId: +values.subName
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
      }
    )
  }

  openModal = () => {
    this.setState({
      visible: true
    })
  }

  handleCancel = () => {
    this.setState({
      visible: false,
      setProjectSetType: ''
    })
    this.props.form.resetFields([
      'areaName',
      'subName',
      'setType',
      'usageType',
      'timeStartData',
      'timeEndData',
      'priceStartRegion',
      'priceEndRegion',
      'setName'
    ])
  }

  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    // 重新查询后，清空勾选的数
    this.setState({
      selectedRowKeys: []
    })
    const { checkedRegionList, checkedSetList, checkedUsageList } = this.state
    this.props.form.validateFieldsAndScroll(
      ['checkedRegionList', 'checkedSetList', 'checkedUsageList', 'keyword'],
      (err, values) => {
        if (!err) {
          const data = Object.assign({}, values)
          const formData = {
            areaIds: checkedRegionList.join(','),
            keyword: data.keyword ? data.keyword.trim() : '',
            cityId: this.cityId,
            pageNum: pageNum || 1,
            pageSize: 20,
            projectSetTypes: checkedSetList.join(','),
            projectUsageCodes: checkedUsageList.join(',')
          }
          this.props.fetchProjectSet(formData)
        }
      }
    )
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
        name: '住宅基础数据'
      },
      {
        key: 3,
        path: '',
        name: '楼盘集合'
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
    const {
      form: { getFieldDecorator }
    } = this.props

    const {
      checkedRegionList,
      checkedAllRegion,
      indeterminateRegion,
      visible,
      keyword,
      indeterminateSet,
      checkedAllSet,
      checkedSetList,
      indeterminateUsage,
      checkedAllUsage,
      checkedUsageList,
      subAreaNames,
      areaListBySetType,
      setProjectSetType,
      dateList
      // setType
    } = this.state
    // 行政区列表
    const areaList = this.props.model.get('areaList').toJS()
    const timeExplain = (
      <div>
        <span>1）区间左右的值，统一为“包含”；</span>
        <span>
          2）只填左边，来表示区间是 [a，＋∞）；只填右边，来表示区间是（－∞，a]。
        </span>
      </div>
    )

    let setType = ''
    if (setProjectSetType === 1) {
      setType = '按片区划分'
    } else if (setProjectSetType === 2) {
      setType = '按行政区划分'
    } else {
      setType = ''
    }

    return (
      <Form onSubmit={e => this.handleSearch(e, 1)} layout="horizontal">
        <Row style={{ marginBottom: 0 }}>
          <FormItem
            label="集合类型"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
            style={{ marginBottom: 0 }}
          >
            <Checkbox
              indeterminate={indeterminateSet}
              checked={checkedAllSet}
              onChange={this.onCheckAllSetChange}
            >
              全部
            </Checkbox>
            <CheckboxGroup
              options={setList}
              value={checkedSetList}
              onChange={this.onCheckSetChange}
            />
          </FormItem>
        </Row>
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
            label="主用途类型"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
            style={{ marginBottom: 0 }}
          >
            <Checkbox
              indeterminate={indeterminateUsage}
              checked={checkedAllUsage}
              onChange={this.onCheckAllUsageChange}
            >
              全部
            </Checkbox>
            <CheckboxGroup
              options={usageList}
              value={checkedUsageList}
              onChange={this.onCheckUsageChange}
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
          {pagePermission('fdc:hd:residence:base:projectSet:addSet') ? (
            <Button type="primary" icon="plus" onClick={this.openModal}>
              新增
            </Button>
          ) : (
            ''
          )}

          <Modal
            title="新增集合"
            visible={visible}
            onOk={this.handleSearchNew}
            onCancel={this.handleCancel}
            width={420}
            maskClosable={false}
          >
            <Form layout="horizontal">
              <FormItem
                label="区域"
                labelCol={layout(7, 7)}
                wrapperCol={layout(16, 16)}
              >
                <Row gutter={24}>
                  <Col span={12}>
                    {this.props.form.getFieldDecorator('areaName', {
                      rules: [{ required: true, message: '请选择' }]
                    })(
                      <Select
                        onChange={this.onSelect}
                        placeholder="请选择行政区"
                        showSearch
                        style={{ width: '126px', marginRight: '14px' }}
                      >
                        {areaListBySetType.map(item => (
                          <Option key={item.key} value={item.value}>
                            {item.label}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Col>
                  {setProjectSetType === 1 ? (
                    <Col span={12}>
                      <FormItem
                        className={styles.selectPosition}
                        style={{ marginBottom: '0px' }}
                      >
                        {this.props.form.getFieldDecorator('subName', {
                          rules: [{ required: true, message: '请选择' }]
                        })(
                          <Select
                            placeholder="请选择片区"
                            showSearch
                            style={{ width: '120px' }}
                            onChange={this.onSubChange}
                          >
                            {subAreaNames.map(item => (
                              <Option key={item.key} value={item.value}>
                                {item.label}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  ) : (
                    ''
                  )}
                </Row>
              </FormItem>
              <FormItem
                label="集合类型"
                labelCol={layout(7, 7)}
                wrapperCol={layout(17, 17)}
              >
                {getFieldDecorator('setType')(<span>{setType}</span>)}
              </FormItem>
              <FormItem
                label="主用途类型"
                labelCol={layout(7, 7)}
                wrapperCol={layout(17, 17)}
              >
                {getFieldDecorator('usageType', {
                  rules: [{ required: true, message: '请选择' }]
                })(
                  <Select placeholder="请选择">
                    {usageList.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>
                )}
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
                      rules: [
                        {
                          validator: this.handleStartValidator
                        }
                      ]
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
                    {getFieldDecorator('timeEndData')(
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
                    {getFieldDecorator('priceStartRegion')(
                      <InputNumber
                        min={1}
                        max={1000000000}
                        precision={0}
                        style={{ width: 94 }}
                        placeholder="起始价格"
                        onChange={this.onStartPrice}
                      />
                    )}
                    <span style={{ margin: '0 4px', fontSize: '20px' }}>~</span>
                    {getFieldDecorator('priceEndRegion')(
                      <InputNumber
                        min={1}
                        max={1000000000}
                        precision={0}
                        style={{ width: 94 }}
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
              <FormItem
                label="名称"
                labelCol={layout(7, 7)}
                wrapperCol={layout(17, 17)}
              >
                {getFieldDecorator('setName', {
                  rules: [
                    {
                      max: 50,
                      message: '最大长度为50'
                    },
                    { required: true, message: '请输入集合名称' }
                  ]
                })(<Input placeholder="请输入集合名称" />)}
              </FormItem>
            </Form>
          </Modal>

          {pagePermission('fdc:hd:residence:base:projectSet:deleteSet') ? (
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
        </Row>
      </Form>
    )
  }

  renderTable() {
    const { cityId, cityName } = this.state
    /* eslint-disable */
    const columns = [
      {
        title: '名称',
        width: 280,
        render: ({ projectSetName }) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{projectSetName}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitAreaSetName}>{projectSetName}</div>
          </Popover>
        )
      },
      {
        title: '集合类型',
        width: 120,
        dataIndex: 'projectSetTypeName'
      },
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
        width: 120,
        render: ({ subAreaName }) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{subAreaName}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitAreaName}>{subAreaName}</div>
          </Popover>
        )
        // dataIndex: 'subAreaName'
      },
      {
        title: '主用途类型',
        width: 100,
        dataIndex: 'projectUsageCodeName'
      },
      {
        title: '竣工日期区间',
        width: 140,
        dataIndex: 'projectDeliveryDateRange'
      },
      {
        title: '价格区间',
        width: 130,
        dataIndex: 'projectPriceRange'
      },
      {
        title: '操作',
        width: 80,
        render: ({ id, areaId }) => (
          <Fragment>
            {pagePermission('fdc:hd:residence:base:projectSet:check') ? (
              <Link
                to={{
                  pathname: router.RES_PROJECT_SET_DETAIL,
                  search: `?setId=${id}&areaId=${areaId}&cityId=${cityId}&cityName=${cityName}`
                }}
              >
                <span>查看详情</span>
              </Link>
            ) : (
              <a>查看详情</a>
            )}
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
        scroll={{ x: '1150px', y: 420 }}
        loading={this.context.loading.includes(actions.FETCH_PROJECT_SET)}
        dataSource={this.props.projectSetList}
        // dataSource={dataSource}
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
)(ProjectSet)
