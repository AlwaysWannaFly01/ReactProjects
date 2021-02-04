import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Modal, Form, Select, Input, Message } from 'antd'
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
 * 新增
 * author: YJF
 * 新增 1.带 projectId 只能新增当前楼盘的相关名称 2.不带 projectId 可以新增所有楼盘的相关名称
 */
class ProNameAdd extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    addModalVisible: PropTypes.bool.isRequired,
    onCloseModal: PropTypes.func.isRequired,
    addProjectAlia: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    editData: PropTypes.object.isRequired,
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
    console.log(ref)
    this.projectSelectRef = ref
    // this.props.form.setFieldsValue({
    //   areaName:ref[0].areaName
    // })
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
        values.alias = values.alias.replace(/(^\s*)|(\s*$)/g, '')

        this.props.addProjectAlia(values, res => {
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
  handlePropertyChange= res =>{
    if(res&&res.areaName){
      this.props.form.setFieldsValue({
        areaName:res.areaName
      })
    }
  }
  handleCloseModal = () => {
    this.props.onCloseModal()
    this.projectSelectRef.resetProjectSelect()
    this.props.form.resetFields()
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
                onChange={this.handlePropertyChange}
                projectItem={projectItem}
                selectDisabled={selectDisabled}
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
              <Select
                placeholder="请选择别名类型"
                disabled={editData.projectStatus === 0}
              >
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
                disabled={editData.projectStatus === 0}
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
                disabled={editData.projectStatus === 0}
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
)(ProNameAdd)
