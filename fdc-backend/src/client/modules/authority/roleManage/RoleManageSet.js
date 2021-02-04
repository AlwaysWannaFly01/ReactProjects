import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import Immutable from 'immutable'

import {
  Breadcrumb,
  Icon,
  Row,
  Col,
  Button,
  Form,
  Select,
  Tree,
  message,
  Popover
} from 'antd'
import { parse } from 'qs'
import { Link } from 'react-router-dom'
import layout from 'client/utils/layout'
import CityRange from 'client/components/city-range'
import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import { breadListSet } from './constant'
import styles from './RoleManage.less'

const { TreeNode } = Tree
const formItemLayout = {
  labelCol: {
    xs: { span: 6 },
    sm: { span: 10 }
  },
  wrapperCol: {
    xs: { span: 6 },
    sm: { span: 14 }
  }
}

/**
 * @description 权限管理--角色管理
 * @author WY
 */
const FormItem = Form.Item
const { Option } = Select
class RoleManageSet extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    getDataAuthority: PropTypes.func.isRequired,
    getSetingRole: PropTypes.func.isRequired,
    getSaveRole: PropTypes.func.isRequired,
    getRoleCity: PropTypes.func.isRequired,
    roleResMenuPerms: PropTypes.array.isRequired,
    roleAllMenu: PropTypes.array.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    const { id = '', dataPermType } = parse(props.location.search.substr(1))
    let flag
    if (dataPermType) {
      flag =
        dataPermType !== 'self' && dataPermType !== 'company'
          ? 'none'
          : dataPermType
    } else {
      flag = undefined
    }
    this.state = {
      // 城市范围
      cityValues: [],
      // 树结构
      checkedKeys: [], // 默认选中
      // selectedKeys: [],
      expandAllState: true,
      id,
      dataPermType: flag,
      dataAuthority: [],
      checkedKeyResult: [],
      list: []
    }
  }
  componentWillMount() {
    const { id } = this.state
    this.props.getDataAuthority({}, data => {
      const arr = []
      if (data) {
        Object.getOwnPropertyNames(data).forEach(key => {
          arr.push({
            key,
            value: data[key]
          })
        })
      }
      // if (data.length > 3) {
      //   this.setState({ dataPermType: '仅本人数据' })
      // }
      this.setState({ dataAuthority: arr })
    })

    this.props.getRoleCity(id, data => {
      this.setState({ cityValues: data.areaIds })
      // this.setState({ cityValues: data.selectableCheckedIds })
    })

    this.props.getSaveRole(id, list => {
      const a2 = [] // 选中的权限
      list.forEach(i => {
        //  全选且为子节点
        if (i.status === 1 && i.leafFlag) {
          a2.push(i.key)
        }
        // 全选和半选
        if (i.status === 1) {
          this.setState({ checkedKeyResult: i.key })
        }
      })
      this.setState({
        checkedKeys: a2,
        list
      })
    })
  }

  onCheck = (checkedKeys, info) => {
    // console.log('onCheck', checkedKeys)
    const checkedKeyResult = [...checkedKeys, ...info.halfCheckedKeys]
    this.setState({ checkedKeys, checkedKeyResult })
  }

  // 城市范围变更事件
  handleCityRangeChange = value => {
    // const newVal = []
    // value.forEach(i => {
    //   if (i.value) {
    //     newVal.push(i.value)
    //   }
    // })
    // this.setState({
    //   cityValues: newVal
    // })
    this.setState({
      cityValues: value
    })
  }

  handleSubmit = e => {
    if (e) {
      e.preventDefault()
    }
    this.props.form.validateFields(
      ['cityValues', 'authority'],
      (err, values) => {
        if (!err) {
          // eslint-disable-next-line
          const { id, cityValues, checkedKeyResult } = this.state

          const temp = this.props.roleAllMenu
          const arr = []
          temp.forEach(i => {
            if (i.status === 1) {
              arr.push(i.key)
            }
          })
          this.checkedKeyAll = []
          if (typeof checkedKeyResult === 'string') {
            this.checkedKeyAll = arr
          } else {
            this.checkedKeyAll = checkedKeyResult
          }
          // 设置角色权限 请求
          const params = {
            cityPermDatas: cityValues, // 授权城市
            dataPermType: values.authority, // 数据权限类型，小写字母
            resourceIdList: this.checkedKeyAll // 授权的资源,即对应的授权菜单
          }
          this.props.getSetingRole(id, params, err => {
            const { code } = err
            if (code === '200') {
              message.success('保存成功!')
              this.backCancel()
            } else {
              message.error('保存失败!')
            }
          })
        } else {
          message.error('请填写必填项!')
        }
      }
    )
  }
  backCancel = () => {
    this.props.history.goBack()
  }

  renderTreeNodes = data =>
    data.map(item => {
      const title = <span>{item.resourceName}</span>
      if (item.children) {
        return (
          <TreeNode title={title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        )
      }
      return (
        <TreeNode
          className={styles.treeBlock}
          key={item.key}
          title={title}
          dataRef={item}
        />
      )
    })

  renderBreads() {
    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadListSet.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.path ? <Link to={item.path}>{item.name}</Link> : item.name}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form
    // eslint-disable-next-line
    const { cityValues, id, dataAuthority, dataPermType, list } = this.state
    const { roleResMenuPerms } = this.props
    roleResMenuPerms.forEach(item1 => {
      if (item1.children) {
        item1.children.forEach(j2 => {
          if (j2.children) {
            j2.children.forEach(m3 => {
              if (m3.resourceName === '更改配置') {
                m3.resourceName = '更改配置（新增、上移、下移、移除）'
              }
              if (m3.children) {
                m3.children.forEach(n4 => {
                  if (n4.value === '585412550584733696') {
                    n4.resourceName = '基础数据导入（楼盘、楼栋、房号）'
                  }
                  if (n4.value === '100320222200070002') {
                    n4.resourceName = '基础数据导入（商业街、楼栋、楼层、房号）'
                  }
                  if (n4.resourceName === '系数差') {
                    n4.resourceName = '系数差（城市标准差、房号系数差）'
                  }
                  if (n4.resourceName === '系数差V3.0') {
                    n4.resourceName =
                      '系数差V3.0（城市标准差V3.0、房号系数差V3.0）'
                  }
                  if (n4.resourceName === '租金系数差V3.0') {
                    n4.resourceName =
                      '租金系数差V3.0（租金城市标准差V3.0、租金房号系数差V3.0）'
                  }
                })
              }
            })
          }
        })
      }
    })

    const contentTip = (
      <div
        style={{
          marginLeft: 4,
          width: '400px'
        }}
      >
        数据权限指的是，限制当前角色在数据导入页面，或者数据导出页面，
        进行查看、删除、下载的任务记录范围。如“仅本人数据”，即可在数据导入页面，或者数据导出页面，查看、删除、下载仅限于本人的任务记录。
      </div>
    )
    return (
      <Form
        style={{
          marginTop: 8
        }}
      >
        <Row>
          <Col span={8}>
            <FormItem
              label="城市范围"
              // labelCol={layout(6, 4)}
              // wrapperCol={layout(6, 6)}
              {...formItemLayout}
              style={{
                marginBottom: 6
              }}
            >
              {getFieldDecorator('cityValues', {
                rules: [
                  {
                    required: true,
                    message: '请选择城市范围'
                  }
                ],
                initialValue: cityValues
              })(
                <CityRange
                  onCityRangeChange={this.handleCityRangeChange}
                  cityValues={cityValues}
                  IsRole={id}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label="数据权限"
              // labelCol={layout(6, 4)}
              // wrapperCol={layout(6, 6)}
              {...formItemLayout}
              style={{
                marginBottom: 6
              }}
            >
              {getFieldDecorator('authority', {
                rules: [
                  {
                    required: true,
                    message: '请选择数据权限'
                  }
                ],
                initialValue: dataPermType
              })(
                <Select placeholder="请选择" allowClear>
                  {dataAuthority.map(item => (
                    <Option value={item.key} key={item.key}>
                      {item.value}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={2} className={styles.iconTip}>
            <Popover placement="right" content={contentTip}>
              <span style={{ cursor: 'pointer' }}>
                <Icon type="question-circle" />
              </span>
            </Popover>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              label="页面及操作权限"
              labelCol={layout(9, 3)}
              wrapperCol={layout(5, 20)}
              style={{
                marginBottom: 4
              }}
            >
              {getFieldDecorator('authorityItem')(
                <div className={styles.treeAllBox}>
                  {list && list.length > 0 ? (
                    <Tree
                      checkable
                      defaultExpandAll={this.state.expandAllState}
                      onCheck={this.onCheck}
                      checkedKeys={this.state.checkedKeys}
                      className={styles.treeSmallBox}
                    >
                      {this.renderTreeNodes(roleResMenuPerms)}
                    </Tree>
                  ) : null}
                </div>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row className={styles.btnCont}>
          <Button
            type="default"
            onClick={this.backCancel}
            style={{ marginRight: '10px' }}
          >
            取消
          </Button>

          <Button type="primary" onClick={this.handleSubmit}>
            保存
          </Button>
        </Row>
      </Form>
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {/* {this.renderTable()} */}
        </div>
      </div>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    modelSelector,
    containerActions
  )
)(RoleManageSet)
