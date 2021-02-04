import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
// import moment from 'moment'
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
  Modal,
  Spin
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

import { breadList, columns } from './constant'
import styles from './PriceRate.less'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const confirm = Modal.confirm
// const Options = AutoComplete.Option

/*
 * 楼盘价格-价格比值
 */
class PriceRate extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    getAreaList: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    fetchPriceRateList: PropTypes.func.isRequired,
    priceRateList: PropTypes.array.isRequired,
    exportPriceRate: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    // eslint-disable-next-line
    const { keyword, cityId, cityName } = parse(props.location.search.substr(1))

    this.state = {
      // 选中的行政区范围 id数组
      checkedRegionList: [],
      checkedAllRegion: false,
      indeterminateRegion: true,

      // 选中table数据
      selectedRowKeys: [],

      keyword,

      // 一键删除Loading
      deleteAllCasesLoading: false,

      cityId,
      cityName
    }
  }

  componentDidMount() {
    // eslint-disable-next-line
    const { cityId, cityName } = this.state
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
      if (this.cityId) {
        clearInterval(this.cityIdInterval)

        // 获取行政区数据
        this.props.getAreaList(this.cityId)
        // 查询列表
        const qry = {
          cityId: this.cityId,
          pageNum: 1,
          pageSize: 20
        }
        this.props.fetchPriceRateList(qry)
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
          // sessionStorage.removeItem('CASE_INFO_SAMPLE_SEARCH')

          // 查询列表
          const qry = {
            cityId: this.cityId,
            pageNum: 1,
            pageSize: 20
          }
          this.props.fetchPriceRateList(qry)
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

  exportPriceRate = () => {
    const { checkedRegionList, selectedRowKeys } = this.state
    const { keyword } = this.props.form.getFieldsValue(['keyword'])
    const exportParams = {
      areaIds: checkedRegionList.join(','),
      keyword: keyword ? keyword.trim() : keyword,
      cityId: this.cityId,
      ids: selectedRowKeys.join(',')
    }
    const that = this
    this.props.exportPriceRate(exportParams, () => {
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
          this.props.fetchPriceRateList(formData)
        }
      }
    )
  }

  renderBreads() {
    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.path ? <Link to={item.path}>{item.name}</Link> : item.name}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )
  }

  renderForm() {
    const {
      form: { getFieldDecorator }
      // newHouseList
    } = this.props

    const {
      checkedRegionList,
      checkedAllRegion,
      indeterminateRegion,
      keyword
    } = this.state
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
          {pagePermission('fdc:hd:residence:average:exportPriceRate') ? (
            <Button
              type="primary"
              icon="download"
              onClick={this.exportPriceRate}
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
    const { cityId, cityName } = this.state
    const column = [
      ...columns,
      {
        title: '操作',
        dataIndex: 'opration',
        width: 120,
        render: (_, record) => (
          <div>
            {/* {pagePermission('fdc:am:roleManagement:setPermission') ? ( */}
            <Link
              to={{
                pathname: router.RES_PRO_PRICE_RATE_DETAIL,
                search: `?projectId=${
                  record.projectId
                }&cityId=${cityId}&cityName=${cityName}`
              }}
            >
              查看更多
            </Link>
            {/* ) : (
              <a>查看更多</a>
            )} */}
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
        columns={column}
        rowKey="projectId"
        scroll={{ x: '1600px', y: 420 }}
        loading={this.context.loading.includes(actions.FETCH_PRICE_RATE_LIST)}
        dataSource={this.props.priceRateList}
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
)(PriceRate)
