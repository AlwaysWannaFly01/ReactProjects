import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import {
  Form,
  Breadcrumb,
  Icon,
  Row,
  Col,
  Input,
  Select,
  Button,
  Message,
  InputNumber,
  Alert
} from 'antd'
import { parse } from 'qs'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'

import formatString from 'client/utils/formatString'
import router from 'client/router'

import { containerActions } from './actions'
import './sagas'
import './reducer'
import { modelSelector } from './selector'

import styles from './ProjectResource.less'

const FormItem = Form.Item
const Option = Select.Option

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
 * @name 楼盘配套模块/编辑
 * @author YJF
 */
class ProjectResourceEdit extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getFacilityType: PropTypes.func.isRequired,
    getFacilitiesSubTypeCode: PropTypes.func.isRequired,
    addProjectFacility: PropTypes.func.isRequired,
    editProjectFacility: PropTypes.func.isRequired,
    getFacilityClassCode: PropTypes.func.isRequired,
    getProjectFacilityDetail: PropTypes.func.isRequired,
    clearFacilitiesSubTypeCode: PropTypes.func.isRequired,
    getProjectDetail: PropTypes.func.isRequired
    // cityId: PropTypes.string.isRequired,
    // cityName: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props)
    // eslint-disable-next-line
    const { projectId, resourceId = '', cityId, cityName } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      projectId,
      resourceId,
      cityId,
      cityName
    }
  }

  componentDidMount() {
    this.cityIdInterval = setInterval(() => {
      
      this.cityId = sessionStorage.getItem('FDC_CITY')
      if (this.cityId) {
        clearInterval(this.cityIdInterval)

        this.props.getFacilityType()
        this.props.getFacilityClassCode()

        const { projectId, resourceId } = this.state

        if (projectId) {
          this.props.getProjectDetail(projectId, this.cityId)
        }

        if (resourceId) {
          const params = {
            cityId: this.cityId,
            id: resourceId
          }
          this.props.getProjectFacilityDetail(params,this.props,projectId, this.cityId,this.state.cityName)
        }
      }
      Message.config({
        top: 100,
        duration: 2,
        maxCount: 1,
      })
    }, 100)
  }

  componentWillUnmount() {
    // 清除 配套子类数据
    this.props.clearFacilitiesSubTypeCode()
  }

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // eslint-disable-next-line
        const { projectId, resourceId, cityId, cityName } = this.state
        values.cityId = this.cityId
        values.projectId = projectId
        if (resourceId) {
          values.id = resourceId
          delete values.creator
          delete values.ownership
          this.props.editProjectFacility(values, res => {
            const { code, message } = res
            if (+code === 200) {
              Message.success('编辑成功')
              // this.props.history.goBack() change wy
              this.props.history.push({
                pathname: router.RES_PROJECT_RESOURCE,
                search: `projectId=${projectId}&cityId=${cityId}&cityName=${cityName}`
              })
            } else {
              Message.error(message)
            }
          })
        } else {
          this.props.addProjectFacility(values, res => {
            const { code, message } = res
            if (+code === 200) {
              // this.props.history.goBack()
              Message.success('新增成功')
              this.props.history.push({
                pathname: router.RES_PROJECT_RESOURCE,
                search: `projectId=${projectId}&cityId=${cityId}&cityName=${cityName}`
              })
            } else {
              Message.error(message)
            }
          })
        }
      }
    })
  }
  goBack = () => {
    // eslint-disable-next-line
    const { projectId, cityId, cityName } = this.state
    this.props.history.push({
      pathname: router.RES_PROJECT_RESOURCE,
      search: `projectId=${projectId}&cityId=${cityId}&cityName=${cityName}`
    })
  }

  handleValidateDistance = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('距离应大于0')
    }
    callback()
  }

  handleTypeChange = value => {
    this.props.getFacilitiesSubTypeCode(value)
    // 配套类型变更则重置配套子类
    this.props.form.setFieldsValue({
      facilitiesCode: undefined
    })
  }

  renderBreads() {
    const {
      areaId,
      areaName,
      id,
      projectName,
      sysStatus
    } = this.props.model.get('projectDetail')

    const { resourceId, cityId, cityName } = this.state
    const breadList = [
      {
        key: 1,
        path: '',
        name: '住宅',
        icon: 'home'
      },
      {
        key: 2,
        path: router.RES_BASEINFO,
        name: '住宅基础数据'
      },
      {
        key: 3,
        path: router.RES_BASEINFO,
        name: areaName,
        search: `areaId=${areaId}&cityId=${cityId}&cityName=${cityName}`
      },
      {
        key: 4,
        path: router.RES_BASEINFO_ADD,
        name:
          projectName && projectName.length > 10
            ? `${projectName.substr(0, 10)}...`
            : projectName,
        search: `projectId=${id}&status=${sysStatus}&cityId=${cityId}&cityName=${cityName}`
      },
      {
        key: 5,
        path: router.RES_PROJECT_RESOURCE,
        name: '楼盘配套',
        search: `projectId=${id}&cityId=${cityId}&cityName=${cityName}`
      },
      {
        key: 6,
        path: '',
        name: resourceId ? '楼盘配套编辑' : '楼盘配套新增'
      }
    ]

    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.path ? (
              <Link
                to={{
                  pathname: item.path,
                  search: item.search
                }}
              >
                {item.name}
              </Link>
            ) : (
              item.name
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )
  }

  renderHeader() {
    const {
      projectDetail: { areaName, projectName, sysStatus }
    } = this.props.model

    return (
      <div style={{ marginTop: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              <span
                style={{
                  fontWeight: 600,
                  color: sysStatus === 1 ? '#33CABB' : '#FF0000'
                }}
              >
                {areaName} | {projectName}
              </span>
            </p>
          }
        />
      </div>
    )
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form

    const { resourceId } = this.state

    const {
      facilityDetail,
      facilityTypeList,
      facilitySubTypeList,
      facilityClassCodeList,
      projectDetail
    } = this.props.model

    // 楼盘状态
    const sysStatus = projectDetail.get('sysStatus')
    const lock = Boolean(resourceId && (facilityDetail.get('sourceTypeCode') === 2))
    // console.log(lock)
    return (
      <Form style={{ marginTop: 8 }}>
        {resourceId ? (
          <Row>
            <Col span={10}>
              <FormItem {...formItemLayout} label="数据权属">
                {getFieldDecorator('ownership', {
                  initialValue: resourceId
                    ? facilityDetail.get('ownership')
                    : undefined
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem {...formItemLayout} label="录入人">
                {getFieldDecorator('creator', {
                  initialValue: resourceId
                    ? facilityDetail.get('creator')
                    : undefined
                })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
        ) : null}
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="配套类型">
              {getFieldDecorator('facilitiesTypeCode', {
                rules: [
                  {
                    required: true,
                    message: '请选择配套类型'
                  }
                ],
                onChange: this.handleTypeChange,
                initialValue: resourceId
                  ? formatString(facilityDetail.get('facilitiesTypeCode'))
                  : undefined
              })(
                <Select placeholder="请选择" disabled={sysStatus === 0 || lock}>
                  {facilityTypeList.map(item => (
                    <Option value={item.get('value')} key={item.get('value')}>
                      {item.get('label')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="配套子类">
              {getFieldDecorator('facilitiesCode', {
                rules: [
                  {
                    required: true,
                    message: '请选择配套子类'
                  }
                ],
                initialValue: resourceId
                  ? formatString(facilityDetail.get('facilitiesCode'))
                  : undefined
              })(
                <Select placeholder="请选择" disabled={sysStatus === 0 || lock}>
                  {facilitySubTypeList.map(item => (
                    <Option key={item.get('code')} value={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="配套名称">
              {getFieldDecorator('facilitiesName', {
                rules: [
                  {
                    required: true,
                    message: '请输入配套名称'
                  },
                  {
                    whitespace: true,
                    message: '请输入配套名称'
                  },
                  {
                    max: 1000,
                    message: '最大长度为1000'
                  }
                ],
                initialValue: resourceId
                  ? facilityDetail.get('facilitiesName')
                  : undefined
              })(<Input placeholder="请输入" disabled={sysStatus === 0 || lock} />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="配套等级">
              {getFieldDecorator('facilitiesClass', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入配套等级'
                  }
                ],
                initialValue: resourceId
                  ? formatString(facilityDetail.get('facilitiesClass'))
                  : undefined
              })(
                <Select
                  placeholder="请选择"
                  disabled={sysStatus === 0}
                  allowClear
                >
                  {facilityClassCodeList.map(item => (
                    <Option key={item.get('code')} value={item.get('code')}>
                      {item.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="是否内部">
              {getFieldDecorator('isInternal', {
                initialValue: resourceId
                  ? formatString(facilityDetail.get('isInternal'))
                  : undefined
              })(
                <Select
                  placeholder="请选择"
                  disabled={sysStatus === 0}
                  allowClear
                >
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="与楼盘距离_千米">
              {getFieldDecorator('distance', {
                rules: [
                  {
                    validator: this.handleValidateDistance
                  }
                ],
                initialValue: resourceId
                  ? facilityDetail.get('distance')
                  : undefined
              })(
                <InputNumber
                  disabled={sysStatus === 0}
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  precision={4}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label="来源类型">
              {getFieldDecorator('sourceTypeCode', {
                rules: [
                  {
                    required: false,
                    message: '请选择来源类型'
                  }
                ],
                initialValue: resourceId
                    ? formatString(facilityDetail.get('sourceTypeCode'))
                    : undefined
              })(
                  <Select placeholder="请选择" disabled>
                    <Option  value={'1'}>
                      楼盘配套自增
                    </Option>
                    <Option  value={'2'}>
                      公共配套关联
                    </Option>
                  </Select>
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem {...formItemLayout} label="备注">
              {getFieldDecorator('remark', {
                rules: [
                  {
                    whitespace: true,
                    message: '请输入备注'
                  },
                  {
                    max: 100,
                    message: '最大长度为100'
                  }
                ],
                initialValue: resourceId
                    ? facilityDetail.get('remark')
                    : undefined
              })(<Input placeholder="请输入" disabled={sysStatus === 0} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem {...formItemLayout} label=" " colon={false}>
              {sysStatus === 1 ? (
                <Fragment>
                  {resourceId ? (
                    <Fragment>
                      {pagePermission(
                        'fdc:hd:residence:base:realMatch:change'
                      ) ? (
                        <Button
                          type="primary"
                          icon="save"
                          onClick={this.handleSubmit}
                          style={{ marginRight: 16 }}
                        >
                          保存
                        </Button>
                      ) : (
                        ''
                      )}
                    </Fragment>
                  ) : (
                    <Fragment>
                      {pagePermission('fdc:hd:residence:base:realMatch:add') ? (
                        <Button
                          type="primary"
                          icon="save"
                          onClick={this.handleSubmit}
                          style={{ marginRight: 16 }}
                        >
                          保存
                        </Button>
                      ) : (
                        ''
                      )}
                    </Fragment>
                  )}
                </Fragment>
              ) : null}
              <Button onClick={this.goBack}>返回</Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderHeader()}
          {this.renderForm()}
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
)(ProjectResourceEdit)
