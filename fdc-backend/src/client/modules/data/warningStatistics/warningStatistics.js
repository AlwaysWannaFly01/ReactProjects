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
  message,
  Message,
  DatePicker
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
const { MonthPicker } = DatePicker
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
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getAreaList: PropTypes.func.isRequired,
    cityList: PropTypes.instanceOf(Immutable.List).isRequired,
    getVisitCities:PropTypes.func.isRequired,
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
      areaOptionsValue: [],
      // 片区
      districtOptions,
      districtOptionsValue: [],
      // 城市均价id
      cityPvgId: '',
      modalVisible: false,
      startDate,
      endDate,
      checkedRegionList:  [],
      checkedAllRegion: false,
      indeterminateRegion: true,
      sortType: null,
      currenKey: null,
      pageNum: 1
    }
  }
  
  componentDidMount() {
    this.props.getPriceWarningList({
      pageNum: 1,
      pageSize: 20
    })
    this.props.getVisitCities()
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
              <a onClick={() => this.handleEditCityPvg(text)}>
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
  
  
  
  
  
  
  
  
  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    this.setState({pageNum})
    const { cities,avgMonth } = this.props.form.getFieldsValue()
    const {areaOptionsValue} = this.state
    
    const params = {
      pageNum: pageNum || 1,
      pageSize: 20,
      useMonth: avgMonth.format('YYYY-MM-01'),
      cityIds: this.handleFindAllCityIds(cities).join(','),
      sortField: this.state.currenKey,
      sortType: this.state.sortType
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
    this.props.getPriceWarningList(params)
  }
  priceWarningExport = () => {
    const { cities,avgMonth } = this.props.form.getFieldsValue()
    const {checkedRegionList, areaOptionsValue} = this.state
    const that = this
    const params = {
      pageNum: this.state.pageNum || 1,
      pageSize: 20,
      useMonth: avgMonth.format('YYYY-MM-01'),
      areaIds: checkedRegionList.join(','),
      cityIds: this.handleFindAllCityIds(cities).join(','),
      sortField: this.state.currenKey,
      sortType: this.state.sortType
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
    this.props.priceWarningExport(params,res=>{
      const { code, message } = res
      if (+code === 200) {
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
      } else {
        Message.error(message)
      }
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
  goProjectAvg = (key,cityId,cityName,provinceId,areaId,useMonth) => {
    const hasCities = this.props.model.get('visitCities').toJS()
    if(hasCities.findIndex(e=>e===cityId)<=-1){
      message.warning('没有该城市权限，请联系管理员')
      return
    }
    if (pagePermission('fdc:hd:residence:average')) {
      sessionStorage.setItem('FDC_CITY_INFO',JSON.stringify({"id":cityId,"cityName":decodeURI(cityName),"provinceId":provinceId}))
      sessionStorage.setItem('FDC_CITY', cityId)
      this.props.history.push({
        pathname: router.RES_PRO_PROJECT_AVG,
        search: `earlyWarningField=${key}&areaId=${areaId===0?'':areaId}&userMonth=${useMonth}`
      })
    } else {
      message.warning('没有楼盘价格权限，请联系管理员')
    }
  }
  // 黄标数(对比挂牌案例均价)
  upOrDown(title, key){
    return (<span style={{cursor: 'pointer'}} onClick={()=>this.toUpOrDown(key)}>{title}{this.state.currenKey===key&&this.state.sortType===1?<Icon type="caret-up" style={{marginLeft: 5, color: '#949494'}}/>:<Icon type="caret-down"  style={{marginLeft: 5, color: '#949494'}}/>}</span> )
  }
  
  toUpOrDown(key){
    let sortType = this.state.sortType
    !sortType?sortType=1:(sortType===1?sortType=2:sortType=1)
    this.setState({
      currenKey: key,
      sortType : sortType
    },()=>{
      this.handleSearch()
    })
  }
  
  renderBreads() {
    const breadList = [
      {
        key: 1,
        path: '',
        name: '价格预警统计',
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
    const monthFormat = 'YYYY/MM'
    const { getFieldDecorator } = this.props.form
    const {
      exportLoading,
      cityValues,
      areaOptions,
      areaOptionsValue,
      districtOptions,
      districtOptionsValue
      // cityName, // change WY
      // cityId
    } = this.state
    // 物业类型
    return (
      <Form style={{ marginTop: 8 }} onSubmit={e => this.handleSearch(e, 1)}>
     
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
          <Col span={6}>
            <FormItem
              label="估价月份"
              labelCol={layout(6, 8)}
              wrapperCol={layout(6, 16)}
              style={{ marginBottom: 4 }}
            >
              {getFieldDecorator('avgMonth', {
                initialValue: moment().add(-0, 'months')
              })(
                <MonthPicker
                  format={monthFormat}
                  disabledDate={this.disabledDate}
                  allowClear={false}
                />
                // <CityRangePicker startDate={startDate} endDate={endDate} />
              )}
            </FormItem>
          </Col>
          <Col span={2}></Col>
        </Row>
        <Row style={{ marginBottom: 16 }}>
          {pagePermission('fdc:ds:warningStatistics:check') ? (
            <Button type="primary" style={{ marginRight: 16 }} onClick={()=>this.handleSearch()}>
              查询
            </Button>
          ) : (
            ''
          )}
          {pagePermission('fdc:ds:warningStatistics:export') ? (
            <Button
              type="primary"
              onClick={()=>this.priceWarningExport()}
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
    /* eslint-disable */
    const priceWarningList = this.props.model.get('priceWarningList').toJS()
    for(let [index, i] of priceWarningList.entries()){
      i.key = index
    }
    const columns = [
      {
        title: '省份',
        dataIndex: 'provinceName',
        width: 150,
      },
      {
        title: '城市',
        dataIndex: 'cityName',
        width: 150,
      },
      {
        title: '行政区',
        dataIndex: 'areaName',
        width: 150,
      },
      {
        title: this.upOrDown('黄标数(对比挂牌案例均价)','yellowAvg'),
        dataIndex: 'yellowAvg',
        render: (r,row) => <span onClick={() => this.goProjectAvg('yellowAvg', row.cityId,row.cityName,row.provinceId,row.areaId,row.useMonth)} style={{ color: 'rgba(255, 153, 0, 0.898039215686275)', cursor: 'pointer' }}>{r || r === 0 ? r : '——'}</span>
      },
      {
        title:  this.upOrDown('红标数(对比挂牌案例均价)','redAvg'),
        dataIndex: 'redAvg',
        render: (r,row) => <span onClick={()=>this.goProjectAvg('redAvg', row.cityId,row.cityName,row.provinceId,row.areaId,row.useMonth)} style={{color: '#FF0000', cursor: 'pointer'}}>{r || r===0?r:'——'}</span>
      },
      {
        title:  this.upOrDown('黄标数(对比评估案例均价)','yellowEstimateAvg'),
        dataIndex: 'yellowEstimateAvg',
        render: (r,row) => <span onClick={()=>this.goProjectAvg('yellowEstimateAvg', row.cityId,row.cityName,row.provinceId,row.areaId,row.useMonth)} style={{color: 'rgba(255, 153, 0, 0.898039215686275)', cursor: 'pointer'}}>{r || r===0?r:'——'}</span>
      },
      {
        title:  this.upOrDown('红标数(对比评估案例均价)','redEstimateAvg'),
        dataIndex: 'redEstimateAvg',
        render: (r,row) => <span onClick={()=>this.goProjectAvg('redEstimateAvg', row.cityId,row.cityName,row.provinceId,row.areaId,row.useMonth)} style={{color: '#FF0000', cursor: 'pointer'}}>{r || r===0?r:'——'}</span>
      },
      {
        title:  this.upOrDown('黄标数(对比网络参考价)','yellowAvgReference'),
        dataIndex: 'yellowAvgReference',
        render: (r,row) => <span onClick={()=>this.goProjectAvg('yellowAvgReference', row.cityId,row.cityName,row.provinceId,row.areaId,row.useMonth)} style={{color: 'rgba(255, 153, 0, 0.898039215686275)', cursor: 'pointer'}}>{r || r===0?r:'——'}</span>
      },
      {
        title:  this.upOrDown('红标数(对比网络参考价)','redAvgReference'),
        dataIndex: 'redAvgReference',
        render: (r,row) => <span onClick={()=>this.goProjectAvg('redAvgReference', row.cityId,row.cityName,row.provinceId,row.areaId,row.useMonth)} style={{color: '#FF0000', cursor: 'pointer'}}>{r || r===0?r:'——'}</span>
      },
    ]
    
    const { pageNum, pageSize, total } = this.props.model.get('priceWarningPagination')
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
        rowKey="key"
        pagination={pagination}
        columns={columns}
        dataSource={priceWarningList}
        loading={this.context.loading.includes(actions.GET_RATING_RULE_SEARCH)}
        scroll={{ x: 1800, y: 420 }}
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
)(CityPvg)
