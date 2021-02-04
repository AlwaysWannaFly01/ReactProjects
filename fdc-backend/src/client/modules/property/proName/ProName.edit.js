import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Modal, Form, Select, Input, Message, Button } from 'antd'
import PropTypes from 'prop-types'
import Immutable from 'immutable'

import layout from 'client/utils/layout'
import ProjectSelect from 'client/components/project-select'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

const FormItem = Form.Item
const { Option } = Select
const { TextArea } = Input

/**
 * 相关楼盘名称
 * 编辑 / 查看
 * author: YJF
 */
class ProNameEdit extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    editModalVisible: PropTypes.bool.isRequired,
    onCloseModal: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    editData: PropTypes.object.isRequired,
    editProjectAlia: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    cityId: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      // selectedProject: []
      submitBtnLoading: false
    }
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

        // console.log(values)
        const { editData } = this.props

        values.projectId = values.projectItem.projectId
        delete values.projectItem

        values.cityId = this.cityId

        // 正则去除首尾空格
        values.alias = values.alias.replace(/(^\s*)|(\s*$)/g, '')
        values.id = editData.id
        this.props.editProjectAlia(values, res => {
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
  handlePropertyChange= res =>{
    console.log(res)
    const { editData } = this.props
    console.log(editData)
    if(res&&res.areaName&&editData.projectId!==res.projectId){
      this.props.form.setFieldsValue({
        areaName:res.areaName
      })
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form
    // const areaList = this.props.model.get('areaList')
    const aliaTypeList = this.props.model.get('aliaTypeList')

    const { editData } = this.props

    const projectItem = {
      areaId: editData.areaId,
      areaName: editData.areaName,
      projectId: editData.projectId,
      projectName: editData.projectName
    }
    // console.log(editData, 103103103)

    // 判断Modal是 查看还是编辑 - 根据楼盘状态判断
    const isEditModal = editData.projectStatus === 1

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
        title={isEditModal ? '编辑' : '查看'}
        visible={this.props.editModalVisible}
        maskClosable={false}
        onCancel={this.handleCloseModal}
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
                onChange={this.handlePropertyChange}
                projectItem={projectItem}
                selectDisabled={!isEditModal}
                onProjectSelectRef={this.onProjectSelectRef}
              />
            )}
          </FormItem>
          <FormItem
            label="别名类型"
            labelCol={layout(6, 6)}
            wrapperCol={layout(18, 16)}
          >
            {getFieldDecorator('typeCode', {
              rules: [
                {
                  required: true,
                  message: '请选择别名类型'
                }
              ],
              initialValue: editData.typeCode
            })(
              <Select placeholder="请选择别名类型" disabled={!isEditModal}>
                {aliaTypeList.map(item => (
                  <Option value={+item.get('code')} key={item.get('code')}>
                    {item.get('name')}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem
            label="行政区"
            labelCol={layout(6, 6)}
            wrapperCol={layout(18, 16)}
          >
            {getFieldDecorator('areaName', {
              rules: [
                {
                  max: 50,
                  message: '最大长度50'
                }
              ],
              initialValue: editData.areaName
            })(
              <Input
                placeholder="请输入行政区"
                disabled={!isEditModal}
                // maxLength="50"
              />
            )}
          </FormItem>
          <FormItem
            label="相关楼盘名称"
            labelCol={layout(6, 6)}
            wrapperCol={layout(18, 16)}
          >
            {getFieldDecorator('alias', {
              rules: [
                {
                  required: true,
                  message: '请输入相关楼盘名称'
                },
                {
                  whitespace: true,
                  message: '不能输入空格'
                },
                {
                  max: 100,
                  message: '最大长度100'
                }
              ],
              initialValue: editData.alias
            })(
              <TextArea
                disabled={!isEditModal}
                placeholder="相关楼盘名称"
                // maxLength="100"
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
)(ProNameEdit)
