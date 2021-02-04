import React, { Component } from 'react'
import {
  Checkbox,
  Button,
  Row,
  Col,
  Modal,
  Icon,
  Form,
  Select,
  Input,
  message
} from 'antd'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { pagePermission } from 'client/utils'
import router from 'client/router'
// import { getSession } from 'client/utils/assist'
import Styles from './style.less'
import { containerActions } from './store/action'
import './store/sagas'

const CheckboxGroup = Checkbox.Group
const confirm = Modal.confirm
const FormItem = Form.Item
const Option = Select.Option

/**
 * 楼栋导出
 * author: LiuYaoChange
 * create Date: 2018-05-14
 * version: 1.0
 */

class BuildingSelected extends Component {
  static propTypes = {
    form: PropTypes.object,
    options: PropTypes.array,
    exportBuildingData: PropTypes.func,
    history: PropTypes.object.isRequired,
    fetchAreas: PropTypes.func,
    cityId: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      selectAll: false,
      indeterminate: false,
      selected: [],
      selectOptions: [],
      nameShow: true
    }
    this.selectedNode = []
    this.handleChange = this.handleChange.bind(this)
    this.handleExport = this.handleExport.bind(this)
    this.handleSelectAll = this.handleSelectAll.bind(this)
  }

  componentDidMount() {
    const { cityId } = this.props
    // this.cityId = getSession('FDC_CITY')
    this.initLoad(cityId)
  }

  onChangeAreaId = value => {
    this.setState({ nameShow: !value })
    this.props.form.setFieldsValue({
      projectName: ''
    })
  }

  initLoad(cityId) {
    this.props.fetchAreas({ cityId }, data => {
      // const defaultKey = data[0].id
      this.setState({
        selectOptions: data
      })
      // this.props.form.setFieldsValue({
      //   areaId: defaultKey
      // })
    })
  }
  /**
   * 点击选项时的事件
   * @param checkedList 被选中的列表
   */
  handleChange(selected) {
    const selectedNode = []
    const model = {}
    const original = {}
    const { options } = this.props
    // 将数组转换成HASH值
    for (let i = 0, len = options.length; i < len; i += 1) {
      original[options[i].value] = options[i]
    }
    // 构造一个选中的HASH模板
    for (let i = 0, len = selected.length; i < len; i += 1) {
      model[selected[i]] = ''
    }
    // 匹配数据
    const keys = Object.keys(model)

    for (let i = 0, len = keys.length; i < len; i += 1) {
      selectedNode.push(original[keys[i]])
    }
    this.selectedNode = selectedNode
    this.setState({
      selected,
      indeterminate: !!selected.length && selected.length < options.length,
      selectAll: selected.length === options.length
    })
  }

  handleSelectAll(e) {
    const target = e.target
    let selected = []
    this.selectedNode = []
    if (target.checked) {
      this.selectedNode = this.props.options.map(item => item)
      selected = this.props.options.map(option => option.value)
    }
    this.setState({
      selected,
      indeterminate: false,
      selectAll: !!target.checked
    })
  }
  // 点击导出
  handleExport() {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // values.projectName = values.projectName ? values.projectName.trim() : []
        let columns = this.selectedNode
        if (columns.length < 1) {
          const { options } = this.props
          columns = options
        }
        columns = [
          {
            label: '楼盘ID',
            value: 'projectId'
          },
          {
            label: '楼栋ID',
            value: 'id'
          },
          ...columns
        ]
        columns = columns.map(item => `${item.label}:${item.value}`)
        const params = {
          ...values,
          cityId: this.props.cityId,
          columnAndFields: columns
        }
        const that = this
        this.props.exportBuildingData(params, () => {
          confirm({
            title: '导出提示',
            content: (
              <div>
                <p>系统正在导出Excel,请耐心等待...</p>
                <p>
                  <Icon type="info-circle" />
                  <i style={{ marginLeft: 8 }} />
                  可跳转导出任务页查看
                </p>
              </div>
            ),
            okText: '跳转',
            onOk() {
              that.goExportTask()
            },
            onCancel() {}
          })
        })
      }
    })
  }

  goExportTask = () => {
    if (pagePermission('fdc:hd:export:check')) {
      this.props.history.push({
        pathname: router.RES_EXPORT_TASK,
        search: 'type=1'
      })
    } else {
      message.warning('没有导出任务页权限，请联系管理员')
    }
  }

  render() {
    const { selectOptions, nameShow } = this.state
    const { options } = this.props
    const { getFieldDecorator } = this.props.form
    return (
      <div className="fdc-house-data-base-export-building-wrap">
        <div className={Styles['fileter-wrap']} style={{ margin: '5px 0' }}>
          <Form layout="inline" onSubmit={this.handleSubmit}>
            <FormItem label="行政区">
              {getFieldDecorator('areaId')(
                <Select
                  allowClear
                  style={{ width: 120 }}
                  placeholder="行政区"
                  onChange={this.onChangeAreaId}
                >
                  {selectOptions.map(option => (
                    <Option key={option.id} value={option.id}>
                      {option.areaName}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label="楼盘名称">
              {getFieldDecorator('projectName')(
                <Input placeholder="楼盘名称" disabled={nameShow} />
              )}
            </FormItem>
          </Form>
        </div>
        <div style={{ borderBottom: '1px solid #E9E9E9', padding: '10px 0' }}>
          <Checkbox
            indeterminate={this.state.indeterminate}
            onChange={this.handleSelectAll}
            checked={this.state.selectAll}
          >
            全选
          </Checkbox>
          <i style={{ margin: '0 20px' }} />
          {pagePermission('fdc:hd:residence:base:building:export') ? (
            <Button type="primary" onClick={this.handleExport}>
              导出
            </Button>
          ) : (
            ''
          )}
        </div>
        <br />
        <CheckboxGroup value={this.state.selected} onChange={this.handleChange}>
          <Row gutter={8}>
            {options.map(option => (
              <Col key={option.value} className="gutter-row" span={6}>
                <Checkbox value={option.value}>{option.label}</Checkbox>
              </Col>
            ))}
          </Row>
        </CheckboxGroup>
      </div>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    null,
    containerActions
  )
)(BuildingSelected)
