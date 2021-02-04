import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Form, Row, Col, Checkbox, Modal, Radio, Message } from 'antd'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group

const projectOptions = [
  {
    label: '楼层差',
    value: '1033003'
  },
  {
    label: '朝向',
    value: '1033001'
  },
  {
    label: '景观',
    value: '1033002'
  },
  {
    label: '通风采光',
    value: '1033006'
  },
  {
    label: '装修',
    value: '1033004'
  },
  {
    label: '面积段',
    value: '1033005'
  }
]

/**
 * 住宅 房号系数差 / 清除修正系数
 * author: YJF
 */
class HouseStandThreeFactor extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    modalVisible: PropTypes.bool.isRequired,
    onCloseModal: PropTypes.func.isRequired,
    delProjectCoef: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    onRefreshPage: PropTypes.func.isRequired
    // currentTab: PropTypes.string.isRequired
  }

  constructor() {
    super()

    this.state = {
      // 选中的筛选范围 id数组
      checkedProjectList: [],
      // 是否全部选中
      checkedAllProject: false,
      indeterminateProject: true
    }
  }

  onCheckAllProjectChange = e => {
    const projectOptionsValue = []
    projectOptions.forEach(item => {
      projectOptionsValue.push(item.value)
    })
    this.setState({
      checkedProjectList: e.target.checked ? projectOptionsValue : [],
      indeterminateProject: false,
      checkedAllProject: e.target.checked
    })
  }

  onCheckProjectChange = checkedList => {
    this.setState({
      checkedProjectList: checkedList,
      indeterminateProject:
        !!checkedList.length && checkedList.length < projectOptions.length,
      checkedAllProject: checkedList.length === projectOptions.length
    })
  }

  handleSubmit = () => {
    const cityId = sessionStorage.getItem('FDC_CITY')
    const { scope } = this.props.form.getFieldsValue(['scope'])
    const { checkedProjectList } = this.state

    if (checkedProjectList.length > 0) {
      const data = {
        cityId,
        scope,
        diffTypes: this.state.checkedProjectList.join(','),
        projectId: this.props.projectId,
        coefficientDiffVersion: 3
      }
      this.props.delProjectCoef(data, () => {
        // 清空数据
        this.props.form.resetFields()
        this.setState({
          checkedProjectList: []
        })
        this.handleCancel()
        Message.success('清除成功')
        this.props.onRefreshPage(null, 1)
      })
    } else {
      Message.warn('请选择删除范围')
    }
  }

  handleCancel = () => {
    this.props.onCloseModal()
  }

  render() {
    const {
      form: { getFieldDecorator }
    } = this.props

    const formItemLayout = {
      labelCol: {
        xs: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 14 }
      }
    }

    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px'
    }

    const {
      checkedAllProject,
      indeterminateProject,
      checkedProjectList
    } = this.state

    return (
      <Modal
        title="清除修正系数"
        visible={this.props.modalVisible}
        okText="清除"
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        maskClosable={false}
      >
        <Form>
          <Row>
            <FormItem label="删除标准" {...formItemLayout}>
              {getFieldDecorator('scope', {
                initialValue: this.props.projectId ? 2 : 1
              })(
                <RadioGroup>
                  {this.props.projectId ? (
                    <span>
                      <Radio style={radioStyle} value={2}>
                        删除本楼盘标准
                      </Radio>
                    </span>
                  ) : (
                    <span>
                      <Radio style={radioStyle} value={1}>
                        删除城市公共标准
                      </Radio>
                      <Radio style={radioStyle} value={4}>
                        删除所有楼盘标准
                      </Radio>
                      <Radio style={radioStyle} value={3}>
                        删除所有标准
                      </Radio>
                    </span>
                  )}
                </RadioGroup>
              )}
            </FormItem>
          </Row>
          <Row>
            <FormItem label="删除范围" {...formItemLayout}>
              <Checkbox
                indeterminate={indeterminateProject}
                checked={checkedAllProject}
                onChange={this.onCheckAllProjectChange}
              >
                全部
              </Checkbox>
              <CheckboxGroup
                // options={projectOptions}
                value={checkedProjectList}
                onChange={this.onCheckProjectChange}
              >
                {projectOptions.map(item => (
                  <Col span={8} key={item.value}>
                    <Checkbox value={item.value}>{item.label}</Checkbox>
                  </Col>
                ))}
              </CheckboxGroup>
            </FormItem>
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
)(HouseStandThreeFactor)
