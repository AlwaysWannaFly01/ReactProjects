/* eslint-disable react/no-unescaped-entities */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import {
  Form,
  Modal,
  Select,
  Icon,
  Message,
  Tooltip,
  Row,
  Col,
  InputNumber
} from 'antd'

import Immutable from 'immutable'

import { containerActions } from './actions'
import './sagas'
import './reducer'
import { modelSelector } from './selector'
import styles from './estateRating.less'

const text = (
  <span>
    <p>1)区间左右的值,统一为'包含'</p>
    <p>2)只填左边说明区间是[a,+∞）,只填右边说明区间是(-∞,a]</p>
  </span>
)
const textChange = (
  <span>
    <p>1)区间左右的值,统一为'包含'</p>
    <p>2)只填左边说明区间是[a,+∞),只填右边说明区间是(-∞,a)</p>
  </span>
)
const Option = Select.Option

const formItemLayoutSelect = {
  labelCol: {
    xs: { span: 6 }
  },
  wrapperCol: {
    xs: { span: 16 }
  }
}

const formItemLayout = {
  labelCol: {
    xs: { span: 6 }
  },
  wrapperCol: {
    xs: { span: 12 }
  }
}
const formItemLayoutChange = {
  labelCol: {
    xs: { span: 6 }
  },
  wrapperCol: {
    xs: { span: 18 }
  }
}

/**
 * @description 楼盘评级规则-修改 模块
 */
