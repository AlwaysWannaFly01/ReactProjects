import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import {
  Form,
  Modal,
  Select,
  DatePicker,
  Switch,
  Message,
  InputNumber,
  Input
} from 'antd'
import Immutable from 'immutable'
import moment from 'moment'

import formatString from 'client/utils/formatString'

import { containerActions } from './actions'
import './sagas'
import './reducer'
import { modelSelector } from './selector'

const FormItem = Form.Item
const Option = Select.Option
const { MonthPicker } = DatePicker

const formItemLayout = {
  labelCol: {
    xs: { span: 6 }
  },
  wrapperCol: {
    xs: { span: 12 }
  }
}

/**
 * @author YJF
 * @description 城市均价-新增/编辑 模块
 */
class CityPvgEdit extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    cityPvgId: PropTypes.string,
    visible: PropTypes.bool.isRequired,
    onCloseModal: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    cityList: PropTypes.instanceOf(Immutable.List).isRequired,
    getAreaList: PropTypes.func.isRequired,
    getSubAreas: PropTypes.func.isRequired,
    getLastMonthCityAvgPrice: PropTypes.func.isRequired,
    addCityAvgPrice: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    editCityAvgPrice: PropTypes.func.isRequired,
	cityAvgPriceMonth: PropTypes.func.isRequired
  }

  constructor() {
    super()

    this.state = {
      addAvgPrice: '',
      // 是否显示上个月均价
      showLastMonthPrice: false,

      // 行政区列表
      areaOptions: [],
      // 片区列表
      districtOptions: []
    }
  }
  
  componentDidMount() {
    this.props.onRef(this)
  }
	
	componentWillReceiveProps(nextProps) {
    const { cityAvgDetail } = this.props.model
    const { cityAvgDetail: nextCityAvgDetail } = nextProps.model
    if (cityAvgDetail !== nextCityAvgDetail) {
      // console.log(nextCityAvgDetail.toJS(), 22222)
      const { cityId, areaId } = nextCityAvgDetail
      if (cityId) {
        this.getAreaList(cityId)
      }
      if (areaId) {
        this.getSubAreas(areaId)
      }
    }
  }

  getAreaList = cityId => {
    this.props.getAreaList(cityId, res => {
      if (res instanceof Array) {
        this.setState({
          areaOptions: res
        })
      }
    })
  }

  getSubAreas = areaId => {
    this.props.getSubAreas(areaId, res => {
      if (res instanceof Array) {
        this.setState({
          districtOptions: res
        })
      }
    })
  }

  handleCloseModal = () => {
    this.props.form.resetFields()
    this.setState({
      addAvgPrice: '',
      areaOptions: [],
      districtOptions: [],
      showLastMonthPrice: false
    })
    this.props.onCloseModal()
  }

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      console.log(values)
      if (!err) {
        console.log(values)
        values.avgPriceDate = values.avgPriceDate.format('YYYY-MM-01')

        if (this.props.cityPvgId) {
          values.id = this.props.cityPvgId
          this.props.editCityAvgPrice(values, res => {
            const { code, message } = res
            if (+code === 200) {
              Message.success('编辑成功')
              this.props.onSearch()
              this.handleCloseModal()
            } else {
              Message.success(message)
            }
          })
        } else {
          this.props.addCityAvgPrice(values, res => {
            const { code, message } = res
            if (+code === 200) {
              Message.success('新增成功')
              this.props.onSearch()
              this.handleCloseModal()
            } else {
              Message.success(message)
            }
          })
        }
      }
    })
  }

  handlePropertyChange = () => {
    this.setState({
      showLastMonthPrice: false
    })
  }

  handleCityChange = value => {
    // console.log(value)
    // 重置行政区
    this.props.form.setFieldsValue({ areaId: '0' })
    // 重置片区
    this.props.form.setFieldsValue({ subAreaId: '0' })
    this.setState({
      areaOptions: [],
      showLastMonthPrice: false
    })
    // 获取行政区
    this.getAreaList(value)
  }

  handleAreaChange = value => {
    // console.log(value)
    // 重置片区
    this.props.form.setFieldsValue({ subAreaId: '0' })
    this.getSubAreas(value)
    this.setState({
      showLastMonthPrice: false
    })
  }

  handleSubAreaChange = () => {
    this.setState({
      showLastMonthPrice: false
    })
  }
  
  setFormData = val =>{
    const {cityId,areaId,subAreaId,propertyTypeCode,avgPriceDate} = val
    this.props.form.setFieldsValue({cityId,areaId,subAreaId,propertyType:propertyTypeCode,avgPriceDate})
    if (cityId) {
      this.getAreaList(cityId)
    }
    if (areaId) {
      this.getSubAreas(areaId)
    }
  }

  handleAvgPriceDateChange = val => {
    this.setState({
      showLastMonthPrice: false
    })
  	// 均价月份改变
    const {propertyType,cityId,areaId,subAreaId,avgPriceDate} = this.props.form.getFieldsValue(['propertyType','cityId','areaId','subAreaId','avgPriceDate'])
  	if(!this.props.cityPvgId && propertyType && cityId && areaId && subAreaId){
	  let parm = {
		  areaId,
		  cityId,
		  propertyType,
		  subAreaId,
		  useMonth: moment(val).format('YYYY-MM-DD')
	  }
	  this.props.cityAvgPriceMonth(parm,res=>{
        /* eslint-disable */
        if(res.code == 200){
          this.setState({addAvgPrice: res.data})
        }
      })
  	}
  }

  handleShowLastMonthPrice = value => {
    if (value) {
      // 查询上个月时验证条件
      const validateArr = [
        'propertyType',
        'cityId',
        'areaId',
        'subAreaId',
        'avgPriceDate'
      ]
      this.props.form.validateFields(validateArr, (err, values) => {
        if (!err) {
          // console.log(values)
          delete values.avgPrice
          values.useMonth = values.avgPriceDate.format('YYYY-MM-01')
          delete values.avgPriceDate
          this.props.cityList.forEach(item => {
            if (item.get('id') === values.cityId) {
              values.provinceId = item.get('provinceId')
            }
          })
          this.props.getLastMonthCityAvgPrice(values)
        }
      })
    }
    this.setState({
      showLastMonthPrice: value
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    // 城市均价id, 有值则是编辑，无值则新增
    const { cityPvgId } = this.props
    // 物业类型
    const { objectTypeList, cityAvgDetail, lastMonthPrice } = this.props.model

    const { showLastMonthPrice, areaOptions, districtOptions } = this.state

    const title = cityPvgId ? '编辑' : '新增'
    // 均价月份
    let avgPriceDate = null
    if (cityAvgDetail.get('avgPriceDate')) {
      avgPriceDate = moment(cityAvgDetail.get('avgPriceDate'))
    }

    return (
      <Modal
        title={title}
        visible={this.props.visible}
        onCancel={this.handleCloseModal}
        onOk={this.handleSubmit}
        maskClosable={false}
      >
        <Form>
          <FormItem label="物业类型" {...formItemLayout}>
            {getFieldDecorator('propertyType', {
              rules: [
                {
                  required: true,
                  message: '请选择物业类型'
                }
              ],
              onChange: this.handlePropertyChange,
              initialValue: cityPvgId
                ? formatString(cityAvgDetail.get('propertyType'))
                : undefined
            })(
              <Select placeholder="请选择" disabled={!!cityPvgId}>
                {objectTypeList.map(item => (
                  <Option value={item.get('value')} key={item.get('value')}>
                    {item.get('label')}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem label="城市" {...formItemLayout}>
            {getFieldDecorator('cityId', {
              rules: [
                {
                  required: true,
                  message: '请选择城市'
                }
              ],
              onChange: this.handleCityChange,
              initialValue: cityPvgId ? cityAvgDetail.get('cityId') : undefined
            })(
              <Select
                placeholder="请选择"
                disabled={!!cityPvgId}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                {this.props.cityList.map(item => (
                  <Option value={item.get('id')} key={item.get('id')}>
                    {item.get('cityName')}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem label="行政区" {...formItemLayout}>
            {getFieldDecorator('areaId', {
              rules: [
                {
                  required: true,
                  message: '请选择行政区'
                }
              ],
              onChange: this.handleAreaChange,
              initialValue: cityPvgId
                ? formatString(cityAvgDetail.get('areaId'))
                : undefined
            })(
              <Select
                placeholder="请选择"
                disabled={!!cityPvgId}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                <Option value="0">全市</Option>
                {areaOptions.map(item => (
                  <Option value={`${item.id}`} key={item.id}>
                    {item.areaName}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem label="片区" {...formItemLayout}>
            {getFieldDecorator('subAreaId', {
              rules: [
                {
                  required: true,
                  message: '请选择片区'
                }
              ],
              onChange: this.handleSubAreaChange,
              initialValue: cityPvgId
                ? `${cityAvgDetail.get('subAreaId')}`
                : undefined
            })(
              <Select
                placeholder="请选择"
                disabled={!!cityPvgId}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                <Option value="0">全区</Option>
                {districtOptions.map(item => (
                  <Option value={`${item.id}`} key={item.id}>
                    {item.subAreaName}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem label="均价月份" {...formItemLayout}>
            {getFieldDecorator('avgPriceDate', {
              rules: [
                {
                  required: true,
                  message: '请选择均价月份'
                }
              ],
              onChange: this.handleAvgPriceDateChange,
              initialValue: cityPvgId ? avgPriceDate : undefined
            })(
              <MonthPicker
                format="YYYY-MM-01"
                disabled={!!cityPvgId}
                style={{ width: '100%' }}
                allowClear={false}
              />
            )}
          </FormItem>
          <FormItem label="上个月均价" {...formItemLayout}>
            <div>
              <Switch
                onChange={this.handleShowLastMonthPrice}
                checked={showLastMonthPrice}
              />
              {showLastMonthPrice ? (
                <span style={{ marginLeft: 16 }}>
                  均价&nbsp;
                  {lastMonthPrice ? `${lastMonthPrice}元/㎡` : ''}
                </span>
              ) : null}
            </div>
          </FormItem>
          <FormItem label="均价_元/㎡" {...formItemLayout}>
            {getFieldDecorator('avgPrice', {
              rules: [
                {
                  required: true,
                  message: '请输入均价'
                }
              ],
              initialValue: cityPvgId ? cityAvgDetail.get('avgPrice') : this.state.addAvgPrice || ''
            })(
              <InputNumber
                placeholder="请输入均价_元/㎡"
                min={0}
                precision={0}
                max={2147483647}
                style={{ width: '100%' }}
              />
            )}
          </FormItem>
          <FormItem label="均价计算逻辑" {...formItemLayout}>
            {getFieldDecorator('caculateLogicTypeName', {
              rules: [
                // {
                //   required: true,
                //   message: '均价计算逻辑'
                // }
              ],
              initialValue: cityPvgId ? cityAvgDetail.get('caculateLogicTypeName') : ''
            })(
                <Input
                    disabled={true}
                    placeholder="请输入均价计算逻辑"
                    style={{ width: '100%' }}
                />
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    modelSelector,
    containerActions
  )
)(CityPvgEdit)
