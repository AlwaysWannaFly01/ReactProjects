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
  Button,
  Input,
  Popconfirm,
  Popover,
  Checkbox,
  Message,
  Modal,
  Spin,
  message
} from 'antd'
import { parse } from 'qs'
import moment from 'moment'
import { pagePermission } from 'client/utils'
import router from 'client/router'
import layout from 'client/utils/layout'
import showTotal from 'client/utils/showTotal'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './CaseInfo.less'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const confirm = Modal.confirm

/**
 * @name 长租公寓-案例数据
 * @author YJF
 */
class CaseInfo extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    getAreaList: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getRentApartCaseList: PropTypes.func.isRequired,
    caseList: PropTypes.array.isRequired,
    delRentApartCase: PropTypes.func.isRequired,
    deleteAllCases: PropTypes.func.isRequired,
    exportRentApartCase: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    // eslint-disable-next-line
    const { areaIds, pageNum = 1, keyword, cityId, cityName } = parse(
      props.location.search.substr(1)
    )

    const checkedRegionList = areaIds ? areaIds.split(',').filter(i => i) : []

    this.state = {
      // 选中的行政区范围 id数组
      checkedRegionList,
      checkedAllRegion: false,
      indeterminateRegion: true,

      selectedRowKeys: [],

      pageNum,
      keyword,

      // 一键删除loading
      deleteAllCasesLoading: false,
      cityId,
      cityName
    }
  }

  componentDidMount() {
    // eslint-disable-next-line
    const { checkedRegionList, keyword, pageNum, cityId, cityName } = this.state

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
          pageNum,
          pageSize: 20
        }
        this.props.getRentApartCaseList(qry)
      }
    }, 100)
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

  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    // 重新查询后，清空勾选的数
    this.setState({
      selectedRowKeys: []
    })
    const { checkedRegionList } = this.state
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const params = {
          areaIds: checkedRegionList.join(','),
          keyword: values.keyword,
          pageNum: pageNum || 1,
          pageSize: 20,
          cityId: this.cityId
        }
        this.props.getRentApartCaseList(params)
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
        that.handleBatchDel()
      }
    })
  }

  handleBatchDel = () => {
    const ids = this.state.selectedRowKeys.join(',')
    const cityId = this.cityId
    this.props.delRentApartCase(ids, cityId, res => {
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
    const { checkedRegionList } = this.state

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({
          deleteAllCasesLoading: true
        })
        const { keyword } = values
        const delParams = {
          areaIds: checkedRegionList.join(','),
          keyword: keyword ? keyword.trim() : keyword,
          cityId: this.cityId
        }

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
    })
  }

  exportCase = () => {
    const { checkedRegionList, selectedRowKeys } = this.state
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const data = Object.assign({}, values)
        const { keyword } = data

        const exportParams = {
          areaIds: checkedRegionList.join(','),
          keyword: keyword ? keyword.trim() : keyword,
          cityId: this.cityId,
          ids: selectedRowKeys.join(',')
        }

        // console.log(formData)
        const that = this
        this.props.exportRentApartCase(exportParams, () => {
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
    const breadList = [
      {
        key: 1,
        path: '',
        name: '长租公寓',
        icon: 'appstore'
      },
      {
        key: 2,
        path: '',
        name: '案例数据',
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
      indeterminateRegion
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
                initialValue: ''
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
              pathname: router.RES_APART_CASE_INFO_EDIT,
              search: `cityId=${this.cityId}&cityName=${this.cityName}`
            }}
          >
            {pagePermission('fdc:hd:longRental:caseData:add') ? (
              <Button type="primary" icon="plus" style={{ marginRight: 16 }}>
                新增
              </Button>
            ) : (
              ''
            )}
          </Link>
          {pagePermission('fdc:hd:longRental:caseData:delete') ? (
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

          {pagePermission('fdc:hd:longRental:caseData:allDelete') ? (
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
              pathname: router.RES_APART_CASE_INFO_IMPORT,
              search: `importType=${1212114}&cityId=${this.cityId}&cityName=${
                this.cityName
              }`
            }}
          >
            {pagePermission('fdc:hd:longRental:caseData:import') ? (
              <Button type="primary" icon="upload" style={{ marginRight: 16 }}>
                导入
              </Button>
            ) : (
              ''
            )}
          </Link>
          {pagePermission('fdc:hd:longRental:caseData:export') ? (
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
    const columns = [
      {
        title: '行政区',
        width: 120,
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
        title: '项目名称',
        width: 212,
        render: (text, record) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{text}</div>}
            title={false}
            placement="topLeft"
          >
            <Link
              to={{
                pathname: router.RES_APART_CASE_INFO_EDIT,
                search: `caseId=${record.id}&cityId=${this.cityId}&cityName=${
                  this.cityName
                }`
              }}
            >
              <div className={styles.limitProjectName}>{text}</div>
            </Link>
          </Popover>
        ),
        dataIndex: 'projectName'
      },
      {
        title: '案例日期',
        width: 150,
        dataIndex: 'caseHappenDate',
        render: (_, record) => {
          let caseHappenDate = record.caseHappenDate
          if (caseHappenDate) {
            caseHappenDate = moment(caseHappenDate).format('YYYY-MM-DD')
          }
          return <span>{caseHappenDate}</span>
        }
      },
      {
        title: '租金范围',
        width: 150,
        dataIndex: 'rentRange'
      },
      {
        title: '建筑面积范围',
        width: 150,
        dataIndex: 'houseAreaRange'
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
      onChange: selectedRowKeys => {
        this.setState({
          selectedRowKeys
        })
      }
    }

    return (
      <Table
        columns={columns}
        pagination={pagination}
        rowSelection={rowSelection}
        rowKey="id"
        loading={this.context.loading.includes(actions.GET_RENTAPART_CASE_LIST)}
        dataSource={this.props.caseList}
        scroll={{ x: 1200, y: 420 }}
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
)(CaseInfo)
