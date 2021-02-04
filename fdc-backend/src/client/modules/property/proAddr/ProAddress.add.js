import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Modal, Form, Select, Input, Message } from 'antd'
import PropTypes from 'prop-types'
import Immutable from 'immutable'

import ProjectSelect from 'client/components/project-select'
import layout from 'client/utils/layout'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

const FormItem = Form.Item
const { Option } = Select
const { TextArea } = Input

/**
 * 相关楼盘地址
 * 新增
 * author: YJF
 * 新增 1.带 projectId 只能新增当前楼盘的相关地址 2.不带 projectId 可以新增所有楼盘的相关地址
 */
class ProAddressAdd extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    addModalVisible: PropTypes.bool.isRequired,
    onCloseModal: PropTypes.func.isRequired,
    initialAddFetch: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    addProjectAddr: PropTypes.func.isRequired,
    // editProjectAddr: PropTypes.func.isRequired,
    editData: PropTypes.object.isRequired,
    onSearch: PropTypes.func.isRequired,
    cityId: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props)

    props.initialAddFetch()

    this.state = {
      submitBtnLoading: false
    }

    this.timer = null
  }

  componentDidMount() {
    const { cityId } = this.props
    this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
  }

  onProjectSelectRef = ref => {
    this.projectSelectRef = ref
  }

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          submitBtnLoading: true
        })

        values.projectId = values.projectItem.projectId
        delete values.projectItem

        values.cityId = this.cityId

        // 正则去除首尾空格
        values.propertyAddress = values.propertyAddress.replace(
          /(^\s*)|(\s*$)/g,
          ''
        )

        this.props.addProjectAddr(values, res => {
          setTimeout(() => {
            const { code, message } = res || {}
            switch (code) {
              case '200':
                this.handleCloseModal()
                Message.success('新增成功')
                this.props.onSearch(null, 1)
                break
              case '400':
                Message.error(message)
                break
              default:
                break
            }
            this.setState({
              submitBtnLoading: false
            })
          }, 300)
        })
      }
    })
  }

  handleCloseModal = () => {
    this.props.onCloseModal()
    this.projectSelectRef.resetProjectSelect()
    this.props.form.resetFields()
  }

  render() {
    const { getFieldDecorator } = this.props.form

    const addrTypeList = this.props.model.get('addrTypeList')
    const { editData } = this.props

    const projectItem = {
      areaId: editData.areaId,
      areaName: editData.areaName,
      projectId: editData.projectId,
      projectName: editData.projectName
    }

    let selectDisabled = false
    if (editData.projectId) {
      selectDisabled = true
    }

    return (
      <Modal
        title="新增"
        visible={this.props.addModalVisible}
        onOk={this.handleSubmit}
        onCancel={this.handleCloseModal}
        confirmLoading={this.state.submitBtnLoading}
        maskClosable={false}
      >
        <Form>
          <FormItem
            label="正式楼盘"
            labelCol={layout(6, 6)}
            wrapperCol={layout(18, 16)}
          >
            {getFieldDecorator('projectItem', {
              rules: [
                {
                  required: true,
                  message: '请选择正式楼盘'
                }
              ]
            })(
              <ProjectSelect
                projectItem={projectItem}
                selectDisabled={selectDisabled}
                onProjectSelectRef={this.onProjectSelectRef}
              />
            )}
          </FormItem>
          <FormItem
            label="地址类型"
            labelCol={layout(6, 6)}
            wrapperCol={layout(18, 16)}
          >
            {getFieldDecorator('typeCode', {
              rules: [
                {
                  required: true,
                  message: '请选择地址类型'
                }
              ]
            })(
              <Select
                placeholder="请选择地址类型"
                disabled={editData.prjStatus === 0}
              >
                {addrTypeList.map(item => (
                  <Option key={+item.get('code')}>{item.get('name')}</Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem
            label="相关楼盘地址"
            labelCol={layout(6, 6)}
            wrapperCol={layout(18, 16)}
          >
            {getFieldDecorator('propertyAddress', {
              rules: [
                {
                  required: true,
                  message: '请输入相关楼盘地址'
                },
                {
                  whitespace: true,
                  message: '不能输入空格'
                },
                {
                  max: 200,
                  message: '最大长度200'
                }
              ],
              initialValue: editData.projectAddress
            })(
              <TextArea
                disabled={editData.prjStatus === 0}
                placeholder="相关楼盘地址"
                // maxLength="200"
                autosize={{ maxRows: 4 }}
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
)(ProAddressAdd)
