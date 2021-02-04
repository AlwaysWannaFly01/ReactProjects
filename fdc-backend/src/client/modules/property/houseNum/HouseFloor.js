import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import { Row, Form, Col, Select } from 'antd'

import layout from 'client/utils/layout'

import { modelSelector } from './selector'

const FormItem = Form.Item
const { Option } = Select

// 楼层 单元室号组件
class HouseFloor extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    onHouseFloorRef: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    props.onHouseFloorRef(this)

    // props.onHouseFloorRef(this)
    this.state = {
      // 楼层数组中、第一个select选中的index
      floorIndex: -1,
      // 单号室号中、第一个select选中的index
      houseIndex: -1
    }
  }

  handleFloorNo1Change = value => {
    const { floorList } = this.props.model
    // 获取 floorNo2 的index
    const floorNo2 = this.props.form.getFieldValue('floorNo2')
    let floorNo2Index = -1
    if (floorNo2) {
      floorNo2Index = floorList.findIndex(item => item === +floorNo2)
    }
    const newFloorIndex = floorList.findIndex(item => item === +value)
    if (floorNo2Index < newFloorIndex) {
      this.props.form.setFieldsValue({ floorNo2: undefined })
    }
    this.setState({
      floorIndex: newFloorIndex
    })
  }

  handleHouseCol1Change = value => {
    const { houseColList } = this.props.model
    // 获取 houseCol2 的index
    const houseCol2 = this.props.form.getFieldValue('houseCol2')
    let houseCol2Index = -1
    if (houseCol2) {
      houseCol2Index = houseColList.findIndex(item => item === houseCol2)
    }
    const newHouseIndex = houseColList.findIndex(item => item === value)
    if (houseCol2Index < newHouseIndex) {
      this.props.form.setFieldsValue({ houseCol2: undefined })
    }
    this.setState({
      houseIndex: newHouseIndex
    })
  }

  handleSubmitHouseFloor = () => {
    const {
      floorNo1,
      floorNo2,
      houseCol1,
      houseCol2
    } = this.props.form.getFieldsValue()
    const { floorList, houseColList } = this.props.model
    const postData = {}
    // 物理层 / 单元室号 是否有选值，必须都有选值
    let isChosedHouseFloor = false
    let isChosedFloor = false
    let isChosedHouse = false
    if (floorNo1 && floorNo2) {
      isChosedFloor = true
      const floorNo1Index = floorList.findIndex(item => item === +floorNo1)
      const floorNo2Index = floorList.findIndex(item => item === +floorNo2)
      postData.floorNo = floorList.slice(floorNo1Index, floorNo2Index + 1)
    }
    if (houseCol1 && houseCol2) {
      isChosedHouse = true
      const houseCol1Index = houseColList.findIndex(item => item === houseCol1)
      const houseCol2Index = houseColList.findIndex(item => item === houseCol2)
      postData.houseCol = houseColList.slice(houseCol1Index, houseCol2Index + 1)
    }
    isChosedHouseFloor = isChosedFloor && isChosedHouse
    return { postData, isChosedHouseFloor }
  }

  render() {
    const {
      form: { getFieldDecorator }
    } = this.props

    const { floorIndex, houseIndex } = this.state
    const { floorList, houseColList } = this.props.model
    // console.log(houseColList)

    return (
      <div>
        {pagePermission('fdc:hd:residence:base:roomNum:change') ? (
          <Form>
            <Row>
              <Col span={16}>
                <FormItem
                  label="物理层"
                  labelCol={layout(12, 6)}
                  wrapperCol={layout(12, 18)}
                >
                  <Col span={10}>
                    <FormItem>
                      {getFieldDecorator('floorNo1', {
                        onChange: this.handleFloorNo1Change
                      })(
                        <Select placeholder="请选择" style={{ width: '100%' }}>
                          {floorList.map(item => (
                            <Option key={item}>{item}</Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={2} style={{ textAlign: 'center' }}>
                    ~
                  </Col>
                  <Col span={12}>
                    <FormItem>
                      {getFieldDecorator('floorNo2')(
                        <Select
                          placeholder="请选择"
                          style={{ width: '100%' }}
                          disabled={floorIndex === -1}
                        >
                          {floorList.slice(floorIndex).map(item => (
                            <Option key={item}>{item}</Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={16}>
                <FormItem
                  label="单元室号"
                  labelCol={layout(12, 6)}
                  wrapperCol={layout(12, 18)}
                >
                  <Col span={10}>
                    <FormItem>
                      {getFieldDecorator('houseCol1', {
                        onChange: this.handleHouseCol1Change
                      })(
                        <Select placeholder="请选择" style={{ width: '100%' }}>
                          {houseColList.map(item => (
                            <Option key={item}>
                              {item.split(',').join('')}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={2} style={{ textAlign: 'center' }}>
                    ~
                  </Col>
                  <Col span={12}>
                    <FormItem>
                      {getFieldDecorator('houseCol2')(
                        <Select
                          placeholder="请选择"
                          style={{ width: '100%' }}
                          disabled={houseIndex === -1}
                        >
                          {houseColList.slice(houseIndex).map(item => (
                            <Option key={item}>
                              {item.split(',').join('')}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </FormItem>
              </Col>
            </Row>
          </Form>
        ) : (
          ''
        )}
      </div>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    modelSelector,
    null
  )
)(HouseFloor)
