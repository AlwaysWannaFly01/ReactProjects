import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Form, Table, Row, Select, Col, Button, Message } from 'antd'
import Immutable from 'immutable'
import { Link } from 'react-router-dom'
import { pagePermission } from 'client/utils'
import layout from 'client/utils/layout'
import router from 'client/router'
import shallowEqual from 'client/utils/shallowEqual'
import fillupFloor from 'client/utils/fillupFloor'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import HouseFloor from './HouseFloor'

const FormItem = Form.Item
const { Option } = Select

// 通风采光
class VentLightCode extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    dataList: PropTypes.array.isRequired,
    houseTitle: PropTypes.array.isRequired,
    getDataList: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    buildId: PropTypes.string.isRequired,
    updateHouseCols: PropTypes.func.isRequired,
    getVentLightType: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    buildStatus: PropTypes.number.isRequired,
    cityId: PropTypes.string.isRequired,
    cityName: PropTypes.string.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      houseNameTitle: [
        {
          title: '物理层',
          dataIndex: 'floorNo',
          width: 80
        },
        {
          title: '实际层',
          dataIndex: 'actualFloor',
          width: 80
        }
      ],
      // 是否已加载title
      isShowTitle: false
    }
  }

  componentDidMount() {
    this.cityId = sessionStorage.getItem('FDC_CITY')
    this.getDataList()
    this.props.getVentLightType()
  }

  componentWillReceiveProps(nextProps) {
    if (!shallowEqual(this.props.dataList, nextProps.dataList)) {
      const { houseTitle, dataList } = nextProps
      const houseNameTitle = []
      houseTitle.forEach(item => {
        const itemArr = item.split(',')
        if (itemArr.length === 2) {
          const title = itemArr.join('')
          houseNameTitle.push({
            title,
            width: 100,
            render: record => {
              const { projectId, buildId, cityId, cityName } = this.props // eslint-disable-line

              if (record[title]) {
                const [houseId, ventLightCode] = record[title].split(',')

                return (
                  <Link
                    to={{
                      pathname: router.RES_HOUSE_NUM_EDIT,
                      search: `projectId=${projectId}&buildId=${buildId}&houseId=${houseId ||
                        ''}&cityId=${cityId}&cityName=${cityName}`
                    }}
                  >
                    {ventLightCode ? (
                      <span>{ventLightCode}</span>
                    ) : (
                      <span style={{ textDecoration: 'underline' }}>——</span>
                    )}
                  </Link>
                )
              }
              return null
            }
          })
        }
      })
      const newDataList = fillupFloor(dataList)
      if (this.state.isShowTitle) {
        this.setState({
          dataList: newDataList
        })
      } else {
        this.setState({
          houseNameTitle: [...this.state.houseNameTitle, ...houseNameTitle],
          dataList: newDataList,
          isShowTitle: true
        })
      }
    }
  }

  onHouseFloorRef = ref => {
    this.houseFloorRef = ref
  }

  getDataList = () => {
    const qry = {
      cityId: this.cityId,
      buildingId: this.props.buildId,
      fieldName: 'ventLightCode'
    }
    this.props.getDataList(qry)
  }

  handleSet = () => {
    const {
      postData,
      isChosedHouseFloor
    } = this.houseFloorRef.handleSubmitHouseFloor()
    // 如果有选值
    if (isChosedHouseFloor) {
      const { floorNo, houseCol } = postData
      const { ventLightCode } = this.props.form.getFieldsValue()
      if (ventLightCode) {
        const data = {
          cityId: this.cityId,
          buildingId: this.props.buildId,
          fieldName: 'ventLightCode',
          fieldValue: ventLightCode,
          floorList: floorNo,
          unitNoList: houseCol
        }
        this.props.updateHouseCols(data, res => {
          Message.success(`${res || 0}`)
          this.getDataList()
        })
      } else {
        Message.info('请选择通风采光')
      }
    } else {
      Message.info('请选择物理层/单元室号')
    }
  }

  render() {
    const { houseNameTitle = [], dataList } = this.state

    const { getFieldDecorator } = this.props.form

    const { ventLightTypeList } = this.props.model

    let x = 120
    if (houseNameTitle.length) {
      x = 100 * houseNameTitle.length
      x += 120
    }

    return (
      <div>
        <Table
          columns={houseNameTitle}
          dataSource={dataList}
          pagination={false}
          loading={this.context.loading.includes(actions.GET_DATA_LIST)}
          scroll={{ x, y: 400 }}
        />
        {this.props.buildStatus === 1 ? (
          <div>
            <Row style={{ marginTop: 16 }}>
              <HouseFloor onHouseFloorRef={this.onHouseFloorRef} />
            </Row>
            {pagePermission('fdc:hd:residence:base:roomNum:change') ? (
              <Row>
                <Col span={16}>
                  <FormItem
                    label="通风采光"
                    labelCol={layout(12, 6)}
                    wrapperCol={layout(12, 18)}
                  >
                    <Col span={10}>
                      <FormItem>
                        {getFieldDecorator('ventLightCode')(
                          <Select
                            style={{ width: '100%' }}
                            placeholder="请选择"
                          >
                            {ventLightTypeList.map(item => (
                              <Option key={item.get('code')}>
                                {item.get('name')}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={2} />
                    <Col span={12}>
                      <FormItem>
                        <Button type="primary" onClick={this.handleSet}>
                          设置
                        </Button>
                      </FormItem>
                    </Col>
                  </FormItem>
                </Col>
              </Row>
            ) : (
              ''
            )}
          </div>
        ) : null}
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
)(VentLightCode)
