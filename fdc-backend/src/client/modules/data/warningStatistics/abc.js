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
  Modal,
  message,
  Message,
  Input, Checkbox,
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

import styles from './estateRating.less'
// import AreaRentalEdit from './AreaRental.edit'

const FormItem = Form.Item
const confirm = Modal.confirm
const CheckboxGroup = Checkbox.Group
const { MonthPicker } = DatePicker


/**
 * @description 数据统计-价格预警统计
 */
class warningStatistics extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    // location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    initialFetch: PropTypes.func.isRequired,
    getPriceWarningList: PropTypes.func.isRequired,
    priceWarningExport: PropTypes.func.isRequired
  }
  
  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }
  
  constructor(props) {
    super(props)
    this.state = {
      checkedRegionList:  [],
      checkedAllRegion: false,
      indeterminateRegion: true,
      sortType: null,
      currenKey: null,
      pageNum: 1
    }
  }
  
  componentDidMount() {
    this.cityId = sessionStorage.getItem('FDC_CITY')
    this.props.initialFetch({
      cityId: this.cityId
    })
    this.props.getPriceWarningList({
      pageNum: 1,
      pageSize: 20
    })
  }
  
  disabledDate = current => (current > moment().endOf('month'))
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
      let cityId = []// eslint-disable-line no-unused-vars
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
    const {checkedRegionList} = this.state
    const params = {
      pageNum: pageNum || 1,
      pageSize: 20,
      useMonth: avgMonth.format('YYYY-MM-01'),
      areaIds: checkedRegionList.join(','),
      cityIds: this.handleFindAllCityIds(cities).join(','),
      sortField: this.state.currenKey,
      sortType: this.state.sortType
    }
    this.props.getPriceWarningList(params)
  }
  priceWarningExport = () => {
    const { cities,avgMonth } = this.props.form.getFieldsValue()
    const {checkedRegionList} = this.state
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
    this.props.priceWarningExport(params,res=>{
      console.log(res)
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
      keyword,
      checkedRegionList,
      checkedAllRegion,
      indeterminateRegion
    } = this.state
    // 行政区列表
 
    const areaList = this.props.model.get('areaList').toJS()
    // for(let i of areaList){
    //   i.value = Number(i.value)
    // }
    // 物业类型
    return (
      <Form style={{ marginTop: 8 }} onSubmit={e => this.handleSearch(e, 1)}>
        <Row>
          <Col span={12}>
            <FormItem
              label="城市范围"
              labelCol={layout(4, 4)}
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
          <Col span={6}>
            <FormItem
              label="估计月份"
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
          {pagePermission('fdc:ds:ratingRules:import') ? (
            <Button type="primary" style={{ marginRight: 16 }} onClick={()=>this.handleSearch()}>
              查询
            </Button>
          ) : (
            ''
          )}
          {pagePermission('fdc:ds:ratingRules:export') ? (
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
        render: r => <span style={{color: 'rgba(255, 153, 0, 0.898039215686275)'}}>{r || r===0?r:'——'}</span>
      },
      {
        title:  this.upOrDown('红标数(对比挂牌案例均价)','redAvg'),
        dataIndex: 'redAvg',
        render: r => <span style={{color: '#FF0000'}}>{r || r===0?r:'——'}</span>
      },
      {
        title:  this.upOrDown('黄标数(对比评估案例均价)','yellowEstimateAvg'),
        dataIndex: 'yellowEstimateAvg',
        render: r => <span style={{color: 'rgba(255, 153, 0, 0.898039215686275)'}}>{r || r===0?r:'——'}</span>
      },
      {
        title:  this.upOrDown('红标数(对比评估案例均价)','redEstimateAvg'),
        dataIndex: 'redEstimateAvg',
        render: r => <span style={{color: '#FF0000'}}>{r || r===0?r:'——'}</span>
      },
      {
        title:  this.upOrDown('黄标数(对比网络参考价)','yellowAvgReference'),
        dataIndex: 'yellowAvgReference',
        render: r => <span style={{color: 'rgba(255, 153, 0, 0.898039215686275)'}}>{r || r===0?r:'——'}</span>
      },
      {
        title:  this.upOrDown('红标数(对比网络参考价)','redAvgReference'),
        dataIndex: 'redAvgReference',
        render: r => <span style={{color: '#FF0000'}}>{r || r===0?r:'——'}</span>
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
    const { modalVisible, editDate, newAreaList } = this.state
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
)(warningStatistics)
