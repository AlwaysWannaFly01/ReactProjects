import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Modal, Form, Select, Row, Radio, Message, Input } from 'antd'

import { containerActions } from './actions'
import './sagas'
import './reducer'
import { modelSelector } from './selector'

const FormItem = Form.Item
const { Option } = Select
const RadioGroup = Radio.Group

const formItemLayout = {
  labelCol: {
    xs: { span: 6 }
  },
  wrapperCol: {
    xs: { span: 12 }
  }
}

// 楼栋复制 模块
class BuildInfoCopy extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    buildId: PropTypes.string.isRequired,
    copyModalVisible: PropTypes.bool.isRequired,
    onCloseCopyModal: PropTypes.func.isRequired,
    buildDetail: PropTypes.object.isRequired,
    validBuildCopy: PropTypes.func.isRequired,
    buildCopy: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      // 已删除的楼栋列表
      delBuildList: [],
      // 校验结果
      validateBuildNameMsg: '',

      // 是否显示新增楼栋选项
      showAddbuild: false,
      // 是否显示已删除楼栋列表
      showDelBuildList: false,
      // 要还原楼栋的id
      restoreBuildingId: '',

      btnLoading: false
    }
  }

  componentDidMount() {
    this.cityId = sessionStorage.getItem('FDC_CITY')
  }

  handleBuildNameBlur = (_, isSubmit) => {
    this.props.form.validateFields(['buildName'], (err, values) => {
      if (!err) {
        const validParam = {
          cityId: this.cityId,
          projectId: this.props.projectId,
          srcBuildingId: this.props.buildId,
          targetBuildingName: values.buildName
        }
        this.props.validBuildCopy(validParam, res => {
          this.handleValidRes(res, isSubmit)
        })
      }
    })
  }

  // 复制前校验结果
  handleValidRes = (res, isSubmit) => {
    /* eslint-disable */
    const { tipMsgCode, tipMsg, buildings } = res || {}
    switch (tipMsgCode) {
      case 1001:
      case 1003:
        this.resetDelBuildList()
        if (isSubmit) {
          this.handleSubmitCopy()
        } else {
          this.setState({
            validateBuildNameMsg: tipMsg
          })
        }
        break
      case 1004:
      case 1005:
        // 如果是提交
        if (isSubmit) {
          const { showDelBuildList, restoreBuildingId } = this.state
          if (showDelBuildList) {
            if (restoreBuildingId) {
              this.handleSubmitCopy()
            }
          } else {
            this.handleSubmitCopy()
          }
        } else {
          this.setState({
            delBuildList: buildings ? buildings : [],
            showAddbuild: true,
            showDelBuildList: true,
            validateBuildNameMsg: tipMsg
          })
        }
        break
      default:
        break
    }
  }

  handleAddBuildChange = ({ target: { value } }) => {
    if (value === '1') {
      this.setState({
        validateBuildNameMsg: '',
        showDelBuildList: false,
        restoreBuildingId: ''
      })
    } else {
      this.setState({
        showDelBuildList: true
      })
    }
  }

  handleRestoreBuildChange = value => {
    this.setState({
      restoreBuildingId: value,
      validateBuildNameMsg: ''
    })
  }

  // 清空已删除楼栋列表
  resetDelBuildList = () => {
    this.setState({
      delBuildList: [],
      showDelBuildList: false,
      restoreBuildingId: '',
      showAddbuild: false
    })
  }

  handlePreSubmitCopy = () => {
    setTimeout(() => {
      this.handleBuildNameBlur(null, true)
    }, 100)
  }

  handleSubmitCopy = () => {
    this.setState({
      btnLoading: true
    })

    // this.handleBuildNameBlur()

    this.props.form.validateFields((err, values) => {
      if (!err) {
        // this.handleBuildCopy(values)
        const { isCopyDetail, buildName, isAddBuild } = values
        const { restoreBuildingId } = this.state

        const copyParams = {
          cityId: this.cityId,
          isCopyDetail,
          projectId: this.props.projectId,
          srcBuildingId: this.props.buildId,
          targetBuildingName: buildName,
          isAdd: isAddBuild
        }

        if (restoreBuildingId) {
          copyParams.restoreBuildingId = restoreBuildingId
        }

        this.props.buildCopy(copyParams, res => {
          const { tipMsgCode, tipMsg } = res
          if (tipMsgCode === 1009) {
            Message.success(tipMsg)
            this.closeCopyModal()
          } else {
            Message.error(tipMsg)
          }

          this.setState({
            btnLoading: false
          })
        })
      } else {
        this.setState({
          btnLoading: false
        })
      }
    })
  }

  closeCopyModal = () => {
    this.props.form.resetFields()
    this.setState({
      delBuildList: [],
      validateBuildNameMsg: '',
      showAddbuild: false,
      showDelBuildList: false,
      restoreBuildingId: '',
      btnLoading: false
    })
    this.props.onCloseCopyModal()
  }

  render() {
    const { getFieldDecorator } = this.props.form

    const { buildDetail } = this.props

    const { delBuildList, showAddbuild, showDelBuildList } = this.state

    const delBuildOptions = delBuildList.map(item => (
      <Option key={item.buildingId} value={item.buildingId}>
        {item.buildingName} | 房号数
        <span style={{ color: '#33CABB' }}>
          &nbsp;
          {item.houseNum || 0}
        </span>
      </Option>
    ))

    return (
      <Modal
        title="楼栋复制"
        visible={this.props.copyModalVisible}
        onOk={this.handlePreSubmitCopy}
        onCancel={this.closeCopyModal}
        confirmLoading={this.state.btnLoading}
        maskClosable={false}
      >
        <Form>
          <Row>
            <FormItem label="当前楼栋" {...formItemLayout}>
              {getFieldDecorator('srcBuild')(
                <h4>{buildDetail.get('buildingName')}</h4>
              )}
            </FormItem>
          </Row>
          <Row>
            <FormItem
              label="目标楼栋"
              {...formItemLayout}
              extra={
                <span style={{ color: '#FF0000' }}>
                  {this.state.validateBuildNameMsg}
                </span>
              }
            >
              {getFieldDecorator('buildName', {
                rules: [
                  {
                    required: true,
                    message: '请输入目标楼栋'
                  },
                  {
                    whitespace: true,
                    message: '请输入目标楼栋'
                  }
                ]
              })(
                <Input
                  placeholder="请输入目标楼栋"
                  onBlur={e => this.handleBuildNameBlur(e, false)}
                />
              )}
            </FormItem>
          </Row>
          <Row>
            <FormItem label="是否复制详情" {...formItemLayout}>
              {getFieldDecorator('isCopyDetail', {
                initialValue: '0'
              })(
                <RadioGroup>
                  <Radio value="1">是</Radio>
                  <Radio value="0">否</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </Row>
          {showAddbuild ? (
            <Row>
              <FormItem label="是否新增楼栋" {...formItemLayout}>
                {getFieldDecorator('isAddBuild', {
                  initialValue: '0',
                  onChange: this.handleAddBuildChange
                })(
                  <RadioGroup>
                    <Radio value="1">是</Radio>
                    <Radio value="0">否</Radio>
                  </RadioGroup>
                )}
              </FormItem>
            </Row>
          ) : null}
          {showDelBuildList ? (
            <Row>
              <FormItem label="需还原的楼栋" {...formItemLayout}>
                {getFieldDecorator('restoreBuild', {
                  rules: [
                    {
                      required: true,
                      message: '请选择还原楼盘'
                    }
                  ],
                  onChange: this.handleRestoreBuildChange
                })(
                  <Select
                    style={{ width: '100%' }}
                    placeholder="请选择还原楼栋"
                    allowClear
                  >
                    {delBuildOptions}
                  </Select>
                )}
              </FormItem>
            </Row>
          ) : null}
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
)(BuildInfoCopy)
