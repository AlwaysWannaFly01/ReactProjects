import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import {
  Modal,
  Form,
  Row,
  Transfer,
  Select,
  Message,
  Col,
  Input,
  Radio
} from 'antd'
import Immutable from 'immutable'

import shallowEqual from 'client/utils/shallowEqual'

import { containerActions } from './actions'
import './sagas'
import './reducer'
import { modelSelector } from './selector'

import styles from './BaseInfo.less'

const FormItem = Form.Item
const { Option } = Select
const RadioGroup = Radio.Group

const formItemLayout = {
  labelCol: {
    xs: { span: 4 }
  },
  wrapperCol: {
    xs: { span: 18 }
  }
}

/**
 * 住宅 楼盘拆分
 * author: YJF
 */
class ProInfoSplit extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    splitModalVisible: PropTypes.bool.isRequired,
    onCloseModal: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    projectDetail: PropTypes.object.isRequired,
    validProjectSplit: PropTypes.func.isRequired,
    splitProject: PropTypes.func.isRequired,
    getBuildTotal: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      // Transfer 选中的楼栋
      selectedKeys: [],
      targetKeys: [],

      // 校验状态
      validateStatus: '',

      validateProjectNameMsg: '',

      // 有多个删除的楼盘的时候
      delProjectList: [],
      // 当校验就删除楼盘的时候，显示是否直接新增选项
      showAddProject: false,
      // 还原楼盘是否必须的项
      isNeedRestoreProject: true,
      // 是否显示还原楼盘列表
      showRestoreProject: false,
      // 还原的楼盘ID
      restorePrjId: '',

      splitBuildList: [],

      btnLoading: false
    }

    this.timeout = null
  }

  componentDidMount = () => {
    this.cityId = sessionStorage.getItem('FDC_CITY')
  }

  componentWillReceiveProps(nextProps) {
    const preSplitBuildList = this.props.model.get('splitBuildList').toJS()
    const nextSplitBuildList = nextProps.model.get('splitBuildList').toJS()
    if (!shallowEqual(preSplitBuildList, nextSplitBuildList)) {
      this.setState({
        splitBuildList: nextSplitBuildList
      })
    }
  }

  handleCloseModal = () => {
    // 初始化 state
    this.setState({
      // Transfer 选中的楼栋
      selectedKeys: [],
      targetKeys: [],

      // 校验状态
      validateStatus: '',

      validateProjectNameMsg: '',

      // 有多个删除的楼盘的时候
      delProjectList: [],
      // 当校验就删除楼盘的时候，显示是否直接新增选项
      showAddProject: false,
      // 还原楼盘是否必须的项
      isNeedRestoreProject: true,
      // 是否显示还原楼盘列表
      showRestoreProject: false,
      // 还原的楼盘ID
      restorePrjId: '',

      splitBuildList: []
    })
    this.props.form.resetFields()
    this.props.onCloseModal()
  }

  handlePreSplitProject = () => {
    setTimeout(() => {
      this.handleProjectNameBlur(null, true)
    }, 100)
  }

  handleSplitProject = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          btnLoading: true
        })

        const { areaId, projectName, isAddProject } = values

        const { projectDetail } = this.props
        const params = {
          cityId: this.cityId,
          targetPrjName: projectName,
          srcPrjId: projectDetail.get('id'),
          targetAreaName: areaId,
          srcAreaId: projectDetail.get('areaId'),
          targetBuildings: this.state.targetKeys
        }

        const { restorePrjId, showAddProject } = this.state

        if (restorePrjId) {
          params.restorePrjId = restorePrjId
        }

        if (showAddProject) {
          params.isAdd = isAddProject
        }

        this.props.splitProject(params, res => {
          const { tipMsgCode, tipMsg, bdCounts } = res
          switch (tipMsgCode) {
            case 1009:
              Message.success(tipMsg)
              this.handleCloseModal()
              break
            case 1007:
            case 1008:
              Message.error(tipMsg)
              break
            case 1006:
              this.handleDelBuild(bdCounts)
              Message.error(tipMsg)
              break
            default:
              break
          }
          setTimeout(() => {
            this.setState({
              btnLoading: false
            })
          }, 500)
        })
      }
    })
  }

  handleChange = nextTargetKeys => {
    this.setState({ targetKeys: nextTargetKeys })
  }

  handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({
      selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys]
    })
  }

  hanleProjectNameChange = value => {
    if (!value) {
      this.setState({
        validateProjectNameMsg: ''
      })
    }
    this.props.form.setFieldsValue({ restoreProject: undefined })
  }

  // 行政区变更后也需校验
  handleAreaChange = () => {
    const projectName = this.props.form.getFieldValue('projectName')
    if (projectName) {
      setTimeout(() => {
        this.handleProjectNameBlur(null, false)
      }, 100)
    }
  }

  // 失去焦点后校验楼盘
  handleProjectNameBlur = (_, isSubmit) => {
    this.props.form.validateFields(['areaId', 'projectName'], (err, values) => {
      if (!err) {
        const { areaId, projectName: targetPrjName } = values
        if (targetPrjName) {
          const { projectDetail } = this.props
          const params = {
            cityId: this.cityId,
            targetPrjName,
            srcPrjId: projectDetail.get('id'),
            targetAreaName: areaId,
            srcAreaId: projectDetail.get('areaId')
          }
          this.timeout = setTimeout(
            () =>
              this.props.validProjectSplit(params, res => {
                this.setState({
                  validateStatus: ''
                })
                this.handleValidateRes(res, isSubmit)
              }),
            200
          )
        }
      } else {
        this.setState({
          validateProjectNameMsg: ''
        })
      }
    })
  }

  // 拆分前校验结果
  handleValidateRes = (res, isSubmit) => {
    /* eslint-disable */
    const { tipMsgCode, tipMsg, restores } = res || {}
    this.setState({ showAddProject: false })
    switch (tipMsgCode) {
      case 1001:
      case 1003:
      case 1010:
        this.resetDelProjectList()
        if (isSubmit) {
          this.handleSplitProject()
        } else {
          this.setState({
            restorePrjId: '',
            validateProjectNameMsg: tipMsg
          })
        }
        break
      case 1004:
      case 1005:
        if (isSubmit) {
          const { showRestoreProject, restorePrjId } = this.state
          if (showRestoreProject) {
            if (restorePrjId) {
              this.handleSplitProject()
            } else {
              Message.warn('选择还原楼盘')
            }
          } else {
            this.handleSplitProject()
          }
        } else {
          this.setState({
            delProjectList: restores,
            showRestoreProject: true,
            showAddProject: true,
            restorePrjId: '',
            validateProjectNameMsg: tipMsg
          })
        }
        break
      default:
        break
    }
  }

  // 校验为其他结果，需清空 需还原楼盘列表
  resetDelProjectList = () => {
    this.setState({
      delProjectList: [],
      showRestoreProject: false
    })
  }

  // 拆分失败 标红 重名楼栋
  handleDelBuild = bdCounts => {
    // const splitBuildList = []
    const { splitBuildList } = this.state
    let newSplitBuildList = []
    if (bdCounts && bdCounts.length) {
      bdCounts.forEach(item => {
        newSplitBuildList = splitBuildList.map(splitBuild => {
          if (splitBuild.title === item) {
            splitBuild.isDel = true
          }
          return splitBuild
          // newSplitBuildList.push(splitBuild)
        })
      })
    }
    this.setState({
      splitBuildList: newSplitBuildList
    })
  }

  // 处理拆分失败 - 有重名楼栋
  renderItem = item => {
    // const { splitBuildList } = this.state
    const delBuildLabel = (
      <span style={{ color: item.isDel ? '#FF0000' : '' }}>{item.title}</span>
    )
    return {
      label: delBuildLabel,
      value: item.value
    }
  }

  // 已删除楼盘选项变更时，改变输入的拆分楼盘值
  handleRestorePrjChange = value => {
    const restoreProject = this.state.delProjectList.filter(
      item => item.prjId === value
    )
    if (restoreProject.length) {
      const restoreProjectId = restoreProject[0].prjId
      const restoreProjectName = restoreProject[0].prjName
      this.props.form.setFieldsValue({ projectName: restoreProjectName })
      this.setState({
        validateProjectNameMsg: '',
        restorePrjId: restoreProjectId
      })
    } else {
      this.setState({
        validateProjectNameMsg: '',
        restorePrjId: ''
      })
    }
  }

  // 校验为已删除楼盘时，选择直接新增
  handleAddProjectChange = ({ target: { value } }) => {
    if (value === '1') {
      this.setState({
        validateProjectNameMsg: '',
        isNeedRestoreProject: false,
        showRestoreProject: false,
        restorePrjId: ''
      })
    } else {
      this.setState({
        isNeedRestoreProject: true,
        showRestoreProject: true
      })
    }
  }
  
  buildSearch = e =>{
    const {buildKeyWord} = this.props.form.getFieldsValue()
    const splitBuildList = this.state.splitBuildList
    let newArr = []
    for(let i of splitBuildList){
      if(i.title.indexOf(buildKeyWord)>-1){
        newArr.push(i)
      }
    }
    this.setState({
      splitBuildList:newArr
    })
  }
  
  
  render() {
    const {
      form: { getFieldDecorator },
      projectDetail
    } = this.props

    const { isNeedRestoreProject } = this.state

    // 行政区
    const areaList = this.props.model.get('areaList')

    // const currentAreaId = projectDetail.get('areaId')
    // let currentAreaName = areaList.filter(
    //   item => item.get('value') === currentAreaId
    // )
    // currentAreaName = currentAreaName.get(0)
    //   ? currentAreaName.get(0).get('label')
    //   : ''
    // const currentProjectName = projectDetail.get('projectName')
    // const currentProject = `${currentAreaName} | ${currentProjectName}`

    // const splitBuildOptions = this.state.splitBuildOptions.map(item => (
    //   <Option key={item.PrjId} value={`${item.prjName}`}>
    //     {item.prjName}
    //   </Option>
    // ))

    const { delProjectList, showAddProject } = this.state
    const delProjectOptions = delProjectList.map(item => (
      <Option key={item.prjId} value={`${item.prjId}`}>
        {item.prjName} | 楼栋数{' '}
        <span style={{ color: '#33CABB' }}>{item.buildingCount || 0}</span> |
        房号数 <span style={{ color: '#33CABB' }}>{item.houseCount || 0}</span>
      </Option>
    ))

    return (
      <Modal
        title="楼盘拆分"
        visible={this.props.splitModalVisible}
        onCancel={this.handleCloseModal}
        okText="拆分"
        confirmLoading={this.state.btnLoading}
        onOk={this.handlePreSplitProject}
        width={700}
        maskClosable={false}
      >
        <Row style={{ height: '45px' }}>
          <FormItem label="当前楼盘" {...formItemLayout}>
            <h4>
              {projectDetail.get('areaName')} |{' '}
              {projectDetail.get('projectName')}
            </h4>
          </FormItem>
        </Row>
        <Row>
          <FormItem
            label="拆分到"
            {...formItemLayout}
            style={{marginBottom:0}}
            validateStatus={this.state.validateStatus}
          >
            <Col span={8}>
              <FormItem  style={{marginBottom:0}}>
                {getFieldDecorator('areaId', {
                  rules: [
                    {
                      required: true,
                      message: '请选择行政区'
                    }
                  ],
                  onChange: this.handleAreaChange
                })(
                  <Select placeholder="请选择" style={{ width: '100%' }}>
                    {areaList.map(item => (
                      <Option key={item.get('key')} value={item.get('label')}>
                        {item.get('label')}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={1} />
            <Col span={15}>
              <FormItem
                style={{marginBottom:0}}
                extra={
                  <span style={{ color: '#FF0000' }}>
                    {this.state.validateProjectNameMsg}
                  </span>
                }
              >
                {getFieldDecorator('projectName', {
                  rules: [
                    {
                      required: true,
                      message: '请输入拆分楼盘'
                    },
                    {
                      whitespace: true,
                      message: '请输入拆分楼盘'
                    }
                  ],
                  onChange: this.hanleProjectNameChange
                })(
                  // <Select
                  //   mode="combobox"
                  //   placeholder="输入拆分楼盘"
                  //   showArrow={false}
                  //   filterOption={false}
                  //   style={{ width: '100%' }}
                  //   onBlur={this.handleProjectNameBlur}
                  // >
                  //   {splitBuildOptions}
                  // </Select>
                  <Input
                    placeholder="请输入拆分楼盘"
                    autoComplete="off"
                    style={{ width: '100%' }}
                    onBlur={e => this.handleProjectNameBlur(e, false)}
                  />
                )}
              </FormItem>
            </Col>
          </FormItem>
        </Row>
        {showAddProject ? (
          <Row>
            <FormItem label="是否新增楼盘" {...formItemLayout}  style={{marginBottom:0}}>
              {getFieldDecorator('isAddProject', {
                onChange: this.handleAddProjectChange,
                initialValue: '0'
              })(
                <RadioGroup>
                  <Radio value="1">是</Radio>
                  <Radio value="0">否</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </Row>
        ) : null}
        {this.state.showRestoreProject ? (
          <Row>
            <FormItem label="需还原的楼盘" {...formItemLayout}  style={{marginBottom:0}}>
              {getFieldDecorator('restoreProject', {
                rules: [
                  {
                    required: isNeedRestoreProject,
                    message: '请选择还原楼盘'
                  }
                ],
                onChange: this.handleRestorePrjChange
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择还原楼盘"
                  allowClear
                >
                  {delProjectOptions}
                </Select>
              )}
            </FormItem>
          </Row>
        ) : null}
        <Row>
          <FormItem
            label={<span className={styles.isRequired}>楼栋:</span>}
            {...formItemLayout}
            colon={false}
          > {getFieldDecorator('buildKeyWord')(
            <Input placeholder="" style={{width:300}} onKeyUp={e=>this.buildSearch(e)}/>
          )}
          </FormItem>
        </Row>
  
        <Row>
          <FormItem
            label={<span> </span>}
            {...formItemLayout}
            colon={false}
          >
            <Transfer
              dataSource={this.state.splitBuildList}
              render={this.renderItem}
              targetKeys={this.state.targetKeys}
              selectedKeys={this.state.selectedKeys}
              onChange={this.handleChange}
              onSelectChange={this.handleSelectChange}
              listStyle={{ width: '45%' }}
            />
          </FormItem>
        </Row>
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
)(ProInfoSplit)
