import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  Form,
  Row,
  Col,
  Select,
  Input,
  Switch,
  Icon,
  InputNumber,
  Message,
  Modal
} from 'antd'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import formatString from 'client/utils/formatString'
import DataTrackComp from 'client/components/data-track2'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'
import moment from "moment"

const FormItem = Form.Item
const { Option } = Select
const { TextArea } = Input
const confirm = Modal.confirm

const formItemLayout = {
  labelCol: {
    xs: { span: 6 },
    sm: { span: 10 }
  },
  wrapperCol: {
    xs: { span: 6 },
    sm: { span: 14 }
  }
}

/*
 * 楼栋新增 / 编辑 基本信息
 */
class BuildInfoAddFirst extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    onAddFirstRef: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    buildId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    initialAddFetchFirst: PropTypes.func.isRequired,
    buildStatus: PropTypes.any.isRequired,
    validBuildName: PropTypes.func.isRequired,
    urlCityId: PropTypes.string.isRequired,
    cityId: PropTypes.string.isRequired,
    cityName: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props)

    props.onAddFirstRef(this)

    this.state = {
      // 校验楼栋名称 code 和 msg
      validBuildNameCode: '',
      validBuildNameMsg: '',
      totalFloorMaxNum: 10000  //楼栋总层数 默认值10000
    }
  }

  componentDidMount() {
    const { cityId } = this.props
    this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
    this.cityIdInterval = setInterval(() => {
      // this.cityId = sessionStorage.getItem('FDC_CITY')
      // if (this.cityId) {
      //   clearInterval(this.cityIdInterval)
      //   this.props.initialAddFetchFirst()
      // }
      let finalCityId = this.props.urlCityId
      if (!finalCityId) {
        finalCityId = sessionStorage.getItem('FDC_CITY')
      }
      // this.cityId = sessionStorage.getItem('FDC_CITY')
      if (finalCityId) {
        clearInterval(this.cityIdInterval)
        this.props.initialAddFetchFirst()
      }
    }, 100)
  }

  // 地上总楼层失去焦点事件
  handleTotalFloorBlur = () => {
    const totalFloorNum = this.props.form.getFieldValue('totalFloorNum')

    // 根据地上总楼层推算是否带电梯
    if (totalFloorNum >= 1 && totalFloorNum <= 7) {
      this.props.form.setFieldsValue({ isWithElevator: '0' })
    } else if (totalFloorNum > 7) {
      this.props.form.setFieldsValue({ isWithElevator: '1' })
    }

    // 根据地上总楼层推算建筑类型
    switch (totalFloorNum) {
      case totalFloorNum >= 1 && totalFloorNum <= 3 ? totalFloorNum : -1:
        this.props.form.setFieldsValue({ buildingTypeCode: '2003001' })
        break
      case totalFloorNum >= 4 && totalFloorNum <= 7 ? totalFloorNum : -1:
        this.props.form.setFieldsValue({ buildingTypeCode: '2003002' })
        break
      case totalFloorNum >= 8 && totalFloorNum <= 12 ? totalFloorNum : -1:
        this.props.form.setFieldsValue({ buildingTypeCode: '2003003' })
        break
      case totalFloorNum >= 13 && totalFloorNum <= 34 ? totalFloorNum : -1:
        this.props.form.setFieldsValue({ buildingTypeCode: '2003004' })
        break
      case totalFloorNum >= 35 ? totalFloorNum : -1:
        this.props.form.setFieldsValue({ buildingTypeCode: '2003005' })
        break
      default:
        break
    }
  }

  // 楼栋名称失去焦点校验
  handleValidBuildName = () => {
    const buildingName = this.props.form.getFieldValue('buildingName')
    if (buildingName) {
      const data = {
        cityId: this.cityId || this.props.cityId,
        projectId: this.props.projectId,
        buildingName: buildingName.trim(),
        buildingId: this.props.buildId
        // areaId: 71
      }
      this.props.validBuildName(data, res => {
        // console.log(res)
        const { msgCode, msg } = res
        switch (msgCode) {
          case 1001:
          case 1002:
          case 1003:
            this.setState({
              validBuildNameCode: msgCode,
              validBuildNameMsg: msg
            })
            break
          case 1004:
            break
          case 1005:
            this.setState({
              validBuildNameCode: '',
              validBuildNameMsg: ''
            })
            break
          default:
            break
        }
      })
    }
  }
  
  /*楼栋用途切换事件*/
  usageChange = (rule, value, callback) =>{
    // if(val === '1001001' || val === '1001002' || val=== '1001003'){
    //   this.setState({
    //     totalFloorMaxNum: 80
    //   })
    // }else{
    //   this.setState({
    //     totalFloorMaxNum: 10000
    //   })
    // }
  }

  submitFirst = () =>
    /* eslint-disable */
    new Promise((resolve, reject) => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          // 去除楼盘名称空格
          values.buildingName = values.buildingName.trim()

          values.isLBuildingName = values.isLBuildingName ? 1 : 0
          // values.isDegreeRoom = values.isDegreeRoom ? 1 : 0
          // values.isWithElevator = values.isWithElevator ? 1 : 0
          values.isLUseageCode = values.isLUseageCode ? 1 : 0

          const { validBuildNameCode, validBuildNameMsg } = this.state
          if (validBuildNameCode === '') {
            resolve(values)
          } else {
            if (validBuildNameCode === 1001 || validBuildNameCode === 1002) {
              confirm({
                title: '你是否确定提交？',
                content: (
                  <div>
                    已有一个重名的删除楼栋。您可以前往已删除楼栋列表，还原该楼栋；也可以选择放弃还原已删除的楼栋，重新新建楼栋。请自行确认。
                  </div>
                ),
                onOk() {
                  resolve(values)
                }
              })
            }
            if (validBuildNameCode === 1003) {
              Message.error(validBuildNameMsg)
              reject('1')
            }
          }
        } else {
          reject('1')
        }
      })
    })
  
  // 校验地上总层数
  handleValidTotalFloorNum = (rule, value, callback) => {
    if (value) {
      const {
        usageCode,
      } = this.props.form.getFieldsValue([
        'usageCode',
      ])
      if(usageCode === '1001001' || usageCode === '1001002' || usageCode=== '1001003'){
        if(value > 80){
          callback('楼栋用途为居住,居住(别墅),居住(洋房)时,地上总层数不能超过80层')
        }else{
          callback()
        }
      }else{
        callback()
      }
    }
    callback()
  }
  // 基本信息
  render() {
    const {
      form: { getFieldDecorator },
      buildId,
      buildStatus
    } = this.props
    const {
      usageTypeList,
      owershipTypeList,
      actualUsageTypeList,
      objectTypeList,
      buildingTypeList
    } = this.props.model
    const buildDetail = this.props.model.get('buildDetail')
    const {totalFloorMaxNum}  = this.state;
    return (
      <Form>
        {buildId ? (
          <Row>
            <Col span={8}>
              <FormItem label="数据权属" {...formItemLayout}>
                {getFieldDecorator('ownership', {
                  initialValue: buildDetail.get('ownership')
                })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
        ) : null}
        <Row>
          <Col span={8}>
            <FormItem
              label="楼栋名称"
              {...formItemLayout}
              extra={
                <span style={{ color: '#FF0000' }}>
                  {this.state.validBuildNameMsg}
                </span>
              }
            >
              {getFieldDecorator('buildingName', {
                rules: [
                  {
                    required: true,
                    message: '请选择楼栋名称'
                  },
                  {
                    whitespace: true,
                    message: '请选择楼栋名称'
                  },
                  {
                    max: 150,
                    message: '最大长度150'
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('buildingName')
                  : undefined
              })(
                <TextArea
                  disabled={!buildStatus}
                  placeholder="请输入楼栋名称"
                  autosize={{ maxRows: 4 }}
                  // maxLength="150"
                  onBlur={this.handleValidBuildName}
                />
              )}
            </FormItem>
          </Col>
          <Col span={2} style={{ marginLeft: 16 }}>
            <FormItem>
              {getFieldDecorator('isLBuildingName', {
                valuePropName: 'checked',
                initialValue: buildId
                  ? buildDetail.get('isLBuildingName') === 1
                  : false
              })(
                <Switch
                  disabled={
                    !buildStatus ||
                    !pagePermission('fdc:hd:residence:base:building:change')
                  }
                  checkedChildren={<Icon type="lock" />}
                  unCheckedChildren={<Icon type="unlock" />}
                />
              )}
            </FormItem>
          </Col>
          {buildId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="buildInfo"
                  field={1001}
                  qryId={buildId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="地上总层数" {...formItemLayout}>
              {getFieldDecorator('totalFloorNum', {
                rules: [
                  {
                    required: true,
                    message: '请输入地上总层数'
                  },
                  {
                    validator: this.handleValidTotalFloorNum
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('totalFloorNum')
                  : undefined
              })(
                <InputNumber
                  disabled={!buildStatus}
                  style={{ width: '100%' }}
                  min={1}
                  // max={totalFloorMaxNum}
                  placeholder="地上总层数"
                  onBlur={this.handleTotalFloorBlur}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="是否确认总层数" {...formItemLayout}>
              {getFieldDecorator('isFloorNumComfirmed', {
                rules: [
                  {
                    required: true,
                    message: '请确认总层数'
                  }
                ],
                initialValue: buildId
                  ? formatString(buildDetail.get('isFloorNumComfirmed'))
                  : '1'
              })(
                <Select placeholder="请选择" disabled={!buildStatus}>
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="楼栋用途" {...formItemLayout}>
              {getFieldDecorator('usageCode', {
                rules: [
                  {
                    required: true,
                    message: '请选择楼栋用途'
                  }
                ],
                initialValue: buildId
                  ? formatString(buildDetail.get('usageCode'))
                  : undefined
              })(
                <Select
                  placeholder="请选择"
                  disabled={!buildStatus}
                  // onChange={this.usageChange}
                >
                  {usageTypeList.map(item => (
                    <Option value={item.get('code')} key={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={2} style={{ marginLeft: 16 }}>
            <FormItem>
              {getFieldDecorator('isLUseageCode', {
                valuePropName: 'checked',
                initialValue: buildId
                  ? buildDetail.get('isLUseageCode') === 1
                  : false
              })(
                <Switch
                  disabled={
                    !buildStatus ||
                    !pagePermission('fdc:hd:residence:base:building:change')
                  }
                  checkedChildren={<Icon type="lock" />}
                  unCheckedChildren={<Icon type="unlock" />}
                />
              )}
            </FormItem>
          </Col>
          {buildId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="buildInfo"
                  field={1003}
                  qryId={buildId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="建筑类型" {...formItemLayout}>
              {getFieldDecorator('buildingTypeCode', {
                initialValue: buildId
                  ? formatString(buildDetail.get('buildingTypeCode'))
                  : undefined
              })(
                <Select
                  placeholder="建筑类型"
                  disabled={!buildStatus}
                  allowClear
                >
                  {buildingTypeList.map(item => (
                    <Option value={item.get('code')} key={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="楼栋别名" {...formItemLayout}>
              {getFieldDecorator('buildingAlias', {
                rules: [
                  {
                    max: 50,
                    message: '最大长度50'
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('buildingAlias')
                  : undefined
              })(
                <TextArea
                  disabled={!buildStatus}
                  placeholder="请输入"
                  autosize={{ maxRows: 4 }}
                  // maxLength="50"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="楼栋预售证名称" {...formItemLayout}>
              {getFieldDecorator('preSaleName', {
                rules: [
                  {
                    max: 50,
                    message: '最大长度50'
                  }
                ],
                initialValue: buildId
                  ? buildDetail.get('preSaleName')
                  : undefined
              })(
                <TextArea
                  disabled={!buildStatus}
                  placeholder="楼栋预售证名称"
                  autosize={{ maxRows: 4 }}
                  // maxLength="50"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="是否带电梯" {...formItemLayout}>
              {getFieldDecorator('isWithElevator', {
                // valuePropName: 'checked',
                initialValue: buildId
                  ? formatString(buildDetail.get('isWithElevator'))
                  : undefined
              })(
                // <Switch
                //   checkedChildren="是"
                //   unCheckedChildren="否"
                //   disabled={buildStatus === '0'}
                // />
                <Select placeholder="请选择" allowClear disabled={!buildStatus}>
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="产权性质" {...formItemLayout}>
              {getFieldDecorator('ownershipTypeCode', {
                initialValue: buildId
                  ? formatString(buildDetail.get('ownershipTypeCode'))
                  : undefined
              })(
                <Select placeholder="请选择" disabled={!buildStatus} allowClear>
                  {owershipTypeList.map(item => (
                    <Option value={item.get('code')} key={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="建筑形式" {...formItemLayout}>
              {getFieldDecorator('actualUsageCode', {
                initialValue: buildId
                  ? formatString(buildDetail.get('actualUsageCode'))
                  : undefined
              })(
                <Select placeholder="请选择" disabled={!buildStatus} allowClear>
                  {actualUsageTypeList.map(item => (
                    <Option value={item.get('code')} key={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="房产物业类型" {...formItemLayout}>
              {getFieldDecorator('objectTypeCode', {
                initialValue: buildId
                  ? formatString(buildDetail.get('objectTypeCode'))
                  : undefined
              })(
                <Select placeholder="请选择" disabled={!buildStatus} allowClear>
                  {objectTypeList.map(item => (
                    <Option value={item.get('code')} key={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="是否带学位" {...formItemLayout}>
              {getFieldDecorator('isDegreeRoom', {
                initialValue: buildId
                  ? formatString(buildDetail.get('isDegreeRoom'))
                  : undefined
              })(
                <Select placeholder="请选择" disabled={!buildStatus} allowClear>
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    modelSelector,
    containerActions
  )
)(BuildInfoAddFirst)