class EstateRatingEdit extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    visible: PropTypes.bool.isRequired,
    onCloseModal: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    // cityList: PropTypes.instanceOf(Immutable.List).isRequired,
    // getAreaList: PropTypes.func.isRequired,
    // addCityAvgPrice: PropTypes.func.isRequired,
    editDate: PropTypes.object.isRequired,
    newAreaList: PropTypes.array.isRequired,
    onSearch: PropTypes.func.isRequired,
    editEstateRating: PropTypes.func.isRequired
  }

  constructor() {
    super()

    this.selectList = []
    this.delList = []
    this.state = {
      locationStandard1: [],
      locationStandard2: [],
      locationStandard3: [],
      locationStandard4: [],
      // 起始年份
      dateList: []
    }
  }

  componentDidMount() {
    // const { cityId } = this.state
    // this.props.getAreaList({})
    this.cityIdInterval = setInterval(() => {
      clearInterval(this.cityIdInterval)
      // 起始年份
      const dateList = []
      for (let i = 1970; i < 2081; i += 1) {
        dateList.push(i)
      }
      this.setState({ dateList })
    }, 100)
  }

  handleCloseModal = () => {
    this.props.form.resetFields()
    this.setState({
      locationStandard1: [],
      locationStandard2: [],
      locationStandard3: [],
      locationStandard4: []
    })
    this.props.onCloseModal()
  }

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { editDate } = this.props
        const params = {}
        // let deliveryTest = []
        // for(let i = 1;i<5;i++){
        //   if(values['deliveryDateStart'+i]||values['deliveryDateEnd'+i]||values['deliveryDateStandardValue'+i]){
        //     let obj =  {
        //       deliveryDateEnd: values['deliveryDateEnd'+i],
        //       deliveryDateStandardValue: values['deliveryDateStandardValue'+i],
        //       deliveryDateStart: values['deliveryDateStart'+i]
        //     }
        //     deliveryTest.push(obj)
        //   }
        // }
        params.scoresObject = {}
        for(let i in editDate.scoresObject){
          params.scoresObject[i] = values[i]
        }
        
        params.cityId = editDate.cityId
        params.deliveryDateWeight = values.deliveryDateWeight
        params.offerLivenessWeight = values.offerLivenessWeight
        params.vqQueryWeight = values.vqQueryWeight
        params.developerWeight = values.developerWeight
        params.volumeWeight = values.volumeWeight
        params.facilitiesWeight = values.facilitiesWeight
        params.managementWeight = values.managementWeight
        params.transportationWeight = values.transportationWeight
        params.municipalityWeight = values.municipalityWeight
        params.medicalWeight = values.medicalWeight
        params.educationWeight = values.educationWeight
        params.commercialWeight = values.commercialWeight
        // params.bankWhitelistWeight = values.bankWhitelistWeight
        params.priceRentRatioWeight = values.priceRentRatioWeight
        params.priceStabilityWeight = values.priceStabilityWeight
        this.props.editEstateRating(params, res => {
          const { code, message } = res
          if (+code === 200) {
            Message.success('更改成功')
            this.props.onSearch()
            this.handleCloseModal()
          } else {
            Message.error(message)
          }
        })
      }
    })
  }

  handleChange1 = value => {
    const { newAreaList } = this.props
    value.forEach(item => {
      newAreaList.forEach(item2 => {
        if (item === item2.key) {
          item2.disable = true
        }
      })
    })
    this.setState({ locationStandard1: value })
  }

  handleChange2 = value => {
    const { newAreaList } = this.props
    value.forEach(item => {
      newAreaList.forEach(item2 => {
        if (item === item2.key) {
          item2.disable = true
        }
      })
    })
    this.setState({ locationStandard2: value })
  }

  handleChange3 = value => {
    const { newAreaList } = this.props
    value.forEach(item => {
      newAreaList.forEach(item2 => {
        if (item === item2.key) {
          item2.disable = true
        }
      })
    })
    this.setState({ locationStandard3: value })
  }

  handleChange4 = value => {
    const { newAreaList } = this.props
    value.forEach(item => {
      newAreaList.forEach(item2 => {
        if (item === item2.key) {
          item2.disable = true
        }
      })
    })
    this.setState({ locationStandard4: value })
  }

  // 取消选中时触发
  handleDeselect = value => {
    const { newAreaList } = this.props
    newAreaList.forEach(item2 => {
      if (value === item2.key) {
        item2.disable = false
      }
    })
  }
  limitNumber = value =>{
    if (typeof value === 'string') {
      return !isNaN(Number(value)) ? value.replace(/\./g, '') : 0
    } else if (typeof value === 'number') {
      return !isNaN(value) ? String(value).replace(/\./g, '') : 0
    } else {
      return 0
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form
    const { dateList } = this.state
    const { editDate, newAreaList } = this.props
    if(!editDate.scoresObject){
      editDate.scoresObject = {}
    }else if(Object.keys(editDate.scoresObject).length===0){
      editDate.scoresObject = {}
    }
   
    /* eslint-disable */

    const children = []
    newAreaList.forEach((item, i) => {
      children.push(
        <Option
          value={item.key}
          className={item.disable ? styles.none : styles.block}
          key={item.key}
        >
          {item.label}
        </Option>
      )
    })
    const title = `更改楼盘评级规则(${editDate.cityName})`
    // 均价月份
    return (
      <Modal
        title={title}
        bodyStyle={{ maxHeight: '500px', overflowY: 'scroll' }}
        width="700px"
        visible={this.props.visible}
        onCancel={this.handleCloseModal}
        onOk={this.handleSubmit}
        maskClosable={false}
      >
        <Form>
          <Row className={styles.rowTitle} style={{marginBottom:5}}>
            <span>报盘活跃度 </span>
          </Row>
          <Row>
            <Col span={16}>
              <Form.Item label="权重：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('offerLivenessWeight', {
                  initialValue: editDate.offerLivenessWeight
                })(<InputNumber placeholder="请输入" min={0} max={100} />)}
                <span className="ant-form-text"> %</span>
              </Form.Item>
              <Form.Item label="标准A_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('offerLivenessScore1', {
                  initialValue: editDate.scoresObject.offerLivenessScore1
                })(<InputNumber placeholder="请输入" min={0} max={10} formatter={this.limitNumber} parser={this.limitNumber}/>)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准B_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('offerLivenessScore2', {
                  initialValue: editDate.scoresObject.offerLivenessScore2
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准C_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('offerLivenessScore3', {
                  initialValue: editDate.scoresObject.offerLivenessScore3
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准D_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('offerLivenessScore4', {
                  initialValue: editDate.scoresObject.offerLivenessScore4
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
            </Col>
            <Col span={8} />
          </Row>
          <Row className={styles.rowTitle} style={{marginTop: 15,marginBottom:5}}>
            <span>VQ查询热度 </span>
          </Row>
          <Row>
            <Col span={16}>
              <Form.Item label="权重：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('vqQueryWeight', {
                  initialValue: editDate.vqQueryWeight
                })(<InputNumber placeholder="请输入" min={0} max={100} />)}
                <span className="ant-form-text"> %</span>
              </Form.Item>
              <Form.Item label="标准A_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('vqQueryScore1', {
                  initialValue: editDate.scoresObject.vqQueryScore1
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准B_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('vqQueryScore2', {
                  initialValue: editDate.scoresObject.vqQueryScore2
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准C_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('vqQueryScore3', {
                  initialValue: editDate.scoresObject.vqQueryScore3
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准D_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('vqQueryScore4', {
                  initialValue: editDate.scoresObject.vqQueryScore4
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
            </Col>
            <Col span={8} />
          </Row>
          <Row className={styles.rowTitle} style={{marginTop: 15,marginBottom:5}}>
            <span>竣工日期 </span>
            <Tooltip placement="bottomLeft" title={text}>
              <Icon type="question-circle" />
            </Tooltip>
          </Row>
          <Row>
            <Col span={11}>
              <Form.Item label="权重：" {...formItemLayout} style={{marginTop: 15,marginBottom:5}}>
                {getFieldDecorator('deliveryDateWeight', {
                  initialValue: editDate.deliveryDateWeight
                })(<InputNumber placeholder="请输入" min={0} max={100} />)}
                <span className="ant-form-text"> %</span>
              </Form.Item>
            </Col>
            <Col span={8} />
          </Row>
          <Row>
            <Col span={11}>
              <Form.Item label="标准A:" {...formItemLayout} style={{marginBottom:5}}>
                <Row gutter={6} style={{width:'133%'}}>
                  <Col span={12}>
                    {getFieldDecorator('deliveryDateStart1', {
                      initialValue: editDate.scoresObject.deliveryDateStart1
                    })(
                      <Select
                        showSearch
                        allowClear
                        style={{ width: 92 }}
                        placeholder="起始年份"
                        onChange={this.onStartChange}
                      >
                        {dateList.map(item => (
                          <Option key={item} value={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Col>
                  <Col span={2}> ~ </Col>
                  <Col span={8}>
                    <Form.Item style={{ marginBottom: '0px' }}>
                      {this.props.form.getFieldDecorator('deliveryDateEnd1', {
                        initialValue: editDate.scoresObject.deliveryDateEnd1
                      })(
                        <Select
                          showSearch
                          allowClear
                          style={{ width: 92 }}
                          placeholder="结束年份"
                          onChange={this.onEndChange}
                        >
                          {dateList.map(item => (
                            <Option key={item} value={item}>
                              {item}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="分值:" {...formItemLayout} style={{marginBottom:5}}>
                {getFieldDecorator('deliveryDateStandardValue1', {
                  initialValue: editDate.scoresObject.deliveryDateStandardValue1,
                  rules: [
                    {
                      required: false,
                      message: '请输入'
                    }
                  ]
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={11}>
              <Form.Item label="标准B:" {...formItemLayout} style={{marginBottom:5}}>
                <Row gutter={6} style={{width:'133%'}}>
                  <Col span={12}>
                    {getFieldDecorator('deliveryDateStart2', {
                      initialValue: editDate.scoresObject.deliveryDateStart2
                    })(
                        <Select
                            showSearch
                            allowClear
                            style={{ width: 92 }}
                            placeholder="起始年份"
                            onChange={this.onStartChange}
                        >
                          {dateList.map(item => (
                              <Option key={item} value={item}>
                                {item}
                              </Option>
                          ))}
                        </Select>
                    )}
                  </Col>
                  <Col span={2}> ~ </Col>
                  <Col span={8}>
                    <Form.Item style={{ marginBottom: '0px' }}>
                      {this.props.form.getFieldDecorator('deliveryDateEnd2', {
                        initialValue: editDate.scoresObject.deliveryDateEnd2
                      })(
                          <Select
                              showSearch
                              allowClear
                              style={{ width: 92 }}
                              placeholder="结束年份"
                              onChange={this.onEndChange}
                          >
                            {dateList.map(item => (
                                <Option key={item} value={item}>
                                  {item}
                                </Option>
                            ))}
                          </Select>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="分值:" {...formItemLayout} style={{marginBottom:5}}>
                {getFieldDecorator('deliveryDateStandardValue2', {
                  initialValue: editDate.scoresObject.deliveryDateStandardValue2,
                  rules: [
                    {
                      required: false,
                      message: '请输入'
                    }
                  ]
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={11}>
              <Form.Item label="标准C:" {...formItemLayout} style={{marginBottom:5}}>
                <Row gutter={6} style={{width:'133%'}}>
                  <Col span={12}>
                    {getFieldDecorator('deliveryDateStart3', {
                      initialValue: editDate.scoresObject.deliveryDateStart3
                    })(
                        <Select
                            showSearch
                            allowClear
                            style={{ width: 92 }}
                            placeholder="起始年份"
                            onChange={this.onStartChange}
                        >
                          {dateList.map(item => (
                              <Option key={item} value={item}>
                                {item}
                              </Option>
                          ))}
                        </Select>
                    )}
                  </Col>
                  <Col span={2}> ~ </Col>
                  <Col span={8}>
                    <Form.Item style={{ marginBottom: '0px' }}>
                      {this.props.form.getFieldDecorator('deliveryDateEnd3', {
                        initialValue: editDate.scoresObject.deliveryDateEnd3
                      })(
                          <Select
                              showSearch
                              allowClear
                              style={{ width: 92 }}
                              placeholder="结束年份"
                              onChange={this.onEndChange}
                          >
                            {dateList.map(item => (
                                <Option key={item} value={item}>
                                  {item}
                                </Option>
                            ))}
                          </Select>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="分值:" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('deliveryDateStandardValue3', {
                  initialValue: editDate.scoresObject.deliveryDateStandardValue3,
                  rules: [
                    {
                      required: false,
                      message: '请输入'
                    }
                  ]
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={11}>
              <Form.Item label="标准D:" {...formItemLayout} style={{marginBottom:5}}>
                <Row gutter={6} style={{width:'133%'}}>
                  <Col span={12}>
                    {getFieldDecorator('deliveryDateStart4', {
                      initialValue: editDate.scoresObject.deliveryDateStart4
                    })(
                        <Select
                            showSearch
                            allowClear
                            style={{ width: 92 }}
                            placeholder="起始年份"
                            onChange={this.onStartChange}
                        >
                          {dateList.map(item => (
                              <Option key={item} value={item}>
                                {item}
                              </Option>
                          ))}
                        </Select>
                    )}
                  </Col>
                  <Col span={2}> ~ </Col>
                  <Col span={8}>
                    <Form.Item style={{ marginBottom: '0px' }}>
                      {this.props.form.getFieldDecorator('deliveryDateEnd4', {
                        initialValue: editDate.scoresObject.deliveryDateEnd4
                      })(
                          <Select
                              showSearch
                              allowClear
                              style={{ width: 92 }}
                              placeholder="结束年份"
                              onChange={this.onEndChange}
                          >
                            {dateList.map(item => (
                                <Option key={item} value={item}>
                                  {item}
                                </Option>
                            ))}
                          </Select>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="分值:" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('deliveryDateStandardValue4', {
                  initialValue: editDate.scoresObject.deliveryDateStandardValue4,
                  rules: [
                    {
                      required: false,
                      message: '请输入'
                    }
                  ]
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={11}>
              <Form.Item label="标准E:" {...formItemLayout} style={{marginBottom:5}}>
                <Row gutter={6} style={{width:'133%'}}>
                  <Col span={12}>
                    {getFieldDecorator('deliveryDateStart5', {
                      initialValue: editDate.scoresObject.deliveryDateStart5
                    })(
                        <Select
                            showSearch
                            allowClear
                            style={{ width: 92 }}
                            placeholder="起始年份"
                            onChange={this.onStartChange}
                        >
                          {dateList.map(item => (
                              <Option key={item} value={item}>
                                {item}
                              </Option>
                          ))}
                        </Select>
                    )}
                  </Col>
                  <Col span={2}> ~ </Col>
                  <Col span={8}>
                    <Form.Item style={{ marginBottom: '0px' }}>
                      {this.props.form.getFieldDecorator('deliveryDateEnd5', {
                        initialValue: editDate.scoresObject.deliveryDateEnd5
                      })(
                          <Select
                              showSearch
                              allowClear
                              style={{ width: 92 }}
                              placeholder="结束年份"
                              onChange={this.onEndChange}
                          >
                            {dateList.map(item => (
                                <Option key={item} value={item}>
                                  {item}
                                </Option>
                            ))}
                          </Select>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="分值:" {...formItemLayout} style={{marginBottom:5}}>
                {getFieldDecorator('deliveryDateStandardValue5', {
                  initialValue: editDate.scoresObject.deliveryDateStandardValue5,
                  rules: [
                    {
                      required: false,
                      message: '请输入'
                    }
                  ]
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
              </Form.Item>
            </Col>
          </Row>
          
          
          
          <Row className={styles.rowTitle} style={{marginTop: 15,marginBottom:5}}>
            <span>开发商 </span>
          </Row>
          <Row>
            <Col span={16}>
              <Form.Item label="权重：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('developerWeight', {
                  initialValue: editDate.developerWeight
                })(<InputNumber placeholder="请输入" min={0} max={100} />)}
                <span className="ant-form-text"> %</span>
              </Form.Item>
              <Form.Item label="标准A_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('developerScore1', {
                  initialValue: editDate.scoresObject.developerScore1
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准B_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('developerScore2', {
                  initialValue: editDate.scoresObject.developerScore2
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准C_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('developerScore3', {
                  initialValue: editDate.scoresObject.developerScore3
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
            </Col>
            <Col span={8} />
          </Row>
          
          <Row className={styles.rowTitle} style={{marginTop: 15,marginBottom:5}}>
            <span>楼盘体量 </span>
          </Row>
          <Row>
            <Col span={16}>
              <Form.Item label="权重：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('volumeWeight', {
                  initialValue: editDate.volumeWeight
                })(<InputNumber placeholder="请输入" min={0} max={100} />)}
                <span className="ant-form-text"> %</span>
              </Form.Item>
              <Form.Item label="标准A_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('volumeScore1', {
                  initialValue: editDate.scoresObject.volumeScore1
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准B_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('volumeScore2', {
                  initialValue: editDate.scoresObject.volumeScore2
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准C_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('volumeScore3', {
                  initialValue: editDate.scoresObject.volumeScore3
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准D_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('volumeScore4', {
                  initialValue: editDate.scoresObject.volumeScore4
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
            </Col>
            
            <Col span={8} />
          </Row>
          <Row className={styles.rowTitle} style={{marginTop: 15,marginBottom:5}}>
            <span>内部配套 </span>
          </Row>
          <Row>
            <Col span={16}>
              <Form.Item label="权重：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('facilitiesWeight', {
                  initialValue: editDate.facilitiesWeight
                })(<InputNumber placeholder="请输入" min={0} max={100} />)}
                <span className="ant-form-text"> %</span>
              </Form.Item>
              <Form.Item label="标准A_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('facilitiesScore1', {
                  initialValue: editDate.scoresObject.facilitiesScore1
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准B_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('facilitiesScore2', {
                  initialValue: editDate.scoresObject.facilitiesScore2
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准C_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('facilitiesScore3', {
                  initialValue: editDate.scoresObject.facilitiesScore3
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准D_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('facilitiesScore4', {
                  initialValue: editDate.scoresObject.facilitiesScore4
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
            </Col>
            <Col span={8} />
          </Row>
          <Row className={styles.rowTitle} style={{marginTop: 15,marginBottom:5}}>
            <span>物业 </span>
          </Row>
          <Row>
            <Col span={16}>
              <Form.Item label="权重：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('managementWeight', {
                  initialValue: editDate.managementWeight
                })(<InputNumber placeholder="请输入" min={0} max={100} />)}
                <span className="ant-form-text"> %</span>
              </Form.Item>
              <Form.Item label="标准A_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('managementScore1', {
                  initialValue: editDate.scoresObject.managementScore1
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准B_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('managementScore2', {
                  initialValue: editDate.scoresObject.managementScore2
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
            </Col>
            <Col span={8} />
          </Row>
          <Row className={styles.rowTitle} style={{marginTop: 15,marginBottom:5}}>
            <span>交通 </span>
          </Row>
          <Row>
            <Col span={16}>
              <Form.Item label="权重：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('transportationWeight', {
                  initialValue: editDate.transportationWeight
                })(<InputNumber placeholder="请输入" min={0} max={100} />)}
                <span className="ant-form-text"> %</span>
              </Form.Item>
              <Form.Item label="标准A_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('transportationScore1', {
                  initialValue: editDate.scoresObject.transportationScore1
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准B_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('transportationScore2', {
                  initialValue: editDate.scoresObject.transportationScore2
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准C_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('transportationScore3', {
                  initialValue: editDate.scoresObject.transportationScore3
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准D_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('transportationScore4', {
                  initialValue: editDate.scoresObject.transportationScore4
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
            </Col>
            <Col span={8} />
          </Row>
          <Row className={styles.rowTitle} style={{marginTop: 15,marginBottom:5}}>
            <span>市政 </span>
          </Row>
          <Row>
            <Col span={16}>
              <Form.Item label="权重：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('municipalityWeight', {
                  initialValue: editDate.municipalityWeight
                })(<InputNumber placeholder="请输入" min={0} max={100} />)}
                <span className="ant-form-text"> %</span>
              </Form.Item>
              <Form.Item label="标准A_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('municipalityScore1', {
                  initialValue: editDate.scoresObject.municipalityScore1
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准B_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('municipalityScore2', {
                  initialValue: editDate.scoresObject.municipalityScore2
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准C_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('municipalityScore3', {
                  initialValue: editDate.scoresObject.municipalityScore3
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              
            </Col>
            <Col span={8} />
          </Row>
          <Row className={styles.rowTitle} style={{marginTop: 15,marginBottom:5}}>
            <span>医疗 </span>
          </Row>
          <Row>
            <Col span={16}>
              <Form.Item label="权重：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('medicalWeight', {
                  initialValue: editDate.medicalWeight
                })(<InputNumber placeholder="请输入" min={0} max={100} />)}
                <span className="ant-form-text"> %</span>
              </Form.Item>
              <Form.Item label="标准A_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('medicalScore1', {
                  initialValue: editDate.scoresObject.medicalScore1
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准B_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('medicalScore2', {
                  initialValue: editDate.scoresObject.medicalScore2
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准C_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('medicalScore3', {
                  initialValue: editDate.scoresObject.medicalScore3
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准D_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('medicalScore4', {
                  initialValue: editDate.scoresObject.medicalScore4
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
            </Col>
            <Col span={8} />
          </Row>
          
          
          <Row className={styles.rowTitle} style={{marginTop: 15,marginBottom:5}}>
            <span>教育 </span>
          </Row>
          <Row>
            <Col span={16}>
              <Form.Item label="权重：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('educationWeight', {
                  initialValue: editDate.educationWeight
                })(<InputNumber placeholder="请输入" min={0} max={100} />)}
                <span className="ant-form-text"> %</span>
              </Form.Item>
              <Form.Item label="标准A_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('educationScore1', {
                  initialValue: editDate.scoresObject.educationScore1
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准B_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('educationScore2', {
                  initialValue: editDate.scoresObject.educationScore2
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准C_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('educationScore3', {
                  initialValue: editDate.scoresObject.educationScore3
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              
            </Col>
            <Col span={8} />
          </Row>
          <Row className={styles.rowTitle} style={{marginTop: 15,marginBottom:5}}>
            <span>商业 </span>
          </Row>
          <Row>
            <Col span={16}>
              <Form.Item label="权重：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('commercialWeight', {
                  initialValue: editDate.commercialWeight
                })(<InputNumber placeholder="请输入" min={0} max={100} />)}
                <span className="ant-form-text"> %</span>
              </Form.Item>
              <Form.Item label="标准A_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('commercialScore1', {
                  initialValue: editDate.scoresObject.commercialScore1
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准B_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('commercialScore2', {
                  initialValue: editDate.scoresObject.commercialScore2
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准C_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('commercialScore3', {
                  initialValue: editDate.scoresObject.commercialScore3
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准D_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('commercialScore4', {
                  initialValue: editDate.scoresObject.commercialScore4
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
            </Col>
            <Col span={8} />
          </Row>
          {/*<Row className={styles.rowTitle}>*/}
          {/*  <span>入围银行白名单 </span>*/}
          {/*</Row>*/}
          {/*<Row>*/}
          {/*  <Col span={16}>*/}
          {/*    <Form.Item label="权重：" {...formItemLayout}>*/}
          {/*      {getFieldDecorator('bankWhitelistWeight', {*/}
          {/*        initialValue: editDate.bankWhitelistWeight*/}
          {/*      })(<InputNumber placeholder="请输入" min={0} max={100} />)}*/}
          {/*      <span className="ant-form-text"> %</span>*/}
          {/*    </Form.Item>*/}
          {/*  </Col>*/}
          {/*  <Col span={8} />*/}
          {/*</Row>*/}
          <Row className={styles.rowTitle} style={{marginTop: 15,marginBottom:5}}>
            <span>租售比 </span>
          </Row>
          <Row>
            <Col span={16}>
              <Form.Item label="权重：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('priceRentRatioWeight', {
                  initialValue: editDate.priceRentRatioWeight
                })(<InputNumber placeholder="请输入" min={0} max={100} />)}
                <span className="ant-form-text"> %</span>
              </Form.Item>
              <Form.Item label="标准A_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('priceRentRatioScore1', {
                  initialValue: editDate.scoresObject.priceRentRatioScore1
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准B_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('priceRentRatioScore2', {
                  initialValue: editDate.scoresObject.priceRentRatioScore2
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准C_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('priceRentRatioScore3', {
                  initialValue: editDate.scoresObject.priceRentRatioScore3
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
            </Col>
            <Col span={8} />
          </Row>
          <Row className={styles.rowTitle} style={{marginTop: 15,marginBottom:5}}>
            <span>价格稳定性 </span>
          </Row>
          <Row>
            <Col span={16}>
              <Form.Item label="权重：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('priceStabilityWeight', {
                  initialValue: editDate.priceStabilityWeight
                })(<InputNumber placeholder="请输入" min={0} max={100} />)}
                <span className="ant-form-text"> %</span>
              </Form.Item>
              <Form.Item label="标准A_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('priceStabilityScore1', {
                  initialValue: editDate.scoresObject.priceStabilityScore1
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准B_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('priceStabilityScore2', {
                  initialValue: editDate.scoresObject.priceStabilityScore2
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
              <Form.Item label="标准C_分值：" {...formItemLayout} style={{marginBottom: 3}}>
                {getFieldDecorator('priceStabilityScore3', {
                  initialValue: editDate.scoresObject.priceStabilityScore3
                })(<InputNumber placeholder="请输入" min={0} max={10} />)}
                {/*<span className="ant-form-text"> %</span>*/}
              </Form.Item>
            </Col>
            <Col span={8} />
          </Row>
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
)(EstateRatingEdit)
