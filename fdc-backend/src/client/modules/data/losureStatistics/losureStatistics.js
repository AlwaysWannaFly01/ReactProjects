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
import CityRange from 'client/components/city-range'
import CityRangeSingle from 'client/components/city-range-single'
import showTotal from 'client/utils/showTotal'
import router from 'client/router'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './losureStatistics.less'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const confirm = Modal.confirm
const statTypesList = [
  {
    label: '城市',
    value: 1
  },
  {
    label: '行政区',
    value: 2
  },
  {
    label: '楼盘',
    value: 3
  }
]
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
/**
 * @description 数据统计-区域租售比
 * @author YJF
 */
class losureStatistics extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    // location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    getLosureStatisticsList: PropTypes.func.isRequired,
    exportLosureStatistics: PropTypes.func.isRequired,
  
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
      cityeStyle: false,
      isCity: false,
      statTypes_checkAll: false,
      statTypes_indeterminate: true,
      statTypesValue: [1,2],
      isProject: false,
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
    // const { cityId, cityName } = this.state
    // console.log(cityId, cityName)
    this.cityId = sessionStorage.getItem('FDC_CITY')
    // this.cityName =
    //   JSON.parse(sessionStorage.getItem('FDC_CITY_INFO')).cityName || cityName
    // console.log(this.cityId, this.cityName)
    this.setDefaultUserMonth()
    const { avgMonth, statTypesValue, areaOptionsValue} = this.state
    const params = {
      pageNum: 1,
      pageSize: 20,
      useMonth: avgMonth.add(-1, 'months').format('YYYY-MM-01'),
      // areaIds: areaOptionsValue.join(','),
      statTypes: statTypesValue.join(','),
    }
    this.props.getLosureStatisticsList(params, (data, code, message) => {
      if (code !== '200') {
        message.error(message)
      }
    })
  }

  // 设置均价月份默认值
  setDefaultUserMonth = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()
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
        this.setState({
          areaOptions,
          areaOptionsValue: [0]
        })
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
            
            if(this.state.cityeStyle){    //只勾选了城市
              //  eslint-disable-next-line
              areaList.map(item=>{
                item.disabled  = true
              })
              this.setState({
                areaOptions: [...areaOptions, ...areaList]
              })
            }else{
              //  eslint-disable-next-line
              areaList.map(item=>{
                item.disabled  = false
              })
              this.setState({
                areaOptions: [...areaOptions, ...areaList]
              })
            }
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
        areaOptionsValue: [0]
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

  // 处理查询数据
  handlePreSubmitData = pageNum => {
    const { avgMonth } = this.props.form.getFieldsValue()
    const { keyword } =  this.props.form.getFieldsValue()
    const { cityValues, areaOptionsValue, statTypesValue} = this.state

    const params = {
      pageNum: pageNum || 1,
      pageSize: 20,
      useMonth: avgMonth.format('YYYY-MM-01'),
      keyword
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
    // 统计类型
    if (statTypesValue.length) {
      params.statTypes = statTypesValue.join(',')
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
    
    if(this.state.isProject){
      if(params.cityIds === undefined){
        message.error("统计范围有楼盘时,城市范围为必选项")
      }else{
        this.props.getLosureStatisticsList(params, (data, code, message) => {
          if (code !== '200') {
            message.error(message)
          }
        })
      }
    }else{
      this.props.getLosureStatisticsList(params, (data, code, message) => {
        if (code !== '200') {
          message.error(message)
        }
      })
    }
  }

  // handleCityChange = value => {
  //   this.setState({
  //     cityValues: value
  //   })
  // }

  exportCityPvg = () => {
    const params = this.handlePreSubmitData()
    const that = this
    if(this.state.isProject){
      if(params.cityIds === undefined){
        message.error("导出时,统计范围有楼盘时,城市范围为必选项")
      }else{
        this.props.exportLosureStatistics(params, () => {
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
    }else{
      this.props.exportLosureStatistics(params, () => {
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
  
  statTypesOnChange = checkedList => {
    // eslint-disable-next-line array-callback-return
    checkedList.map(itme => {
      if(itme === 3){
        this.setState({
          isProject : true
        })
      }else{
        this.setState({
          isProject : false
        })
      }
    })
    // 如果只勾选了城市
    if(checkedList.length === 1){
      if(checkedList[0] === 1){
      	console.log("只勾选了城市")
		let arr = this.state.areaOptions
        // eslint-disable-next-line
		arr.map(item =>{
			item.disabled = true
		})
        this.setState({
          areaOptions: arr,
          cityeStyle: true,
          areaOptionsValue: [0]
        })
      }
    }else{
		let arr = this.state.areaOptions
      // eslint-disable-next-line
		arr.map(item =>{
			item.disabled = false
		})
      this.setState({
        areaOptions:arr,
        cityeStyle: false,
        areaOptionsValue: [-1]
      })
    }
    
    if(checkedList.length === 0){
      this.setState({
        isProject : false
      })
    }
    this.setState({
      statTypesValue: checkedList,
      statTypes_indeterminate:
          !!checkedList.length && checkedList.length < statTypesList.length,
      statTypes_checkAll: checkedList.length === statTypesList.length
    })
  };
  
  statTypesOnCheckAllChange = e => {
    if(e.target.checked){
      this.setState({
        isProject : true
      })
    }else{
      this.setState({
        isProject : false
      })
    }
    const regionOptionsValue = []
    statTypesList.forEach(item => {
      regionOptionsValue.push(item.value)
    })
    this.setState({
      statTypesValue: e.target.checked ? regionOptionsValue : [],
      statTypes_indeterminate: false,
      statTypes_checkAll: e.target.checked
    })
  };

  renderBreads() {
    const breadList = [
      {
        key: 1,
        path: '',
        name: '法拍数据统计',
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
      cityValues,
      avgMonth,
      areaOptions,
      areaOptionsValue,
      statTypesValue,
        isProject,
      // cityName, // change WY
      // cityId
    } = this.state
    console.log(this.state)
    // 物业类型
    return (
      <Form style={{ marginTop: 8 }} onSubmit={e => this.handleSearch(e, 1)}>
        <Row style={{ marginBottom: 0 }}>
          <FormItem
              label="统计类型"
              labelCol={layout(6, 2)}
              wrapperCol={layout(18, 22)}
              style={{ marginBottom: 0 }}
          >
            <Checkbox
                indeterminate={this.state.statTypes_indeterminate}
                onChange={this.statTypesOnCheckAllChange}
                checked={this.state.statTypes_checkAll}
            >
              全部
            </Checkbox>
            <CheckboxGroup
                options={statTypesList}
                value={statTypesValue}
                onChange={this.statTypesOnChange}
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
              {isProject ? getFieldDecorator('cities', {
                initialValue: cityValues
              })(<CityRangeSingle isCity={this.state.isCity} onCityRangeChange={this.handleCityRangeChange} />):
                  getFieldDecorator('cities', {
                    initialValue: cityValues
                    })(<CityRange onCityRangeChange={this.handleCityRangeChange} />)
              }
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
            {pagePermission('fdc:ds:foreclosureStatistics:check') ? (
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
            ) : (
                ''
            )}
          </Col>
        </Row>
        <Row style={{ marginBottom: 16 }}>
          {pagePermission('fdc:ds:foreclosureStatistics:export') ? (
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
    const columns = [
      // {
      //   title: '省份',
      //   // fixed: 'left',
      //   render: ({provinceName}) => (
      //     <Popover
      //       content={<div style={{ maxWidth: '200px' }}>{provinceName}</div>}
      //       title={false}
      //       placement="topLeft"
      //     >
      //       <div className={styles.limitProjectName}>
      //         {provinceName || ''}
      //       </div>
      //     </Popover>
      //   ),
      //   // dataIndex: 'provinceName',
      //   width: 100,
      // },
      {
        title: '城市',
		  fixed: true,
        render: cityName => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{cityName}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitCityName}>
              {cityName ? cityName.slice(0, 5) : ''}
            </div>
          </Popover>
        ),
        dataIndex: 'cityName',
        width: 100,
      },
      {
        title: '行政区',
		  fixed: true,
		  //dataIndex: 'areaName',
        width: 100,
        render: ({areaName}) => (
          <Popover
            content={<div style={{ maxWidth: '200px' }}>{areaName}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitAreaName}>
              {areaName ? areaName.slice(0, 6) : '——'}
            </div>
          </Popover>
        )
      },
      // {
      //   title: '月份',
      //   render: useMonth => {
      //     if (useMonth) {
      //       return moment(useMonth).format('YYYY-MM')
      //     }
      //     return moment(this.props.useMonth)
      //     .add(-1, 'M')
      //     .format('YYYY-MM')
      //   },
      //   dataIndex: 'useMonth',
      //   width: 150,
      // },
      {
        title: '楼盘名称',
		  fixed: true,
		  render:  ({projectName}) => (
			<Popover
				content={<div style={{ maxWidth: '200px' }}>{projectName}</div>}
				title={false}
				placement="topLeft"
			>
			  <div className={styles.limitProjectName}>
				{projectName ? projectName : '——'}
			  </div>
			</Popover>
        ),
        // dataIndex: 'projectName',
        width: 190,
      },
      {
        title: '楼盘法拍成交单价',
        render:  ({projectUnitprice}) => (
            <span>{projectUnitprice || '——'}</span>
        ),
        // dataIndex: 'projectUnitprice',
        width: 150,
      },
      {
        title: '楼盘法拍评估单价',
        render:  ({projectEstimateUnitprice}) => (
            <span>{projectEstimateUnitprice || '——'}</span>
        ),
        // dataIndex: 'projectEstimateUnitprice',
        width: 150,
      },
      {
        title: '楼盘价格',
        render:  ({projectAvgPrice}) => (
            <span>{projectAvgPrice || '——'}</span>
        ),
        // dataIndex: 'projectAvgPrice',
        width: 150,
      },
      {
        title: '法拍案例量',
        render:  ({foreclosureCount}) => (
            <span>{foreclosureCount || '——'}</span>
        ),
        // dataIndex: 'foreclosureCount',
        width: 150,
      },
      {
        title: '一拍案例量',
        render:  ({firstAuctionCount}) => (
            <span>{firstAuctionCount || '——'}</span>
        ),
        // dataIndex: 'firstAuctionCount',
        width: 150,
      },
      {
        title: '二拍案例量',
        render:  ({secondAuctionCount}) => (
            <span>{secondAuctionCount || '——'}</span>
        ),
        // dataIndex: 'secondAuctionCount',
        width: 150,
      },
      {
        title: '变卖案例量',
        render:  ({sellCount}) => (
            <span>{sellCount || '——'}</span>
        ),
        // dataIndex: 'sellCount',
        width: 150,
      },
      {
        title: '法拍成交量',
        render:  ({foreclosureTurnover}) => (
            <span>{foreclosureTurnover || '——'}</span>
        ),
        // dataIndex: 'foreclosureTurnover',
        width: 150,
      },
      {
        title: '一拍成交量',
        render:  ({firstAuctionTurnover}) => (
            <span>{firstAuctionTurnover || '——'}</span>
        ),
        // dataIndex: 'firstAuctionTurnover',
        width: 150,
      },
      {
        title: '二拍成交量',
        render:  ({secondAuctionTurnover}) => (
            <span>{secondAuctionTurnover || '——'}</span>
        ),
        // dataIndex: 'secondAuctionTurnover',
        width: 150,
      },
      {
        title: '变卖成交量',
        render:  ({sellTurnover}) => (
            <span>{sellTurnover || '——'}</span>
        ),
        // dataIndex: 'sellTurnover',
        width: 150,
      },
      {
        title: '法拍流拍量',
        render:  ({abortiveAuctionCount}) => (
            <span>{abortiveAuctionCount || '——'}</span>
        ),
        // dataIndex: 'abortiveAuctionCount',
        width: 150,
      },
      {
        title: '法拍成交率(%)',
        render:  ({closeRate}) => (
            <span>{closeRate || '——'}</span>
        ),
        // dataIndex: 'closeRate',
        width: 150,
      },
      {
        title: '法拍流拍率(%)',
        render:  ({abortiveAuctionRate}) => (
            <span>{abortiveAuctionRate || '——'}</span>
        ),
        // dataIndex: 'abortiveAuctionRate',
        width: 150,
      },
      {
        title: '法拍变现率(%)',
        render:  ({monetizationRate}) => (
            <span>{monetizationRate || '——'}</span>
        ),
        // dataIndex: 'monetizationRate',
        width: 150,
      },
      {
        title: '法拍折扣(溢价)率(%)',
        render:  ({discountRate}) => (
            <span>{discountRate || '——'}</span>
        ),
        // dataIndex: 'discountRate',
        width: 150,
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
      //   // dataIndex: 'projectId'
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
        dataSource={this.props.losureStatisticsList}
        scroll={{ x: 1600, y: 420 }}
        className={styles.tableDetailRoom}
        loading={this.context.loading.includes(actions.GET_LOSURE_STATISTICS_LIST)}
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
)(losureStatistics)
