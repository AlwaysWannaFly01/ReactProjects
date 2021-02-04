import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Modal, Form, Row, Col, Input, Switch, Icon } from 'antd'

// import compareObj from 'client/utils/compareObj'
import layout from 'client/utils/layout'

import './sagas'
import { containerActions } from './actions'

const FormItem = Form.Item

/**
 *  批量修改楼栋名称、楼栋别名
 *  author: YJF
 */
class BuildInfoBatch extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    batchModalVisible: PropTypes.bool.isRequired,
    selectedRows: PropTypes.array.isRequired,
    onCloseBatchModal: PropTypes.func.isRequired,
    batchUpdateBuild: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    validBuildName: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      selectedRows: [],

      btnLoading: false
    }

    this.timer = null
    this.isSubmit = false
    this.handleValidBuildName = this.handleValidBuildName.bind(this)
  }

  componentDidMount() {
    this.cityId = sessionStorage.getItem('FDC_CITY')
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedRows !== nextProps.selectedRows) {
      this.setState({
        selectedRows: nextProps.selectedRows
      })
    }
  }

  // 与后端进行校验
  async handleValidBuildName(rule, value, callback, buildId) {
    if (value !== null && value !== '' && !this.isSubmit) {
      await new Promise(resolve => {
        // 先前端进行特殊字符校验
        // const reg1 = /[~！@#￥%……&*（）=+·`，。、；‘《》？：“【、{}|】”^$]/gi
        const reg1 = /[`%^',;￥‘’？]/gi
        if (reg1.test(value)) {
          callback('名称不合法')
        } else {
          if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
          }

          const data = {
            cityId: this.cityId,
            projectId: this.props.projectId,
            buildingName: value.trim(),
            buildingId: buildId
          }
          this.timer = setTimeout(() => {
            this.props.validBuildName(data, res => {
              const { msgCode, msg } = res
              switch (msgCode) {
                case 1001:
                case 1003:
                  callback(msg)
                  break
                case 1002:
                  {
                    // 后端校验通过后，和已填写的楼栋名称校验
                    const count = this.handleValidateSelfBuildName(value)
                    if (count >= 2) {
                      callback('已有重复楼栋名称')
                    } else {
                      // 1002 与已删除楼盘重名，让通过保存
                      callback(msg)
                    }
                  }
                  break
                case 1005: {
                  // 后端校验通过后，和已填写的楼栋名称校验
                  const count = this.handleValidateSelfBuildName(value)
                  if (count >= 2) {
                    callback('已有重复楼栋名称')
                  } else {
                    callback()
                  }
                  break
                }
                default:
                  break
              }
              resolve()
            })
          }, 500)
        }
      })
    }
    callback()
  }

  handleValidateSelfBuildName = value => {
    const formData = this.props.form.getFieldsValue()
    const formDataKeys = Object.keys(formData)
    const formBuildNames = []
    formDataKeys.forEach(item => {
      // 获取填写的楼栋名称值集合
      if (item.substr(0, 4) === 'name') {
        formBuildNames.push(formData[item])
      }
    })
    // 统计填写value出现的次数
    const countFunc = (arr, value) =>
      arr.reduce((a, v) => (v === value ? a + 1 : a + 0), 0)
    const count = countFunc(formBuildNames, value) || 1
    return count
  }

  handleSubmit = () => {
    this.isSubmit = true

    this.props.form.validateFieldsAndScroll((err, values) => {
      // 过滤校验code为1002的情况，让保存成功
      // 如果全部错误为1002，则保存通过isPass
      let isPass = false
      const errMessage = []
      if (err) {
        const errKeys = Object.keys(err)
        errKeys.forEach(item => {
          const errors = err[item].errors
          errors.forEach(errItem => {
            errMessage.push(errItem.message)
          })
        })
        isPass = errMessage.every(item => item === '与已删除楼栋重名')
      } else {
        isPass = true
      }
      // console.log(errMessage, isPass, 111)

      if (isPass) {
        this.setState({
          btnLoading: true
        })
        const data = []
        // const values = this.props.form.getFieldsValue()
        this.state.selectedRows.forEach(item => {
          // const oldDataObj = {
          //   buildingName: item.buildingName,
          //   buildingAlias: item.buildingAlias,
          //   isLBuildingName: item.isLBuildingName
          // }
          // const newDataObj = {
          //   buildingName: values[`name${item.id}`],
          //   buildingAlias: values[`alias${item.id}`],
          //   isLBuildingName: values[`lock${item.id}`] ? 1 : 0
          // }
          // const res = compareObj(oldDataObj, newDataObj, 'batchBuild')
          data.push({
            id: item.id,
            buildingName: values[`name${item.id}`],
            buildingAlias: values[`alias${item.id}`],
            isLBuildingName: values[`lock${item.id}`] ? 1 : 0
          })
        })
        // 如果有数据修改才提交
        if (data.length > 0) {
          // console.log(data, 111111)
          this.props.batchUpdateBuild(data, (isSuccess, res) => {
            if (isSuccess) {
              this.closeBatchModal()

              if (res) {
                // 显示修改的具体结果
                this.openResultModal(res)
              }
            } else {
              this.isSubmit = false
            }
            this.setState({
              btnLoading: false
            })
          })
        }
      } else {
        this.isSubmit = false
      }
    })
  }

  openResultModal = res => {
    const { successList, failList } = res
    const that = this

    if (successList && failList) {
      Modal.info({
        title: '批量修改结果',
        content: (
          <div style={{ maxHeight: '320px', overflow: 'auto' }}>
            <div>
              <h4>
                修改成功条数：
                <span style={{ color: '#4dcaba' }}>{successList.length}</span>
              </h4>
              {successList.map(item => (
                <p key={item.buildingId}>
                  楼栋名称：
                  {item.buildingName}
                </p>
              ))}
            </div>
            <div>
              <h4>
                修改失败条数：
                <span style={{ color: '#4dcaba' }}>{failList.length}</span>
              </h4>
              {failList.map(item => (
                <p key={item.buildingId}>
                  楼栋名称：
                  {item.buildingName}
                </p>
              ))}
            </div>
          </div>
        ),
        onOk() {
          that.handleListSearch()
        }
      })
    }
  }

  handleListSearch = () => {
    this.props.onSearch(null, 1)
  }

  closeBatchModal = () => {
    this.isSubmit = false
    this.props.form.resetFields()
    this.props.onCloseBatchModal()
  }

  render() {
    const {
      form: { getFieldDecorator }
    } = this.props
    // console.log(this.state.selectedRows)

    const { selectedRows } = this.state

    return (
      <Modal
        title="批量修改"
        visible={this.props.batchModalVisible}
        okText="保存"
        onOk={this.handleSubmit}
        onCancel={this.closeBatchModal}
        confirmLoading={this.state.btnLoading}
        width={600}
        maskClosable={false}
        bodyStyle={{ maxHeight: 500, overflow: 'auto' }}
      >
        <Form>
          {selectedRows.map(item => (
            <Row key={item.id}>
              <Col span={10}>
                <FormItem
                  label="楼栋名称"
                  labelCol={layout(8)}
                  wrapperCol={layout(16)}
                  key={item.id}
                >
                  {getFieldDecorator(`name${item.id}`, {
                    rules: [
                      {
                        required: true,
                        message: '请输入名称'
                      },
                      {
                        whitespace: true,
                        message: '请输入名称'
                      },
                      {
                        validator: (rule, value, callback) =>
                          this.handleValidBuildName(
                            rule,
                            value,
                            callback,
                            item.id
                          )
                        // validator: this.handleValidBuildName
                      }
                    ],
                    initialValue: item.buildingName
                  })(
                    <Input
                      placeholder="请输入名称"
                      maxLength="150"
                      // onBlur={() => this.handleBuildNameBlur(item.id)}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={4} style={{ textAlign: 'center' }}>
                <FormItem>
                  {getFieldDecorator(`lock${item.id}`, {
                    valuePropName: 'checked',
                    initialValue: item.isLBuildingName === 1
                  })(<Switch checkedChildren={<Icon type="lock" />} />)}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem
                  label="楼栋别名"
                  labelCol={layout(8)}
                  wrapperCol={layout(16)}
                >
                  {getFieldDecorator(`alias${item.id}`, {
                    rules: [
                      {
                        whitespace: true,
                        message: '请输入楼栋别名'
                      }
                    ],
                    initialValue: item.buildingAlias
                  })(<Input placeholder="请输入别名" maxLength="50" />)}
                </FormItem>
              </Col>
            </Row>
          ))}
        </Form>
      </Modal>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    null,
    containerActions
  )
)(BuildInfoBatch)
