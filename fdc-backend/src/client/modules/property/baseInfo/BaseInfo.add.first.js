import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import {
  Form,
  Row,
  Col,
  Input,
  Select,
  Switch,
  Icon,
  DatePicker,
  Message,
  Modal
} from 'antd'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import { Link } from 'react-router-dom'
import moment from 'moment'

import router from 'client/router'
import DataTrackComp from 'client/components/data-track2'

import { containerActions } from './actions'
import './sagas'
import './reducer'
import { modelSelector } from './selector'

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
 * 楼盘新增 基本信息
 */
class BaseInfoAddFirst extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    onAddFirstRef: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getSubAreas: PropTypes.func.isRequired,
    initialAddFetchFirst: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    projectDetail: PropTypes.instanceOf(Immutable.Map).isRequired,
    addValidateProjectName: PropTypes.func.isRequired,
    editValidateProjectName: PropTypes.func.isRequired,
    addValidateProjectAlias: PropTypes.func.isRequired,
    editValidateProjectAlias: PropTypes.func.isRequired,
    hasMatchProjectAlias:PropTypes.func.isRequired,
    projectStatus: PropTypes.string.isRequired,
    urlCityId: PropTypes.string.isRequired,
    cityId: PropTypes.string.isRequired,
    getPinyinStringLo: PropTypes.func.isRequired,
    delProjectAlia: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    props.onAddFirstRef(this)

    this.state = {
      // pingyinString: {},

      // 校验楼盘名称提示消息 2：检验通过，1：有正式楼盘，0：有删除楼盘
      validateProjectNameCode: '',
      validateProjectNameMsg: '',
      validateAreaNameMsg: '',
      projectAliasIds:[]
    }

    // this.handleValidateProjectName = this.handleValidateProjectName.bind(this)
  }

  componentDidMount() {
    this.cityIdInterval = setInterval(() => {
      let finalCityId = this.props.urlCityId
      if (!finalCityId) {
        finalCityId = sessionStorage.getItem('FDC_CITY')
      }
      this.cityId = sessionStorage.getItem('FDC_CITY') || this.props.cityId
      if (finalCityId) {
        clearInterval(this.cityIdInterval)
        const searchAreaList = {
          cityId: finalCityId
        }
        this.props.initialAddFetchFirst(searchAreaList)
      }
    }, 100)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.projectDetail !== nextProps.projectDetail) {
      const { projectDetail } = nextProps
      const areaId = projectDetail.get('areaId')
      this.props.getSubAreas(areaId)
    }
  }

  handleAreaChange = areaId => {
    // 重置片区选项 & 获取片区列表
    this.props.form.setFieldsValue({ subAreaId: undefined })
    this.props.getSubAreas(areaId)
    // 已选择行政区，清空行政区校验Msg && 校验楼盘名称
    this.setState({
      validateAreaNameMsg: ''
    })
    const projectName = this.props.form.getFieldValue('projectName')
    if (projectName) {
      setTimeout(() => {
        this.validateProjectName()
      }, 100)
    }
  }

  // 土地起始日期 <= 开盘日期、竣工日期 <= 土地终止日期
  handleValidLandStartDate = (rule, value, callback) => {
    if (value) {
      const landStartDate = value
      const {
        openingDate,
        deliveryDate,
        landEndDate,
        expectedDeliveryDate
      } = this.props.form.getFieldsValue([
        'openingDate',
        'deliveryDate',
        'landEndDate',
        'expectedDeliveryDate'
      ])
      if (openingDate || deliveryDate || landEndDate || expectedDeliveryDate) {
        if (
          openingDate &&
          moment(landStartDate).isAfter(moment(openingDate), 'day')
        ) {
          callback('土地起始日期不能大于开盘日期')
        }

        // if (
        //   deliveryDate &&
        //   moment(landStartDate).isAfter(moment(deliveryDate), 'day')
        // ) {
        //   callback('土地起始日期不能大于竣工日期')
        // }

        // if (
        //   expectedDeliveryDate &&
        //   moment(landStartDate).isAfter(moment(expectedDeliveryDate), 'day')
        // ) {
        //   callback('土地起始日期不能大于预估竣工日期')
        // }

        if (
          landEndDate &&
          moment(landStartDate).isAfter(moment(landEndDate), 'day')
        ) {
          callback('土地起始日期不能大于土地终止日期')
        }
        this.props.form.setFieldsValue({
          openingDate,
          deliveryDate,
          landEndDate,
          expectedDeliveryDate
        })
        callback()
      } else {
        callback()
      }
    }
    callback()
  }

  handleValidLandEndDate = (rule, value, callback) => {
    if (value) {
      const landEndDate = value
      const {
        landStartDate,
        openingDate,
        deliveryDate,
        expectedDeliveryDate
      } = this.props.form.getFieldsValue([
        'landStartDate',
        'openingDate',
        'deliveryDate',
        'expectedDeliveryDate'
      ])
      if (
        landStartDate ||
        openingDate ||
        deliveryDate ||
        expectedDeliveryDate
      ) {
        if (
          landStartDate &&
          moment(landStartDate).isAfter(moment(landEndDate), 'day')
        ) {
          callback('土地起始日期不能大于土地终止日期')
        }

        if (
          openingDate &&
          moment(openingDate).isAfter(moment(landEndDate), 'day')
        ) {
          callback('开盘日期不能大于土地终止日期')
        }

        if (
          deliveryDate &&
          moment(deliveryDate).isAfter(moment(landEndDate), 'day')
        ) {
          callback('竣工日期不能大于土地终止日期')
        }

        if (
          expectedDeliveryDate &&
          moment(expectedDeliveryDate).isAfter(moment(landEndDate), 'day')
        ) {
          callback('预估竣工日期不能大于土地终止日期')
        }

        this.props.form.setFieldsValue({
          landStartDate,
          openingDate,
          deliveryDate,
          expectedDeliveryDate
        })
        callback()
      } else {
        callback()
      }
    }

    callback()
  }

  handleValidOpenDate = (rule, value, callback) => {
    if (value) {
      const openDate = value
      const { landStartDate, landEndDate } = this.props.form.getFieldsValue([
        'landStartDate',
        'landEndDate'
      ])
      if (landStartDate || landEndDate) {
        if (
          landStartDate &&
          moment(landStartDate).isAfter(moment(openDate), 'day')
        ) {
          callback('土地起始日期不能大于开盘日期')
        }

        if (
          landEndDate &&
          moment(openDate).isAfter(moment(landEndDate), 'day')
        ) {
          callback('开盘日期不能大于土地终止日期')
        }
        this.props.form.setFieldsValue({
          landStartDate,
          landEndDate
        })
        callback()
      } else {
        callback()
      }
    }

    callback()
  }

  handleValidDeliveryDate = (rule, value, callback) => {
    if (value) {
      const deliveryDate = value
      const { landStartDate, landEndDate } = this.props.form.getFieldsValue([
        'landStartDate',
        'landEndDate'
      ])
      if (landStartDate || landEndDate) {
        // if (
        //   landStartDate &&
        //   moment(landStartDate).isAfter(moment(deliveryDate), 'day')
        // ) {
        //   callback('土地起始日期不能大于竣工日期')
        // }

        if (
          landEndDate &&
          moment(deliveryDate).isAfter(moment(landEndDate), 'day')
        ) {
          callback('竣工日期不能大于土地终止日期')
        }
        this.props.form.setFieldsValue({
          landStartDate,
          landEndDate
        })
        callback()
      } else {
        callback()
      }
    }

    callback()
  }

  handleValidExpectDeliveryDate = (rule, value, callback) => {
    if (value) {
      const expectedDeliveryDate = value
      const { landStartDate, landEndDate } = this.props.form.getFieldsValue([
        'landStartDate',
        'landEndDate'
      ])
      if (landStartDate || landEndDate) {
        // if (
        //   landStartDate &&
        //   moment(landStartDate).isAfter(moment(expectedDeliveryDate), 'day')
        // ) {
        //   callback('土地起始日期不能大于预估竣工日期')
        // }

        if (
          landEndDate &&
          moment(expectedDeliveryDate).isAfter(moment(landEndDate), 'day')
        ) {
          callback('预估竣工日期不能大于土地终止日期')
        }
        this.props.form.setFieldsValue({
          landStartDate,
          landEndDate
        })
        callback()
      } else {
        callback()
      }
    }

    callback()
  }

  handleProjectNameChange = () => {
    this.setState({
      validateProjectNameCode: '',
      validateProjectNameMsg: ''
    })
  }

  handleProjectNameBlur = () => {
    const projectName = this.props.form.getFieldValue('projectName')
    if (projectName) {
      // 1.去做拼音检索
      const data = {
        chineseLanguage: projectName.trim()
      }
      this.props.getPinyinStringLo(data, res => {
        // this.setState({
        //   pingyinString: res
        // })
        this.props.form.setFieldsValue({
          pinyinS: res.pinyinS,
          pinyinF: res.pinyinF
        })
      })

      // 2.做楼盘校验
      this.validateProjectName()
    }
  }
  
  // 楼盘名称校验封装，鄙视查重还要分两个地方写的后端，脑子在想什么
  CheckRechecking=(res,code,msg,id)=>{
    switch (res.result) {
      case 0:
        this.setState({
          validateProjectNameCode: 2,
          validateProjectNameMsg: '有已删除的楼盘'
        })
        break
      case 1:
        this.setState({
          validateProjectNameCode: 1,
          validateProjectNameMsg: '已有重名楼盘，请确认！'
        })
       break
      case 3:
        this.setState({
          validateProjectNameCode: 3,
          validateProjectNameMsg: '已有重名的楼盘别名，请确认！'
        })
        break
      case 4:
        this.setState({
          validateProjectNameCode: 4,
          validateProjectNameMsg: '有重名的相关楼盘名称，请确认！',
          projectAliasIds:res.projectAliasIds
        })
        break
      case null:
        if (code === '200') {
          this.setState({
            validateProjectNameCode: 2,
            validateProjectNameMsg: msg
          })
        }
        break
      default:
        if (code === '200') {
          this.setState({
            validateProjectNameCode: 2,
            validateProjectNameMsg: ''
          })
        }
        break
    }
  }
  
  validateProjectName = () =>
    new Promise(resolve => {
      const { areaId, projectName } = this.props.form.getFieldsValue([
        'areaId',
        'projectName'
      ])

      if (areaId) {
        if (projectName) {
          const data = {
            cityId: this.cityId,
            areaId,
            projectName: projectName.trim()
          }
          // 如果是编辑
          if (this.props.projectId) {
            data.id = this.props.projectId
          }
          this.setState({
            projectAliasIds:[]
          })
          this.props.addValidateProjectName(data, (res,code,msg ) => {
            this.CheckRechecking(res,code,msg,this.props.projectId)
          })
        } else {
          this.setState({
            validateProjectNameMsg: '请输入楼盘名称'
          })
        }
      } else {
        this.setState({
          validateAreaNameMsg: '请先选择行政区'
        })
      }
      resolve()
    })

  submitFirst = () => {
    this.setState({
      validateAreaNameMsg: ''
    })
    const that = this
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        that.props.form.validateFields((err, values) => {
          if (!err) {
            const {
              validateProjectNameCode,
              validateProjectNameMsg
            } = that.state
            // 去除楼盘名称空格
            values.projectName = values.projectName.trim()
            // 行政区 和 楼盘名称 锁定使用同一个字段
            values.isLAreaId = values.isLProjectName ? 1 : 0
            values.isLProjectName = values.isLProjectName ? 1 : 0
            values.isLUsageCode = values.isLUsageCode ? 1 : 0
            values.isLProjectAlias = values.isLProjectAlias ? 1 : 0
            values.isLLandStartDate = values.isLLandStartDate ? 1 : 0
            values.isLLandEndDate = values.isLLandEndDate ? 1 : 0
            values.isLDeliveryDate = values.isLDeliveryDate ? 1 : 0
            values.isLExpectDeliveryDate = values.isLExpectDeliveryDate ? 1 : 0
            values.isLOpeningDate = values.isLOpeningDate ? 1 : 0

            // 如果是编辑 前端传时间戳(精确到毫秒)给后端，方便前端做数据比对
            const { projectId } = that.props
            if (values.deliveryDate) {
              values.deliveryDate = projectId
                ? values.deliveryDate.unix() * 1000
                : values.deliveryDate.format('YYYY-MM-DD')
            }
            if (values.expectedDeliveryDate) {
              values.expectedDeliveryDate = projectId
                ? values.expectedDeliveryDate.unix() * 1000
                : values.expectedDeliveryDate.format('YYYY-MM-DD')
            }
            if (values.landEndDate) {
              values.landEndDate = projectId
                ? values.landEndDate.unix() * 1000
                : values.landEndDate.format('YYYY-MM-DD')
            }
            if (values.landStartDate) {
              values.landStartDate = projectId
                ? values.landStartDate.unix() * 1000
                : values.landStartDate.format('YYYY-MM-DD')
            }
            if (values.openingDate) {
              values.openingDate = projectId
                ? values.openingDate.unix() * 1000
                : values.openingDate.format('YYYY-MM-DD')
            }
            
            // 周一来动这里👇
            
            
            if (validateProjectNameCode === '') {
              resolve(values)
            } else
              {
              if (validateProjectNameCode === 0) {
                Message.info('楼盘名称已有已删除的楼盘')
                /* eslint-disable */
                reject('1')
              }
              if (validateProjectNameCode === 1) {
                Message.info('楼盘名称已有重名的正式楼盘')
                /* eslint-disable */
                reject('1')
              }
              if (validateProjectNameCode === 2) {
                resolve(values)
              }
              // if (validateProjectNameCode === 2) {
              //   // Message.info('有删除楼盘')
              //   confirm({
              //     title: '温馨提示：',
              //     content:
              //       '已有重名的删除楼盘。您可以前往已删除楼盘列表，还原该楼盘；也可以选择放弃还原已删除的楼盘，另外新增楼盘。请自行确认。',
              //     onOk() {
              //       that.setState(
              //         {
              //           validateProjectNameCode: '',
              //           validateProjectNameMsg: ''
              //         },
              //         () => {
              //           alert(123)
              //           resolve(values)
              //         }
              //       )
              //     }
              //   })
              // }
                console.log(that.state)
              // 重名的楼盘别名
              if (validateProjectNameCode === 3) {
                Message.info('已有重名的楼盘别名，请确认！')
                reject('1')
                // confirm({
                //   title: '温馨提示：',
                //   content: validateProjectNameMsg,
                //   onOk() {
                //     values.isIgnores = 1
                //     that.setState(
                //       {
                //         validateProjectNameCode: '',
                //         validateProjectNameMsg: ''
                //       },
                //       () => {
                //         reject('1')
                //       }
                //     )
                //   }
                // })
              }
              if (validateProjectNameCode === 4) {
                confirm({
                  title: '温馨提示：',
                  content:
                    '有重名的相关楼盘名称，是否删除该相关楼盘名称？',
                  onOk() {
                    console.log(that.state)
                    that.props.delProjectAlia({ids:that.state.projectAliasIds[0],cityId:that.cityId,isDeleteRelateProjectAlias:true}, () => {
                      Message.success('删除该相关楼盘名称成功')
                      that.setState({
                        validateProjectNameCode: 2,
                        validateProjectNameMsg: ''
                      })
                      resolve(values)
                    })
                  }
                })
              }
            }
          } else {
            /* eslint-disable */
            reject('1')
          }
        })
      }, 800)
    })
  }

  render() {
    const {
      form: { getFieldDecorator },
      projectDetail,
      projectStatus,
      projectId,
      cityId
    } = this.props

    // 行政区
    const areaList = this.props.model.get('areaList')
    // 片区列表
    const subAreaList = this.props.model.get('subAreaList')
    // 主用途列表
    const usageTypeList = this.props.model.get('usageTypeList')

    // 拼音
    const {
      validateProjectNameCode,
      validateProjectNameMsg,
      validateAreaNameMsg
    } = this.state

    return (
      <form>
        {this.props.projectId ? (
          <Row>
            <Col span={8}>
              <FormItem label="数据权属" {...formItemLayout}>
                {getFieldDecorator('ownership', {
                  initialValue: projectDetail.get('ownership')
                })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
        ) : null}
        <Row>
          <Col span={8}>
            <FormItem
              label="行政区"
              style={{marginBottom:0}}
              {...formItemLayout}
              extra={
                <span style={{ color: '#FF0000' }}>{validateAreaNameMsg}</span>
              }
            >
              {getFieldDecorator('areaId', {
                rules: [
                  {
                    required: true,
                    message: '请选择行政区'
                  }
                ],
                initialValue: projectId
                  ? projectDetail.get('areaId')
                  : undefined,
                onChange: this.handleAreaChange
              })(
                <Select
                  placeholder="请选择行政区"
                  disabled={projectStatus === '0'}
                >
                  {areaList.map(item => (
                    <Option key={item.get('key')} value={item.get('value')}>
                      {item.get('label')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {/* <Col span={2} style={{ marginLeft: 16 }}>
            <FormItem>
              {getFieldDecorator('isLAreaId', {
                valuePropName: 'checked',
                initialValue: projectDetail.get('isLAreaId') === 1
              })(
                <Switch
                  checkedChildren={<Icon type="lock" />}
                  unCheckedChildren={<Icon type="unlock" />}
                  disabled={projectStatus === '0'}
                />
              )}
            </FormItem>
          </Col> */}
          {projectId ||
          pagePermission('fdc:hd:residence:base:dataSale:check') ? (
            <Col span={2} style={{ marginLeft: 16 }}>
              <FormItem>
                <DataTrackComp
                  fromURL="baseInfo"
                  field={1001}
                  qryId={projectId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="片区" {...formItemLayout}>
              {getFieldDecorator('subAreaId', {
                initialValue: projectId
                  ? projectDetail.get('subAreaId')
                  : undefined
              })(
                <Select
                  placeholder="请选择片区"
                  allowClear
                  disabled={projectStatus === '0'}
                >
                  {subAreaList.map(item => (
                    <Option key={item.get('id')} value={item.get('id')}>
                      {item.get('subAreaName')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label="楼盘名称"
              style={{marginBottom:0}}
              {...formItemLayout}
              extra={
                <span style={{ color: '#FF0000' }}>
                  {validateProjectNameCode !== 2
                    ? validateProjectNameMsg
                    : validateProjectNameMsg.split('，')[0]}
                </span>
              }
            >
              {getFieldDecorator('projectName', {
                rules: [
                  {
                    required: true,
                    message: '请输入楼盘名称'
                  },
                  {
                    max: 80,
                    message: '最大长度为80'
                  }
                  // {
                  //   validator: this.handleValidateProjectName
                  // }
                ],
                initialValue: projectId
                  ? projectDetail.get('projectName')
                  : undefined
              })(
                <TextArea
                  placeholder="请输入楼盘名称"
                  autosize={{ maxRows: 4 }}
                  disabled={projectStatus === '0'}
                  onBlur={this.handleProjectNameBlur}
                  onChange={this.handleProjectNameChange}
                />
              )}
            </FormItem>
          </Col>
          <Col span={2} style={{ marginLeft: 16 }}>
            <FormItem>
              {getFieldDecorator('isLProjectName', {
                valuePropName: 'checked',
                initialValue: projectDetail.get('isLProjectName') === 1
              })(
                <Switch
                  disabled={
                    projectStatus === '0' ||
                    !pagePermission('fdc:hd:residence:base:dataSale:change')
                  }
                  checkedChildren={<Icon type="lock" />}
                  unCheckedChildren={<Icon type="unlock" />}
                />
              )}
            </FormItem>
          </Col>
          {projectId ||
          pagePermission('fdc:hd:residence:base:dataSale:check') ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="baseInfo"
                  field={1002}
                  qryId={projectId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="楼盘名称简拼" {...formItemLayout}>
              {getFieldDecorator('pinyinS', {
                rules: [
                  {
                    max: 80,
                    message: '最大长度为80'
                  }
                ],
                // initialValue: projectId
                //   ? pingyinString.pinyinS || projectDetail.get('pinyinS')
                //   : pingyinString.pinyinS
                initialValue: projectId
                  ? projectDetail.get('pinyinS')
                  : undefined
              })(
                <TextArea
                  disabled={projectStatus === '0'}
                  placeholder="楼盘名称简拼"
                  autosize={{ maxRows: 4 }}
                  // maxLength="80"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="楼盘名称全拼" {...formItemLayout} style={{marginBottom:0}}>
              {getFieldDecorator('pinyinF', {
                rules: [
                  {
                    max: 500,
                    message: '最大长度500'
                  }
                ],
                // initialValue: projectId
                //   ? pingyinString.pinyinF || projectDetail.get('pinyinF')
                //   : pingyinString.pinyinF
                initialValue: projectId
                  ? projectDetail.get('pinyinF')
                  : undefined
              })(
                <TextArea
                  disabled={projectStatus === '0'}
                  placeholder="楼盘名称全拼"
                  autosize={{ maxRows: 4 }}
                  // maxLength="500"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="主用途" {...formItemLayout}>
              {getFieldDecorator('usageCode', {
                rules: [
                  {
                    required: true,
                    message: '请输入主用途'
                  }
                ],
                initialValue: projectId
                  ? projectDetail.get('usageCode')
                  : undefined
              })(
                <Select
                  placeholder="请选择主用途"
                  disabled={projectStatus === '0'}
                >
                  {usageTypeList.map(item => (
                    <Option key={item.get('code')} value={+item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={2} style={{ marginLeft: 16 }}>
            <FormItem>
              {getFieldDecorator('isLUsageCode', {
                valuePropName: 'checked',
                initialValue: projectDetail.get('isLUsageCode') === 1
              })(
                <Switch
                  disabled={
                    projectStatus === '0' ||
                    !pagePermission('fdc:hd:residence:base:dataSale:change')
                  }
                  checkedChildren={<Icon type="lock" />}
                  unCheckedChildren={<Icon type="unlock" />}
                />
              )}
            </FormItem>
          </Col>
          {projectId ||
          pagePermission('fdc:hd:residence:base:dataSale:check') ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="baseInfo"
                  field={1003}
                  qryId={projectId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="楼盘别名" {...formItemLayout}>
              {getFieldDecorator('projectAlias', {
                rules: [
                  {
                    max: 1000,
                    message: '最大长度为1000'
                  }
                ],
                initialValue: projectId
                  ? projectDetail.get('projectAlias')
                  : undefined
              })(
                <TextArea
                  disabled
                  // disabled={projectStatus === '0'}
                  placeholder="请输入楼盘别名"
                  autosize={{ maxRows: 4 }}
                  // maxLength="80"
                />
              )}
            </FormItem>
          </Col>
          <Col span={2} style={{ marginLeft: 16 }}>
            {/*<FormItem>*/}
            {/*  {getFieldDecorator('isLProjectAlias', {*/}
            {/*    valuePropName: 'checked',*/}
            {/*    initialValue: projectDetail.get('isLProjectAlias') === 1*/}
            {/*  })(*/}
            {/*    <Switch*/}
            {/*      disabled={*/}
            {/*        projectStatus === '0' ||*/}
            {/*        !pagePermission('fdc:hd:residence:base:dataSale:change')*/}
            {/*      }*/}
            {/*      checkedChildren={<Icon type="lock" />}*/}
            {/*      unCheckedChildren={<Icon type="unlock" />}*/}
            {/*    />*/}
            {/*  )}*/}
            {/*</FormItem>*/}
          </Col>
          {/* {projectId ||
          pagePermission('fdc:hd:residence:base:dataSale:check') ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="baseInfo"
                  field={1004}
                  qryId={projectId}
                />
              </FormItem>
            </Col>
          ) : null} */}
          <Col span={2}>
            <FormItem>
              {pagePermission('fdc:hd:residence:saleName:check') ? (
                <Link
                  to={{
                    pathname: router.RES_PRO_NAME,
                    search: `projectId=${this.props.projectId}&cityId=${cityId}`
                  }}
                >
                  <Icon type="plus-square-o" />
                </Link>
              ) : (
                ''
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="土地起始日期" {...formItemLayout}>
              {getFieldDecorator('landStartDate', {
                rules: [
                  {
                    validator: this.handleValidLandStartDate
                  }
                ],
                initialValue: projectDetail.get('landStartDate')
                  ? moment(projectDetail.get('landStartDate'))
                  : undefined
              })(
                <DatePicker
                  disabled={projectStatus === '0'}
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={2} style={{ marginLeft: 16 }}>
            <FormItem>
              {getFieldDecorator('isLLandStartDate', {
                valuePropName: 'checked',
                initialValue: projectDetail.get('isLLandStartDate') === 1
              })(
                <Switch
                  disabled={
                    projectStatus === '0' ||
                    !pagePermission('fdc:hd:residence:base:dataSale:change')
                  }
                  checkedChildren={<Icon type="lock" />}
                  unCheckedChildren={<Icon type="unlock" />}
                />
              )}
            </FormItem>
          </Col>
          {projectId ||
          pagePermission('fdc:hd:residence:base:dataSale:check') ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="baseInfo"
                  field={1006}
                  qryId={projectId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="土地终止日期" {...formItemLayout}>
              {getFieldDecorator('landEndDate', {
                rules: [
                  {
                    validator: this.handleValidLandEndDate
                  }
                ],
                initialValue: projectDetail.get('landEndDate')
                  ? moment(projectDetail.get('landEndDate'))
                  : undefined
              })(
                <DatePicker
                  disabled={projectStatus === '0'}
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={2} style={{ marginLeft: 16 }}>
            <FormItem>
              {getFieldDecorator('isLLandEndDate', {
                valuePropName: 'checked',
                initialValue: projectDetail.get('isLLandEndDate') === 1
              })(
                <Switch
                  disabled={
                    projectStatus === '0' ||
                    !pagePermission('fdc:hd:residence:base:dataSale:change')
                  }
                  checkedChildren={<Icon type="lock" />}
                  unCheckedChildren={<Icon type="unlock" />}
                />
              )}
            </FormItem>
          </Col>
          {projectId ||
          pagePermission('fdc:hd:residence:base:dataSale:check') ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="baseInfo"
                  field={1007}
                  qryId={projectId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="开盘日期" {...formItemLayout}>
              {getFieldDecorator('openingDate', {
                rules: [
                  {
                    validator: this.handleValidOpenDate
                  }
                ],
                initialValue: projectDetail.get('openingDate')
                  ? moment(projectDetail.get('openingDate'))
                  : undefined
              })(
                <DatePicker
                  disabled={projectStatus === '0'}
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={2} style={{ marginLeft: 16 }}>
            <FormItem>
              {getFieldDecorator('isLOpeningDate', {
                valuePropName: 'checked',
                initialValue: projectDetail.get('isLOpeningDate') === 1
              })(
                <Switch
                  disabled={
                    projectStatus === '0' ||
                    !pagePermission('fdc:hd:residence:base:dataSale:change')
                  }
                  checkedChildren={<Icon type="lock" />}
                  unCheckedChildren={<Icon type="unlock" />}
                />
              )}
            </FormItem>
          </Col>
          {projectId ||
          pagePermission('fdc:hd:residence:base:dataSale:check') ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="baseInfo"
                  field={1009}
                  qryId={projectId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="竣工日期" {...formItemLayout}>
              {getFieldDecorator('deliveryDate', {
                rules: [
                  {
                    validator: this.handleValidDeliveryDate
                  }
                ],
                initialValue: projectDetail.get('deliveryDate')
                  ? moment(projectDetail.get('deliveryDate'))
                  : undefined
              })(
                <DatePicker
                  disabled={projectStatus === '0'}
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={2} style={{ marginLeft: 16 }}>
            <FormItem>
              {getFieldDecorator('isLDeliveryDate', {
                valuePropName: 'checked',
                initialValue: projectDetail.get('isLDeliveryDate') === 1
              })(
                <Switch
                  disabled={
                    projectStatus === '0' ||
                    !pagePermission('fdc:hd:residence:base:dataSale:change')
                  }
                  checkedChildren={<Icon type="lock" />}
                  unCheckedChildren={<Icon type="unlock" />}
                />
              )}
            </FormItem>
          </Col>
          {projectId ||
          pagePermission('fdc:hd:residence:base:dataSale:check') ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="baseInfo"
                  field={1008}
                  qryId={projectId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="预估竣工日期" {...formItemLayout}>
              {getFieldDecorator('expectedDeliveryDate', {
                rules: [
                  {
                    validator: this.handleValidExpectDeliveryDate
                  }
                ],
                initialValue: projectDetail.get('expectedDeliveryDate')
                  ? moment(projectDetail.get('expectedDeliveryDate'))
                  : undefined
              })(
                <DatePicker
                  disabled={projectStatus === '0'}
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={2} style={{ marginLeft: 16 }}>
            <FormItem>
              {getFieldDecorator('isLExpectDeliveryDate', {
                valuePropName: 'checked',
                initialValue: projectDetail.get('isLExpectDeliveryDate') === 1
              })(
                <Switch
                  disabled={
                    projectStatus === '0' ||
                    !pagePermission('fdc:hd:residence:base:dataSale:change')
                  }
                  checkedChildren={<Icon type="lock" />}
                  unCheckedChildren={<Icon type="unlock" />}
                />
              )}
            </FormItem>
          </Col>
          {projectId ||
          pagePermission('fdc:hd:residence:base:dataSale:check') ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="baseInfo"
                  field={1011}
                  qryId={projectId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
      </form>
    )
  }
}

export default compose(
  Form.create(),
  connect(modelSelector, containerActions)
)(BaseInfoAddFirst)
