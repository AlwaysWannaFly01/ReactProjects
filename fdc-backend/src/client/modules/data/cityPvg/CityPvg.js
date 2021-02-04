import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import {
  Table,
  Breadcrumb,
  Icon,
  Form,
  Row,
  Col,
  Button,
  Checkbox,
  Modal,
  message
} from 'antd'
// import { parse } from 'qs'
import moment from 'moment'
import { Link } from 'react-router-dom'
import layout from 'client/utils/layout'
import CityRange from 'client/components/city-range'
import showTotal from 'client/utils/showTotal'
import router from 'client/router'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './CityPvg.less'
import CityPvgEdit from './CityPvg.edit'
import CityRangePicker from './CityRangePicker'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const confirm = Modal.confirm
const areaOptions = [
  {
    label: '不限',
    value: -1
  },
  {
    label: '全市',
    value: 0
  }
]

const districtOptions = [
  {
    label: '不限',
    value: -1
  },
  {
    label: '全区',
    value: 0
  }
]

const tableColumns = [
  {
    title: '物业类型',
    dataIndex: 'propertyType'
  },
  {
    title: '省份',
    dataIndex: 'provinceName'
  },
  {
    title: '城市',
    dataIndex: 'cityName'
  },
  {
    title: '行政区',
    dataIndex: 'areaName'
  },
  {
    title: '片区',
    dataIndex: 'subAreaName'
  }
]

/**
 * @description 数据统计-城市均价模块
 * @author YJF
 */
