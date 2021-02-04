import React, { Component } from 'react'
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
  DatePicker,
  Popover, Input
} from 'antd'
// import { parse } from 'qs'
import moment from 'moment'
import { Link } from 'react-router-dom'
import layout from 'client/utils/layout'
import CityRangeSingle from 'client/components/city-range-single'
import showTotal from 'client/utils/showTotal'
import router from 'client/router'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './dealStatistics.less'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const confirm = Modal.confirm
const areaOptions = [
  // {
  //   label: '不限',
  //   value: -1
  // },
  // {
  //   label: '全市',
  //   value: 0
  // }
]
/**
 * @description 数据统计-成交数据统计
 * @author YJF
 */
class DealStatistics extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    // location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    exportDealStatistics: PropTypes.func.isRequired,
    getDealStatisticsList: PropTypes.func.isRequired,
    
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    // cityAvgList: PropTypes.array.isRequired,
    getAreaList: PropTypes.func.isRequired,
    getSubAreas: PropTypes.func.isRequired,
    cityList: PropTypes.instanceOf(Immutable.List).isRequired,
    // onSearch: PropTypes.func.isRequired,
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    // const startDate = moment().add(-6, 'months')
    // const endDate = moment().add(-1, 'months')
    const avgMonth = moment().add(-0, 'months')
    // const dateTableColumns = this.produceDateTableColumns(startDate, endDate)
    this.state = {
      isCity: true,
      cityId: '',
      checkedAllRegion: false,
      indeterminateRegion: true,
      // tableColumns: [...tableColumns],
      // 城市范围
      cityValues: [],
      // 均价月份
      avgMonth,
      // 行政区
      areaOptions,
      areaOptionsValue: [-1],
      // 城市均价id
      modalVisible: false
    }
  }

  componentDidMount() {
    let vm = this
    // const { cityId, cityName } = this.state
    // this.cityId = sessionStorage.getItem('FDC_CITY') || ''
    
    //   JSON.parse(sessionStorage.getItem('FDC_CITY_INFO')).cityName || cityName
    this.setDefaultUserMonth()
  
    vm.handleSearch(null, 1)
   
    // if (cityIds.length) {
    //   params.cityId = cityIds.join(',')
    // }
    // const {avgMonth, areaOptionsValue } = this.state
    // const params = {
    //   pageNum: 1,
    //   pageSize: 20,
    //   useMonth: avgMonth.format('YYYY-MM-01 00:00:00'),
    //   // cityId: this.state.cityId
    //   // areaIds: areaOptionsValue.join(',')
    // }
    // this.props.getDealStatisticsList(params, (data, code, message) => {
    //   if (code !== '200') {
    //     message.error(message)
    //   }
    // })
  }

  // 设置均价月份默认值
  setDefaultUserMonth = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    this.setState({
      avgMonth: moment(new Date(`${year}-${month}`))
    })
    // this.avgMonth = `${year}-${month}`
  }

  disabledDate = current => (current > moment().add(-1, 'months').endOf('month'))


  // 城市范围变更事件
  // value.length > 1 则重置行政区和片区
  // value.item长度为2:省份 3.城市
  handleCityRangeChange = value => {
    // console.log(value, '城市范围变更')
    this.setState({
      cityValues: value,
      areaOptionsValue: [-1],
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
              // areaOptions: [...areaOptions, ...areaList]
              areaOptions: [...areaList]
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
        areaOptionsValue: [-1]
      })
    }
  }

  
  // 行政区变更
  handleAreaChange = areaValue => {
    const areaOptions = this.state.areaOptions
    
    this.setState({
      checkedRegionList: areaValue,
      indeterminateRegion:
          !!areaValue.length && areaValue.length < areaOptions.length,
      checkedAllRegion: areaValue.length === areaOptions.length
    })
    
    const areaValueLen = areaValue.length
    const currentCheckedValue = areaValue[areaValueLen - 1]
    // console.log(areaValue, currentCheckedValue, '行政区')
    // 行政区 是不限/全市
    if ([0, -1].includes(currentCheckedValue)) {
      this.setState({
        areaOptionsValue: [currentCheckedValue]
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
              this.setState({})
            })
          } else {
            this.setState({})
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
  
  // 获取子组件的传值
  getChildrenMsg = (result, cityValues) => {
    // console.log(result, msg)
    // 很奇怪这里的result就是子组件那bind的第一个参数this，msg是第二个参数
    this.setState({
      cityValues: cityValues
    })
  }
  
  // 处理查询数据
  handlePreSubmitData = pageNum => {
    const { avgMonth } = this.props.form.getFieldsValue()
    const { keyword } =  this.props.form.getFieldsValue()
    const { cityValues, areaOptionsValue } = this.state

    const params = {
      pageNum: pageNum || 1,
      pageSize: 20,
      useMonth: avgMonth.format('YYYY-MM-01 00:00:00'),
      keyword
    }

    // console.log(cityValues, 11111)
    // 城市id
    const cityIds = this.handleFindAllCityIds(cityValues)
    if (cityIds.length) {
      params.cityId = cityIds.join(',')
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
    return params
  }

  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    // const { avgMonth } = this.props.form.getFieldsValue()
    // 查询后，设置表格columns
    // const dateTableColumns = this.produceDateTableColumns(avgMonth)...dateTableColumns
    // this.setState({
    //   tableColumns: [...tableColumns]
    // })

    const params = this.handlePreSubmitData(pageNum)
    // console.log(params, 'submit')
    this.props.getDealStatisticsList(params, (data, code, message) => {
      if (code !== '200') {
        message.error(message)
      }
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
    this.props.exportDealStatistics(params, () => {
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
  
  
  onCheckAllRegionChange = e => {
    // const regionOptions = this.props.model.get('areaList').toJS()
    const areaOptions = this.state.areaOptions
    const regionOptionsValue = []
    areaOptions.forEach(item => {
      regionOptionsValue.push(item.value)
    })
    this.setState({
      areaOptionsValue: e.target.checked ? regionOptionsValue : [],
      indeterminateRegion: false,
      checkedAllRegion: e.target.checked
    })
  }

  renderBreads() {
    const breadList = [
      {
        key: 1,
        path: '',
        name: '成交数据统计',
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
    const { MonthPicker } = DatePicker
    const { getFieldDecorator } = this.props.form
    const {
      exportLoading,
      avgMonth,
      areaOptions,
      areaOptionsValue,
      checkedAllRegion,
      indeterminateRegion,
      // cityName, // change WY
      // cityId
    } = this.state
    let cityValues =  this.state
    // let defaultCity = []
    // const City  =  this.props.model.get('defaultCity')
    // defaultCity.push(City.toString())
    // if(City) {
    //   cityValues = defaultCity
    // }
    // 物业类型
    return (
      <Form style={{ marginTop: 8 }} onSubmit={e => this.handleSearch(e, 1)}>
        <Row>
          <Col span={8}>
            <FormItem
              label="城市"
              labelCol={layout(6, 6)}
              wrapperCol={layout(6, 18)}
              style={{ marginBottom: 4 }}
            >
              {getFieldDecorator('cityValues', {
                initialValue: cityValues
              })(<CityRangeSingle parent={ this } isCity={this.state.isCity} onCityRangeChange={this.handleCityRangeChange} />)}
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
            <Checkbox
                indeterminate={indeterminateRegion}
                checked={checkedAllRegion}
                onChange={this.onCheckAllRegionChange}
            >
              全部
            </Checkbox>
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
              label="月份"
              labelCol={layout(6, 8)}
              wrapperCol={layout(6, 16)}
              style={{ marginBottom: 4 }}
            >
              {getFieldDecorator('avgMonth', {
                initialValue: moment().add(-1, 'months')
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
        </Row>
        <Row>
          <Col span={6}>
            <FormItem
                label="关键字"
                labelCol={layout(6, 8)}
                wrapperCol={layout(6, 16)}
            >
              {getFieldDecorator('keyword', {
                // initialValue: keyword
              })(<Input placeholder="请输入关键字" maxLength={100} />)}
            </FormItem>
          </Col>
          <Col span={3}>
            {pagePermission('fdc:ds:dealStatistics:check') ? (
            <FormItem>
              <Button
                  htmlType="submit"
                  type="primary"
                  icon="search"
                  style={{ marginLeft: 58, marginTop: 4 }}
              >
                查询
              </Button>
            </FormItem>
                ) : ('')}
          </Col>
        </Row>
        <Row style={{ marginBottom: 16 }}>
          {pagePermission('fdc:ds:dealStatistics:export') ? (
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
    /* eslint-disable */
    const { cityName, areaName } = this.props
    const { caseDatasList } = this.state
    const columns = [
      {
        title: '城市',
        //dataIndex: 'cityName',
        width: 100,
        // fixed: 'left',
        render: ({ cityName }) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{cityName}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitCityName}>
              {cityName ? cityName.slice(0, 5) : '——'}
            </div>
          </Popover>
        )
      },
      {
        title: '行政区',
        //dataIndex: 'areaName',
        width: 100,
        render: ({ areaName }) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{areaName}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitAreaName}>
              {areaName ? areaName.slice(0, 10) : '——'}
            </div>
          </Popover>
        )
      },
      {
        title: '楼盘名称',
        //dataIndex: 'areaName',
        width: 100,
        render: ({ projectName }) => (
            <Popover
                content={<div style={{ maxWidth: '200px' }}>{projectName}</div>}
                title={false}
                placement="topLeft"
            >
              <div className={styles.limitProjectName}>
                {projectName || '——'}
              </div>
            </Popover>
        )
      },
      {
        title: '月份',
        render: useMonth => {
          if (useMonth) {
            return moment(useMonth).format('YYYY-MM')
          }
          return moment(this.props.useMonth)
            .add(-1, 'M')
            .format('YYYY-MM')
        },
        dataIndex: 'useMonth',
        width: 150,
      },
      {
        title: '平均成交周期(天)',
        width: 150,
        render:  ({dealPeriodAvg,dealPeriodCaseCount}) => dealPeriodAvg ? (
            <span>{dealPeriodAvg}({dealPeriodCaseCount}) </span>
        ) : (<span>{'——'}</span>),
        // dataIndex: 'dealPeriodAvg'
      },
      {
        title: '平均议价空间(%)',
        width: 150,
        render:  ({bargainSpaceAvg,bargainSpaceCaseCount}) => bargainSpaceAvg ? (
            <span>{bargainSpaceAvg}({bargainSpaceCaseCount}) </span>
        ) : (<span>{'——'}</span>),
        // dataIndex: 'bargainSpaceAvg'
      },
      {
        title: '平均带看次数',
        width: 150,
        render:  ({watchingCountAvg,watchingCountCaseCount}) => watchingCountAvg ? (
            <span>{watchingCountAvg}({watchingCountCaseCount}) </span>
        ) : (<span>{'——'}</span>),
        // dataIndex: 'watchingCountAvg'
      },
      // {
      //   title: '' //此处添加一个空列，让此列去自适应一行宽度
      // },
      // {
      //   title: '操作',
      //   width: 100,
      //   fixed: 'right',
      //   render: (_, { id, cityName, areaName, areaId, cityId }) => (
      //     <Link
      //       to={{
      //         pathname: router.DATA_AREA_RENTAL_HISTORY,
      //         search: `id=${id}&cityName=${cityName}&areaName=${areaName}&areaId=${areaId}&cityId=${cityId}`
      //       }}
      //     >
      //       <span>历史</span>
      //     </Link>
      //   )
      // }
    ]

    const { pageNum, pageSize, total } = this.props.model.get('areaPagination')
    const pagination = {
      current: pageNum,
      pageSize,
      total,
      showTotal,
      showQuickJumper: true,
      onChange: pageNum => {
        // this.props.onSearch(null, pageNum)
        this.handleSearch(null, pageNum)
      }
    }

    return (
      <Table
        rowKey={(record, index) => index}
        pagination={pagination}
        columns={columns}
        dataSource={this.props.dealStatisticsList}
        scroll={{ x: 1600, y: 420 }}
        className={styles.tableDetailRoom}
        loading={this.context.loading.includes(actions.GET_DEAL_STATISTICS_LIST)}
      />
    )
  }

  render() {
    const { modalVisible } = this.state
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
)(DealStatistics)
