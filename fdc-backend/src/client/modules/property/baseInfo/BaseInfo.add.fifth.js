import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Form, Row, Col, Input, Select, Spin, InputNumber } from 'antd'
import Immutable from 'immutable'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

const FormItem = Form.Item
const { Option } = Select
const { TextArea } = Input

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

/*
 * 楼盘新增 小区规模
 */
class BaseInfoAddFifth extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    onAddFifthRef: PropTypes.func.isRequired,
    initialAddFetchFifth: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    projectDetail: PropTypes.instanceOf(Immutable.Map).isRequired,
    projectStatus: PropTypes.string.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)

    props.onAddFifthRef(this)
  }

  componentDidMount() {
    this.props.initialAddFetchFifth()
  }

  handleValidateParkingNum = (rule, value, callback) => {
    if (value !== undefined && value !== null && value <= 0) {
      callback('车位数应大于0')
    }
    callback()
  }

  submitFifth = () =>
    new Promise((resolve, reject) => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          values.projectFeatureCode = values.projectFeatureCode
            ? values.projectFeatureCode.join(',')
            : ''
          values.subwayCode = values.subwayCode
            ? values.subwayCode.join(',')
            : ''
          resolve(values)
        } else {
          /* eslint-disable */
          reject('5')
        }
      })
    })

  render() {
    const {
      form: { getFieldDecorator },
      projectDetail,
      projectStatus
    } = this.props

    const {
      decorationTypeList,
      buildingQualityList,
      communitySizeList,
      managementQualityList,
      communityClosenessList,
      classCodeList,
      loopLineList,
      diversionVehicleList,
      subwayPropertyList, // 地铁属性
      projectFeatureList,
      subwayCodeList
    } = this.props.model

    return (
      <form>
        <Spin
          spinning={this.context.loading.includes(
            actions.GET_COMMUNITY_CLOSENESS
          )}
        >
          <Row>
            <Col span={8}>
              <FormItem label="停车费" {...formItemLayout}>
                {getFieldDecorator('parkingFee', {
                  rules: [
                    {
                      max: 50,
                      message: '最大长度为50'
                    }
                  ],
                  initialValue: projectDetail.get('parkingFee')
                })(
                  <TextArea
                    disabled={projectStatus === '0'}
                    placeholder="请输入"
                    autosize={{ maxRows: 4 }}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="车位数" {...formItemLayout}>
                {getFieldDecorator('parkingNum', {
                  rules: [
                    {
                      validator: this.handleValidateParkingNum
                    }
                  ],
                  initialValue: projectDetail.get('parkingNum')
                })(
                  <InputNumber
                    disabled={projectStatus === '0'}
                    placeholder="请输入"
                    // min={0}
                    style={{ width: '100%' }}
                    precision={0}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label="车位配比" {...formItemLayout}>
                {getFieldDecorator('parkingSpaceRatio', {
                  rules: [
                    {
                      max: 40,
                      message: '最大长度为40'
                    }
                  ],
                  initialValue: projectDetail.get('parkingSpaceRatio')
                })(
                  <TextArea
                    disabled={projectStatus === '0'}
                    placeholder="请输入"
                    autosize={{ maxRows: 4 }}
                    // maxLength="40"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="车位描述" {...formItemLayout}>
                {getFieldDecorator('parkingPlaceDesc', {
                  rules: [
                    {
                      max: 100,
                      message: '最大长度为100'
                    }
                  ],
                  initialValue: projectDetail.get('parkingPlaceDesc')
                })(
                  <TextArea
                    disabled={projectStatus === '0'}
                    placeholder="请输入"
                    autosize={{ maxRows: 4 }}
                    // maxLength="100"
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label="建筑质量" {...formItemLayout}>
                {getFieldDecorator('buildingQualityCode', {
                  initialValue:
                    projectDetail.get('buildingQualityCode') || undefined
                })(
                  <Select
                    placeholder="请选择"
                    disabled={projectStatus === '0'}
                    allowClear
                  >
                    {buildingQualityList.map(item => (
                      <Option key={item.get('code')} value={+item.get('code')}>
                        {item.get('name')}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="小区规模" {...formItemLayout}>
                {getFieldDecorator('communitySizeCode', {
                  initialValue:
                    projectDetail.get('communitySizeCode') || undefined
                })(
                  <Select
                    placeholder="请选择"
                    disabled={projectStatus === '0'}
                    allowClear
                  >
                    {communitySizeList.map(item => (
                      <Option key={item.get('code')} value={+item.get('code')}>
                        {item.get('name')}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label="物业管理质量" {...formItemLayout}>
                {getFieldDecorator('managementQualityCode', {
                  initialValue:
                    projectDetail.get('managementQualityCode') || undefined
                })(
                  <Select
                    placeholder="请选择物业管理质量"
                    disabled={projectStatus === '0'}
                    allowClear
                  >
                    {managementQualityList.map(item => (
                      <Option key={item.get('code')} value={+item.get('code')}>
                        {item.get('name')}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem label="物业评价" {...formItemLayout}>
                {getFieldDecorator('propertyEvaluation', {
                  rules: [
                    {
                      max: 500,
                      message: '最大长度为500'
                    }
                  ],
                  initialValue: projectDetail.get('propertyEvaluation')
                })(
                  <TextArea
                    disabled={projectStatus === '0'}
                    placeholder="请输入"
                    autosize={{ maxRows: 4 }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label="小区封闭性" {...formItemLayout}>
                {getFieldDecorator('communityClosenessCode', {
                  initialValue:
                    projectDetail.get('communityClosenessCode') || undefined
                })(
                  <Select
                    placeholder="请选择小区封闭性"
                    disabled={projectStatus === '0'}
                    allowClear
                  >
                    {communityClosenessList.map(item => (
                      <Option key={item.get('code')} value={+item.get('code')}>
                        {item.get('name')}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="装修情况" {...formItemLayout}>
                {getFieldDecorator('decorationCode', {
                  initialValue: projectDetail.get('decorationCode') || undefined
                })(
                  <Select
                    placeholder="请选择装修情况"
                    disabled={projectStatus === '0'}
                    allowClear
                  >
                    {decorationTypeList.map(item => (
                      <Option key={item.get('code')} value={+item.get('code')}>
                        {item.get('name')}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label="配套等级" {...formItemLayout}>
                {getFieldDecorator('classCode', {
                  initialValue: projectDetail.get('classCode') || undefined
                })(
                  <Select
                    placeholder="请选择配套等级"
                    disabled={projectStatus === '0'}
                    allowClear
                  >
                    {classCodeList.map(item => (
                      <Option key={item.get('code')} value={+item.get('code')}>
                        {item.get('name')}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="环线位置" {...formItemLayout}>
                {getFieldDecorator('loopLineCode', {
                  initialValue: projectDetail.get('loopLineCode') || undefined
                })(
                  <Select
                    placeholder="请选择环线位置"
                    disabled={projectStatus === '0'}
                    allowClear
                  >
                    {loopLineList.map(item => (
                      <Option key={item.get('code')} value={+item.get('code')}>
                        {item.get('name')}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label="人车分流情况" {...formItemLayout}>
                {getFieldDecorator('diversionVehicleCode', {
                  initialValue:
                    projectDetail.get('diversionVehicleCode') || undefined
                })(
                  <Select
                    placeholder="请选择人车分流情况"
                    disabled={projectStatus === '0'}
                    allowClear
                  >
                    {diversionVehicleList.map(item => (
                      <Option key={item.get('code')} value={+item.get('code')}>
                        {item.get('name')}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="地铁属性" {...formItemLayout}>
                {getFieldDecorator('subwayProperty', {
                  initialValue: projectDetail.get('subwayProperty') || undefined
                })(
                  <Select
                    placeholder="请选择"
                    disabled={projectStatus === '0'}
                    allowClear
                  >
                    {subwayPropertyList.map(item => (
                      <Option key={item.get('code')} value={+item.get('code')}>
                        {item.get('name')}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label="轨道沿线" {...formItemLayout}>
                {getFieldDecorator('subwayCode', {
                  initialValue: projectDetail.get('subwayCode')
                    ? projectDetail.get('subwayCode').split(',')
                    : []
                })(
                  <Select
                    placeholder="请选择轨道沿线"
                    mode="multiple"
                    disabled={projectStatus === '0'}
                  >
                    {subwayCodeList.map(item => (
                      <Option key={item.get('code')} value={item.get('code')}>
                        {item.get('name')}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="项目特色" {...formItemLayout}>
                {getFieldDecorator('projectFeatureCode', {
                  initialValue: projectDetail.get('projectFeatureCode')
                    ? projectDetail.get('projectFeatureCode').split(',')
                    : []
                })(
                  <Select
                    placeholder="请选择项目特色"
                    mode="multiple"
                    disabled={projectStatus === '0'}
                  >
                    {projectFeatureList.map(item => (
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
            <Col span={8}>
              <FormItem label="小区门禁" {...formItemLayout}>
                {getFieldDecorator('doorControl', {
                  rules: [
                    {
                      max: 50,
                      message: '最大长度为50'
                    }
                  ],
                  initialValue: projectDetail.get('doorControl')
                })(
                  <TextArea
                    disabled={projectStatus === '0'}
                    placeholder="请输入"
                    autosize={{ maxRows: 4 }}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="派出所" {...formItemLayout}>
                {getFieldDecorator('policeStation', {
                  rules: [
                    {
                      max: 100,
                      message: '最大长度为100'
                    }
                  ],
                  initialValue: projectDetail.get('policeStation')
                })(
                  <TextArea
                    disabled={projectStatus === '0'}
                    placeholder="请输入"
                    autosize={{ maxRows: 4 }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label="安全防范" {...formItemLayout}>
                {getFieldDecorator('safetyProtection', {
                  rules: [
                    {
                      max: 50,
                      message: '最大长度为50'
                    }
                  ],
                  initialValue: projectDetail.get('safetyProtection')
                })(
                  <TextArea
                    disabled={projectStatus === '0'}
                    placeholder="请输入"
                    autosize={{ maxRows: 4 }}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="居民特征" {...formItemLayout}>
                {getFieldDecorator('inhabitantFeature', {
                  rules: [
                    {
                      max: 200,
                      message: '最大长度为200'
                    }
                  ],
                  initialValue: projectDetail.get('inhabitantFeature')
                })(
                  <TextArea
                    disabled={projectStatus === '0'}
                    placeholder="请输入"
                    autosize={{ maxRows: 4 }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label="居委会" {...formItemLayout}>
                {getFieldDecorator('neighborhoodCommittee', {
                  rules: [
                    {
                      max: 100,
                      message: '最大长度为100'
                    }
                  ],
                  initialValue: projectDetail.get('neighborhoodCommittee')
                })(
                  <TextArea
                    disabled={projectStatus === '0'}
                    placeholder="请输入"
                    autosize={{ maxRows: 4 }}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="购物体验" {...formItemLayout}>
                {getFieldDecorator('shoppingExperience', {
                  rules: [
                    {
                      max: 500,
                      message: '最大长度为500'
                    }
                  ],
                  initialValue: projectDetail.get('shoppingExperience')
                })(
                  <TextArea
                    disabled={projectStatus === '0'}
                    placeholder="请输入"
                    autosize={{ maxRows: 4 }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label="生活体验" {...formItemLayout}>
                {getFieldDecorator('livedExperience', {
                  rules: [
                    {
                      max: 500,
                      message: '最大长度为500'
                    }
                  ],
                  initialValue: projectDetail.get('livedExperience')
                })(
                  <TextArea
                    disabled={projectStatus === '0'}
                    placeholder="请输入"
                    autosize={{ maxRows: 4 }}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="有利因素" {...formItemLayout}>
                {getFieldDecorator('positiveFactor', {
                  rules: [
                    {
                      max: 500,
                      message: '最大长度为500'
                    }
                  ],
                  initialValue: projectDetail.get('positiveFactor')
                })(
                  <TextArea
                    disabled={projectStatus === '0'}
                    placeholder="请输入"
                    autosize={{ maxRows: 4 }}
                    // maxLength="200"
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label="不利因素" {...formItemLayout}>
                {getFieldDecorator('negetiveFactor', {
                  rules: [
                    {
                      max: 500,
                      message: '最大长度为500'
                    }
                  ],
                  initialValue: projectDetail.get('negetiveFactor')
                })(
                  <TextArea
                    disabled={projectStatus === '0'}
                    placeholder="请输入"
                    autosize={{ maxRows: 4 }}
                    // maxLength="200"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="设备设施" {...formItemLayout}>
                {getFieldDecorator('facility', {
                  rules: [
                    {
                      max: 200,
                      message: '最大长度为200'
                    }
                  ],
                  initialValue: projectDetail.get('facility')
                })(
                  <TextArea
                    disabled={projectStatus === '0'}
                    placeholder="请输入"
                    autosize={{ maxRows: 4 }}
                    // maxLength="200"
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label="区域分析" {...formItemLayout}>
                {getFieldDecorator('regionalAnalysis', {
                  rules: [
                    {
                      max: 500,
                      message: '最大长度为500'
                    }
                  ],
                  initialValue: projectDetail.get('regionalAnalysis')
                })(
                  <TextArea
                    disabled={projectStatus === '0'}
                    placeholder="请输入"
                    autosize={{ maxRows: 4 }}
                    // maxLength="500"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="楼盘备注" {...formItemLayout}>
                {getFieldDecorator('remark', {
                  rules: [
                    {
                      max: 255,
                      message: '最大长度为255'
                    }
                  ],
                  initialValue: projectDetail.get('remark')
                })(
                  <TextArea
                    disabled={projectStatus === '0'}
                    placeholder="请输入"
                    autosize={{ maxRows: 4 }}
                    // maxLength="500"
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label="项目概况" {...formItemLayout}>
                {getFieldDecorator('detail', {
                  initialValue: projectDetail.get('detail')
                })(
                  <TextArea
                    placeholder="请输入"
                    autosize={{ mixRows: 1, maxRows: 4 }}
                    disabled={projectStatus === '0'}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        </Spin>
      </form>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    modelSelector,
    containerActions
  )
)(BaseInfoAddFifth)
