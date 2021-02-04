import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Modal, Form, Row, Radio, Message, Input, Tag } from 'antd'
import Immutable from 'immutable'
import router from 'client/router'
import ProjectSelect from 'client/components/project-select'
import { pagePermission } from 'client/utils'
import { containerActions } from './actions'
import './sagas'
import './reducer'
import { modelSelector } from './selector'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const { TextArea } = Input

const formItemLayout = {
  labelCol: {
    xs: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 12 }
  }
}

/**
 * 住宅 楼盘合并
 * author: YJF
 */
class ProInfoMerge extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    mergeModalVisible: PropTypes.bool.isRequired,
    onCloseModal: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    projectDetail: PropTypes.object.isRequired,
    mergeProjects: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    getProjectDetail: PropTypes.func.isRequired
  }
  
  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }
  
  constructor() {
    super()
    
    this.state = {
      btnLoading: false,
      
      // 是否显示删除合并理由
      showMergeReason: true,
      
      // 合并有重名楼栋清单
      buildingCounts: []
    }
  }
  
  componentDidMount() {
    this.cityId = sessionStorage.getItem('FDC_CITY')
  }
  
  trans = data => {
    this.props.sendBaseInfoAdd(data)
  }
  onProjectSelectRef = ref => {
    this.projectSelectRef = ref
  }
  
  handleCloseModal = () => {
    this.props.onCloseModal()
    this.setState({
      showMergeReason: true,
      buildingCounts: []
    })
    this.projectSelectRef.resetProjectSelect()
    this.props.form.resetFields()
  }
  
  handleDeleteMergedProject = ({ target: { value } }) => {
    this.setState({
      showMergeReason: +value === 1
    })
  }
  
  handleProjectItemChange = () => {
    // 清空重名楼栋清单
    this.setState({
      buildingCounts: []
    })
  }
  
  handleMergeProject = () => {
    this.props.mergeProjects({}, data => {
      const { tipMsgCode, tipMsg, buildingCounts } = data
      this.setState({
        btnLoading: false
      })
      switch (tipMsgCode) {
        case 10001:
          this.setState({
            buildingCounts
          })
          Message.warn(tipMsg)
          break
        case 10002:
          // 合并失败
          Message.warn(tipMsg)
          break
        case 10003:
          this.handleCloseModal()
          this.projectSelectRef.resetProjectSelect()
          Message.success(tipMsg)
          // 合并成功 详情页面刷新
          this.props.getProjectDetail(this.props.projectId, this.cityId)
          break
        case 10004:
          // 无相关数据
          Message.warn(tipMsg)
          break
        default:
          this.handleCloseModal()
          Message.warning(tipMsg, 1.5)
          this.permissinBuild()
          break
      }
    })
  }
  
  permissinBuild = () => {
    if (pagePermission('fdc:hd:residence:base:building:check')) {
      setTimeout(() => {
        this.context.router.history.push({
          pathname: router.RES_BUILD_INFO,
          search: `projectId=${this.props.projectId}&prjStatus=1`
        })
      }, 1500)
    }
  }
  
  render() {
    const {
      form: { getFieldDecorator },
      projectDetail
    } = this.props
    
    // 行政区
    const areaList = this.props.model.get('areaList')
    
    const currentAreaId = projectDetail.get('areaId')
    let currentAreaName = areaList.filter(
      item => item.get('value') === currentAreaId
    )
    currentAreaName = currentAreaName.get(0)
      ? currentAreaName.get(0).get('label')
      : ''
    const currentProjectName = projectDetail.get('projectName')
    // const currentProject = `${currentAreaName} | ${currentProjectName}`
    const currentProject = `${currentProjectName}`
    // console.log(projectDetail.toJS(), 2222222)
    
    const projectItem = {
      areaId: projectDetail.get('areaId'),
      areaName: '',
      projectId: projectDetail.get('id'),
      projectName: projectDetail.get('projectName')
    }
    
    // 合并楼盘 有删除楼栋
    const buildingCounts = this.state.buildingCounts
    
    return (
      <Modal
        title="楼盘合并"
        visible={this.props.mergeModalVisible}
        onCancel={this.handleCloseModal}
        okText="合并"
        onOk={this.handleMergeProject}
        confirmLoading={this.state.btnLoading}
        width={600}
        maskClosable={false}
      >
        <Row>
          <FormItem label="选择楼盘" {...formItemLayout}>
            {getFieldDecorator('projectItem', {
              rules: [
                {
                  required: true,
                  message: '请选择楼盘'
                }
              ],
              onChange: this.handleProjectItemChange
            })(
              <ProjectSelect
                projectItem={projectItem}
                onProjectSelectRef={this.onProjectSelectRef}
              />
            )}
          </FormItem>
        </Row>
        {buildingCounts.length ? (
          <Row>
            <FormItem label="存在重名楼栋" {...formItemLayout}>
              {getFieldDecorator('building')(
                <div style={{ maxHeight: 120, overflow: 'auto' }}>
                  {buildingCounts.map(item => (
                    <Tag key={item} style={{ cursor: 'auto' }}>
                      {item}
                    </Tag>
                  ))}
                </div>
              )}
            </FormItem>
          </Row>
        ) : null}
        <Row>
          <FormItem label="合并到当前楼盘" {...formItemLayout}>
            <h4>{currentProject}</h4>
          </FormItem>
        </Row>
        <Row>
          <FormItem label="合并楼盘详情" {...formItemLayout}>
            {getFieldDecorator('isMergeDetail', {
              initialValue: '1'
            })(
              <RadioGroup>
                <Radio value="1">是</Radio>
                <Radio value="0">否</Radio>
              </RadioGroup>
            )}
          </FormItem>
        </Row>
        <Row>
          <FormItem label="删除被合并楼盘" {...formItemLayout}>
            {getFieldDecorator('isDel', {
              initialValue: '1',
              onChange: this.handleDeleteMergedProject
            })(
              <RadioGroup>
                <Radio value="1">是</Radio>
                <Radio value="0">否</Radio>
              </RadioGroup>
            )}
          </FormItem>
        </Row>
        {this.state.showMergeReason ? (
          <Row>
            <FormItem label="删除原因" {...formItemLayout}>
              {getFieldDecorator('deleteReason', {
                rules: [
                  {
                    required: true,
                    message: '请输入删除原因'
                  },
                  {
                    whitespace: true,
                    message: '请输入删除原因'
                  },
                  {
                    max: 250,
                    message: '最大长度250'
                  }
                ],
                initialValue: '合并删除'
              })(
                <TextArea
                  // maxLength="250"
                  autosize={{ maxRows: 4 }}
                  placeholder="请输入删除原因"
                />
              )}
            </FormItem>
          </Row>
        ) : null}
      
      
      
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
)(ProInfoMerge)
