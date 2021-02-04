import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'

import PropTypes from 'prop-types'
import { Form, Modal, Input, InputNumber, Message, DatePicker} from 'antd'

import moment from 'moment'
import Immutable from 'immutable'
// import { pagePermission } from 'client/utils'

import layout from 'client/utils/layout'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'
const { MonthPicker } = DatePicker
const FormItem = Form.Item

class ResRatingHistoryEdit extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    modalVisible: PropTypes.bool.isRequired,
    isAdd: PropTypes.bool.isRequired,
    editData: PropTypes.object.isRequired,
    weightDetail: PropTypes.object.isRequired,
    projectName: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    cityId: PropTypes.string.isRequired,
    modalCancel: PropTypes.func.isRequired,
    editRatingResult: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    getGradeDetail:PropTypes.func.isRequired
  }
  
  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }
  
  constructor(props) {
    super(props)
    /* eslint-disable */
    this.state = {
    
    }
    this.deliveryChange = this.deliveryChange.bind(this)
  }
  
  componentDidMount() {
    // 设置默认估价月份
    this.setDefaultUserMonth()
  }
  
  setDefaultUserMonth = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    this.userMonth = moment(new Date(`${year}-${month}-01`))
  }
  
  grade = totalScroll => {
    // 计算楼盘等级
    let grade = ''
    if (totalScroll >= 8.5 && totalScroll <= 10) {
      grade = 'A'
    } else if (totalScroll >= 7.5 && totalScroll < 8.5) {
      grade = 'B'
    } else if (totalScroll >= 6 && totalScroll < 7.5) {
      grade = 'C'
    } else if (totalScroll > 0 && totalScroll < 6) {
      grade = 'D'
    } else {
      grade = ''
    }
    // this.setState({ grade })
    if(grade){
      this.props.form.setFieldsValue({ 'grade':grade })
    }
  }
  
  // 删掉了前两个
  // 竣工日期得分
  deliveryChange = value => {
    const { weightDetail } = this.props
    if(JSON.stringify(weightDetail)==='{}'){
      return
    }
    // weightDetail.deliveryDateWeight = weightDetail.deliveryDateStardardDetail.deliveryDateWeight
    delete weightDetail.cityId
    delete weightDetail.provinceId
    setTimeout(()=>{
      let {
        offerLivenessScore,vqQueryScore,deliveryDateScore,
        developerScore,facilitiesScore,volumeScore,managementScore,transportationScore,
        municipalityScore,medicalScore,educationScore,commercialScore,priceRentRatioScore,priceStabilityScore
      } = this.props.form.getFieldsValue()
      let arr = []
      arr.push(offerLivenessScore,vqQueryScore,deliveryDateScore,
        developerScore,facilitiesScore,volumeScore,managementScore,transportationScore,
        municipalityScore,medicalScore,educationScore,commercialScore,priceRentRatioScore,priceStabilityScore)
      for(let i of arr){
        if(!i||i>10){
          return
        }
      }
     
      let totalScroll = +(
        (offerLivenessScore*weightDetail.offerLivenessWeight)/100 +
        (vqQueryScore*weightDetail.vqQueryWeight)/100 +
        (deliveryDateScore*weightDetail.deliveryDateWeight)/100 +
        (developerScore*weightDetail.developerWeight)/100 +
        (facilitiesScore*weightDetail.facilitiesWeight)/100 +
        (volumeScore*weightDetail.volumeWeight)/100 +
        (managementScore*weightDetail.managementWeight)/100 +
        (transportationScore*weightDetail.transportationWeight)/100 +
        (municipalityScore*weightDetail.municipalityWeight)/100 +
        (medicalScore*weightDetail.medicalWeight)/100 +
        (educationScore*weightDetail.educationWeight)/100 +
        (commercialScore*weightDetail.commercialWeight)/100 +
        // (bankWhitelistScore*weightDetail.bankWhitelistWeight)/100 +
        (priceRentRatioScore*weightDetail.priceRentRatioWeight)/100 +
        (priceStabilityScore*weightDetail.priceStabilityWeight)/100
      ).toFixed(2)
      // 计算楼盘等级
      this.grade(totalScroll)
      this.props.form.setFieldsValue({ totalScore: totalScroll })
    },200)
  }
  
  handleCancelEdit = () => {
    this.props.modalCancel()
    this.props.form.resetFields()
  }
  
  handleOkEdit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { cityId, projectId, editData } = this.props
        const  useMonth  = this.props.isAdd?moment(values.useMonth).format('YYYY-MM-01 HH:mm:ss'):moment(editData.useMonth).format('YYYY-MM-01 HH:mm:ss')
        values.cityId = cityId
        values.projectId = projectId
        values.useMonth = useMonth
        this.props.editRatingResult(values, res => {
          const { code, message } = res
          if (+code === 200) {
            Message.success('修改成功')
            this.props.onSearch(null, 1)
            this.handleCancelEdit()
          } else {
            Message.error(message)
          }
        })
      }
    })
  }
  
  monthChange = val => {
    const useMonth = val.utcOffset(8).format('YYYY-MM-DD')
    const { cityId, projectId } = this.props
    this.props.getGradeDetail({
      cityId:cityId,
      projectId:projectId,
      useMonth:useMonth
    },res => {
      if(res.code==='200'){
        const {data} = res
        const obj = {
          offerLivenessScore:data.offerLivenessScore,
          vqQueryScore:data.vqQueryScore,
          deliveryDateScore:data.deliveryDateScore,
          developerScore:data.developerScore,
          volumeScore:data.volumeScore,
          facilitiesScore:data.facilitiesScore,
          managementScore:data.managementScore,
          transportationScore:data.transportationScore,
          municipalityScore:data.municipalityScore,
          medicalScore:data.medicalScore,
          educationScore:data.educationScore,
          commercialScore:data.commercialScore,
          bankWhitelistScore:data.bankWhitelistScore,
          priceRentRatioScore:data.priceRentRatioScore,
          priceStabilityScore:data.priceStabilityScore,
          avgDealPeriod:data.avgDealPeriod,
          avgBargainSpace:data.avgBargainSpace,
          rankRate:data.rankRate,
          totalScore:data.totalScore,
          grade:data.grade
        }
        this.props.form.setFieldsValue(obj)
      }
    })
   
  }
  
  disabledDate = current => {
    // Can not select days before today and today
    return current > moment().endOf('month')
  }
  
  render() {
    const { getFieldDecorator } = this.props.form
    const { editData,isAdd } = this.props
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    let userMonth = moment(new Date(`${year}-${month}-01`))
    return (
      <div>
        <Modal
          width={420}
          title={isAdd?'新增评级结果':'修改评级结果'}
          maskClosable={false}
          visible={this.props.modalVisible}
          onOk={this.handleOkEdit}
          onCancel={this.handleCancelEdit}
        >
          
          <Form>
            <FormItem
              label="楼盘名称"
              labelCol={layout(7, 11)}
              wrapperCol={layout(18, 13)}
              style={{marginBottom:5}}
            >
              {getFieldDecorator('projectId')(
                <span>{this.props.projectName}</span>
              )}
            </FormItem>
            <FormItem
              label="行政区"
              labelCol={layout(7, 11)}
              wrapperCol={layout(18, 13)}
              style={{marginBottom:5}}
            >
              {getFieldDecorator('areaName')(
                <span>{isAdd?this.props.areaName:editData.areaName}</span>
              )}
            </FormItem>
            {isAdd?
              <FormItem
                label="月份"
                labelCol={layout(7, 11)}
                wrapperCol={layout(18, 13)}
                style={{marginBottom:5}}
              >
                {getFieldDecorator('useMonth', {
                  rules: [
                    {
                      required: false,
                      message: '月份不能为空!'
                    }
                  ],
                  initialValue: userMonth
                })(
                  <MonthPicker
                    style={{ width: 95 }}
                    monthCellContentRender={date => (
                      <span>{date.format('MM')}</span>
                    )}
                    disabledDate={this.disabledDate}
                    allowClear={false}
                    onChange={this.monthChange}
                  />
                )}
              </FormItem>:
              <FormItem
                label="月份"
                labelCol={layout(7, 11)}
                wrapperCol={layout(18, 13)}
                style={{marginBottom:5}}
              >
                {getFieldDecorator('useMonth', {
                  rules: [
                    {
                      required: false,
                      message: '月份不能为空!'
                    }
                  ],
                  initialValue: this.userMonth
                })(
                  <span>
                  {editData.useMonth
                    ? moment(editData.useMonth).utcOffset(8).format('YYYY-MM')
                    : ''}
                  </span>
                )}
              </FormItem>
             }
            <div style={{height:200,overflow:'hidden',overflowY:'scroll',marginLeft: -6}}>
              <FormItem
                label="报盘活跃度得分"
                labelCol={layout(6, 10)}
                wrapperCol={layout(18, 14)}
                style={{marginBottom:10,width:420}}
              >
                {getFieldDecorator('offerLivenessScore', {
                  rules: [
                    {
                      required: false,
                      message: '报盘活跃度得分不能为空!'
                    }
                  ],
                  initialValue: editData.offerLivenessScore
                })(
                  <InputNumber
                    style={{ width: 95 }}
                    min={0}
                    max={10}
                    precision={0}
                    onChange={this.deliveryChange}
                    placeholder=""
                  />
                )}
              </FormItem>
              <FormItem
                label="VQ查询热度得分"
                labelCol={layout(6, 10)}
                wrapperCol={layout(18, 14)}
                style={{marginBottom:10,width:420}}
              >
                {getFieldDecorator('vqQueryScore', {
                  rules: [
                    {
                      required: false,
                      message: 'VQ查询热度得分不能为空!'
                    }
                  ],
                  initialValue: editData.vqQueryScore
                })(
                  <InputNumber
                    style={{ width: 95 }}
                    min={0}
                    max={10}
                    precision={0}
                    onChange={this.deliveryChange}
                    placeholder=""
                  />
                )}
              </FormItem>
              <FormItem
                label="竣工日期得分"
                labelCol={layout(6, 10)}
                wrapperCol={layout(18, 14)}
                style={{marginBottom:10,width:420}}
              >
                {getFieldDecorator('deliveryDateScore', {
                  rules: [
                    {
                      required: false,
                      message: '竣工日期得分不能为空!'
                    }
                  ],
                  initialValue: editData.deliveryDateScore
                })(
                  <InputNumber
                    style={{ width: 95 }}
                    min={0}
                    max={10}
                    precision={0}
                    onChange={this.deliveryChange}
                    placeholder=""
                  />
                )}
              </FormItem>
              <FormItem
                label="开发商得分"
                labelCol={layout(6, 10)}
                wrapperCol={layout(18, 14)}
                style={{marginBottom:10,width:420}}
              >
                {getFieldDecorator('developerScore', {
                  rules: [
                    {
                      required: false,
                      message: '开发商得分不能为空!'
                    }
                  ],
                  initialValue: editData.developerScore
                })(
                  <InputNumber
                    style={{ width: 95 }}
                    min={0}
                    max={10}
                    precision={0}
                    onChange={this.deliveryChange}
                    placeholder=""
                  />
                )}
              </FormItem>
              <FormItem
                label="楼盘体量得分"
                labelCol={layout(6, 10)}
                wrapperCol={layout(18, 14)}
                style={{marginBottom:10,width:420}}
              >
                {getFieldDecorator('volumeScore', {
                  rules: [
                    {
                      required: false,
                      message: '楼盘体量得分不能为空!'
                    }
                  ],
                  initialValue: editData.volumeScore
                })(
                  <InputNumber
                    style={{ width: 95 }}
                    min={0}
                    max={10}
                    precision={0}
                    onChange={this.deliveryChange}
                    placeholder=""
                  />
                )}
              </FormItem>
              <FormItem
                label="内部配套得分"
                labelCol={layout(6, 10)}
                wrapperCol={layout(18, 14)}
                style={{marginBottom:10,width:420}}
              >
                {getFieldDecorator('facilitiesScore', {
                  rules: [
                    {
                      required: false,
                      message: '内部配套得分不能为空!'
                    }
                  ],
                  initialValue: editData.facilitiesScore
                })(
                  <InputNumber
                    style={{ width: 95 }}
                    min={0}
                    max={10}
                    precision={0}
                    onChange={this.deliveryChange}
                    placeholder=""
                  />
                )}
              </FormItem>
              <FormItem
                label="物业得分"
                labelCol={layout(6, 10)}
                wrapperCol={layout(18, 14)}
                style={{marginBottom:10,width:420}}
              >
                {getFieldDecorator('managementScore', {
                  rules: [
                    {
                      required: false,
                      message: '物业得分不能为空!'
                    }
                  ],
                  initialValue: editData.managementScore
                })(
                  <InputNumber
                    style={{ width: 95 }}
                    min={0}
                    max={10}
                    precision={0}
                    onChange={this.deliveryChange}
                    placeholder=""
                  />
                )}
              </FormItem>
              <FormItem
                label="交通得分"
                labelCol={layout(6, 10)}
                wrapperCol={layout(18, 14)}
                style={{marginBottom:10,width:420}}
              >
                {getFieldDecorator('transportationScore', {
                  rules: [
                    {
                      required: false,
                      message: '交通得分不能为空!'
                    }
                  ],
                  initialValue: editData.transportationScore
                })(
                  <InputNumber
                    style={{ width: 95 }}
                    min={0}
                    max={10}
                    precision={0}
                    onChange={this.deliveryChange}
                    placeholder=""
                  />
                )}
              </FormItem>
              <FormItem
                label="市政得分"
                labelCol={layout(6, 10)}
                wrapperCol={layout(18, 14)}
                style={{marginBottom:10,width:420}}
              >
                {getFieldDecorator('municipalityScore', {
                  rules: [
                    {
                      required: false,
                      message: '市政得分不能为空!'
                    }
                  ],
                  initialValue: editData.municipalityScore
                })(
                  <InputNumber
                    style={{ width: 95 }}
                    min={0}
                    max={10}
                    precision={0}
                    onChange={this.deliveryChange}
                    placeholder=""
                  />
                )}
              </FormItem>
              <FormItem
                label="医疗得分"
                labelCol={layout(6, 10)}
                wrapperCol={layout(18, 14)}
                style={{marginBottom:10,width:420}}
              >
                {getFieldDecorator('medicalScore', {
                  rules: [
                    {
                      required: false,
                      message: '医疗得分不能为空!'
                    }
                  ],
                  initialValue: editData.medicalScore
                })(
                  <InputNumber
                    style={{ width: 95 }}
                    min={0}
                    max={10}
                    precision={0}
                    onChange={this.deliveryChange}
                    placeholder=""
                  />
                )}
              </FormItem>
              <FormItem
                label="教育得分"
                labelCol={layout(6, 10)}
                wrapperCol={layout(18, 14)}
                style={{marginBottom:10,width:420}}
              >
                {getFieldDecorator('educationScore', {
                  rules: [
                    {
                      required: false,
                      message: '教育得分不能为空!'
                    }
                  ],
                  initialValue: editData.educationScore
                })(
                  <InputNumber
                    style={{ width: 95 }}
                    min={0}
                    max={10}
                    precision={0}
                    onChange={this.deliveryChange}
                    placeholder=""
                  />
                )}
              </FormItem>
              <FormItem
                label="商业得分"
                labelCol={layout(6, 10)}
                wrapperCol={layout(18, 14)}
                style={{marginBottom:10,width:420}}
              >
                {getFieldDecorator('commercialScore', {
                  rules: [
                    {
                      required: false,
                      message: '商业得分不能为空!'
                    }
                  ],
                  initialValue: editData.commercialScore
                })(
                  <InputNumber
                    style={{ width: 95 }}
                    min={0}
                    max={10}
                    precision={0}
                    onChange={this.deliveryChange}
                    placeholder=""
                  />
                )}
              </FormItem>
              {/*<FormItem*/}
              {/*  label="入围银行白名单得分"*/}
              {/*  labelCol={layout(6, 10)}*/}
              {/*  wrapperCol={layout(18, 14)}*/}
              {/*  style={{marginBottom:10,width:420}}*/}
              {/*>*/}
              {/*  {getFieldDecorator('bankWhitelistScore', {*/}
              {/*    rules: [*/}
              {/*      {*/}
              {/*        required: false,*/}
              {/*        message: '入围银行白名单得分不能为空!'*/}
              {/*      }*/}
              {/*    ],*/}
              {/*    initialValue: editData.bankWhitelistScore*/}
              {/*  })(*/}
              {/*    <InputNumber*/}
              {/*      style={{ width: 95 }}*/}
              {/*      min={0}*/}
              {/*      max={10}*/}
              {/*      precision={0}*/}
              {/*      onChange={this.deliveryChange}*/}
              {/*      placeholder=""*/}
              {/*    />*/}
              {/*  )}*/}
              {/*</FormItem>*/}
  
              <FormItem
                label="租售比得分"
                labelCol={layout(6, 10)}
                wrapperCol={layout(18, 14)}
                style={{marginBottom:10,width:420}}
              >
                {getFieldDecorator('priceRentRatioScore', {
                  rules: [
                    {
                      required: false,
                      message: '租售比得分不能为空!'
                    }
                  ],
                  initialValue: editData.priceRentRatioScore
                })(
                  <InputNumber
                    style={{ width: 95 }}
                    min={0}
                    max={10}
                    precision={0}
                    onChange={this.deliveryChange}
                    placeholder=""
                  />
                )}
              </FormItem>
              <FormItem
                label="价格稳定性得分"
                labelCol={layout(6, 10)}
                wrapperCol={layout(18, 14)}
                style={{marginBottom:10,width:420}}
              >
                {getFieldDecorator('priceStabilityScore', {
                  rules: [
                    {
                      required: false,
                      message: '价格稳定性得分不能为空!'
                    }
                  ],
                  initialValue: editData.priceStabilityScore
                })(
                  <InputNumber
                    style={{ width: 95 }}
                    min={0}
                    max={10}
                    precision={0}
                    onChange={this.deliveryChange}
                    placeholder=""
                  />
                )}
              </FormItem>
              
              
              
              {/*<FormItem*/}
              {/*  label="平均成交周期(天)"*/}
              {/*  labelCol={layout(6, 10)}*/}
              {/*  wrapperCol={layout(18, 14)}*/}
              {/*  style={{marginBottom:10,width:420}}*/}
              {/*>*/}
              {/*  {getFieldDecorator('avgDealPeriod', {*/}
              {/*    rules: [*/}
              {/*      {*/}
              {/*        required: false,*/}
              {/*        message: '平均成交周期(天)必须是大于0',*/}
              {/*        pattern: new RegExp(/^[1-9]\d*$/, "g"),*/}
              {/*      }*/}
              {/*    ],*/}
              {/*    initialValue: editData.avgDealPeriod*/}
              {/*  })(*/}
              {/*    <InputNumber*/}
              {/*      style={{ width: 95 }}*/}
              {/*      min={0}*/}
              {/*      precision={0}*/}
              {/*      placeholder=""*/}
              {/*    />*/}
              {/*  )}*/}
              {/*</FormItem>*/}
              {/*<FormItem*/}
              {/*  label="平均议价空间(%)"*/}
              {/*  labelCol={layout(6, 10)}*/}
              {/*  wrapperCol={layout(18, 14)}*/}
              {/*  style={{marginBottom:10,width:420}}*/}
              {/*>*/}
              {/*  {getFieldDecorator('avgBargainSpace', {*/}
              {/*    rules: [*/}
              {/*      {*/}
              {/*        pattern: new RegExp(/^[1-9]{1}[0-9]*$|^0{1}\.{1}[0-9]+$|^[1-9]{1}[0-9]*\.{1}[0-9]+$/, "g"),*/}
              {/*        required: false,*/}
              {/*        message: '平均议价空间必须大于0'*/}
              {/*      }*/}
              {/*    ],*/}
              {/*    initialValue: editData.avgBargainSpace*/}
              {/*  })(*/}
              {/*    <InputNumber*/}
              {/*      style={{ width: 95 }}*/}
              {/*      min={0}*/}
              {/*      precision={2}*/}
              {/*      placeholder=""*/}
              {/*    />*/}
              {/*  )}*/}
              {/*</FormItem>*/}
              <FormItem
                label="楼盘评级排位占比(%)"
                labelCol={layout(6, 10)}
                wrapperCol={layout(18, 14)}
                style={{marginBottom:10,width:420}}
              >
                {getFieldDecorator('rankRate', {
                  initialValue: editData.rankRate
                })(
                  <InputNumber
                    style={{ width: 95 }}
                    min={0}
                    precision={2}
                    placeholder=""
                  />
                )}
              </FormItem>
             
            </div>
            
            <FormItem
              label="总得分"
              labelCol={layout(7, 11)}
              wrapperCol={layout(18, 13)}
              style={{marginBottom:5}}
            >
              {getFieldDecorator('totalScore', {
                initialValue: editData.totalScore
              })(<Input precision={2} disabled placeholder=""  style={{ width: 95 }} />)}
            </FormItem>
            <FormItem
              label="楼盘等级"
              labelCol={layout(7, 11)}
              wrapperCol={layout(18, 13)}
              style={{marginBottom:5}}
            >
              {getFieldDecorator('grade', {
                initialValue: editData.grade
              })(<Input disabled placeholder=""  style={{ width: 95 }}/>)}
            </FormItem>
          </Form>
        </Modal>
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
)(ResRatingHistoryEdit)
