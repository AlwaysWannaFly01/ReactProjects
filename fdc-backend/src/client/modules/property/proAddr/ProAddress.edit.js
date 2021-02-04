import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Modal, Form, Select, Input, Message, Button } from 'antd'
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
 * 编辑 / 查看
 * author: YJF
 * 新增 1.带 projectId 只能新增当前楼盘的相关地址 2.不带 projectId 可以新增所有楼盘的相关地址
 */
class ProAddressEdit extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    editModalVisible: PropTypes.bool.isRequired,
    onCloseModal: PropTypes.func.isRequired,
    initialAddFetch: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    editProjectAddr: PropTypes.func.isRequired,
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
    this.cityId = sessionStorage.getItem('FDC_CITY') || this.props.cityId
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
        const { editData } = this.props

        values.projectId = values.projectItem.projectId
        delete values.projectItem

        values.cityId = this.cityId

        // 正则去除首尾空格
        values.propertyAddress = values.propertyAddress.replace(
          /(^\s*)|(\s*$)/g,
          ''
        )
        values.id = editData.id
        this.props.editProjectAddr(values, res => {
          setTimeout(() => {
            const { code, message } = res || {}
            switch (code) {
              case '200':
                Message.success('编辑成功')
                this.handleCloseModal()
                this.props.onSearch(null, this.props.pageNum)
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
    this.projectSelectRef.resetProjectSelect()
    this.props.form.resetFields()
    this.props.onCloseModal()
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

    // 判断Modal是 查看还是编辑 - 根据楼盘状态判断
    const isEditModal = editData.prjStatus === 1

    const footerBtns = [
      <Button key="cancel" onClick={this.handleCloseModal}>
        取消
      </Button>,
      <Button
        key="save"
        type="primary"
        onClick={this.handleSubmit}
        loading={this.state.submitBtnLoading}
      >
        保存
      </Button>
    ]

    return (
      <Modal
        title={isEditModal ? '编辑' : '新增'}
        visible={this.props.editModalVisible}
        onCancel={this.handleCloseModal}
        maskClosable={false}
        footer={isEditModal ? footerBtns : null}
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
                selectDisabled={!isEditModal}
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
              ],
              initialValue: `${editData.typeCode}`
            })(
              <Select placeholder="请选择地址类型" disabled={!isEditModal}>
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
                disabled={!isEditModal}
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
)(ProAddressEdit)
