import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import Immutable from 'immutable'
import { parse } from 'qs'
import { Link } from 'react-router-dom'
import router from 'client/router'
import {
  Breadcrumb,
  Icon,
  Form,
  Row,
  Col,
  Checkbox,
  Button,
  Input,
  Table,
  message
} from 'antd'

import layout from 'client/utils/layout'
import CityRange from 'client/components/city-range'
import showTotal from 'client/utils/showTotal'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './RoomNumber.less'
import { breadList, dealStatusList, tableColumns } from './constant'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group

/**
 * @description 数据审核-DC模块
 * @author WY
 */

class AuditRoomNO extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    cityList: PropTypes.instanceOf(Immutable.List).isRequired,
    getHouseList: PropTypes.func.isRequired,
    houseList: PropTypes.array.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    const {
      areaId = '',
      fdcProjectId = '',
      projectName = '',
      buildingName = '',
      fdcBuildingId = '',
      buildingIds = '',
      cityValues
    } = parse(props.location.search.substr(1))
    this.state = {
      // 城市范围
      cityValues: cityValues ? cityValues.split(',') : [],
      // 处理状态 （选中）
      halfStatus: true,
      checkedAllStatus: false,
      checkedAllStatusList: areaId ? areaId.split(',') : [],
      // 查询所带字段
      fdcProjectId,
      projectName,
      buildingName,
      fdcBuildingId,
      buildingIds
    }
  }
  componentDidMount() {
    // const { buildingIds } = this.state
    // this.handleSearch(null, 1, !!buildingIds)
    // setTimeout(() => {
    //   this.setState({ buildingIds: '' })
    // }, 0)
    // 缓存处理状态，来解决编辑页面转房号处理是否可点击
    // if (getSession('auditState')) {
    //   removeSession('auditState')
    // }
  }
  // 处理类型 (全选)
  onCheckAllStatusChange = e => {
    const statusOptionsValue = dealStatusList.map(i => i.value)
    this.setState({
      checkedAllStatusList: e.target.checked ? statusOptionsValue : [],
      halfStatus: false,
      checkedAllStatus: e.target.checked
    })
  }
  onCheckStatusChange = e => {
    this.setState({
      checkedAllStatusList: e,
      halfStatus: !!e.length && e.length < dealStatusList.length,
      checkedAllStatus: e.length === dealStatusList.length
    })
  }
  // 搜索
  handleSearch = (e, pageNum, flag) => {
    if (e) {
      e.preventDefault()
    }
    const { cityValues, checkedAllStatusList, buildingIds } = this.state
    if (cityValues && !cityValues.length) {
      message.error('请选择城市')
      return
    }
    this.props.form.validateFields(
      ['fdcProjectId', 'projectName', 'buildingName', 'fdcBuildingId'],
      (err, values) => {
        if (!err) {
          const params = {
            pageNum: pageNum || 1,
            pageSize: 20,
            cityIds: this.handleFindAllCityIds(cityValues).join(','),
            processStates: checkedAllStatusList.join(','),
            buildingId: flag ? buildingIds : '',
            projectName: values.projectName,
            buildingName: values.buildingName,
            fdcProjectId: values.fdcProjectId,
            fdcBuildingId: values.fdcBuildingId
          }
          this.props.getHouseList(params)
          if (!flag) {
            this.setState({
              buildingIds: ''
            })
          }
          const {
            fdcProjectId,
            projectName,
            buildingName,
            fdcBuildingId,
            processStates
          } = params
          const baseInfoSearch = `&fdcProjectId=${fdcProjectId ||
            ''}&projectName=${projectName || ''}&buildingName=${buildingName ||
            ''}&fdcBuildingId=${fdcBuildingId ||
            ''}&cityValues=${cityValues}&areaId=${processStates}&pageNum=${pageNum}`
          // 将DC楼盘列表查询条件设置到 sessionStorage
          sessionStorage.setItem('ROOM_NUMBER_SEARCH', baseInfoSearch)
          this.context.router.history.push({
            pathname: this.props.location.pathname,
            search: baseInfoSearch
          })
        }
      }
    )
  }
  // 城市范围变更事件
  // value.length > 1 则重置行政区和片区
  // value.item长度为2:省份 3.城市
  handleCityRangeChange = value => {
    this.setState({
      cityValues: value
    })
  }

  handleFindAllCityIds = cityValues => {
    const cityIds = []
    if (cityValues instanceof Array) {
      cityValues.forEach(item => {
        const itemArr = item ? item.split('-') : []
        if (itemArr.length === 2) {
          const provinceId = itemArr[0]
          this.props.cityList.forEach(item => {
            if (item.get('provinceId') === +provinceId) {
              cityIds.push(item.get('id'))
            }
          })
        }
        if (itemArr.length === 3) {
          cityIds.push(itemArr[1])
        }
      })
    }
    return cityIds
  }
  renderBreads() {
    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''} {item.name}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form
    const {
      cityValues,
      halfStatus,
      checkedAllStatus,
      checkedAllStatusList,
      // 查询所带的字段
      fdcProjectId,
      projectName,
      buildingName,
      fdcBuildingId
    } = this.state
    return (
      <Form
        style={{
          marginTop: 8
        }}
        onSubmit={e => this.handleSearch(e, 1, false)}
      >
        <Row>
          <Col span={8}>
            <FormItem
              label="城市范围"
              labelCol={layout(6, 6)}
              wrapperCol={layout(6, 18)}
              style={{
                marginBottom: 4
              }}
            >
              {getFieldDecorator('cities', {
                rules: [{ required: true }]
              })(
                <CityRange
                  onCityRangeChange={this.handleCityRangeChange}
                  cityValues={cityValues}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              label="处理状态"
              labelCol={layout(6, 2)}
              wrapperCol={layout(18, 22)}
              style={{
                marginBottom: 4
              }}
            >
              <Checkbox
                indeterminate={halfStatus}
                checked={checkedAllStatus}
                onChange={this.onCheckAllStatusChange}
              >
                全部
              </Checkbox>
              <CheckboxGroup
                options={dealStatusList}
                value={checkedAllStatusList}
                onChange={this.onCheckStatusChange}
              />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label="DC楼盘名称："
              labelCol={layout(10, 6)}
              wrapperCol={layout(10, 18)}
              style={{
                marginBottom: 4
              }}
            >
              {getFieldDecorator('projectName', {
                initialValue: projectName
              })(<Input placeholder="请输入DC楼盘名称" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label="DC楼栋名称："
              labelCol={layout(10, 6)}
              wrapperCol={layout(10, 18)}
              style={{
                marginBottom: 4
              }}
            >
              {getFieldDecorator('buildingName', {
                initialValue: buildingName
              })(<Input placeholder="请输入DC楼栋名称" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label="关联楼盘ID："
              labelCol={layout(10, 6)}
              wrapperCol={layout(10, 18)}
              style={{
                marginBottom: 4
              }}
            >
              {getFieldDecorator('fdcProjectId', {
                initialValue: fdcProjectId,
                rules: [
                  {
                    required: false,
                    pattern: new RegExp(/^[1-9]\d*$/, 'g'),
                    message: '请输入正确的ID'
                  }
                ]
              })(<Input maxLength={19} placeholder="完全匹配FDC的楼盘ID" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label="关联楼栋ID："
              labelCol={layout(10, 6)}
              wrapperCol={layout(10, 18)}
              style={{
                marginBottom: 4
              }}
            >
              {getFieldDecorator('fdcBuildingId', {
                initialValue: fdcBuildingId,
                rules: [
                  {
                    required: false,
                    pattern: new RegExp(/^[1-9]\d*$/, 'g'),
                    message: '请输入正确的ID'
                  }
                ]
              })(<Input maxLength={19} placeholder="完全匹配FDC的楼栋ID" />)}
            </FormItem>
          </Col>
        </Row>
        <Row
          style={{
            marginBottom: 16
          }}
        >
          <Button
            htmlType="submit"
            type="primary"
            icon="search"
            style={{
              marginLight: 16
            }}
          >
            查询
          </Button>
        </Row>
      </Form>
    )
  }

  renderTable() {
    const { houseList } = this.props
    const { pageNum, pageSize, total } = this.props.model.get('pagination')
    const pagination = {
      current: pageNum,
      pageSize,
      total,
      showTotal,
      showQuickJumper: true,
      onChange: pageNum => {
        this.handleSearch(null, pageNum, !!this.state.buildingIds)
      }
    }
    const columns = [
      ...tableColumns,
      {
        title: '操作',
        width: 100,
        render: (
          _,
          {
            id,
            fdcBuildingStatus,
            fdcProjectStatus,
            processState,
            cityId,
            fdcBuildingId,
            fdcProjectId,
            areaName,
            projectName,
            buildingName,
            cityName // eslint-disable-line
          }
        ) => (
          <Link
            to={{
              pathname: router.AUDIT_NUMBER_EDIT,
              search: `?houseId=${id}&processState=${processState}&cityId=${cityId}&fdcBuildingId=${fdcBuildingId}&cityName=${cityName}&areaName=${areaName}&projectName=${projectName}&buildingName=${buildingName}&fdcProjectStatus=${fdcProjectStatus}&fdcBuildingStatus=${fdcBuildingStatus}`
            }}
          >
            <Button
              type="primary"
              style={{ margin: '0 8px' }}
              disabled={!(fdcProjectId && fdcBuildingId)}
            >
              处理
            </Button>
          </Link>
        )
      }
    ]
    return (
      <Table
        columns={columns}
        rowKey="id"
        dataSource={houseList}
        pagination={pagination}
        scroll={{ x: '1310px', y: 420 }}
        loading={this.context.loading.includes(actions.GET_HOUSE_LIST)}
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
)(AuditRoomNO)