class CityPvg extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    // location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    getCityAvgPrice: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getObjectType: PropTypes.func.isRequired,
    cityAvgList: PropTypes.array.isRequired,
    getAreaList: PropTypes.func.isRequired,
    getSubAreas: PropTypes.func.isRequired,
    cityList: PropTypes.instanceOf(Immutable.List).isRequired,
    getCityAvgPriceDetail: PropTypes.func.isRequired,
    clearCityAvgPriceDetail: PropTypes.func.isRequired,
    exportCityAvgPrice: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    const startDate = moment().add(-6, 'months')
    const endDate = moment().add(-1, 'months')

    const dateTableColumns = this.produceDateTableColumns(startDate, endDate)
    this.state = {
      tableColumns: [...tableColumns, ...dateTableColumns],

      // 物业类型
      checkedTenementList: [],
      indeterminateTenement: true,
      checkedAllTenement: false,

      // 城市范围
      cityValues: [],
      // 行政区
      areaOptions,
      areaOptionsValue: [0],
      // 片区
      districtOptions,
      districtOptionsValue: [],

      // 城市均价id
      cityPvgId: '',
      modalVisible: false,

      startDate,
      endDate
    }
  }

  componentDidMount() {
    this.cityId = sessionStorage.getItem('FDC_CITY')
    // 获取物业类型
    this.props.getObjectType()

    const { startDate, endDate, areaOptionsValue } = this.state
    const params = {
      pageNum: 1,
      pageSize: 20,
      useMonthStart: startDate.format('YYYY-MM-01'),
      useMonthEnd: endDate.format('YYYY-MM-01'),
      areaIds: areaOptionsValue.join(',')
    }
    this.props.getCityAvgPrice(params)
  }

  onCheckAllTenementChange = e => {
    const objectTypeList = this.props.model.get('objectTypeList').toJS()
    const tenementOptionsValue = []
    objectTypeList.forEach(item => {
      tenementOptionsValue.push(item.value)
    })
    this.setState({
      checkedTenementList: e.target.checked ? tenementOptionsValue : [],
      indeterminateTenement: false,
      checkedAllTenement: e.target.checked
    })
  }

  onCheckTenementChange = checkedList => {
    const objectTypeList = this.props.model.get('objectTypeList').toJS()
    this.setState({
      checkedTenementList: checkedList,
      indeterminateTenement:
        !!checkedList.length && checkedList.length < objectTypeList.length,
      checkedAllTenement: checkedList.length === objectTypeList.length
    })
  }

  // 大于6个月时，以结束月份为主向前6个月
  produceDateTableColumns = (startDate, endDate) => {
    const dateTableColumns = []
    const dateMonth = endDate.diff(startDate, 'months') + 1
    const dateMonthLen = dateMonth >= 6 ? 6 : dateMonth

    for (let i = dateMonthLen - 1; i >= 0; i -= 1) {
      // for (let i = 0; i < dateMonthLen; i += 1) {
      const endDateValue = endDate.valueOf()
      dateTableColumns.push({
        title: moment(endDateValue)
          .add(-i, 'months')
          .format('YYYY-MM'),
        dataIndex: moment(endDateValue)
          .add(-i, 'months')
          .format('YYYY-MM'),
        render: text => (
          <Fragment>
            {pagePermission('fdc:ds:cityAvg:change') ? (
              <a onClick={() => this.handleEditCityPvg(text,moment(endDateValue)
              .add(-i, 'months')
              .format('YYYY-MM'))}>
                {text ? text.split(',')[1] : ''}
              </a>
            ) : (
              <span>{text ? text.split(',')[1] : ''}</span>
            )}
          </Fragment>
        )
      })
    }
    return dateTableColumns
  }

  // 城市范围变更事件
  // value.length > 1 则重置行政区和片区
  // value.item长度为2:省份 3.城市
  handleCityRangeChange = value => {
    // console.log(value, '城市范围变更')
    this.setState({
      cityValues: value
    })
    if (value.length === 1) {
      const valueArr = value[0].split('-')
      let cityId = ''
      // 省份
      if (valueArr.length === 2) {
        const [provinceId] = valueArr
        const cityList = this.props.cityList.filter(
          item => item.get('provinceId') === +provinceId
        )
        if (cityList.size === 1) {
          cityId = cityList.get(0).get('id')
        }
      }
      // 城市
      if (valueArr.length === 3) {
        const [, realCityId] = valueArr
        cityId = realCityId
      }

      if (cityId) {
        this.props.getAreaList(cityId, res => {
          if (res instanceof Array) {
            const areaList = []
            res.forEach(item => {
              areaList.push({
                label: item.areaName,
                value: item.id
              })
            })
            this.setState({
              areaOptions: [...areaOptions, ...areaList]
            })
          }
        })
      } else {
        this.setState({
          areaOptions
        })
      }
    } else {
      this.setState({
        areaOptions,
        areaOptionsValue: [0],
        districtOptions,
        districtOptionsValue: []
      })
    }
  }

  // 行政区变更
  handleAreaChange = areaValue => {
    const areaValueLen = areaValue.length
    const currentCheckedValue = areaValue[areaValueLen - 1]
    // console.log(areaValue, currentCheckedValue, '行政区')
    // 行政区 是不限/全市
    if ([0, -1].includes(currentCheckedValue)) {
      this.setState({
        areaOptionsValue: [currentCheckedValue],
        districtOptions,
        districtOptionsValue: []
      })
    } else {
      this.setState(
        {
          areaOptionsValue: areaValue.filter(item => item !== -1 && item !== 0)
        },
        () => {
          const { areaOptionsValue } = this.state
          if (areaOptionsValue.length === 1) {
            this.props.getSubAreas(areaOptionsValue[0], res => {
              const districtList = []
              res.forEach(item => {
                districtList.push({
                  label: item.subAreaName,
                  value: item.id
                })
              })
              this.setState({
                districtOptions: [...districtOptions, ...districtList]
              })
            })
          } else {
            this.setState({
              districtOptions,
              districtOptionsValue: []
            })
          }
        }
      )
    }
  }

  // 片区变更
  handleDistrictChange = districtValue => {
    // 片区 是不限/全片区
    const districtValueLen = districtValue.length
    const currentCheckedValue = districtValue[districtValueLen - 1]
    // console.log(districtValue, currentCheckedValue, '片区')
    if ([0, -1].includes(currentCheckedValue)) {
      this.setState({
        districtOptionsValue: [currentCheckedValue]
      })
    } else {
      this.setState({
        districtOptionsValue: districtValue.filter(
          item => item !== -1 && item !== 0
        )
      })
    }
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

  // 处理查询数据
  handlePreSubmitData = pageNum => {
    const {
      monthRange: { startDate, endDate }
    } = this.props.form.getFieldsValue()
    const {
      checkedTenementList,
      cityValues,
      areaOptionsValue,
      districtOptionsValue
    } = this.state

    const params = {
      pageNum: pageNum || 1,
      pageSize: 20,
      useMonthStart: startDate.format('YYYY-MM-01'),
      useMonthEnd: endDate.format('YYYY-MM-01'),
      propertyTypes: checkedTenementList.join(',')
    }

    // console.log(cityValues, 11111)
    // 城市id
    const cityIds = this.handleFindAllCityIds(cityValues)
    if (cityIds.length) {
      params.cityIds = cityIds.join(',')
    }
    // 行政区id
    if (areaOptionsValue.length) {
      let areaIds = ''
      if (areaOptionsValue.length === 1) {
        areaIds = areaOptionsValue[0] === -1 ? '' : areaOptionsValue
      } else {
        areaIds = areaOptionsValue
      }
      if (areaIds) {
        params.areaIds = areaIds.join(',')
      }
    }
    // 片区id
    if (districtOptionsValue.length) {
      let districtIds = ''
      if (districtOptionsValue.length === 1) {
        districtIds = districtOptionsValue[0] === -1 ? '' : districtOptionsValue
      } else {
        districtIds = districtOptionsValue
      }
      if (districtIds) {
        params.subAreaIds = districtIds.join(',')
      }
    }
    return params
  }

  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }

    const {
      monthRange: { startDate, endDate }
    } = this.props.form.getFieldsValue()
    // 查询后，设置表格columns
    const dateTableColumns = this.produceDateTableColumns(startDate, endDate)
    this.setState({
      tableColumns: [...tableColumns, ...dateTableColumns]
    })

    const params = this.handlePreSubmitData(pageNum)
    // console.log(params, 'submit')
    this.props.getCityAvgPrice(params)
  }

  handleAddCityPvg = () => {
    this.props.clearCityAvgPriceDetail()
    this.setState({
      cityPvgId: '',
      modalVisible: true
    })
  }
  
  cityOnRefPvgEdit = ref =>{
    this.child = ref
  }

  handleEditCityPvg = (text,date) => {
    // console.log(text, 'edit')
    // 先判断是否有add, 有则是编辑，无则是新增
    const id = text ? text.split(',')[0] : ''
  
    this.setState({
      cityPvgId: id,
      modalVisible: true
    })
    if (id) {
      this.props.getCityAvgPriceDetail(id)
    } else {
      this.props.clearCityAvgPriceDetail()
      this.child.setFormData({
        cityId:  Number(text.split(',')[2]),
        areaId:  text.split(',')[3],
        subAreaId:  text.split(',')[4],
        propertyTypeCode:  text.split(',')[5],
        avgPriceDate:moment(date)
      })
    }
    
  }

  handleCloseModal = () => {
    this.setState({
      modalVisible: false
    })
  }

  // handleCityChange = value => {
  //   this.setState({
  //     cityValues: value
  //   })
  // }

  exportCityPvg = () => {
    const params = this.handlePreSubmitData()
    const that = this
    this.props.exportCityAvgPrice(params, () => {
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
    if (pagePermission('fdc:ds:export:check')) {
      this.props.history.push({
        pathname: router.DATA_EXPORT_TASK,
        search: 'type=2'
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
        name: '城市均价',
        icon: 'appstore'
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
      exportLoading,
      cityValues,

      indeterminateTenement,
      checkedAllTenement,
      checkedTenementList,
      startDate,
      endDate,

      areaOptions,
      areaOptionsValue,
      districtOptions,
      districtOptionsValue
      // cityName, // change WY
      // cityId
    } = this.state
    // 物业类型
    const objectTypeList = this.props.model.get('objectTypeList').toJS()
    return (
      <Form style={{ marginTop: 8 }} onSubmit={e => this.handleSearch(e, 1)}>
        <Row>
          <FormItem
            label="物业类型"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
            style={{ marginBottom: 4 }}
          >
            <Checkbox
              indeterminate={indeterminateTenement}
              checked={checkedAllTenement}
              onChange={this.onCheckAllTenementChange}
            >
              全部
            </Checkbox>
            <CheckboxGroup
              options={objectTypeList}
              value={checkedTenementList}
              onChange={this.onCheckTenementChange}
            />
          </FormItem>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label="城市范围"
              labelCol={layout(6, 6)}
              wrapperCol={layout(6, 18)}
              style={{ marginBottom: 4 }}
            >
              {getFieldDecorator('cities', {
                initialValue: cityValues
              })(<CityRange onCityRangeChange={this.handleCityRangeChange} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <FormItem
            label="行政区"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
            style={{ marginBottom: 4 }}
          >
            <CheckboxGroup
              options={areaOptions}
              value={areaOptionsValue}
              onChange={this.handleAreaChange}
            />
          </FormItem>
        </Row>
        <Row>
          <FormItem
            label="片区"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
            style={{ marginBottom: 4 }}
          >
            <CheckboxGroup
              options={districtOptions}
              value={districtOptionsValue}
              onChange={this.handleDistrictChange}
            />
          </FormItem>
        </Row>
        <Row>
          <FormItem
            label="均价月份"
            labelCol={layout(6, 2)}
            wrapperCol={layout(18, 22)}
            style={{ marginBottom: 4 }}
          >
            {getFieldDecorator('monthRange')(
              <CityRangePicker startDate={startDate} endDate={endDate} />
            )}
          </FormItem>
        </Row>
        <Row style={{ marginBottom: 16 }}>
          <Button
            htmlType="submit"
            type="primary"
            icon="search"
            style={{ marginRight: 16 }}
          >
            查询
          </Button>
          {pagePermission('fdc:ds:cityAvg:add') ? (
            <Button
              type="primary"
              icon="plus"
              style={{ marginRight: 16 }}
              onClick={this.handleAddCityPvg}
            >
              新增
            </Button>
          ) : (
            ''
          )}
          <Link
            to={{
              pathname: router.DATA_CITY_PVG_IMPORT,
              search: `importType=${1212111}&cityId=${this.cityId}`
            }}
          >
            {pagePermission('fdc:ds:cityAvg:import') ? (
              <Button type="primary" icon="upload" style={{ marginRight: 16 }}>
                导入
              </Button>
            ) : (
              ''
            )}
          </Link>
          {pagePermission('fdc:ds:cityAvg:export') ? (
            <Button
              type="primary"
              icon="download"
              onClick={this.exportCityPvg}
              loading={exportLoading}
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
    const { tableColumns } = this.state
    const columns = tableColumns
    // console.log(this.props.cityAvgList)

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

    return (
      <Table
        columns={columns}
        rowKey="id"
        dataSource={this.props.cityAvgList}
        pagination={pagination}
        className={styles.defineTable}
        loading={this.context.loading.includes(actions.GET_CITY_AVG_PRICE)}
      />
    )
  }

  render() {
    const { modalVisible, cityPvgId } = this.state
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderTable()}
        </div>
        <CityPvgEdit
          onRef={this.cityOnRefPvgEdit}
          cityPvgId={cityPvgId}
          visible={modalVisible}
          onCloseModal={this.handleCloseModal}
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
)(CityPvg)
